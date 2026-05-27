import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateCertificate } from "@/lib/generateCertificate";
import { uploadToS3 } from "@/lib/s3";
import { sendCertificateEmail } from "@/lib/certificateEmail";

export const dynamic = "force-dynamic";

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const certificate = await prisma.certificate.findUnique({
        where: { certificateId: id },
        select: {
            certificateId: true,
            name: true,
            recipientEmail: true,
            course: true,
            issueDate: true,
            templateUrl: true,
            status: true,
            userId: true,
        },
    });

    if (!certificate) {
        return NextResponse.json({ error: "Certificate not found." }, { status: 404 });
    }

    if (certificate.userId !== session.user.id) {
        return NextResponse.json({ error: "You do not own this certificate." }, { status: 403 });
    }

    if (certificate.status !== "failed") {
        return NextResponse.json({ error: "Not retryable" }, { status: 400 });
    }

    const templateResponse = await fetch(certificate.templateUrl);
    if (!templateResponse.ok) {
        const failureReason = `Failed to fetch templateUrl (HTTP ${templateResponse.status}).`;
        await prisma.certificate.update({
            where: { certificateId: certificate.certificateId },
            data: { status: "failed", failureReason },
        });
        return NextResponse.json({ error: failureReason }, { status: 400 });
    }

    const templateBuffer = await templateResponse.arrayBuffer();
    const protocol = req.headers.get("x-forwarded-proto") ?? "https";
    const host = req.headers.get("host") ?? "vurakit.vercel.app";
    const baseUrl = `${protocol}://${host}`;

    await prisma.certificate.update({
        where: { certificateId: certificate.certificateId },
        data: { status: "pending", failureReason: null },
    });

    try {
        const pdfBuffer = await generateCertificate(
            templateBuffer,
            {
                name: certificate.name,
                course: certificate.course,
                issueDate: certificate.issueDate,
                certificateId: certificate.certificateId,
            },
            undefined,
            baseUrl
        );

        const pdfUrl = await uploadToS3(pdfBuffer, `certificates/${certificate.certificateId}.pdf`);

        await prisma.certificate.update({
            where: { certificateId: certificate.certificateId },
            data: {
                pdfUrl,
                status: "generated",
                failureReason: null,
            },
        });

        if (certificate.recipientEmail) {
            try {
                await sendCertificateEmail({
                    recipientEmail: certificate.recipientEmail,
                    recipientName: certificate.name,
                    certificateId: certificate.certificateId,
                    verifyUrl: `${baseUrl}/verify/${certificate.certificateId}`,
                });

                await prisma.certificate.update({
                    where: { certificateId: certificate.certificateId },
                    data: {
                        status: "sent",
                        sentAt: new Date(),
                        failureReason: null,
                    },
                });
            } catch (emailError) {
                const failureReason = getErrorMessage(emailError);
                await prisma.certificate.update({
                    where: { certificateId: certificate.certificateId },
                    data: { status: "failed", failureReason },
                });

                return NextResponse.json({ error: failureReason }, { status: 500 });
            }
        }

        const refreshed = await prisma.certificate.findUnique({
            where: { certificateId: certificate.certificateId },
            select: {
                certificateId: true,
                status: true,
                pdfUrl: true,
                sentAt: true,
            },
        });

        return NextResponse.json({ success: true, certificate: refreshed });
    } catch (error) {
        const failureReason = getErrorMessage(error);
        await prisma.certificate.update({
            where: { certificateId: certificate.certificateId },
            data: { status: "failed", failureReason },
        });

        return NextResponse.json({ error: failureReason }, { status: 500 });
    }
}