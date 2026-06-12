import prisma from "@/lib/prisma";
import { Award, Search, ExternalLink, Calendar, RefreshCw, FileDown, CheckCircle, Clock, XCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function AdminCertificatesPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const query = searchParams?.q || "";
    const statusFilter = searchParams?.status || "all";
    const currentPage = parseInt(searchParams?.page || "1", 10);
    const pageSize = 15;

    // Build Prisma query filters
    const where: any = {};

    if (query) {
        where.OR = [
            { certificateId: { contains: query, mode: "insensitive" as const } },
            { name: { contains: query, mode: "insensitive" as const } },
            { recipientEmail: { contains: query, mode: "insensitive" as const } },
            { course: { contains: query, mode: "insensitive" as const } }
        ];
    }

    if (statusFilter === "revoked") {
        where.revoked = true;
    } else if (statusFilter !== "all") {
        where.status = statusFilter;
        where.revoked = false;
    }

    // Get Counts for metrics
    const totalCerts = await prisma.certificate.count();
    const certsSent = await prisma.certificate.count({ where: { status: "sent", revoked: false } });
    const certsPending = await prisma.certificate.count({ where: { status: "pending", revoked: false } });
    const certsFailed = await prisma.certificate.count({ where: { status: "failed", revoked: false } });
    const certsRevoked = await prisma.certificate.count({ where: { revoked: true } });

    // Filtered Counts for pagination
    const totalFilteredCerts = await prisma.certificate.count({ where });
    const totalPages = Math.max(Math.ceil(totalFilteredCerts / pageSize), 1);

    // Fetch paginated certificates
    const certificates = await prisma.certificate.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
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
                    <span className="section-label mb-2">Audit Registry</span>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Certificates Audit</h1>
                    <p className="text-[var(--color-neon-muted)] text-sm mt-1">
                        Platform-wide certificate ledger. Search, filter, and inspect PDF files and delivery status.
                    </p>
                </div>
            </div>

            {/* Status counts widgets */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-4 bg-[#0a0a0a] border border-[var(--color-neon-border)] rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-[var(--color-neon-muted)] uppercase tracking-wider">Total</span>
                    <span className="text-2xl font-black text-white mt-1">{totalCerts}</span>
                </div>
                <div className="p-4 bg-[#0a0a0a] border border-[var(--color-neon-border)] rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-[var(--color-neon-muted)] uppercase tracking-wider flex items-center gap-1"><CheckCircle className="w-3 h-3 text-[var(--color-neon-primary)]" /> Sent</span>
                    <span className="text-2xl font-black text-[var(--color-neon-primary)] mt-1">{certsSent}</span>
                </div>
                <div className="p-4 bg-[#0a0a0a] border border-[var(--color-neon-border)] rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-[var(--color-neon-muted)] uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3 text-yellow-500" /> Pending</span>
                    <span className="text-2xl font-black text-yellow-500 mt-1">{certsPending}</span>
                </div>
                <div className="p-4 bg-[#0a0a0a] border border-[var(--color-neon-border)] rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-[var(--color-neon-muted)] uppercase tracking-wider flex items-center gap-1"><XCircle className="w-3 h-3 text-red-500" /> Failed</span>
                    <span className="text-2xl font-black text-red-500 mt-1">{certsFailed}</span>
                </div>
                <div className="p-4 bg-[#0a0a0a] border border-[var(--color-neon-border)] rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-[var(--color-neon-muted)] uppercase tracking-wider flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-purple-500" /> Revoked</span>
                    <span className="text-2xl font-black text-purple-500 mt-1">{certsRevoked}</span>
                </div>
            </div>

            {/* Search and Filter Form */}
            <div className="glass-card py-4">
                <form method="GET" className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-neon-muted)]" />
                        <input
                            type="text"
                            name="q"
                            defaultValue={query}
                            placeholder="Search ID, recipient name, email, event..."
                            className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[var(--color-neon-text)] outline-none focus:border-[var(--color-neon-primary)] transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <select
                            name="status"
                            defaultValue={statusFilter}
                            className="bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-neon-text)] outline-none focus:border-[var(--color-neon-primary)] cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            <option value="sent">Status: Sent</option>
                            <option value="pending">Status: Pending</option>
                            <option value="failed">Status: Failed</option>
                            <option value="revoked">Status: Revoked</option>
                        </select>

                        <button 
                            type="submit" 
                            className="btn-primary py-2.5 px-6 rounded-xl text-xs bg-[var(--color-neon-primary)] text-black font-semibold flex items-center gap-2"
                        >
                            Apply Filters
                        </button>

                        {(query || statusFilter !== "all") && (
                            <Link href="/admin/certificates" className="text-xs text-[var(--color-neon-muted)] hover:text-white px-2">
                                Reset
                            </Link>
                        )}
                    </div>
                </form>
            </div>

            {/* Certificates Table */}
            <div className="glass-card">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Certificate Details</th>
                                <th>Course / Event</th>
                                <th>Generated By</th>
                                <th>Status</th>
                                <th>Issue Date</th>
                                <th className="text-right">PDF</th>
                            </tr>
                        </thead>
                        <tbody>
                            {certificates.length > 0 ? (
                                certificates.map((cert) => (
                                    <tr key={cert.id} className="hover:bg-white/5 transition-all">
                                        <td>
                                            <div className="font-mono text-xs text-[var(--color-neon-primary)] font-bold mb-1">
                                                {cert.certificateId}
                                            </div>
                                            <div className="font-semibold text-white">{cert.name}</div>
                                            <div className="text-[10px] text-[var(--color-neon-muted)]">{cert.recipientEmail || "No Email Specified"}</div>
                                        </td>
                                        <td>
                                            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/10">
                                                {cert.course}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="text-xs font-medium text-white">{cert.user?.name || "System"}</div>
                                            <div className="text-[9px] text-[var(--color-neon-muted)] truncate max-w-[150px]">{cert.user?.email || "API Access"}</div>
                                        </td>
                                        <td>
                                            {cert.revoked ? (
                                                <span className="badge-pill bg-purple-500/10 border-purple-500/30 text-purple-400">Revoked</span>
                                            ) : cert.status === "sent" ? (
                                                <span className="badge-pill bg-[var(--color-neon-primary)]/10 border-[var(--color-neon-primary)]/30 text-[var(--color-neon-primary)]">Sent</span>
                                            ) : cert.status === "pending" ? (
                                                <span className="badge-pill bg-yellow-500/10 border-yellow-500/30 text-yellow-400">Pending</span>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="badge-pill bg-red-500/10 border-red-500/30 text-red-400">Failed</span>
                                                    {cert.failureReason && (
                                                        <span className="text-[8px] text-red-400 max-w-[120px] truncate mt-1" title={cert.failureReason}>
                                                            {cert.failureReason}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="text-xs text-[var(--color-neon-muted)]">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 shrink-0" />
                                                <span>{cert.issueDate}</span>
                                            </div>
                                            <div className="text-[9px] mt-1">
                                                Added: {new Date(cert.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            {cert.pdfUrl ? (
                                                <a 
                                                    href={cert.pdfUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-xs text-white transition-all font-semibold"
                                                >
                                                    <FileDown className="w-3.5 h-3.5" /> PDF
                                                </a>
                                            ) : (
                                                <span className="text-xs text-[var(--color-neon-muted)] font-mono">N/A</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-[var(--color-neon-muted)]">
                                        No certificates matching filters found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-[var(--color-neon-border)]">
                        <Link
                            href={`/admin/certificates?q=${encodeURIComponent(query)}&status=${statusFilter}&page=${currentPage - 1}`}
                            className={`btn-secondary text-xs px-4 py-2 flex items-center justify-center text-white border-[var(--color-neon-border)] ${currentPage <= 1 ? "opacity-50 pointer-events-none" : ""}`}
                        >
                            Previous
                        </Link>
                        <span className="text-xs text-[var(--color-neon-muted)]">
                            Page <span className="text-white font-bold">{currentPage}</span> of <span className="text-white font-bold">{totalPages}</span>
                        </span>
                        <Link
                            href={`/admin/certificates?q=${encodeURIComponent(query)}&status=${statusFilter}&page=${currentPage + 1}`}
                            className={`btn-secondary text-xs px-4 py-2 flex items-center justify-center text-white border-[var(--color-neon-border)] ${currentPage >= totalPages ? "opacity-50 pointer-events-none" : ""}`}
                        >
                            Next
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
