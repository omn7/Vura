import prisma from "@/lib/prisma"
import { CheckCircle2, XCircle, ExternalLink, Calendar, GraduationCap, User, ShieldCheck, Hash } from "lucide-react"
import Link from "next/link"

export default async function VerifyPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;

    const certificate = await prisma.certificate.findUnique({
        where: { certificateId: id }
    });

    if (!certificate) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative">
                {/* Background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.12)_0%,transparent_60%)] pointer-events-none" />
                <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

                <div className="relative z-10 w-full max-w-md">
                    {/* Header brand */}
                    <div className="flex justify-center mb-8">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg bg-[var(--color-neon-primary)] flex items-center justify-center shadow-[0_0_12px_rgba(0,229,153,0.4)]">
                                <div className="w-3 h-3 bg-black rounded-sm rotate-45" />
                            </div>
                            <span className="text-xl font-black tracking-widest uppercase text-white">VURA</span>
                        </Link>
                    </div>

                    <div className="glass-card text-center border-red-500/20" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
                        {/* Animated ring */}
                        <div className="relative w-24 h-24 mx-auto mb-6">
                            <div className="absolute inset-0 rounded-full border-2 border-red-500/20 animate-ping" />
                            <div className="w-24 h-24 rounded-full border-2 border-red-500/30 bg-red-500/08 flex items-center justify-center">
                                <XCircle className="w-10 h-10 text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
                            </div>
                        </div>

                        <div className="badge-invalid mx-auto mb-4 w-fit">✗ Invalid Certificate</div>

                        <h1 className="text-2xl font-bold text-white mb-3">Certificate Not Found</h1>
                        <p className="text-[var(--color-neon-muted)] text-sm leading-relaxed mb-6">
                            No certificate matching this ID exists in our registry. It may have been revoked, or the ID may be incorrect.
                        </p>

                        <div className="bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-xl p-3 mb-6 font-mono text-sm text-[var(--color-neon-muted)] text-center">
                            {id}
                        </div>

                        <Link href="/" className="btn-secondary w-full flex items-center justify-center text-sm">Go Back to Vura</Link>
                    </div>

                    <p className="text-center text-xs text-[var(--color-neon-muted)] mt-6 flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-neon-primary)]" />
                        Verified by Vura Certificate Authority
                    </p>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative">
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,153,0.1)_0%,transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

            <div className="relative z-10 w-full max-w-lg">
                {/* Header brand */}
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-neon-primary)] flex items-center justify-center shadow-[0_0_12px_rgba(0,229,153,0.4)] group-hover:shadow-[0_0_22px_rgba(0,229,153,0.6)] transition-all">
                            <div className="w-3 h-3 bg-black rounded-sm rotate-45" />
                        </div>
                        <span className="text-xl font-black tracking-widest uppercase text-white">VURA</span>
                    </Link>
                </div>

                <div className="glass-card border-[var(--color-neon-primary)]/15" style={{ borderColor: "rgba(0,229,153,0.18)" }}>
                    {/* Status header */}
                    <div className="flex flex-col items-center pb-7 mb-7 border-b border-[var(--color-neon-border)]">
                        {/* Animated check ring */}
                        <div className="relative w-24 h-24 mb-5">
                            <div className="absolute inset-0 rounded-full border-2 border-[var(--color-neon-primary)]/20 animate-ping" style={{ animationDuration: '2.5s' }} />
                            <div className="absolute inset-2 rounded-full border border-[var(--color-neon-primary)]/10" />
                            <div className="w-24 h-24 rounded-full border-2 border-[var(--color-neon-primary)]/40 bg-[var(--color-neon-primary)]/08 flex items-center justify-center shadow-[0_0_40px_rgba(0,229,153,0.2)]">
                                <CheckCircle2 className="w-10 h-10 text-[var(--color-neon-primary)] drop-shadow-[0_0_14px_rgba(0,229,153,0.7)]" />
                            </div>
                        </div>

                        <div className="badge-valid mb-3">✓ Valid Certificate</div>
                        <h1 className="text-2xl font-bold text-white mb-2">Authenticity Confirmed</h1>
                        <span className="font-mono text-xs text-[var(--color-neon-muted)] bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] px-4 py-1.5 rounded-full">
                            {certificate.certificateId}
                        </span>
                    </div>

                    {/* Detail rows */}
                    <div className="space-y-1 mb-7">
                        {[
                            { icon: User, label: "Recipient Name", value: certificate.name },
                            { icon: GraduationCap, label: "Course / Certification", value: certificate.course },
                            { icon: Calendar, label: "Date of Issue", value: certificate.issueDate },
                            { icon: Hash, label: "Certificate ID", value: certificate.certificateId, mono: true },
                        ].map(({ icon: Icon, label, value, mono }) => (
                            <div key={label} className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-[var(--color-neon-surface-hover)] transition-colors group">
                                <div className="w-9 h-9 rounded-lg bg-[var(--color-neon-primary)]/08 border border-[var(--color-neon-primary)]/15 flex items-center justify-center shrink-0 group-hover:border-[var(--color-neon-primary)]/30 transition-all">
                                    <Icon className="w-4 h-4 text-[var(--color-neon-primary)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-[var(--color-neon-muted)] mb-0.5 uppercase tracking-wider">{label}</p>
                                    <p className={`text-white font-semibold truncate ${mono ? "font-mono text-xs" : "text-sm"}`}>{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <a href={certificate.pdfUrl} target="_blank" rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-4 text-sm font-bold text-black bg-[var(--color-neon-primary)] rounded-xl transition-all hover:bg-[#00ffaa] shadow-[0_0_20px_rgba(0,229,153,0.3)] hover:shadow-[0_0_30px_rgba(0,229,153,0.5)]">
                        <ExternalLink className="w-4 h-4" /> View Original PDF
                    </a>
                </div>

                {/* Footer note */}
                <div className="mt-6 flex flex-col items-center gap-2 text-center">
                    <div className="flex items-center gap-2 text-xs text-[var(--color-neon-muted)]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-neon-primary)]" />
                        <span>Verified by <span className="text-white font-semibold">Vura Certificate Authority</span></span>
                    </div>
                    <p className="text-xs text-[var(--color-neon-muted)] opacity-60">This certificate has been verified against the Vura registry.</p>
                </div>
            </div>
        </main>
    )
}
