import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle, LogOut, ArrowRight, Home } from "lucide-react";
import Image from "next/image";

export default async function DashboardPage() {
    let session = null;
    try {
        session = await getServerSession(authOptions);
    } catch (e) {
        console.warn("Session invalid or decryption failed", e);
    }

    if (!session || !session.user) {
        redirect("/login");
    }

    const certificates = await prisma.certificate.findMany({
        where: {
            userId: session.user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <main className="flex-1 flex flex-col pt-24 pb-20 px-6 sm:px-12 z-10 relative">
            <div className="glow-bg" style={{ top: "0%" }}></div>

            <div className="max-w-6xl mx-auto w-full relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center mb-1">
                            Your Dashboard
                        </h1>
                        <p className="text-[var(--color-neon-muted)]">
                            Welcome back, <span className="text-white font-semibold">{session.user.name}</span>
                        </p>
                    </div>

                    <div className="flex gap-4 items-center">
                        {session.user.image && (
                            <Image src={session.user.image} alt="Profile" width={40} height={40} className="rounded-full border-2 border-[var(--color-neon-primary)]" />
                        )}
                        <Link href="/api/auth/signout" className="btn-secondary flex items-center">
                            <LogOut className="w-4 h-4 mr-2" /> Sign Out
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="btn-secondary py-2 flex items-center">
                        <Home className="w-4 h-4 mr-2" /> Home
                    </Link>
                    <Link href="/app" className="btn-primary py-2 flex items-center">
                        Create New <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </div>

                {certificates.length === 0 ? (
                    <div className="glass-card flex flex-col items-center justify-center p-16 text-center border-dashed">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-neon-surface-hover)] flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-[var(--color-neon-muted)] opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">You don&apos;t have any certificates yet</h3>
                        <p className="text-[var(--color-neon-muted)] max-w-md mb-6">
                            You haven't generated any certificates with your account. Head over to the generator to create your first batch!
                        </p>
                        <Link href="/app" className="btn-primary">
                            Generate Certificates
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {certificates.map((cert) => (
                            <div key={cert.certificateId} className="glass-card flex flex-col p-5 hover:border-[var(--color-neon-primary)] transition-colors group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-semibold text-lg">{cert.name}</h3>
                                        <p className="text-[var(--color-neon-muted)] text-sm line-clamp-1">{cert.course}</p>
                                    </div>
                                </div>

                                <div className="bg-black/30 p-3 rounded-lg mb-4">
                                    <div className="text-xs text-[var(--color-neon-muted)] mb-1">Certificate ID</div>
                                    <div className="font-mono text-sm text-[var(--color-neon-primary)] truncate">
                                        {cert.certificateId}
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-auto pt-2">
                                    <a
                                        href={cert.pdfUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs bg-[var(--color-neon-surface-hover)] border border-[var(--color-neon-border)] hover:border-[var(--color-neon-primary)] px-3 py-2 rounded-lg flex-1 text-center transition-colors"
                                    >
                                        View PDF
                                    </a>
                                    <a
                                        href={`/verify/${cert.certificateId}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs bg-[var(--color-neon-primary)] text-black font-semibold hover:bg-[#00ffaa] flex-1 px-3 py-2 rounded-lg text-center transition-colors"
                                    >
                                        Verify
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
