import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/certificateEmail";
import { forgotPasswordSchema } from "@/lib/validations";

if (process.env.NODE_ENV === "production") {
    process.env.NEXTAUTH_URL = "https://vurakit.in";
    process.env.NEXT_PUBLIC_BASE_URL = "https://vurakit.in";
}
import {
    AUTH_RATE_LIMIT_MESSAGE,
    getRateLimitKey,
    getRetryAfterHeaders,
    isBlocked,
    recordFailedAttempt,
} from "@/lib/rate-limit";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const rateLimitKey = getRateLimitKey(
            "forgot-password",
            typeof body?.email === "string"
                ? body.email
                : "anonymous",
            req.headers
        );
        const blockStatus = isBlocked(rateLimitKey);

        if (blockStatus.blocked) {
            return NextResponse.json(
                {
                    message: AUTH_RATE_LIMIT_MESSAGE,
                },
                {
                    status: 429,
                    headers: getRetryAfterHeaders(
                        blockStatus.retryAfter
                    ),
                }
            );
        }

        const parsed = forgotPasswordSchema.safeParse(body);

        if (!parsed.success) {
            recordFailedAttempt(rateLimitKey);
            const error = parsed.error.issues[0].message;
            return NextResponse.json({ error }, { status: 400 });
        }

        const email = parsed.data.email.toLowerCase();

        const user = await prisma.user.findUnique({
            where: { email },
        });

        // For security, do not expose whether an account exists or not
        if (!user) {
            return NextResponse.json(
                { message: "If an account with that email exists, we sent a password reset link." },
                { status: 200 }
            );
        }

        // Generate a random token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        await prisma.user.update({
            where: { email },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: resetTokenExpiry,
            },
        });

        const resetUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

        try {
            await sendPasswordResetEmail({
                email,
                resetUrl
            });
        } catch (mailError: any) {
            // It might fail if no valid Resend key is configured. We'll still allow the token to be set, 
            // but we can log the error or print the url for dev purposes.
            console.error("Failed to send email. If you are in dev, here is the reset URL:", resetUrl);
            console.error(mailError);
        }

        return NextResponse.json(
            { message: "If an account with that email exists, we sent a password reset link." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }
}
