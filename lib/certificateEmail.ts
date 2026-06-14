import { Resend } from "resend";
import nodemailer from "nodemailer";

const resendApiKey = process.env.RESEND_API_KEY;
// Initialize resend only if API key is present
const resend = resendApiKey && resendApiKey !== "mock" ? new Resend(resendApiKey) : null;

type SendCertificateEmailInput = {
    recipientEmail: string;
    recipientName: string;
    certificateId: string;
    verifyUrl: string;
    subject?: string;
    cc?: string;
    body?: string;
    theme?: string;
    course?: string;
};

type SendPasswordResetEmailInput = {
    email: string;
    resetUrl: string;
};

function encodeHtml(str: string): string {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}

function replacePlaceholders(
    template: string,
    data: { name: string; course: string; certificateId: string; verifyUrl: string }
): string {
    return template
        .replace(/{name}/g, data.name)
        .replace(/{course}/g, data.course)
        .replace(/{certificateId}/g, data.certificateId)
        .replace(/{verifyUrl}/g, data.verifyUrl);
}

function getEmailHtml({
    recipientName,
    certificateId,
    verifyUrl,
    course,
    bodyText,
    theme
}: {
    recipientName: string;
    certificateId: string;
    verifyUrl: string;
    course: string;
    bodyText: string;
    theme: string;
}): string {
    const formattedBody = bodyText.replace(/\n/g, "<br />");
    const safeName = encodeHtml(recipientName);
    const safeCertificateId = encodeHtml(certificateId);
    const safeVerifyUrl = encodeHtml(verifyUrl);

    if (theme === "modern") {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Certificate Ready</title>
            </head>
            <body style="margin:0;padding:0;background-color:#0b0f19;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0b0f19;padding:40px 20px;">
                    <tr>
                        <td align="center">
                            <table width="100%" max-width="600" style="max-width:600px;background-color:#121827;border:1px solid rgba(0,229,153,0.15);border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.5);overflow:hidden;text-align:left;">
                                <tr>
                                    <td style="padding:40px 30px;background:linear-gradient(135deg, #111827 0%, #0c0f1d 100%);">
                                        <div style="margin-bottom:24px;">
                                            <span style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:2px;">VURA</span>
                                        </div>
                                        <h2 style="margin:0 0 16px;color:#ffffff;font-size:22px;font-weight:700;line-height:1.3;">Your Certificate is Ready!</h2>
                                        <div style="color:#9ca3af;font-size:15px;line-height:1.6;margin-bottom:30px;">
                                            ${formattedBody}
                                        </div>
                                        <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom:30px;">
                                            <tr>
                                                <td align="center" style="border-radius:12px;background:linear-gradient(90deg, #00e599 0%, #00bcff 100%);padding:1px;">
                                                    <a href="${safeVerifyUrl}" target="_blank" style="display:inline-block;padding:14px 28px;background-color:#121827;border-radius:11px;font-size:15px;font-weight:700;color:#00e599;text-decoration:none;letter-spacing:0.5px;">VIEW CERTIFICATE &rarr;</a>
                                                </td>
                                            </tr>
                                        </table>
                                        <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;margin-top:20px;font-size:12px;color:#6b7280;line-height:1.5;">
                                            <p style="margin:0 0 4px;">Certificate ID: <span style="font-family:monospace;color:#00e599;">${safeCertificateId}</span></p>
                                            <p style="margin:0;">This email was sent by Vura Certificate Authority.</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;
    }

    if (theme === "minimalist") {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Certificate Ready</title>
            </head>
            <body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111111;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;padding:40px 20px;">
                    <tr>
                        <td align="left" style="max-width:600px;width:100%;margin:0 auto;">
                            <div style="font-size:16px;font-weight:800;letter-spacing:1px;margin-bottom:40px;color:#000000;">VURA</div>
                            <h2 style="font-size:24px;font-weight:400;margin:0 0 24px;color:#000000;">Certificate Available</h2>
                            <div style="font-size:15px;line-height:1.7;color:#333333;margin-bottom:32px;">
                                ${formattedBody}
                            </div>
                            <div style="margin-bottom:40px;">
                                <a href="${safeVerifyUrl}" target="_blank" style="display:inline-block;padding:12px 24px;background-color:#000000;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;">View and Verify</a>
                            </div>
                            <div style="border-top:1px solid #eeeeee;padding-top:24px;font-size:12px;color:#888888;line-height:1.5;">
                                <p style="margin:0 0 4px;">Certificate ID: ${safeCertificateId}</p>
                                <p style="margin:0;">Vura Certificate Authority</p>
                            </div>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;
    }

    // Default "formal" theme
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Certificate Ready</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;color:#1f2937;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6;padding:40px 20px;">
                <tr>
                    <td align="center">
                        <table width="100%" max-width="600" style="max-width:600px;background-color:#ffffff;border-top:4px solid #111827;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.05);overflow:hidden;text-align:left;">
                            <tr>
                                <td style="padding:40px 30px;">
                                    <div style="font-size:18px;font-weight:bold;color:#111827;margin-bottom:24px;letter-spacing:1px;">VURA</div>
                                    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:700;line-height:1.3;">Certificate Issuance Notification</h2>
                                    <div style="color:#4b5563;font-size:15px;line-height:1.6;margin-bottom:30px;">
                                        ${formattedBody}
                                    </div>
                                    <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom:30px;">
                                        <tr>
                                            <td align="center" style="border-radius:6px;background-color:#111827;">
                                                <a href="${safeVerifyUrl}" target="_blank" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">Verify Certificate</a>
                                            </td>
                                        </tr>
                                    </table>
                                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;"/>
                                    <div style="font-size:12px;color:#9ca3af;line-height:1.5;">
                                        <p style="margin:0 0 4px;">Certificate ID: ${safeCertificateId}</p>
                                        <p style="margin:0;">This is an automated message sent by Vura Certificate Service.</p>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
}

