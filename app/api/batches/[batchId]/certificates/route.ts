import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
    parsePaginationParams,
    getPaginationMetadata,
    calculateSkip,
} from "@/lib/pagination";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, context: { params: Promise<{ batchId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { batchId } = await context.params;
    const searchParams = new URL(req.url).searchParams;
    const search = (searchParams.get("search") ?? "").trim();
    const status = (searchParams.get("status") ?? "").trim();
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    // Parse and validate pagination parameters
    const { page: parsedPage, limit: parsedLimit } = parsePaginationParams(page, limit);
    const skip = calculateSkip(parsedPage, parsedLimit);

    // Build the filter criteria
    const whereCondition = {
        batchId,
        userId: session.user.id,
        ...(status ? { status } : {}),
        ...(search
            ? {
                  OR: [
                      { name: { contains: search, mode: "insensitive" } },
                      { recipientEmail: { contains: search, mode: "insensitive" } },
                      { certificateId: { contains: search, mode: "insensitive" } },
                  ],
              }
            : {}),
    };

    // Execute count and data queries in parallel
    const [total, certificates] = await Promise.all([
        prisma.certificate.count({ where: whereCondition }),
        prisma.certificate.findMany({
            where: whereCondition,
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                certificateId: true,
                name: true,
                recipientEmail: true,
                course: true,
                issueDate: true,
                pdfUrl: true,
                status: true,
                failureReason: true,
                updatedAt: true,
                sentAt: true,
                batchId: true,
            },
            skip,
            take: parsedLimit,
        }),
    ]);

    const paginationMetadata = getPaginationMetadata(parsedPage, parsedLimit, total);

    return NextResponse.json(
        {
            data: certificates,
            pagination: paginationMetadata,
        },
        { status: 200 }
    );
}