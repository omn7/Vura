import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
    isBlocked,
    recordFailedAttempt,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Rate-limit constants for the verify endpoint.
// Only 404 misses are penalised â€” legitimate QR scans always hit,
// so real users are never throttled under normal usage.
const VERIFY_RATE_KEY_PREFIX = "verify:";

async function logUsage(
    userId: string | null | undefined,
    statusCode: number,
    certificateId?: string,
) {
    if (!userId) return;
    try {
        await prisma.apiUsageLog.create({
            data: {
                userId,
                endpoint: "verify",
                statusCode,
                certificateId: certificateId ?? null,
            },
        });
    } catch { /* non-critical */ }
}

// Allow any origin so external agents (OpenClaw, Telegram bots, etc.)
// can call this endpoint; authentication is not required for verification.
export async function GET(req: NextRequest) {
    // â”€â”€ Rate limiting â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Throttle by IP to prevent certificate ID enumeration attacks.
    // Without this, the 32-bit (now 128-bit) ID space could be probed
    // by concurrent scripts to harvest recipient PII at scale.
    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req.headers.get("x-real-ip") ??
        "anonymous";
    const rateLimitKey = `${VERIFY_RATE_KEY_PREFIX}${ip}`;

    const blockStatus = await isBlocked(rateLimitKey);
    if (blockStatus.blocked) {
        return NextResponse.json(
            { error: "Too many verification attempts. Please try again later." },
            { status: 429, headers: corsHeaders() },
        );
    }

    // â”€â”€ Extract certificate ID â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Parse from the URL path â€” most reliable across Next.js 15/16.
    const segments = new URL(req.url).pathname.split("/");
    const id = segments[segments.length - 1];

    if (!id || id.trim() === "") {
        return NextResponse.json(
            { error: "Certificate ID is required." },
            { status: 400, headers: corsHeaders() },
        );
    }

    try {
        // â”€â”€ Single DB query (previously two separate queries for same row) â”€â”€
        // Previously the handler issued two findUnique calls for the same
        // certificateId â€” one for display fields and one for userId logging.
        // Combined into a single round-trip to halve DB load on this hot path.
        const certificate = await prisma.certificate.findUnique({
            where: { certificateId: id.trim().toUpperCase() },
            select: {
                certificateId: true,
                name: true,
                course: true,
                issueDate: true,
                revoked: true,
                userId: true, // included here instead of a second query
            },
        });

        // 404 â€” certificate not found; count as a failed attempt to throttle scanners
        if (!certificate) {
            await recordFailedAttempt(rateLimitKey);
            return NextResponse.json(
                { error: "Certificate not found." },
                { status: 404, headers: corsHeaders() },
            );
        }

        // 403 â€” certificate has been revoked
        if (certificate.revoked) {
            void logUsage(certificate.userId, 403, certificate.certificateId);
            return NextResponse.json(
                { error: "This certificate has been revoked by the issuer." },
                { status: 403, headers: corsHeaders() },
            );
        }

        // 200 â€” valid certificate
        void logUsage(certificate.userId, 200, certificate.certificateId);
        return NextResponse.json(
            {
                verified: true,
                certificateId: certificate.certificateId,
                recipient: certificate.name,
                course: certificate.course,
                issuedOn: certificate.issueDate,
            },
            { status: 200, headers: corsHeaders() },
        );
    } catch (error) {
        console.error("Verification error:", error);
        return NextResponse.json(
            { error: "Internal server error. Please try again later." },
            { status: 500, headers: corsHeaders() },
        );
    }
}

// Preflight support so browsers / agents don't get blocked by CORS
export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

function corsHeaders(): HeadersInit {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
}