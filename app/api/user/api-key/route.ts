import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

function generateApiKey(): string {
    return "vura_" + randomBytes(24).toString("hex");
}

// GET — return the current key (or null if not generated yet)
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { apiKey: true },
    });

    return NextResponse.json({ apiKey: user?.apiKey ?? null }, { status: 200 });
}

// POST — generate (first time) or rotate the API key
export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { apiKey: generateApiKey() },
        select: { apiKey: true },
    });

    return NextResponse.json({ apiKey: user.apiKey }, { status: 201 });
}
