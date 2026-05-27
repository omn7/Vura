import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    return NextResponse.json(certificates, { status: 200 });
}