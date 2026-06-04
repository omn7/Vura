import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { validateResetPassword } from "@/lib/validation/auth";
import { resetPasswordSchema } from "@/lib/validations";
import {
    AUTH_RATE_LIMIT_MESSAGE,
    clearFailedAttempts,
    getRateLimitKey,
    getRetryAfterHeaders,
    isBlocked,
    recordFailedAttempt,
} from "@/lib/rate-limit";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const rateLimitKey = getRateLimitKey(
            "reset-password",
            typeof body?.token === "string"
                ? body.token
                : "anonymous",
            req.headers
        );

        const blockStatus = await isBlocked(rateLimitKey);

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

        try {
            validateResetPassword(body);
        } catch (err) {
            if (err instanceof ZodError) {
                return NextResponse.json(
                    {
                        message: "Invalid input",
                       errors: err.issues,
                    },
                    { status: 400 }
                );
            }

            throw err;
        }

        const parsed = resetPasswordSchema.safeParse(body);

        if (!parsed.success) {
            await recordFailedAttempt(rateLimitKey);

            const error = parsed.error.issues[0].message;

            return NextResponse.json(
                { error },
                { status: 400 }
            );
        }

        const { token, password } = parsed.data;

        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: {
                    gt: new Date(),
                },
            },
        });

        if (!user) {
            await recordFailedAttempt(rateLimitKey);

            return NextResponse.json(
                {
                    message:
                        "Invalid or expired password reset token",
                },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            },
        });

        await clearFailedAttempts(rateLimitKey);

        return NextResponse.json(
            { message: "Password reset successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Reset password error:", error);

        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}