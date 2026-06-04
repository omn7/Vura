"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Copy, ExternalLink, Filter, Loader2, RefreshCw, Search } from "lucide-react";

type CertificateStatus = "pending" | "generated" | "sent" | "failed" | string;

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
};

type Props = {
    batchId: string;
};

const STATUS_OPTIONS: Array<{ value: "" | CertificateStatus; label: string }> = [
    { value: "", label: "All statuses" },
    { value: "pending", label: "Pending" },
    { value: "generated", label: "Generated" },
    { value: "sent", label: "Sent" },
    { value: "failed", label: "Failed" },
];

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    generated: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    sent: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    failed: "bg-rose-500/10 text-rose-300 border-rose-500/20",
};

function formatDate(value: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleString();
}

function getStatusLabel(status: CertificateStatus) {
    if (status === "pending") return "Pending";
    if (status === "generated") return "Generated";
    if (status === "sent") return "Sent";
    if (status === "failed") return "Failed";
    return status;
}

type PaginationMeta = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};

export default function BatchCertificateDashboard({ batchId }: Props) {
    const [records, setRecords] = useState<CertificateRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [retryingId, setRetryingId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [refreshTick, setRefreshTick] = useState(0);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [totals, setTotals] = useState({
        total: 0,
        pending: 0,
        generated: 0,
        sent: 0,
        failed: 0,
    });

    const deferredSearch = useDeferredValue(search);

    useEffect(() => {
        setPage(1);
    }, [status, deferredSearch]);

    useEffect(() => {
        const controller = new AbortController();

        async function loadCertificates() {
            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams();
                if (status) params.set("status", status);
                if (deferredSearch.trim()) params.set("search", deferredSearch.trim());
                params.set("page", String(page));

                const response = await fetch(`/api/batches/${batchId}/certificates?${params.toString()}`, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    const payload = await response.json().catch(() => null);
                    throw new Error(payload?.error || "Failed to load batch certificates.");
                }

                const json = await response.json();
                setRecords(Array.isArray(json.data) ? json.data : []);
                setPagination(json.pagination ?? null);
                if (json.stats) {
                    setTotals(json.stats);
                }
            } catch (loadError) {
                if (controller.signal.aborted) return;
                setError(loadError instanceof Error ? loadError.message : "Failed to load batch certificates.");
                setRecords([]);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadCertificates();

        return () => controller.abort();
    }, [batchId, status, deferredSearch, refreshTick, page]);



    async function handleCopyLink(certificateId: string) {
        const url = `${window.location.origin}/verify/${certificateId}`;
        await navigator.clipboard.writeText(url);
        setCopiedId(certificateId);
        window.setTimeout(() => setCopiedId((current) => (current === certificateId ? null : current)), 1500);
    }

    async function handleRetry(certificateId: string) {
        setRetryingId(certificateId);
        try {
            const response = await fetch(`/api/certificates/${certificateId}/retry`, { method: "POST" });
            if (!response.ok) {
                const payload = await response.json().catch(() => null);
                throw new Error(payload?.error || "Retry failed.");
            }

            setRefreshTick((value) => value + 1);
        } catch (retryError) {
            setError(retryError instanceof Error ? retryError.message : "Retry failed.");
        } finally {
            setRetryingId(null);
        }
    }

    const actionableCount = records.filter((record) => record.status === "pending" || record.status === "failed").length;

    const emptyMessage =
        status === "failed" || status === "pending"
            ? "No action needed. This batch has no pending or failed certificates right now."
            : records.length === 0
                ? "No certificates were found for this batch yet."
                : "No certificates matched your current filters.";

    return (
        <div className="space-y-6">
            <div className="glass-card space-y-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-neon-muted)]">Batch dashboard</p>
                        <h1 className="text-2xl font-bold text-white mt-2">Batch {batchId}</h1>
                        <p className="text-sm text-[var(--color-neon-muted)] mt-1">
                            Review delivery status, retry failures, and copy verification links for this batch.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full lg:w-auto">
                        <div className="metric-card p-4">
                            <p className="text-[10px] uppercase tracking-wider text-[var(--color-neon-muted)]">Total</p>
                            <p className="text-2xl font-black text-white mt-2">{totals.total}</p>
                        </div>
                        <div className="metric-card p-4">
                            <p className="text-[10px] uppercase tracking-wider text-[var(--color-neon-muted)]">Pending</p>
                            <p className="text-2xl font-black text-white mt-2">{totals.pending}</p>
                        </div>
                        <div className="metric-card p-4">
                            <p className="text-[10px] uppercase tracking-wider text-[var(--color-neon-muted)]">Generated</p>
                            <p className="text-2xl font-black text-white mt-2">{totals.generated}</p>
                        </div>
                        <div className="metric-card p-4">
                            <p className="text-[10px] uppercase tracking-wider text-[var(--color-neon-muted)]">Sent</p>
                            <p className="text-2xl font-black text-white mt-2">{totals.sent}</p>
                        </div>
                        <div className="metric-card p-4">
                            <p className="text-[10px] uppercase tracking-wider text-[var(--color-neon-muted)]">Actionable</p>
                            <p className="text-2xl font-black text-white mt-2">{actionableCount}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-3">
                    <label className="relative block">
                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-neon-muted)]" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search participant name, email, or certificate ID"
                            className="w-full rounded-xl border border-[var(--color-neon-border)] bg-[var(--color-neon-surface)] pl-10 pr-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[var(--color-neon-muted)] focus:border-[var(--color-neon-primary)]"
                        />
                    </label>

                    <label className="relative block">
                        <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-neon-muted)]" />
                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
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
            </div>

            {error ? (
                <div className="glass-card border border-rose-500/20 bg-rose-500/5 flex items-start gap-3 text-rose-200">
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                    <p className="text-sm">{error}</p>
                </div>
            ) : null}

            <div className="glass-card p-0 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-[var(--color-neon-muted)]">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Loading certificates...
                    </div>
                ) : records.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center px-6 py-20">
                        <div className="w-14 h-14 rounded-2xl border border-[var(--color-neon-primary)]/20 bg-[var(--color-neon-primary)]/10 flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-7 h-7 text-[var(--color-neon-primary)]" />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Batch is in good shape</h2>
                        <p className="text-sm text-[var(--color-neon-muted)] mt-2 max-w-md">{emptyMessage}</p>
                    </div>
                ) : (
                    <>
                        <div className="hidden md:block overflow-x-auto">
                            <table className="data-table w-full">
                                <thead>
                                    <tr>
                                        <th>Participant</th>
                                        <th>Email / Identifier</th>
                                        <th>Certificate ID</th>
                                        <th>Status</th>
                                        <th>Last Updated</th>
                                        <th>Failure Reason</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((record) => (
                                        <tr key={record.id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[var(--color-neon-primary)]/10 border border-[var(--color-neon-primary)]/20 flex items-center justify-center shrink-0">
                                                        <span className="text-[10px] font-bold text-[var(--color-neon-primary)]">{record.name.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white text-sm">{record.name}</p>
                                                        <p className="text-xs text-[var(--color-neon-muted)]">{record.course}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-sm text-[var(--color-neon-muted)]">
                                                {record.recipientEmail || record.certificateId || "—"}
                                            </td>
                                            <td>
                                                <span className="font-mono text-xs text-[var(--color-neon-primary)] bg-[var(--color-neon-primary)]/10 px-2 py-1 rounded">
                                                    {record.certificateId}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[record.status] || STATUS_STYLES.pending}`}>
                                                    {getStatusLabel(record.status)}
                                                </span>
                                            </td>
                                            <td className="text-sm text-[var(--color-neon-muted)]">{formatDate(record.updatedAt)}</td>
                                            <td className="max-w-[240px] text-sm text-[var(--color-neon-muted)] truncate">
                                                {record.failureReason || "—"}
                                            </td>
                                            <td>
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyLink(record.certificateId)}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-neon-border)] px-3 py-1.5 text-xs text-[var(--color-neon-muted)] transition-colors hover:border-[var(--color-neon-primary)] hover:text-white"
                                                    >
                                                        {copiedId === record.certificateId ? "Copied" : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                                                    </button>
                                                    <a
                                                        href={`/verify/${record.certificateId}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-neon-primary)] px-3 py-1.5 text-xs font-semibold text-black transition-all hover:bg-[#00ffaa]"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" /> View
                                                    </a>
                                                    {record.status === "failed" ? (
                                                        <button
                                                            type="button"
                                                            disabled={retryingId === record.certificateId}
                                                            onClick={() => handleRetry(record.certificateId)}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs text-rose-300 transition-colors hover:border-rose-400 hover:text-rose-200 disabled:opacity-60"
                                                        >
                                                            {retryingId === record.certificateId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                                            Retry
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid gap-4 p-4 md:hidden">
                            {records.map((record) => (
                                <article key={record.id} className="rounded-2xl border border-[var(--color-neon-border)] bg-[var(--color-neon-surface)] p-4 space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-white">{record.name}</h3>
                                            <p className="text-xs text-[var(--color-neon-muted)] mt-1">{record.recipientEmail || "No email provided"}</p>
                                        </div>
                                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium ${STATUS_STYLES[record.status] || STATUS_STYLES.pending}`}>
                                            {getStatusLabel(record.status)}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <p className="text-[var(--color-neon-muted)]">{record.course}</p>
                                        <p className="font-mono text-xs text-[var(--color-neon-primary)]">{record.certificateId}</p>
                                        <p className="text-xs text-[var(--color-neon-muted)]">Updated {formatDate(record.updatedAt)}</p>
                                        {record.failureReason ? <p className="text-xs text-rose-300">{record.failureReason}</p> : null}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleCopyLink(record.certificateId)}
                                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--color-neon-border)] px-3 py-2 text-xs text-[var(--color-neon-muted)]"
                                        >
                                            <Copy className="w-3.5 h-3.5" /> {copiedId === record.certificateId ? "Copied" : "Copy link"}
                                        </button>
                                        <a
                                            href={`/verify/${record.certificateId}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-neon-primary)] px-3 py-2 text-xs font-semibold text-black"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" /> View
                                        </a>
                                        {record.status === "failed" ? (
                                            <button
                                                type="button"
                                                disabled={retryingId === record.certificateId}
                                                onClick={() => handleRetry(record.certificateId)}
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 px-3 py-2 text-xs text-rose-300 disabled:opacity-60"
                                            >
                                                {retryingId === record.certificateId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                                Retry failed
                                            </button>
                                        ) : null}
                                    </div>
                                </article>
                            ))}
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