export async function sendCertificateEmail({
    recipientEmail,
    recipientName,
    certificateId,
    verifyUrl,
    subject: customSubject,
    cc,
    body: customBody,
    theme = "formal",
    course = "Course/Event"
}: SendCertificateEmailInput): Promise<boolean> {
    // Replace localhost urls with vura.vercel.app in verification emails
    let finalVerifyUrl = verifyUrl;
    if (verifyUrl.includes("localhost") || verifyUrl.includes("127.0.0.1")) {
        finalVerifyUrl = verifyUrl.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, "https://vura.vercel.app");
    }

    const placeholderData = {
        name: recipientName,
        course,
        certificateId,
        verifyUrl: finalVerifyUrl
    };

    const finalSubject = customSubject
        ? replacePlaceholders(customSubject, placeholderData)
        : `Your certificate for ${course} is ready`;

    const defaultBody = `Hello {name},\n\nYour certificate for {course} has been generated and is ready to view.\n\nYou can view and verify your certificate here: {verifyUrl}\n\nIf you did not expect this email, you can ignore it.`;
    const finalBodyText = replacePlaceholders(customBody || defaultBody, placeholderData);
    const htmlContent = getEmailHtml({
        recipientName,
        certificateId,
        verifyUrl: finalVerifyUrl,
        course,
        bodyText: finalBodyText,
        theme
    });

    const fromAddress = process.env.RESEND_FROM || process.env.SMTP_FROM || "Vura <onboarding@resend.dev>";
    const parsedCc = cc && cc.trim() ? cc.split(",").map(c => c.trim()).filter(Boolean) : undefined;

    // 1. Attempt Resend
    if (resend) {
        try {
            const payload: any = {
                from: fromAddress,
                to: recipientEmail,
                subject: finalSubject,
                html: htmlContent
            };
            if (parsedCc && parsedCc.length > 0) {
                payload.cc = parsedCc;
            }

            const { data, error } = await resend.emails.send(payload);

            if (error) {
                console.warn("Resend API warning/error:", error.message);
                throw new Error(error.message);
            }

            return true;
        } catch (error: any) {
            console.error("Resend sending failed. Attempting SMTP fallback...", error.message);
            // If Resend failed (e.g. sandbox restriction or wrong domain) and we have SMTP host, fall through to SMTP!
            if (!process.env.SMTP_HOST) {
                throw error;
            }
        }
    }

    // 2. Attempt SMTP Fallback (e.g. if they don't have a verified domain on Resend!)
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
                tls: {
                    rejectUnauthorized: false
                }
            });

            await transporter.sendMail({
                from: fromAddress,
                to: recipientEmail,
                cc: parsedCc,
                subject: finalSubject,
                html: htmlContent,
            });

            console.log(`[SMTP] Successfully delivered email to ${recipientEmail}`);
            return true;
        } catch (smtpError: any) {
            console.error("SMTP sending failed:", smtpError);
            throw smtpError;
        }
    }

    // 3. Fallback for development without Resend API Key and SMTP config
    console.log("=== MOCK EMAIL SENT ===");
    console.log(`To: ${recipientEmail}`);
    if (parsedCc) console.log(`CC: ${parsedCc.join(", ")}`);
    console.log(`From: ${fromAddress}`);
    console.log(`Subject: ${finalSubject}`);
    console.log(`Theme: ${theme}`);
    console.log(`Body (Plaintext): \n${finalBodyText}`);
    console.log("========================");
    return true;
}

