import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendCertificateEmail } from "@/lib/certificateEmail";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { emailQueueIds, batchId } = body;

        let queueEntries = [];

        if (emailQueueIds && Array.isArray(emailQueueIds)) {
            // Process specific queue IDs
            queueEntries = await prisma.emailQueue.findMany({
                where: {
                    id: { in: emailQueueIds },
                    userId: session.user.id,
                },
                include: {
                    certificate: true,
                },
            });
        } else if (batchId) {
            // Process all pending/failed queue entries for a batch
            queueEntries = await prisma.emailQueue.findMany({
                where: {
                    userId: session.user.id,
                    status: { in: ["pending", "failed"] },
                    certificate: {
                        batchId: batchId,
                    },
                },
                include: {
                    certificate: true,
                },
            });
        } else {
            return NextResponse.json({ error: "Missing emailQueueIds or batchId" }, { status: 400 });
        }

        if (queueEntries.length === 0) {
            return NextResponse.json({ success: true, message: "No queued emails to process." });
        }

        const protocol = req.headers.get("x-forwarded-proto") ?? "https";
        const host = req.headers.get("host") ?? "vurakit.in";
        const baseUrl = `${protocol}://${host}`;

        const results = [];

        for (const entry of queueEntries) {
            // Mark as processing
            await prisma.emailQueue.update({
                where: { id: entry.id },
                data: { status: "processing" },
            });

            try {
                const verifyUrl = `${baseUrl}/verify/${entry.certificateId}`;
                
                await sendCertificateEmail({
                    recipientEmail: entry.recipientEmail,
                    recipientName: entry.recipientName,
                    certificateId: entry.certificateId,
                    verifyUrl,
                    subject: entry.subject,
                    cc: entry.cc || undefined,
                    body: entry.body,
                    theme: entry.theme,
                    course: entry.certificate.course,
                });

                // Update to success
                await prisma.emailQueue.update({
                    where: { id: entry.id },
                    data: {
                        status: "sent",
                        attempts: entry.attempts + 1,
                        lastAttempt: new Date(),
                        error: null,
                    },
                });

                await prisma.certificate.update({
                    where: { certificateId: entry.certificateId },
                    data: {
                        status: "sent",
                        sentAt: new Date(),
                        failureReason: null,
                    },
                });

                results.push({ id: entry.id, status: "sent" });
            } catch (err: any) {
                const errorMsg = err instanceof Error ? err.message : String(err);
                console.error(`Failed to send email for queue ID ${entry.id}:`, err);

                // Update to failure
                await prisma.emailQueue.update({
                    where: { id: entry.id },
                    data: {
                        status: "failed",
                        attempts: entry.attempts + 1,
                        lastAttempt: new Date(),
                        error: errorMsg,
                    },
                });

                await prisma.certificate.update({
                    where: { certificateId: entry.certificateId },
                    data: {
                        status: "failed",
                        failureReason: errorMsg,
                    },
                });

                results.push({ id: entry.id, status: "failed", error: errorMsg });
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        console.error("Failed to process email queue:", error);
        return NextResponse.json({ error: error.message || "Failed to process email queue" }, { status: 500 });
    }
}
