import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateCertificate } from "@/lib/generateCertificate";
import { uploadToS3 } from "@/lib/s3";
import { generateCertificateId } from "@/lib/certificateIds";
import { sendCertificateEmail } from "@/lib/certificateEmail";
import { safeFetch } from "@/lib/url-validation";

export const dynamic = "force-dynamic";

const corsHeaders: HeadersInit = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

function generateCertId(): string {
    const buf = new Uint8Array(4);
    crypto.getRandomValues(buf);
    return "CERT-" + Array.from(buf).map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export async function POST(req: NextRequest) {
    // ── 1. Authenticate via API key ──────────────────────────────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    const apiKey = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

    if (!apiKey) {
        return NextResponse.json(
            { error: "Missing Authorization header. Use: Authorization: Bearer <your_api_key>" },
            { status: 401, headers: corsHeaders }
        );
    }

    const owner = await prisma.user.findUnique({
        where: { apiKey },
        select: { id: true },
    });

    if (!owner) {
        return NextResponse.json(
            { error: "Invalid API key." },
            { status: 401, headers: corsHeaders }
        );
    }

    // ── 2. Parse & validate request body ────────────────────────────────
    let body: { recipient?: string; recipientEmail?: string; course?: string; issueDate?: string; templateUrl?: string; batchId?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body." },
            { status: 400, headers: corsHeaders }
        );
    }

    const { recipient, recipientEmail, course, issueDate, templateUrl, batchId } = body;

    if (!recipient || !course || !issueDate || !templateUrl) {
        return NextResponse.json(
            { error: "Missing required fields: recipient, course, issueDate, templateUrl" },
            { status: 400, headers: corsHeaders }
        );
    }

    if (typeof recipient !== "string" || !recipient.trim()) {
        return NextResponse.json(
            { error: "Recipient name cannot be empty or contain only spaces." },
            { status: 400, headers: corsHeaders }
        );
    }

    if (typeof course !== "string" || !course.trim()) {
        return NextResponse.json(
            { error: "Course name cannot be empty or contain only spaces." },
            { status: 400, headers: corsHeaders }
        );
    }

    // ── 3. Generate the certificate record up front so failures are tracked ──
    const certificateId = generateCertificateId();
    const trimmedRecipient = recipient.trim();
    const trimmedCourse = course.trim();
    const trimmedIssueDate = issueDate.trim();

    await prisma.certificate.create({
        data: {
            certificateId,
            name: trimmedRecipient,
            recipientEmail,
            course: trimmedCourse,
            issueDate: trimmedIssueDate,
            templateUrl,
            pdfUrl: "",
            batchId,
            userId: owner.id,
            status: "pending",
        },
    });

    // ── 4. Validate and fetch the PDF template ────────────────────────────
    // safeFetch validates the URL (scheme, hostname, resolved IPs) at every
    // hop and follows redirects manually so a public URL cannot redirect to
    // an internal host or cloud metadata endpoint.
    let templateBuffer: ArrayBuffer;
    try {
        const templateRes = await safeFetch(templateUrl);
        if (!templateRes.ok) {
            await prisma.certificate.update({
                where: { certificateId },
                data: { status: "failed", failureReason: `Failed to fetch templateUrl (HTTP ${templateRes.status}).` },
            });
            return NextResponse.json(
                { error: `Failed to fetch templateUrl (HTTP ${templateRes.status}). Make sure the URL is publicly accessible.` },
                { status: 400, headers: corsHeaders }
            );
        }
        templateBuffer = await templateRes.arrayBuffer();
    } catch (error) {
        const message = error instanceof Error ? error.message : "Could not reach templateUrl.";
        await prisma.certificate.update({
            where: { certificateId },
            data: { status: "failed", failureReason: message },
        });
        return NextResponse.json(
            { error: message },
            { status: 400, headers: corsHeaders }
        );
    }

    // ── 5. Generate the certificate PDF ─────────────────────────────────
    const protocol = req.headers.get("x-forwarded-proto") ?? "https";
    const host = req.headers.get("host") ?? "vurakit.in";
    const baseUrl = `${protocol}://${host}`;

    const certData = {
        name: trimmedRecipient,
        course: trimmedCourse,
        issueDate: trimmedIssueDate,
        certificateId,
    };

    let pdfBuffer: Buffer;
    try {
        pdfBuffer = await generateCertificate(templateBuffer, certData, undefined, baseUrl);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to generate certificate PDF.";
        await prisma.certificate.update({
            where: { certificateId },
            data: { status: "failed", failureReason: message },
        });
        console.error("Certificate generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate certificate PDF. Check that the templateUrl points to a valid PDF file." },
            { status: 500, headers: corsHeaders }
        );
    }

    // ── 6. Upload PDF to S3 ──────────────────────────────────────────────
    let pdfUrl: string;
    try {
        pdfUrl = await uploadToS3(pdfBuffer, `certificates/${certificateId}.pdf`);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to upload certificate to storage.";
        await prisma.certificate.update({
            where: { certificateId },
            data: { status: "failed", failureReason: message },
        });
        console.error("S3 upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload certificate to storage." },
            { status: 500, headers: corsHeaders }
        );
    }

    const generatedRecord = await prisma.certificate.update({
        where: { certificateId },
        data: {
            pdfUrl,
            status: "generated",
            failureReason: null,
        },
    });

    let finalRecord = generatedRecord;

    if (recipientEmail) {
        try {
            await sendCertificateEmail({
                recipientEmail,
                recipientName: trimmedRecipient,
                certificateId,
                verifyUrl: `${baseUrl}/verify/${certificateId}`,
            });

            finalRecord = await prisma.certificate.update({
                where: { certificateId },
                data: {
                    status: "sent",
                    sentAt: new Date(),
                    failureReason: null,
                },
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to send certificate email.";
            await prisma.certificate.update({
                where: { certificateId },
                data: { status: "failed", failureReason: message },
            });
            console.error("Certificate email error:", error);
            return NextResponse.json(
                { error: "Failed to send certificate email." },
                { status: 500, headers: corsHeaders }
            );
        }
    }

    // ── 7. Log API usage ─────────────────────────────────────────────────
    try {
        await prisma.apiUsageLog.create({
            data: { userId: owner.id, endpoint: "create", statusCode: 201, certificateId },
        });
    } catch { /* non-critical */ }

    // ── 8. Return response ───────────────────────────────────────────────
    return NextResponse.json(
        {
            success: true,
            certificateId,
            status: finalRecord.status,
            batchId: finalRecord.batchId,
            pdfUrl: finalRecord.pdfUrl,
            verifyUrl: `${baseUrl}/verify/${certificateId}`,
        },
        { status: 201, headers: corsHeaders }
    );
}
