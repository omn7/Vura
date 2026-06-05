import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const searchParamsSchema = z.object({
    search: z.string().trim().nullable().optional(),
    status: z.preprocess(
        (val) => {
            if (val === "" || val === null || val === undefined) return undefined;
            return String(val).toLowerCase();
        },
        z.enum(["pending", "sent", "failed", "generated", "revoked"]).optional()
    ),
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

    try {
        const certificates = await prisma.certificate.findMany({
            where: {
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
            },
            orderBy: { updatedAt: "desc" },
            // Consider adding `take` and `skip` for pagination to prevent fetching excessive data
            // For example: take: 20, skip: (page - 1) * 20
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
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
