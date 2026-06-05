import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ valid: false, error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");
        const batchId = searchParams.get("batchId");

        if (!token || !batchId) {
            return NextResponse.json({ valid: false, error: "Missing parameters" }, { status: 400 });
        }

        const composeSession = await prisma.composeSession.findUnique({
            where: { token },
        });

        if (!composeSession) {
            return NextResponse.json({ valid: false, error: "Compose session not found." });
        }

        if (composeSession.batchId !== batchId) {
            return NextResponse.json({ valid: false, error: "Batch mismatch." });
        }

        if (composeSession.userId !== session.user.id) {
            return NextResponse.json({ valid: false, error: "User mismatch." });
        }

        if (new Date() > new Date(composeSession.expiresAt)) {
            return NextResponse.json({ valid: false, error: "Compose session has expired." });
        }

        return NextResponse.json({ valid: true });
    } catch (err: any) {
        console.error("Verify compose session error:", err);
        return NextResponse.json({ valid: false, error: err.message || "Failed to verify session" }, { status: 500 });
    }
}
