import prisma from "@/lib/prisma";
import { Users, Award, ShieldAlert, FileText, Mail, Activity, Eye } from "lucide-react";
import Link from "next/link";
import OverviewCharts from "@/components/admin/OverviewCharts";

export const dynamic = "force-dynamic";

async function getVisitorCount(): Promise<number> {
    try {
        const response = await fetch("https://api.visitorbadge.io/api/visitors?path=omn7.Vura", {
            next: { revalidate: 300 } // Cache for 5 minutes
        });
        if (!response.ok) return 232;
        const text = await response.text();
        const match = text.match(/<title>VISITORS:\s*(\d+)<\/title>/i) || text.match(/aria-label="VISITORS:\s*(\d+)"/i);
        return match ? parseInt(match[1], 10) : 232;
    } catch (err) {
        console.error("Failed to fetch visitor count:", err);
        return 232;
    }
}

export default async function AdminOverviewPage() {
    // 1. Fetch High Level COUNTS
    const totalUsers = await prisma.user.count();
    const totalCertificates = await prisma.certificate.count();
    const totalTemplates = await prisma.template.count();
    const totalEvents = await prisma.event.count();
    const totalApiLogs = await prisma.apiUsageLog.count();
    const totalVisitors = await getVisitorCount();

    // 2. Fetch Email Queue Status
    const totalEmails = await prisma.emailQueue.count();
    const emailsPending = await prisma.emailQueue.count({ where: { status: "pending" } });
    const emailsSent = await prisma.emailQueue.count({ where: { status: "sent" } });
    const emailsFailed = await prisma.emailQueue.count({ where: { status: "failed" } });

    // 3. Fetch Certificate Statuses
    const certsSent = await prisma.certificate.count({ where: { status: "sent" } });
    const certsPending = await prisma.certificate.count({ where: { status: "pending" } });
    const certsFailed = await prisma.certificate.count({ where: { status: "failed" } });
    const certsRevoked = await prisma.certificate.count({ where: { revoked: true } });

    // 4. Fetch Month-by-Month Certificate Trend (Last 6 Months)
    const certificates = await prisma.certificate.findMany({
        select: { createdAt: true }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return {
            key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            label: `${monthNames[d.getMonth()]}`,
            count: 0
        };
    }).reverse();

    certificates.forEach(c => {
        const monthKey = c.createdAt.toISOString().slice(0, 7); // "YYYY-MM"
        const match = last6Months.find(m => m.key === monthKey);
        if (match) match.count++;
    });

    // 5. Fetch Top 5 Users by Certificates Generated
    const topUsersData = await prisma.certificate.groupBy({
        by: ['userId'],
        _count: {
            id: true
        },
        orderBy: {
            _count: {
                id: 'desc'
            }
        },
        take: 5
    });

    const topUsers = await Promise.all(
        topUsersData.map(async (item) => {
            if (!item.userId) return { name: "System / Anonymous", email: "N/A", certCount: item._count.id };
            const user = await prisma.user.findUnique({
                where: { id: item.userId },
                select: { name: true, email: true, image: true }
            });
            return {
                name: user?.name || "Unknown User",
                email: user?.email || "N/A",
                image: user?.image,
                certCount: item._count.id
            };
        })
    );

    // 6. Fetch Recent Certificates Generated
    const recentCertificates = await prisma.certificate.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
            user: {
                select: { name: true, email: true }
            }
        }
    });

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--color-neon-border)] pb-6">
                <div>
                    <span className="section-label mb-2">Platform Overview</span>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Database Statistics</h1>
                    <p className="text-[var(--color-neon-muted)] text-sm mt-1">
                        Real-time analytics and activity monitoring for Vura core engines.
                    </p>
                </div>
                <div className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Secure Admin Session Active
                </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="metric-card">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-[var(--color-neon-muted)] uppercase tracking-wider">Total Users</p>
                            <h3 className="text-3xl font-extrabold text-white mt-1">{totalUsers}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[var(--color-neon-border)] flex items-center justify-between text-xs">
                        <span className="text-[var(--color-neon-muted)]">Active registered accounts</span>
                        <Link href="/admin/users" className="text-purple-400 hover:underline flex items-center gap-1">View list &rarr;</Link>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-[var(--color-neon-muted)] uppercase tracking-wider">Certificates Issued</p>
                            <h3 className="text-3xl font-extrabold text-white mt-1">{totalCertificates}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-neon-primary)]/10 border border-[var(--color-neon-primary)]/20 flex items-center justify-center text-[var(--color-neon-primary)]">
                            <Award className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[var(--color-neon-border)] flex items-center justify-between text-xs">
                        <span className="text-[var(--color-neon-muted)]">{certsRevoked} Revoked / {certsFailed} Failed</span>
                        <Link href="/admin/certificates" className="text-[var(--color-neon-primary)] hover:underline flex items-center gap-1">Audit log &rarr;</Link>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-[var(--color-neon-muted)] uppercase tracking-wider">Templates & Events</p>
                            <h3 className="text-3xl font-extrabold text-white mt-1">{totalTemplates} <span className="text-xs text-[var(--color-neon-muted)] font-normal">in {totalEvents} events</span></h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[var(--color-neon-border)] flex items-center justify-between text-xs">
                        <span className="text-[var(--color-neon-muted)]">Active designs</span>
                        <span className="text-blue-400">Vura Engine</span>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-[var(--color-neon-muted)] uppercase tracking-wider">Email Delivery</p>
                            <h3 className="text-3xl font-extrabold text-white mt-1">{totalEmails}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                            <Mail className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[var(--color-neon-border)] flex items-center justify-between text-xs">
                        <span className="text-[var(--color-neon-muted)]">{emailsPending} Pending / {emailsFailed} Failed</span>
                        <Link href="/admin/system" className="text-yellow-400 hover:underline flex items-center gap-1">System stats &rarr;</Link>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-[var(--color-neon-muted)] uppercase tracking-wider">Total Visitors</p>
                            <h3 className="text-3xl font-extrabold text-white mt-1">{totalVisitors}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                            <Eye className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[var(--color-neon-border)] flex items-center justify-between text-xs">
                        <span className="text-[var(--color-neon-muted)]">README badge hits</span>
                        <span className="text-teal-400 font-mono">Live traffic</span>
                    </div>
                </div>
            </div>

            {/* Dynamic Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 6 Months Trend (SVG Chart) */}
                <div className="glass-card lg:col-span-2 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-white">Certificate Issuance Trend</h2>
                            <p className="text-xs text-[var(--color-neon-muted)]">Monthly count of generated certificates in the last 6 months</p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded bg-[var(--color-neon-primary)]/10 text-[var(--color-neon-primary)] font-semibold border border-[var(--color-neon-primary)]/20">6 Months</span>
                    </div>
                    
                    <OverviewCharts 
                        trendData={last6Months} 
                        statusBreakdown={{
                            sent: certsSent,
                            pending: certsPending,
                            failed: certsFailed,
                            revoked: certsRevoked
                        }} 
                    />
                </div>

                {/* Top Generating Users */}
                <div className="glass-card flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">Top Generators</h2>
                        <p className="text-xs text-[var(--color-neon-muted)] mb-6">Users with the highest volume of certificates issued</p>

                        <div className="space-y-4">
                            {topUsers.length > 0 ? (
                                topUsers.map((user, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#0e0e0e] border border-[var(--color-neon-border)] hover:border-red-500/20 transition-all duration-300">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs flex items-center justify-center shrink-0">
                                                #{idx + 1}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                                                <p className="text-[10px] text-[var(--color-neon-muted)] truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-bold text-[var(--color-neon-primary)]">{user.certCount}</p>
                                            <p className="text-[9px] text-[var(--color-neon-muted)]">certs</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-[var(--color-neon-muted)] text-sm">
                                    No certificate activity recorded yet.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[var(--color-neon-border)]">
                        <Link href="/admin/users" className="btn-secondary w-full text-xs py-2.5 flex items-center justify-center text-white border-[var(--color-neon-border)]">
                            View All Users Stats
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Certificates Log */}
            <div className="glass-card">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">Recent Certificates Generated</h2>
                        <p className="text-xs text-[var(--color-neon-muted)]">The latest certificates created and emailed</p>
                    </div>
                    <Link href="/admin/certificates" className="text-xs text-[var(--color-neon-primary)] hover:underline flex items-center gap-1 font-semibold">
                        View Audit Log &rarr;
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Certificate ID</th>
                                <th>Recipient</th>
                                <th>Course / Event</th>
                                <th>Created By</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentCertificates.length > 0 ? (
                                recentCertificates.map((cert) => (
                                    <tr key={cert.id} className="hover:bg-white/5 transition-all">
                                        <td className="font-mono text-xs text-[var(--color-neon-primary)]">{cert.certificateId}</td>
                                        <td>
                                            <div className="font-semibold text-white">{cert.name}</div>
                                            <div className="text-[10px] text-[var(--color-neon-muted)]">{cert.recipientEmail || "No Email"}</div>
                                        </td>
                                        <td>
                                            <span className="text-xs px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                                                {cert.course}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="text-xs font-medium text-white">{cert.user?.name || "System"}</div>
                                            <div className="text-[9px] text-[var(--color-neon-muted)]">{cert.user?.email || "API"}</div>
                                        </td>
                                        <td>
                                            {cert.revoked ? (
                                                <span className="badge-pill bg-purple-500/10 border-purple-500/30 text-purple-400">Revoked</span>
                                            ) : cert.status === "sent" ? (
                                                <span className="badge-pill bg-[var(--color-neon-primary)]/10 border-[var(--color-neon-primary)]/30 text-[var(--color-neon-primary)]">Sent</span>
                                            ) : cert.status === "pending" ? (
                                                <span className="badge-pill bg-yellow-500/10 border-yellow-500/30 text-yellow-400">Pending</span>
                                            ) : (
                                                <span className="badge-pill bg-red-500/10 border-red-500/30 text-red-400">Failed</span>
                                            )}
                                        </td>
                                        <td className="text-xs text-[var(--color-neon-muted)]">
                                            {new Date(cert.createdAt).toLocaleDateString(undefined, {
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-[var(--color-neon-muted)]">
                                        No certificates found in the database.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
