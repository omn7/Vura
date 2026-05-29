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
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

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
    } catch (error) {
        console.error("Failed to fetch certificates:", error);
        return NextResponse.json(
            { error: "Failed to fetch certificates" },
            { status: 500 }
        );
    }
}