export async function sendPasswordResetEmail({
    email,
    resetUrl
}: SendPasswordResetEmailInput): Promise<boolean> {
    const fromAddress = process.env.RESEND_FROM || process.env.SMTP_FROM || "Vura <onboarding@resend.dev>";

    const htmlContent = `
        <div style="font-family:sans-serif;line-height:1.6;color:#1f2937;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e5e7eb;border-radius:8px;">
            <h2 style="color:#111827;">Reset your password</h2>
            <p>You requested to reset your password. Click the link below to set a new password:</p>
            <div style="margin:24px 0;">
                <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background-color:#111827;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">Reset Password</a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="font-family:monospace;background-color:#f3f4f6;padding:12px;border-radius:4px;word-break:break-all;font-size:13px;">${resetUrl}</p>
            <p style="color:#6b7280;font-size:14px;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
            <p style="color:#9ca3af;font-size:12px;border-top:1px solid #e5e7eb;padding-top:16px;margin-top:24px;">This link is valid for 1 hour.</p>
        </div>
    `;

    // 1. Attempt Resend
    if (resend) {
        try {
            const { data, error } = await resend.emails.send({
                from: fromAddress,
                to: email,
                subject: "Password Reset Request",
                html: htmlContent
            });

            if (error) {
                console.warn("Resend reset email API warning:", error.message);
                throw new Error(error.message);
            }

            return true;
        } catch (error: any) {
            console.error("Resend sending reset email failed. Attempting SMTP fallback...", error.message);
            if (!process.env.SMTP_HOST) {
                throw error;
            }
        }
    }

    // 2. Attempt SMTP
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
                tls: {
                    rejectUnauthorized: false
                }
            });

            await transporter.sendMail({
                from: fromAddress,
                to: email,
                subject: "Password Reset Request",
                html: htmlContent,
            });

            console.log(`[SMTP] Successfully delivered reset email to ${email}`);
            return true;
        } catch (smtpError: any) {
            console.error("SMTP sending reset failed:", smtpError);
            throw smtpError;
        }
    }

    // 3. Dev Fallback
    console.log("=== MOCK PASSWORD RESET EMAIL SENT ===");
    console.log(`To: ${email}`);
    console.log(`From: ${fromAddress}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log("======================================");
    return true;
}
