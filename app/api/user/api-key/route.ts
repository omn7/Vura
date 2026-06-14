import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs"; // Import bcryptjs for hashing

export const dynamic = "force-dynamic";

// Generate a new, cryptographically secure API key
function generateApiKey(): string {
    // Increase entropy: 32 bytes for 64-char hex string, plus 'vura_' prefix
    return "vura_" + randomBytes(32).toString("hex");
}

// GET — return the current masked key (or null if not generated yet)
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { apiKey: true },
        });

        // Do NOT return the plaintext API key. Return a masked version.
        const maskedApiKey = user?.apiKey ? `vura_************${user.apiKey.slice(-4)}` : null;

        return NextResponse.json({ apiKey: maskedApiKey });
    } catch (error) {
        console.error("Failed to retrieve API key:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST — generate (first time) or rotate the API key
export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const plaintextApiKey = generateApiKey();
        // Hash the plaintext API key before storing it
        const hashedApiKey = await bcrypt.hash(plaintextApiKey, 10); // Use a salt round of 10

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: { apiKey: hashedApiKey }, // Store the hash
            select: { apiKey: true }, // Select the hash to confirm, though not directly used for response
        });

        // Only return the plaintext API key ONCE upon generation/rotation.
        // The client should store this securely and never expect to retrieve it again in plaintext.
        return NextResponse.json({ apiKey: plaintextApiKey });
    } catch (error) {
        console.error("Failed to generate/rotate API key:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
