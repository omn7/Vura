import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

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

        // We use ethereal or mock if env vars are missing
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.ethereal.email",
            port: Number(process.env.SMTP_PORT) || 587,
            auth: {
                user: process.env.SMTP_USER || "mock_user",
                pass: process.env.SMTP_PASS || "mock_pass",
            },
        });

        const resetUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

        try {
            await transporter.sendMail({
                from: process.env.SMTP_FROM || '"Vura" <noreply@vura.com>',
                to: email,
                subject: "Password Reset Request",
                html: `
                    <h1>Reset your password</h1>
                    <p>You requested to reset your password. Click the link below to set a new password:</p>
                    <a href="${resetUrl}">${resetUrl}</a>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                    <p>This link is valid for 1 hour.</p>
                `,
            });
        } catch (mailError: any) {
            // It might fail if no valid SMTP is configured. We'll still allow the token to be set, 
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
