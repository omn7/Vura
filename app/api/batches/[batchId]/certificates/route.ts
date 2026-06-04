import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import {
    parsePaginationParams,
    getPaginationMetadata,
    calculateSkip,
} from "@/lib/pagination";

export const dynamic = "force-dynamic";

const searchParamsSchema = z.object({
    search: z.string().trim().optional(),
    status: z.enum(["PENDING", "SENT", "FAILED", "REVOKED"]).optional(),
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

    try {
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

        const [total, certificates, statsRaw] = await Promise.all([
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
            prisma.certificate.groupBy({
                by: ["status"],
                where: {
                    batchId,
                    userId: session.user.id,
                },
                _count: {
                    status: true,
                },
            }),
        ]);

        const stats = {
            total: 0,
            pending: 0,
            generated: 0,
            sent: 0,
            failed: 0,
        };

        for (const s of statsRaw) {
            const count = s._count.status;
            stats.total += count;
            const normStatus = s.status.toLowerCase();
            if (normStatus === "pending") {
                stats.pending = count;
            } else if (normStatus === "generated") {
                stats.generated = count;
            } else if (normStatus === "sent") {
                stats.sent = count;
            } else if (normStatus === "failed") {
                stats.failed = count;
            }
        }

        const paginationMetadata = getPaginationMetadata(parsedPage, parsedLimit, total);

        return NextResponse.json({
            data: certificates,
            pagination: paginationMetadata,
            stats,
        });
    } catch (error) {
        console.error("Failed to fetch certificates:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
