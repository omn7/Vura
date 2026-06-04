import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { parsePaginationParams, getPaginationMetadata, calculateSkip } from "@/lib/pagination";

export const dynamic = "force-dynamic";

const searchParamsSchema = z.object({
    search: z.string().trim().optional(),
    status: z.string().trim().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
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
        page: url.searchParams.get("page"),
        limit: url.searchParams.get("limit"),
    });

    if (!parsedSearchParams.success) {
        return NextResponse.json({ error: "Invalid search parameters", details: parsedSearchParams.error.flatten() }, { status: 400 });
    }

    const { search, status, page: pageParam, limit: limitParam } = parsedSearchParams.data;

    const { page, limit } = parsePaginationParams(pageParam, limitParam);
    const skip = calculateSkip(page, limit);

    const whereCondition = {
        batchId,
        userId: session.user.id,
        ...(status ? { status } : {}),
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

    try {
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
                take: limit,
            }),
        ]);

        return NextResponse.json({
            data: certificates,
            pagination: getPaginationMetadata(page, limit, total),
        });
    } catch (error) {
        console.error("Failed to fetch certificates:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
