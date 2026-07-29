import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        // Ensure the certificate belongs to the requesting user
        const cert = await prisma.certificate.findUnique({
            where: { certificateId: id },
            select: { userId: true },
        });

        if (!cert) {
            return NextResponse.json({ error: "Certificate not found." }, { status: 404 });
        }

        if (cert.userId !== session.user.id) {
            return NextResponse.json({ error: "You do not own this certificate." }, { status: 403 });
        }

        await prisma.certificate.delete({ where: { certificateId: id } });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(`Failed to delete certificate ${id}:`, error);
        // More granular error handling could be added, e.g., if ID is malformed or DB connection issues
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
