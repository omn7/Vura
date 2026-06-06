"use client";

import { useEffect, useState, useMemo, useDeferredValue } from "react";
import {
    AlertCircle,
    CheckCircle2,
    Copy,
    ExternalLink,
    Filter,
    Loader2,
    Mail,
    RefreshCw,
    Search,
    XCircle,
    Clock,
    ShieldCheck
} from "lucide-react";

type CertificateStatus = "pending" | "generated" | "sent" | "failed" | string;

type EmailQueueRecord = {
    subject: string;
    cc: string | null;
    body: string;
    theme: string;
    status: string;
    attempts: number;
    error: string | null;
    lastAttempt: string | null;
};

type CertificateRecord = {
    id: string;
    certificateId: string;
    name: string;
    recipientEmail: string | null;
    course: string;
    issueDate: string;
    pdfUrl: string;
    status: CertificateStatus;
    failureReason: string | null;
    updatedAt: string;
    sentAt: string | null;
    batchId: string | null;
    emailQueue?: EmailQueueRecord | null;
};

const STATUS_OPTIONS = [
    { value: "", label: "All statuses" },
    { value: "delivered", label: "Delivered" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
];

function getStatusInfo(status: CertificateStatus, emailQueue?: EmailQueueRecord | null) {
    if (emailQueue) {
        if (emailQueue.status === "sent") {
            return {
                label: "Delivered",
                style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                icon: CheckCircle2
            };
        }
        if (emailQueue.status === "processing") {
            return {
                label: "Sending...",
                style: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                icon: Loader2
            };
        }
        if (emailQueue.status === "pending") {
            return {
                label: "Queue Pending",
                style: "bg-amber-500/10 text-amber-300 border-amber-500/20",
                icon: Clock
            };
        }
        return {
            label: "Failed Send",
            style: "bg-rose-500/10 text-rose-300 border-rose-500/20",
            icon: XCircle
        };
    }
    if (status === "sent" || status === "generated") {
        return {
            label: "Delivered",
            style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            icon: CheckCircle2
        };
    }
    if (status === "pending") {
        return {
            label: "Pending",
            style: "bg-amber-500/10 text-amber-300 border-amber-500/20",
            icon: Clock
        };
    }
    return {
        label: "Failed",
        style: "bg-rose-500/10 text-rose-300 border-rose-500/20",
        icon: XCircle
    };
}

function formatDate(value: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

type PaginationMeta = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};

export default function DeliveriesDashboard() {
    const [records, setRecords] = useState<CertificateRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [retryingId, setRetryingId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [refreshTick, setRefreshTick] = useState(0);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);

    const deferredSearch = useDeferredValue(searchQuery);

    useEffect(() => {
        setPage(1);
    }, [statusFilter, deferredSearch]);

    useEffect(() => {
        const controller = new AbortController();

        async function loadCertificates() {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                if (statusFilter) params.set("status", statusFilter);
                if (deferredSearch.trim()) params.set("search", deferredSearch.trim());
                params.set("page", String(page));

                const response = await fetch(`/api/certificates?${params.toString()}`, {
                    signal: controller.signal,
                });
                if (!response.ok) {
                    const payload = await response.json().catch(() => null);
                    throw new Error(payload?.error || "Failed to load delivery records.");
                }
                const data = await response.json();
                if (active) {
                    setRecords(Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []));
                }
            } catch (err) {
                if (controller.signal.aborted) return;
                setError(err instanceof Error ? err.message : "Failed to load delivery records.");
                setRecords([]);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        loadCertificates();
        return () => controller.abort();
    }, [statusFilter, deferredSearch, refreshTick, page]);

    const stats = useMemo(() => {
        return records.reduce(
            (acc, record) => {
                acc.total += 1;
                const statusInfo = getStatusInfo(record.status, record.emailQueue);
                if (statusInfo.label === "Delivered") {
                    acc.delivered += 1;
                } else if (statusInfo.label === "Queue Pending" || statusInfo.label === "Pending" || statusInfo.label === "Sending...") {
                    acc.pending += 1;
                } else {
                    acc.failed += 1;
                }
                return acc;
            },
            { total: 0, delivered: 0, pending: 0, failed: 0 }
        );
    }, [records]);

    // Filter and search records client-side
    const filteredRecords = useMemo(() => {
        return records.filter((record) => {
            // Status match
            if (statusFilter) {
                const info = getStatusInfo(record.status, record.emailQueue);
                const filterLower = statusFilter.toLowerCase();
                const labelLower = info.label.toLowerCase();
                if (filterLower === "delivered" && labelLower !== "delivered") return false;
                if (filterLower === "pending" && labelLower !== "pending" && labelLower !== "queue pending" && labelLower !== "sending...") return false;
                if (filterLower === "failed" && labelLower !== "failed" && labelLower !== "failed send") return false;
            }

            // Search match
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const nameMatch = record.name.toLowerCase().includes(q);
                const emailMatch = record.recipientEmail?.toLowerCase().includes(q) ?? false;
                const idMatch = record.certificateId.toLowerCase().includes(q);
                const courseMatch = record.course.toLowerCase().includes(q);
                return nameMatch || emailMatch || idMatch || courseMatch;
            }

            return true;
        });
    }, [records, statusFilter, searchQuery]);

    // Copy link helper
    async function handleCopyLink(certificateId: string) {
        const url = `${window.location.origin}/verify/${certificateId}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopiedId(certificateId);
            setTimeout(() => setCopiedId((curr) => (curr === certificateId ? null : curr)), 1500);
        } catch {
            alert(`Copy verification link: ${url}`);
        }
    }

    // Retry sending/generation helper
    async function handleRetry(certificateId: string) {
        setRetryingId(certificateId);
        setError(null);
        try {
            const response = await fetch(`/api/certificates/${certificateId}/retry`, {
                method: "POST",
            });
            if (!response.ok) {
                const payload = await response.json().catch(() => null);
                throw new Error(payload?.error || "Retry action failed.");
            }
            // Increment refreshTick to trigger reload of all records
            setRefreshTick((v) => v + 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Retry action failed.");
        } finally {
            setRetryingId(null);
        }
    }

    const emptyMessage = statusFilter || deferredSearch.trim()
        ? "No certificates match your current filters."
        : "No certificate delivery records found.";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Mail className="w-6 h-6 text-[var(--color-neon-primary)]" /> Delivery Dashboard
                    </h1>
                    <p className="text-sm text-[var(--color-neon-muted)] mt-1">
                        Monitor certificate delivery statuses, inspect errors, and retry failed emails.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                    <div className="metric-card p-4">
                        <p className="text-[10px] uppercase tracking-wider text-[var(--color-neon-muted)]">Total</p>
                        <p className="text-2xl font-black text-white mt-1">{stats.total}</p>
                    </div>
                    <div className="metric-card p-4">
                        <p className="text-[10px] uppercase tracking-wider text-[var(--color-neon-muted)]">Delivered</p>
                        <p className="text-2xl font-black text-emerald-400 mt-1">{stats.delivered}</p>
                    </div>
                    <div className="metric-card p-4">
                        <p className="text-[10px] uppercase tracking-wider text-[var(--color-neon-muted)]">Pending</p>
                        <p className="text-2xl font-black text-amber-400 mt-1">{stats.pending}</p>
                    </div>
                    <div className="metric-card p-4">
                        <p className="text-[10px] uppercase tracking-wider text-[var(--color-neon-muted)]">Failed</p>
                        <p className="text-2xl font-black text-rose-400 mt-1">{stats.failed}</p>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
                <label className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-neon-muted)]" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by participant name, email, course, or certificate ID"
                        className="w-full rounded-xl border border-[var(--color-neon-border)] bg-[var(--color-neon-surface)] pl-10 pr-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[var(--color-neon-muted)] focus:border-[var(--color-neon-primary)]"
                    />
                </label>

                <label className="relative block">
                    <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-neon-muted)]" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-[var(--color-neon-border)] bg-[var(--color-neon-surface)] pl-10 pr-4 py-3 text-sm text-white outline-none transition-colors focus:border-[var(--color-neon-primary)]"
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.label} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {/* Error Toast */}
            {error && (
                <div className="glass-card border border-rose-500/20 bg-rose-500/5 flex items-start gap-3 text-rose-200">
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Main Table Content */}
            <div className="glass-card p-0 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-[var(--color-neon-muted)]">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Loading delivery records...
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center px-6 py-20">
                        <div className="w-14 h-14 rounded-2xl border border-[var(--color-neon-primary)]/20 bg-[var(--color-neon-primary)]/10 flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-7 h-7 text-[var(--color-neon-primary)]" />
                        </div>
                        <h2 className="text-lg font-semibold text-white">No deliveries to display</h2>
                        <p className="text-sm text-[var(--color-neon-muted)] mt-2 max-w-md">{emptyMessage}</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="data-table w-full">
                                <thead>
                                    <tr>
                                        <th>Certificate ID</th>
                                        <th>User Name</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Timestamp</th>
                                        <th className="text-right">Retry Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map((record) => {
                                         const statusInfo = getStatusInfo(record.status, record.emailQueue);
                                         const StatusIconComponent = statusInfo.icon;
                                        return (
                                            <tr key={record.id} className="hover:bg-white/[0.01] transition-colors">
                                                {/* Certificate ID */}
                                                <td>
                                                    <span className="font-mono text-xs text-[var(--color-neon-primary)] bg-[var(--color-neon-primary)]/10 px-2 py-1 rounded">
                                                        {record.certificateId}
                                                    </span>
                                                </td>

                                                {/* User Name */}
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-[var(--color-neon-primary)]/10 border border-[var(--color-neon-primary)]/20 flex items-center justify-center shrink-0">
                                                            <span className="text-[10px] font-bold text-[var(--color-neon-primary)]">
                                                                {record.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-white text-sm">{record.name}</p>
                                                            <p className="text-[10px] text-[var(--color-neon-muted)]">{record.course}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Email */}
                                                <td className="text-sm text-[var(--color-neon-muted)]">
                                                    {record.recipientEmail || <span className="italic opacity-50">No Email</span>}
                                                </td>

                                                {/* Status */}
                                                <td>
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusInfo.style}`}>
                                                        <StatusIconComponent className="w-3.5 h-3.5" />
                                                        {statusInfo.label}
                                                    </span>
                                                </td>

                                                {/* Timestamp */}
                                                <td className="text-xs text-[var(--color-neon-muted)]">
                                                    {formatDate(record.updatedAt)}
                                                </td>

                                                {/* Actions */}
                                                <td>
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Copy Link */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopyLink(record.certificateId)}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-neon-border)] px-2.5 py-1.5 text-xs text-[var(--color-neon-muted)] transition-colors hover:border-[var(--color-neon-primary)] hover:text-white"
                                                            title="Copy verification link"
                                                        >
                                                            {copiedId === record.certificateId ? "Copied" : "Copy link"}
                                                        </button>

                                                        {/* View PDF */}
                                                        <a
                                                            href={record.pdfUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-neon-border)] px-2.5 py-1.5 text-xs text-[var(--color-neon-muted)] transition-colors hover:border-[var(--color-neon-primary)] hover:text-white"
                                                            title="View Certificate PDF"
                                                        >
                                                            <ExternalLink className="w-3 h-3" /> View
                                                        </a>

                                                         {/* Retry Button */}
                                                         {(record.status === "failed" || record.emailQueue?.status === "failed") && (
                                                             <button
                                                                 type="button"
                                                                 disabled={retryingId === record.certificateId}
                                                                 onClick={() => handleRetry(record.certificateId)}
                                                                 className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 px-2.5 py-1.5 text-xs text-rose-300 transition-colors hover:border-rose-400 hover:text-rose-200 disabled:opacity-60"
                                                             >
                                                                 {retryingId === record.certificateId ? (
                                                                     <Loader2 className="w-3 h-3 animate-spin" />
                                                                 ) : (
                                                                     <RefreshCw className="w-3 h-3" />
                                                                 )}
                                                                 Retry
                                                             </button>
                                                         )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List View */}
                        <div className="grid gap-4 p-4 md:hidden">
                             {filteredRecords.map((record) => {
                                 const statusInfo = getStatusInfo(record.status, record.emailQueue);
                                 const StatusIconComponent = statusInfo.icon;
                                return (
                                    <article key={record.id} className="rounded-2xl border border-[var(--color-neon-border)] bg-[var(--color-neon-surface)] p-4 space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="font-semibold text-white">{record.name}</h3>
                                                <p className="text-xs text-[var(--color-neon-muted)] mt-1">
                                                    {record.recipientEmail || <span className="italic opacity-50">No Email</span>}
                                                </p>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium ${statusInfo.style}`}>
                                                <StatusIconComponent className="w-3 h-3" />
                                                {statusInfo.label}
                                            </span>
                                        </div>

                                        <div className="space-y-1.5 text-sm">
                                            <p className="text-[var(--color-neon-muted)] text-xs">{record.course}</p>
                                            <p className="font-mono text-xs text-[var(--color-neon-primary)]">{record.certificateId}</p>
                                            <p className="text-[10px] text-[var(--color-neon-muted)]">Updated {formatDate(record.updatedAt)}</p>
                                            {record.status === "failed" && record.failureReason && (
                                                <p className="text-xs text-rose-300 bg-rose-500/5 border border-rose-500/10 p-2 rounded-lg">
                                                    <span className="font-bold">Error:</span> {record.failureReason}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => handleCopyLink(record.certificateId)}
                                                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-neon-border)] px-3 py-2 text-xs text-[var(--color-neon-muted)]"
                                            >
                                                {copiedId === record.certificateId ? "Copied" : "Copy link"}
                                            </button>
                                            <a
                                                href={record.pdfUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-neon-border)] px-3 py-2 text-xs text-[var(--color-neon-muted)]"
                                            >
                                                <ExternalLink className="w-3 h-3" /> View
                                            </a>
                                            {(record.status === "failed" || record.emailQueue?.status === "failed") && (
                                                 <button
                                                     type="button"
                                                     disabled={retryingId === record.certificateId}
                                                     onClick={() => handleRetry(record.certificateId)}
                                                     className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 px-3 py-2.5 text-xs text-rose-300 disabled:opacity-60"
                                                 >
                                                     {retryingId === record.certificateId ? (
                                                         <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                     ) : (
                                                         <RefreshCw className="w-3.5 h-3.5" />
                                                     )}
                                                     Retry Delivery
                                                 </button>
                                             )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {pagination && pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between text-sm text-[var(--color-neon-muted)]">
                    <span>
                        Page {pagination.page} of {pagination.totalPages} &mdash; {pagination.total} total
                    </span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={!pagination.hasPreviousPage}
                            onClick={() => setPage((p) => p - 1)}
                            className="rounded-lg border border-[var(--color-neon-border)] px-3 py-1.5 text-xs transition-colors hover:border-[var(--color-neon-primary)] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            disabled={!pagination.hasNextPage}
                            onClick={() => setPage((p) => p + 1)}
                            className="rounded-lg border border-[var(--color-neon-border)] px-3 py-1.5 text-xs transition-colors hover:border-[var(--color-neon-primary)] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
