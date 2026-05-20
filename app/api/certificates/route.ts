import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = new URL(req.url).searchParams;
    const search = (searchParams.get("search") ?? "").trim();
    const status = (searchParams.get("status") ?? "").trim();

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
        const certificates = await prisma.certificate.findMany({
            where: {
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
            },
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
        });

        return NextResponse.json(certificates);
    } catch (error) {
        console.error("Failed to fetch certificates:", error);
        return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 });
    }
}
