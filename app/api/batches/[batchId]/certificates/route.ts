import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
    parsePaginationParams,
    getPaginationMetadata,
    calculateSkip,
} from "@/lib/pagination";
import { z } from "zod";

export const dynamic = "force-dynamic";

const searchParamsSchema = z.object({
    search: z.string().trim().optional(),
    status: z.string().optional(),
});

export async function GET(req: NextRequest, context: { params: Promise<{ batchId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { batchId } = await context.params;
    const url = new URL(req.url);

    const parsedSearchParams = searchParamsSchema.safeParse({
        search: url.searchParams.get("search"),
        status: url.searchParams.get("status"),
    });

    if (!parsedSearchParams.success) {
        return NextResponse.json({ error: "Invalid search parameters", details: parsedSearchParams.error.flatten() }, { status: 400 });
    }

    const { search, status } = parsedSearchParams.data;

    const page = url.searchParams.get("page") ?? undefined;
    const limit = url.searchParams.get("limit") ?? undefined;
    const { page: parsedPage, limit: parsedLimit } = parsePaginationParams(page, limit);
    const skip = calculateSkip(parsedPage, parsedLimit);

    const whereCondition = {
        batchId,
        userId: session.user.id,
        ...(status ? { status: status.toLowerCase() } : {}),
        ...(search
            ? {
                  OR: [
                      { name: { contains: search, mode: "insensitive" as const } },
                      { recipientEmail: { contains: search, mode: "insensitive" as const } },
                      { certificateId: { contains: search, mode: "insensitive" as const } },
                  ],
              }
            : {}),
    };

    const selectFields = {
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
    } as const;

    try {
        const [total, certificates] = await Promise.all([
            prisma.certificate.count({ where: whereCondition }),
            prisma.certificate.findMany({
                where: whereCondition,
                orderBy: { updatedAt: "desc" },
                select: selectFields,
                skip,
                take: parsedLimit,
            }),
        ]);

        const pagination = getPaginationMetadata(parsedPage, parsedLimit, total);

        return NextResponse.json({ data: certificates, pagination });
    } catch (error) {
        console.error("Failed to fetch certificates:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
