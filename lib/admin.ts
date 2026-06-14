import { cookies } from "next/headers";

/**
 * Verifies if the request session cookie matches the configured admin passcode.
 */
export async function verifyAdminSession(): Promise<boolean> {
    try {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("vura_admin_session")?.value;
        const adminPasscode = process.env.ADMIN_PASSCODE || "vura-admin-secret-2026";
        return sessionToken === adminPasscode;
    } catch {
        return false;
    }
}
