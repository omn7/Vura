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

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = new URL(req.url).searchParams;
    const search = (searchParams.get("search") ?? "").trim();
    const status = (searchParams.get("status") ?? "").trim();
    const page = searchParams.get("page") ?? undefined;
    const limit = searchParams.get("limit") ?? undefined;

    // Parse and validate pagination parameters
    const { page: parsedPage, limit: parsedLimit } = parsePaginationParams(page, limit);
    const skip = calculateSkip(parsedPage, parsedLimit);

    // Map UI status filter ("delivered", "pending", "failed") to database status values
    let statusFilter = {};
    if (status) {
        if (status === "delivered") {
            statusFilter = { status: { in: ["sent", "generated"] } };
        } else {
            statusFilter = { status };
        }
    }

    try {
        // Build the filter criteria
        const whereCondition = {
            userId: session.user.id,
            ...statusFilter,
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

        // Execute count, data, and stats queries in parallel
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
                    userId: session.user.id,
                },
                _count: {
                    status: true,
                },
            }),
        ]);

        const stats = {
            total: 0,
            delivered: 0,
            pending: 0,
            failed: 0,
        };

        for (const s of statsRaw) {
            const count = s._count.status;
            stats.total += count;
            const normStatus = s.status.toLowerCase();
            if (normStatus === "sent" || normStatus === "generated") {
                stats.delivered += count;
            } else if (normStatus === "pending") {
                stats.pending += count;
            } else if (normStatus === "failed") {
                stats.failed += count;
            }
        }

        const paginationMetadata = getPaginationMetadata(parsedPage, parsedLimit, total);

        return NextResponse.json(
            {
                data: certificates,
                pagination: paginationMetadata,
                stats,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Failed to fetch certificates:", error);
        return NextResponse.json(
            { error: "Failed to fetch certificates" },
            { status: 500 }
        );
    }
}
