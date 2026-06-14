import prisma from "@/lib/prisma";
import { Activity, Mail, Cpu, AlertTriangle, Key, Terminal, Code, CheckCircle, Clock, XCircle, FileText } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminSystemPage() {
    // 1. Query API stats
    const totalApiRequests = await prisma.apiUsageLog.count();
    const createRequests = await prisma.apiUsageLog.count({ where: { endpoint: "create" } });
    const verifyRequests = await prisma.apiUsageLog.count({ where: { endpoint: "verify" } });
    const successfulApiRequests = await prisma.apiUsageLog.count({ where: { statusCode: { gte: 200, lte: 299 } } });
    const failedApiRequests = await prisma.apiUsageLog.count({ where: { statusCode: { gte: 400 } } });

    // 2. Fetch Recent API Usage Logs (last 10)
    const recentApiLogs = await prisma.apiUsageLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
            user: {
                select: { name: true, email: true }
            }
        }
    });

    // 3. Query Email Queue stats
    const totalEmails = await prisma.emailQueue.count();
    const emailsPending = await prisma.emailQueue.count({ where: { status: "pending" } });
    const emailsProcessing = await prisma.emailQueue.count({ where: { status: "processing" } });
    const emailsSent = await prisma.emailQueue.count({ where: { status: "sent" } });
    const emailsFailed = await prisma.emailQueue.count({ where: { status: "failed" } });

    // 4. Fetch Recent Email Queue Entries (last 10)
    const recentEmails = await prisma.emailQueue.findMany({
        orderBy: { createdAt: "desc" },
        take: 10
    });

    // 5. Fetch Templates summary (last 5)
    const recentTemplates = await prisma.template.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
            event: {
                select: { name: true }
            }
        }
    });

    // Calculations
    const apiSuccessRate = totalApiRequests > 0 ? Math.round((successfulApiRequests / totalApiRequests) * 100) : 100;
    const emailSuccessRate = totalEmails > 0 ? Math.round((emailsSent / totalEmails) * 100) : 100;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--color-neon-border)] pb-6">
                <div>
                    <span className="section-label mb-2">Engine Monitoring</span>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">System Activity</h1>
                    <p className="text-[var(--color-neon-muted)] text-sm mt-1">
                        Monitor API invocation metrics, email queue statuses, template layouts, and active worker diagnostics.
                    </p>
                </div>
            </div>

            {/* Diagnostic Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* API Logs Dashboard */}
                <div className="glass-card flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Code className="w-5 h-5 text-purple-400" /> API Gateway Diagnostics
                                </h2>
                                <p className="text-xs text-[var(--color-neon-muted)]">API invocation logs and status codes</p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-1 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20 font-mono">
                                Gateway
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-3 bg-[#0a0a0a] border border-[var(--color-neon-border)] rounded-xl">
                                <p className="text-[10px] font-bold text-[var(--color-neon-muted)] uppercase tracking-wider">Total Requests</p>
                                <p className="text-xl font-black text-white mt-1">{totalApiRequests}</p>
                                <div className="text-[9px] text-[var(--color-neon-muted)] mt-1">
                                    {createRequests} create / {verifyRequests} verify
                                </div>
                            </div>
                            <div className="p-3 bg-[#0a0a0a] border border-[var(--color-neon-border)] rounded-xl">
                                <p className="text-[10px] font-bold text-[var(--color-neon-muted)] uppercase tracking-wider">Success Rate</p>
                                <p className="text-xl font-black text-[var(--color-neon-primary)] mt-1">{apiSuccessRate}%</p>
                                <div className="text-[9px] text-[var(--color-neon-muted)] mt-1">
                                    {failedApiRequests} error status codes (4xx/5xx)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Email Queue Dashboard */}
                <div className="glass-card flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-yellow-400" /> Mail Transfer Agent (MTA)
                                </h2>
                                <p className="text-xs text-[var(--color-neon-muted)]">Distribution queue statistics</p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-lg border border-yellow-500/20 font-mono">
                                SMTP Queue
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-3 bg-[#0a0a0a] border border-[var(--color-neon-border)] rounded-xl">
                                <p className="text-[10px] font-bold text-[var(--color-neon-muted)] uppercase tracking-wider">In Queue</p>
                                <p className="text-xl font-black text-white mt-1">{totalEmails}</p>
                                <div className="text-[9px] text-[var(--color-neon-muted)] mt-1">
                                    {emailsPending} pending / {emailsProcessing} processing
                                </div>
                            </div>
                            <div className="p-3 bg-[#0a0a0a] border border-[var(--color-neon-border)] rounded-xl">
                                <p className="text-[10px] font-bold text-[var(--color-neon-muted)] uppercase tracking-wider">Delivery Rate</p>
                                <p className="text-xl font-black text-[var(--color-neon-primary)] mt-1">{emailSuccessRate}%</p>
                                <div className="text-[9px] text-[var(--color-neon-muted)] mt-1">
                                    {emailsSent} sent / {emailsFailed} failed transmissions
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Email Queue Log */}
            <div className="glass-card">
                <div className="flex items-center gap-2 mb-6">
                    <Mail className="w-5 h-5 text-yellow-400" />
                    <div>
                        <h2 className="text-xl font-bold text-white">Email Queue Activity Log</h2>
                        <p className="text-xs text-[var(--color-neon-muted)]">Recent mailings processed by the backend distribution scheduler</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Recipient</th>
                                <th>Subject</th>
                                <th className="text-center">Attempts</th>
                                <th>Status</th>
                                <th>Queue Date / Last Attempt</th>
                                <th>Diagnostic Error</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentEmails.length > 0 ? (
                                recentEmails.map((email) => (
                                    <tr key={email.id} className="hover:bg-white/5 transition-all">
                                        <td>
                                            <div className="font-semibold text-white">{email.recipientName}</div>
                                            <div className="text-[10px] text-[var(--color-neon-muted)]">{email.recipientEmail}</div>
                                        </td>
                                        <td className="max-w-[200px] truncate">
                                            <span className="text-xs font-medium text-white">{email.subject}</span>
                                        </td>
                                        <td className="text-center font-mono text-xs text-white">
                                            {email.attempts}
                                        </td>
                                        <td>
                                            {email.status === "sent" ? (
                                                <span className="badge-pill bg-[var(--color-neon-primary)]/10 border-[var(--color-neon-primary)]/30 text-[var(--color-neon-primary)] flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Sent</span>
                                            ) : email.status === "pending" || email.status === "processing" ? (
                                                <span className="badge-pill bg-yellow-500/10 border-yellow-500/30 text-yellow-400 flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> {email.status}</span>
                                            ) : (
                                                <span className="badge-pill bg-red-500/10 border-red-500/30 text-red-400 flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Failed</span>
                                            )}
                                        </td>
                                        <td className="text-xs text-[var(--color-neon-muted)]">
                                            <div>Add: {new Date(email.createdAt).toLocaleDateString()}</div>
                                            {email.lastAttempt && (
                                                <div className="text-[9px] mt-0.5">
                                                    Try: {new Date(email.lastAttempt).toLocaleTimeString()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="max-w-[200px] truncate text-[10px] font-mono text-red-400" title={email.error || ""}>
                                            {email.error || <span className="text-[var(--color-neon-muted)]">None</span>}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-[var(--color-neon-muted)]">
                                        No email logs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* API Invocation Log */}
            <div className="glass-card">
                <div className="flex items-center gap-2 mb-6">
                    <Terminal className="w-5 h-5 text-purple-400" />
                    <div>
                        <h2 className="text-xl font-bold text-white">Recent API Gateway Access Logs</h2>
                        <p className="text-xs text-[var(--color-neon-muted)]">Real-time HTTP requests captured at the API endpoints</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Endpoint</th>
                                <th>User Account</th>
                                <th className="text-center">HTTP Status</th>
                                <th>Certificate ID Reference</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentApiLogs.length > 0 ? (
                                recentApiLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/5 transition-all">
                                        <td>
                                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                                                /api/{log.endpoint}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="text-xs font-semibold text-white">{log.user?.name || "API Access Account"}</div>
                                            <div className="text-[10px] text-[var(--color-neon-muted)]">{log.user?.email || "Unknown"}</div>
                                        </td>
                                        <td className="text-center">
                                            <span className={`font-mono text-xs font-black px-2 py-0.5 rounded ${
                                                log.statusCode >= 200 && log.statusCode < 300 
                                                    ? "bg-[var(--color-neon-primary)]/10 text-[var(--color-neon-primary)]" 
                                                    : "bg-red-500/10 text-red-400"
                                            }`}>
                                                {log.statusCode}
                                            </span>
                                        </td>
                                        <td className="font-mono text-xs text-[var(--color-neon-muted)]">
                                            {log.certificateId || "N/A"}
                                        </td>
                                        <td className="text-xs text-[var(--color-neon-muted)]">
                                            {new Date(log.createdAt).toLocaleDateString(undefined, {
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                second: "2-digit"
                                            })}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-[var(--color-neon-muted)]">
                                        No API usage logs found in the database.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Template & Event Summary */}
            <div className="glass-card">
                <div className="flex items-center gap-2 mb-6">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                        <h2 className="text-xl font-bold text-white">Latest Created Design Templates</h2>
                        <p className="text-xs text-[var(--color-neon-muted)]">Active certificate formats configured in event profiles</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Template Name</th>
                                <th>Event Link</th>
                                <th>Background Image Asset</th>
                                <th>Fields Array</th>
                                <th>Configured Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTemplates.length > 0 ? (
                                recentTemplates.map((template) => (
                                    <tr key={template.id} className="hover:bg-white/5 transition-all">
                                        <td>
                                            <div className="font-semibold text-white">{template.name}</div>
                                            <div className="text-[9px] text-[var(--color-neon-muted)] font-mono">ID: {template.id}</div>
                                        </td>
                                        <td>
                                            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/10">
                                                {template.event?.name || "Orphaned Event"}
                                            </span>
                                        </td>
                                        <td className="max-w-[200px] truncate text-xs" title={template.bgImageUrl}>
                                            <a href={template.bgImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">
                                                View Asset &rarr;
                                            </a>
                                        </td>
                                        <td>
                                            <span className="text-xs font-mono bg-white/5 px-2 py-0.5 rounded text-white">
                                                {Array.isArray(template.fields) ? template.fields.length : JSON.parse(JSON.stringify(template.fields || "[]")).length || 0} fields
                                            </span>
                                        </td>
                                        <td className="text-xs text-[var(--color-neon-muted)]">
                                            {new Date(template.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-[var(--color-neon-muted)]">
                                        No templates found.
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
