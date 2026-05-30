import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
<<<<<<< HEAD
=======
import { registerSchema } from "@/lib/validations";
import {
    AUTH_RATE_LIMIT_MESSAGE,
    getRateLimitKey,
    getRetryAfterHeaders,
    isBlocked,
    recordFailedAttempt,
} from "@/lib/rate-limit";
>>>>>>> 07a77bf (Fix: add rate limiting to authentication endpoints)

export async function POST(req: Request) {
    try {
        const body = await req.json();
<<<<<<< HEAD
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Missing required fields: name, email, password" },
                { status: 400 }
            );
        }

        const existing = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existing) {
            return NextResponse.json(
                { error: "An account with this email already exists." },
                { status: 400 }
=======

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
>>>>>>> 07a77bf (Fix: add rate limiting to authentication endpoints)
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
<<<<<<< HEAD
                email: email.toLowerCase(),
=======
                email: normalizedEmail,
>>>>>>> 07a77bf (Fix: add rate limiting to authentication endpoints)
                password: hashedPassword,
            },
        });

        return NextResponse.json(
<<<<<<< HEAD
            { message: "Account created successfully." },
=======
            { message: "Account created successfully" },
>>>>>>> 07a77bf (Fix: add rate limiting to authentication endpoints)
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
<<<<<<< HEAD
            { error: "Something went wrong. Please try again." },
=======
            { message: "Something went wrong" },
>>>>>>> 07a77bf (Fix: add rate limiting to authentication endpoints)
            { status: 500 }
        );
    }
}
