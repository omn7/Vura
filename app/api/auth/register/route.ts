import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";
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
            "register",
            typeof body?.email === "string"
                ? body.email
                : "anonymous",
            req.headers
        );

        const blockStatus = isBlocked(rateLimitKey);

        if (blockStatus.blocked) {
            return NextResponse.json(
                { message: AUTH_RATE_LIMIT_MESSAGE },
                {
                    status: 429,
                    headers: getRetryAfterHeaders(
                        blockStatus.retryAfter
                    ),
                }
            );
        }

        const parsed = registerSchema.safeParse(body);

        if (!parsed.success) {
            recordFailedAttempt(rateLimitKey);
            const error = parsed.error.issues[0].message;
            return NextResponse.json({ error }, { status: 400 });
        }

        const { name, email, password } = parsed.data;
        const normalizedEmail = email.toLowerCase();

        const existing = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (existing) {
            return NextResponse.json(
                { error: "An account with this email already exists" },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email: normalizedEmail,
                password: hashedPassword,
            },
        });

        return NextResponse.json(
            { message: "Account created successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}
