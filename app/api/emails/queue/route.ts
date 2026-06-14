import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { token, batchId, selectedCertificateIds, subject, cc, body: emailBody, theme } = body;

        if (!batchId || !selectedCertificateIds || !Array.isArray(selectedCertificateIds) || !subject || !emailBody || !theme) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Validate compose token
        const composeSession = await prisma.composeSession.findUnique({
            where: { token },
        });

        if (!composeSession) {
            return NextResponse.json({ error: "Access denied. Invalid compose session." }, { status: 403 });
        }

        if (composeSession.batchId !== batchId || composeSession.userId !== session.user.id) {
            return NextResponse.json({ error: "Access denied. Token mismatch." }, { status: 403 });
        }

        if (new Date() > new Date(composeSession.expiresAt)) {
            return NextResponse.json({ error: "Compose session has expired. Please generate again." }, { status: 403 });
        }

        // Fetch selected certificates
        const certificates = await prisma.certificate.findMany({
            where: {
                certificateId: { in: selectedCertificateIds },
                userId: session.user.id,
                batchId: batchId,
            },
        });

        if (certificates.length === 0) {
            return NextResponse.json({ error: "No certificates found to queue" }, { status: 400 });
        }

        // Create or update EmailQueue records
        const upsertPromises = certificates.map(cert => {
            if (!cert.recipientEmail) return null;

            return prisma.emailQueue.upsert({
                where: { certificateId: cert.certificateId },
                update: {
                    recipientEmail: cert.recipientEmail,
                    recipientName: cert.name,
                    subject,
                    cc: cc || null,
                    body: emailBody,
                    theme,
                    status: "pending",
                    attempts: 0,
                    error: null,
                    userId: session.user.id,
                },
                create: {
                    certificateId: cert.certificateId,
                    recipientEmail: cert.recipientEmail,
                    recipientName: cert.name,
                    subject,
                    cc: cc || null,
                    body: emailBody,
                    theme,
                    status: "pending",
                    userId: session.user.id,
                },
            });
        }).filter(Boolean);

        await prisma.$transaction(upsertPromises as any);

        // Update certificates status to "pending" if they are queued for email
        await prisma.certificate.updateMany({
            where: {
                certificateId: { in: selectedCertificateIds },
                recipientEmail: { not: null },
            },
            data: {
                status: "pending",
                failureReason: null,
            },
        });

        return NextResponse.json({ success: true, count: upsertPromises.length });
    } catch (error: any) {
        console.error("Failed to queue emails:", error);
        return NextResponse.json({ error: error.message || "Failed to queue emails" }, { status: 500 });
    }
}
