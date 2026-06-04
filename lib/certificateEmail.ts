import nodemailer from "nodemailer";

type SendCertificateEmailInput = {
    recipientEmail: string;
    recipientName: string;
    certificateId: string;
    verifyUrl: string;
};

function encodeHtml(str: string): string {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}

export async function sendCertificateEmail({ recipientEmail, recipientName, certificateId, verifyUrl }: SendCertificateEmailInput) {
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const appBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"; // Ensure base URL is from trusted source

    if (!smtpHost || !smtpUser || !smtpPass || !recipientEmail) {
        console.error("Missing SMTP configuration or recipient email.");
        return false;
    }

    // Sanitize recipientName and certificateId to prevent XSS in email clients
    const safeRecipientName = encodeHtml(recipientName);
    const safeCertificateId = encodeHtml(certificateId);

    // Validate and sanitize verifyUrl to prevent open redirects/phishing if it were user-controlled.
    // Assuming verifyUrl comes from a trusted source (appBaseUrl + certificateId), it's relatively safe.
    const safeVerifyUrl = new URL(verifyUrl, appBaseUrl).toString(); // Ensure it's an absolute URL and guards against malformed paths

    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // Use 'true' if port is 465, 'false' otherwise
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
    });

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Vura" <noreply@vura.com>',
            to: recipientEmail,
            subject: `Your certificate for ${safeCertificateId} is ready`,
            html: `
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
                    <h2 style="margin:0 0 12px">Your certificate is ready</h2>
                    <p>Hello ${safeRecipientName},</p>
                    <p>Your certificate <strong>${safeCertificateId}</strong> has been generated and is ready to view.</p>
                    <p>You can view and verify your certificate here: <a href="${safeVerifyUrl}">${safeVerifyUrl}</a></p>
                    <p>If you did not expect this email, you can ignore it.</p>
                    <hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0;"/>
                    <p style="font-size:12px;color:#6b7280;">This email was sent by Vura Certificate Authority.</p>
                </div>
            `,
        });
        return true;
    } catch (error) {
        console.error("Error sending certificate email:", error);
        return false;
    }
}
