import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { validateRegister } from "@/lib/validation/auth";
import { registerSchema } from "@/lib/validations";
import {
    AUTH_RATE_LIMIT_MESSAGE,
    clearFailedAttempts,
    getRateLimitKey,
    getRetryAfterHeaders,
    isBlocked,
    recordFailedAttempt,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

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
            var { email, password, name } = validateRegister(body) as {
                email: string;
                password: string;
                name?: string;
            };
        } catch (err) {
            if (err instanceof ZodError) {
                return NextResponse.json({ message: "Invalid input", errors: err.errors }, { status: 400 });
            }
            throw err;
        const parsed = registerSchema.safeParse(body);

        if (!parsed.success) {
            recordFailedAttempt(rateLimitKey);
            const error = parsed.error.issues[0].message;
            return NextResponse.json({ error }, { status: 400 });
        }

        const {
            email: rawEmail,
            password,
            name,
        } = parsed.data;
        const email = rawEmail.toLowerCase();

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            recordFailedAttempt(rateLimitKey);
            return NextResponse.json({ message: "User with this email already exists" }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user to database
        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
        });

        // Don't return the hashed password
        const { password: _, ...userWithoutPassword } = newUser;
        clearFailedAttempts(rateLimitKey);

        return NextResponse.json(
            { user: userWithoutPassword, message: "User created successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }
}
