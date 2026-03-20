import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, Award, TrendingUp, Calendar, AlertTriangle, ExternalLink, ShieldCheck } from "lucide-react";
import CertificatesGrid from "@/components/CertificatesGrid";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    const certificates = await prisma.certificate.findMany({
        where: { userId: session!.user.id },
        orderBy: { createdAt: "desc" },
    });

    const thisMonth = certificates.filter(
        c => new Date(c.createdAt).getMonth() === new Date().getMonth()
    ).length;
    const revoked = certificates.filter(c => c.revoked).length;
    const valid = certificates.length - revoked;

    const STATS = [
        { label: "Total Generated", value: certificates.length, icon: Award, color: "var(--color-neon-primary)", bg: "rgba(0,229,153,0.08)" },
        { label: "This Month", value: thisMonth, icon: Calendar, color: "#007acc", bg: "rgba(0,122,204,0.08)" },
        { label: "Valid / Active", value: valid, icon: TrendingUp, color: "#10b981", bg: "rgba(16,185,129,0.08)" },
        { label: "Revoked", value: revoked, icon: AlertTriangle, color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
    ];

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Certificates</h1>
                    <p className="text-sm text-[var(--color-neon-muted)] mt-1">
                        {certificates.length} certificate{certificates.length !== 1 ? "s" : ""} generated on your account
                    </p>
                </div>
                <Link href="/app" className="btn-primary py-2.5 px-5 flex items-center gap-2 text-sm w-fit">
                    Generate New <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map(s => (
                    <div key={s.label} className="metric-card flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-[var(--color-neon-muted)] uppercase tracking-wider">{s.label}</p>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                                <s.icon className="w-4 h-4" style={{ color: s.color }} />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-white">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Empty state or grid */}
            {certificates.length === 0 ? (
                <div className="glass-card flex flex-col items-center justify-center p-16 text-center" style={{ borderStyle: "dashed" }}>
                    <div className="w-16 h-16 rounded-2xl bg-[var(--color-neon-primary)]/08 border border-[var(--color-neon-primary)]/20 flex items-center justify-center mb-5">
                        <Award className="w-8 h-8 text-[var(--color-neon-primary)] opacity-70" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No certificates yet</h3>
                    <p className="text-sm text-[var(--color-neon-muted)] max-w-sm mb-6">
                        Head to the generator to create your first batch from a PDF template and Excel sheet.
                    </p>
                    <Link href="/app" className="btn-primary text-sm px-6 flex items-center gap-2">
                        Generate Certificates <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <>
                    {/* Table header */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-white">Recent Certificates</h2>
                        <span className="text-xs text-[var(--color-neon-muted)]">Showing {certificates.length} records</span>
                    </div>

                    {/* Recent certificates table (top 5) */}
                    <div className="rounded-2xl border border-[var(--color-neon-border)] bg-[var(--color-neon-surface)] overflow-hidden">
                        <table className="data-table w-full">
                            <thead>
                                <tr>
                                    <th>Recipient</th>
                                    <th className="hidden sm:table-cell">Course</th>
                                    <th className="hidden md:table-cell">Date</th>
                                    <th>Cert ID</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {certificates.slice(0, 10).map((cert) => (
                                    <tr key={cert.certificateId}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[var(--color-neon-primary)]/10 border border-[var(--color-neon-primary)]/20 flex items-center justify-center shrink-0">
                                                    <span className="text-[10px] font-bold text-[var(--color-neon-primary)]">
                                                        {cert.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="font-medium text-white text-sm">{cert.name}</span>
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell text-[var(--color-neon-muted)] text-sm">{cert.course}</td>
                                        <td className="hidden md:table-cell text-[var(--color-neon-muted)] text-sm">{cert.issueDate}</td>
                                        <td>
                                            <span className="font-mono text-xs text-[var(--color-neon-primary)] bg-[var(--color-neon-primary)]/10 px-2 py-1 rounded">
                                                {cert.certificateId}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center justify-end gap-2">
                                                <a href={cert.pdfUrl} target="_blank" rel="noreferrer"
                                                    className="p-1.5 text-[var(--color-neon-muted)] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                                    title="View PDF">
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                                <Link href={`/verify/${cert.certificateId}`} target="_blank"
                                                    className="p-1.5 text-[var(--color-neon-muted)] hover:text-[var(--color-neon-primary)] hover:bg-[var(--color-neon-primary)]/08 rounded-lg transition-colors"
                                                    title="Verify">
                                                    <ShieldCheck className="w-3.5 h-3.5" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Full grid below */}
                    <div className="pt-2">
                        <h2 className="text-sm font-semibold text-white mb-4">All Certificates</h2>
                        <CertificatesGrid initialCerts={certificates} />
                    </div>
                </>
            )}
        </div>
    );
}
