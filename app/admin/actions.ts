"use server";

import { cookies } from "next/headers";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { Resend } from "resend";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;


// Helper to compute a secure cryptographic HMAC hash of the OTP
function hashOtp(otp: string): string {
    const salt = process.env.NEXTAUTH_SECRET || "vura-secret-salt-key-123456";
    return crypto.createHmac("sha256", salt).update(otp).digest("hex");
}

// Mailer function to send the verification code to the admin
async function sendOTPEmail(email: string, otp: string) {
    const subject = "Vura Admin Console Verification Code";
    const htmlContent = `
        <div style="font-family:sans-serif;line-height:1.6;color:#1f2937;max-width:500px;margin:0 auto;padding:30px;border:1px solid #e5e7eb;border-radius:12px;background-color:#ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
            <div style="font-size:20px;font-weight:900;letter-spacing:1px;margin-bottom:24px;color:#111827;">VURA <span style="font-size:12px;color:#ef4444;font-weight:bold;">ADMIN</span></div>
            <h2 style="color:#111827;font-size:22px;margin:0 0 16px;">Console Verification Code</h2>
            <p style="font-size:15px;color:#4b5563;">You are attempting to log into the Vura Admin Console. Use the following 6-digit One-Time Password (OTP) to complete your login. This code is valid for 5 minutes.</p>
            <div style="margin:28px 0;text-align:center;">
                <span style="display:inline-block;padding:12px 30px;background-color:#f3f4f6;color:#111827;font-family:monospace;font-size:28px;font-weight:bold;letter-spacing:4px;border-radius:8px;border:1px solid #e5e7eb;">${otp}</span>
            </div>
            <p style="color:#ef4444;font-size:13px;font-weight:bold;">Warning: If you did not initiate this request, please ignore this email or change your passcode immediately.</p>
            <p style="color:#9ca3af;font-size:12px;border-top:1px solid #e5e7eb;padding-top:16px;margin-top:24px;">Vura Secure Admin Console Authority</p>
        </div>
    `;

    const fromAddress = process.env.RESEND_FROM || process.env.SMTP_FROM || "Vura <onboarding@resend.dev>";
    
    // 1. Attempt SMTP first (highly reliable for direct self-sending with App Passwords)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: Number(process.env.SMTP_PORT) === 465,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
                tls: { rejectUnauthorized: false }
            });

            await transporter.sendMail({
                from: fromAddress,
                to: email,
                subject,
                html: htmlContent,
            });
            console.log(`[SMTP] Successfully delivered OTP code to ${email}`);
            return true;
        } catch (smtpError) {
            console.error("SMTP OTP sending failed, trying Resend fallback...", smtpError);
        }
    }

    // 2. Attempt Resend fallback
    const resendApiKey = process.env.RESEND_API_KEY;
    const resend = resendApiKey && resendApiKey !== "mock" ? new Resend(resendApiKey) : null;
    if (resend) {
        try {
            await resend.emails.send({
                from: fromAddress,
                to: email,
                subject,
                html: htmlContent
            });
            console.log(`[Resend] Successfully sent OTP code to ${email}`);
            return true;
        } catch (error) {
            console.error("Resend OTP failed...", error);
        }
    }

    // 3. Mock Fallback (Dev console print)
    console.log("=== MOCK OTP EMAIL SENT ===");
    console.log(`To: ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log("===========================");
    return true;

}

/**
 * Validates admin email and sends an OTP via email.
 */
export async function requestAdminOtp(email: string) {
    if (email !== ADMIN_EMAIL) {
        return { success: false, error: "Invalid administrator email." };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hash = hashOtp(otp);

    const cookieStore = await cookies();
    // Store hashed OTP in an HTTP-only cookie valid for 5 minutes
    cookieStore.set("vura_admin_otp_hash", hash, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 300, // 5 minutes
        path: "/"
    });

    // Send the OTP code via email
    await sendOTPEmail(ADMIN_EMAIL, otp);

    return { success: true, step: "otp" };
}

/**
 * Verifies the user-entered OTP and establishes the admin session cookie.
 */
export async function verifyAdminOtp(enteredOtp: string) {
    const cookieStore = await cookies();
    const storedHash = cookieStore.get("vura_admin_otp_hash")?.value;

    if (!storedHash) {
        return { success: false, error: "OTP expired or not found. Please request a new one." };
    }

    const calculatedHash = hashOtp(enteredOtp.trim());

    if (calculatedHash === storedHash) {
        // Clear OTP cookie
        cookieStore.set("vura_admin_otp_hash", "", { maxAge: 0, path: "/" });

        // Set the final admin session cookie
        const adminPasscode = process.env.ADMIN_PASSCODE || "vura-admin-secret-2026";
        cookieStore.set("vura_admin_session", adminPasscode, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24, // 1 day session
            path: "/"
        });

        return { success: true };
    }

    return { success: false, error: "Invalid verification code. Please try again." };
}

/**
 * Clears the admin session cookie.
 */
export async function logoutAdmin() {
    const cookieStore = await cookies();
    cookieStore.set("vura_admin_session", "", {
        maxAge: 0,
        path: "/"
    });
    return { success: true };
}
