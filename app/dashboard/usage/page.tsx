import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Activity, ArrowUp, CheckCircle2, Plus, Search, XCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { Session } from "next-auth";

// Extend the Session type to include the user.id
interface CustomSession {
    user?: {
        id?: string | null;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export default async function UsagePage() {
    const session = (await getServerSession(authOptions)) as CustomSession;

    if (!session || !session.user || !session.user.id) {
        redirect("/login"); // Redirect to login if session or user is missing
    }

    const userId = session.user.id;

    try {
        const logs = await prisma.apiUsageLog.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 200, // Limit the number of logs fetched to prevent excessive data loading
        });

        // ── Aggregate stats ───────────────────────────────
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const totalCalls = logs.length;
        const thisMonth = logs.filter(l => l.createdAt >= startOfMonth).length;
        const today = logs.filter(l => l.createdAt >= startOfToday).length;
        const creates = logs.filter(l => l.endpoint === "create").length;
        const verifies = logs.filter(l => l.endpoint === "verify").length;
        const successes = logs.filter(l => l.statusCode < 400).length;
        const errors = logs.filter(l => l.statusCode >= 400).length;

        // ── Last 7 days bar chart data ────────────────────
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            d.setHours(0, 0, 0, 0);
            const next = new Date(d);
            next.setDate(next.getDate() + 1);
            const count = logs.filter(l => l.createdAt >= d && l.createdAt < next).length;
            return {
                label: d.toLocaleDateString("en", { weekday: "short" }),
                count,
            };
        });
        const maxCount = Math.max(...days.map(d => d.count), 1);

        // ── Recent 50 calls ───────────────────────────────
        const recent = logs.slice(0, 50);

        return (
            <div className="space-y-8 max-w-5xl">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Activity className="w-6 h-6 text-[var(--color-neon-primary)]" /> API Usage
                    </h1>
                    <p className="text-sm text-[var(--color-neon-muted)] mt-1">
                        Requests logged across your verify and create endpoints.
                    </p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[ 
                        { label: "Total Calls", value: totalCalls, icon: <Activity className="w-4 h-4" />, color: "text-[var(--color-neon-primary)]" },
                        { label: "This Month", value: thisMonth, icon: <ArrowUp className="w-4 h-4" />, color: "text-blue-400" },
                        { label: "Today", value: today, icon: <ArrowUp className="w-4 h-4" />, color: "text-purple-400" },
                        { label: "Successes", value: successes, icon: <CheckCircle2 className="w-4 h-4" />, color: "text-emerald-400" },
                    ].map(s => (
                        <div key={s.label} className="glass-card px-5 py-4">
                            <div className={`flex items-center gap-2 mb-2 ${s.color}`}>{s.icon}<span className="text-xs font-semibold uppercase tracking-wider">{s.label}</span></div>
                            <p className="text-3xl font-black text-white">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Endpoint split */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="glass-card p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0">
                            <Search className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs text-[var(--color-neon-muted)] uppercase tracking-wider mb-0.5">Verify calls</p>
                            <p className="text-2xl font-black text-white">{verifies}</p>
                            <p className="text-xs text-[var(--color-neon-muted)]">GET /api/verify/&#123;id&#125;</p>
                        </div>
                    </div>
                    <div className="glass-card p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center shrink-0">
                            <Plus className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-[var(--color-neon-muted)] uppercase tracking-wider mb-0.5">Create calls</p>
                            <p className="text-2xl font-black text-white">{creates}</p>
                            <p className="text-xs text-[var(--color-neon-muted)]">POST /api/certificates/create</p>
                        </div>
                    </div>
                </div>

                {/* 7-day bar chart */}
                <div className="glass-card p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-white">Calls — Last 7 Days</h2>
                    <div className="flex items-end gap-2 h-32">
                        {days.map(d => (
                            <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
                                <span className="text-xs text-[var(--color-neon-muted)]">{d.count || ""}</span>
                                <div
                                    className="w-full rounded-t-md bg-[var(--color-neon-primary)]/70 hover:bg-[var(--color-neon-primary)] transition-colors"
                                    style={{ height: `${Math.max((d.count / maxCount) * 88, d.count > 0 ? 6 : 2)}px` }}
                                    title={`${d.label}: ${d.count} call${d.count !== 1 ? "s" : ""}`}
                                />
                                <span className="text-[10px] text-[var(--color-neon-muted)]">{d.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent call log */}
                <div className="glass-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-neon-border)] flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-white">Recent Calls</h2>
                        <span className="text-xs text-[var(--color-neon-muted)]">Last {recent.length} of {totalCalls}</span>
                    </div>

                    {recent.length === 0 ? (
                        <div className="px-6 py-12 text-center text-[var(--color-neon-muted)] text-sm">
                            No API calls recorded yet. Start using the API to see logs here.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#0d0d0d] border-b border-[var(--color-neon-border)] text-xs text-[var(--color-neon-muted)] uppercase tracking-wider">
                                        <th className="text-left px-5 py-3">Status</th>
                                        <th className="text-left px-5 py-3">Endpoint</th>
                                        <th className="text-left px-5 py-3">Certificate ID</th>
                                        <th className="text-left px-5 py-3">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--color-neon-border)]">
                                    {recent.map(log => (
                                        <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${log.statusCode < 400 ? "text-emerald-400" : "text-red-400"}`}>
                                                    {log.statusCode < 400
                                                        ? <CheckCircle2 className="w-3.5 h-3.5" />
                                                        : <XCircle className="w-3.5 h-3.5" />}
                                                    {log.statusCode}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${log.endpoint === "create"
                                                        ? "text-purple-400 bg-purple-400/10 border-purple-400/20"
                                                        : "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                                                    }`}>
                                                    {log.endpoint === "create" ? "POST /create" : "GET /verify"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 font-mono text-xs text-[var(--color-neon-primary)]">
                                                {log.certificateId ?? "—"}
                                            </td>
                                            <td className="px-5 py-3 text-xs text-[var(--color-neon-muted)] whitespace-nowrap">
                                                {new Date(log.createdAt).toLocaleString("en", {
                                                    month: "short", day: "numeric",
                                                    hour: "2-digit", minute: "2-digit",
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Error rate */}
                {totalCalls > 0 && (
                    <div className="glass-card p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-[var(--color-neon-muted)] uppercase tracking-wider mb-1">Success Rate</p>
                            <p className="text-2xl font-black text-white">{Math.round((successes / totalCalls) * 100)}%</p>
                        </div>
                        <div className="flex-1 mx-8">
                            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-[var(--color-neon-primary)] transition-all"
                                    style={{ width: `${(successes / totalCalls) * 100}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-[var(--color-neon-muted)] mt-1">
                                <span>{successes} success</span>
                                <span>{errors} error{errors !== 1 ? "s" : ""}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error("Error fetching usage data:", error);
        // Redirect to an error page or show a user-friendly message
        return (
            <div className="space-y-8 max-w-5xl text-red-400">
                <h1 className="text-2xl font-bold">Error loading usage data</h1>
                <p>There was an issue fetching your API usage logs. Please try again later.</p>
            </div>
        );
    }
}
