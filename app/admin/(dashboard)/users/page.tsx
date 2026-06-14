import prisma from "@/lib/prisma";
import { Users, Search, ArrowRight, Activity, Award, Key, Shield } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminUsersPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const query = searchParams?.q || "";
    const currentPage = parseInt(searchParams?.page || "1", 10);
    const pageSize = 10;

    // Build search query filters
    const where = query 
        ? {
            OR: [
                { name: { contains: query, mode: "insensitive" as const } },
                { email: { contains: query, mode: "insensitive" as const } }
            ]
          }
        : {};

    // Get counts
    const totalUsers = await prisma.user.count();
    const totalFilteredUsers = await prisma.user.count({ where });
    const totalPages = Math.max(Math.ceil(totalFilteredUsers / pageSize), 1);

    // Fetch paginated users with certificate, event, and api stats
    const users = await prisma.user.findMany({
        where,
        orderBy: { id: "desc" },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        include: {
            _count: {
                select: {
                    certificates: true,
                    apiUsageLogs: true,
                    events: true
                }
            }
        }
    });

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--color-neon-border)] pb-6">
                <div>
                    <span className="section-label mb-2">User Directory</span>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Users Stats</h1>
                    <p className="text-[var(--color-neon-muted)] text-sm mt-1">
                        Analyze user registration profiles, active API keys, and certificate generation metrics.
                    </p>
                </div>
            </div>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="metric-card">
                    <p className="text-xs font-bold text-[var(--color-neon-muted)] uppercase tracking-wider">Total Users Registered</p>
                    <h3 className="text-3xl font-extrabold text-white mt-1">{totalUsers}</h3>
                    <p className="text-[10px] text-[var(--color-neon-muted)] mt-2">Platform lifetime users</p>
                </div>
                <div className="metric-card">
                    <p className="text-xs font-bold text-[var(--color-neon-muted)] uppercase tracking-wider">With Active API Keys</p>
                    <h3 className="text-3xl font-extrabold text-[var(--color-neon-primary)] mt-1">
                        {await prisma.user.count({ where: { apiKey: { not: null } } })}
                    </h3>
                    <p className="text-[10px] text-[var(--color-neon-muted)] mt-2">Developers integrated with Vura API</p>
                </div>
                <div className="metric-card">
                    <p className="text-xs font-bold text-[var(--color-neon-muted)] uppercase tracking-wider">Search Matches</p>
                    <h3 className="text-3xl font-extrabold text-blue-400 mt-1">{totalFilteredUsers}</h3>
                    <p className="text-[10px] text-[var(--color-neon-muted)] mt-2">Filtered count in directory</p>
                </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="glass-card py-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <form method="GET" className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-neon-muted)]" />
                    <input
                        type="text"
                        name="q"
                        defaultValue={query}
                        placeholder="Search by name or email..."
                        className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[var(--color-neon-text)] outline-none focus:border-[var(--color-neon-primary)] transition-all"
                    />
                    {query && (
                        <Link href="/admin/users" className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--color-neon-muted)] hover:text-white">
                            Clear
                        </Link>
                    )}
                </form>
                
                <div className="text-xs text-[var(--color-neon-muted)]">
                    Showing {users.length} of {totalFilteredUsers} matching users
                </div>
            </div>

            {/* Users Table */}
            <div className="glass-card">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User Profile</th>
                                <th>API Credentials</th>
                                <th className="text-center">Events Created</th>
                                <th className="text-center">Certs Generated</th>
                                <th className="text-center">API Usage Log</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-all">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                {user.image ? (
                                                    <img src={user.image} alt={user.name || "avatar"} className="w-8 h-8 rounded-full border border-[var(--color-neon-border)] shrink-0 object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-[var(--color-neon-border)] text-[var(--color-neon-muted)] flex items-center justify-center shrink-0 font-bold text-xs uppercase">
                                                        {(user.name || user.email || "?").charAt(0)}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-white truncate max-w-[180px]">{user.name || "No Name"}</div>
                                                    <div className="text-[11px] text-[var(--color-neon-muted)] truncate max-w-[200px]">{user.email || "No Email"}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {user.apiKey ? (
                                                <div className="flex items-center gap-1.5 text-xs text-[var(--color-neon-primary)] font-semibold">
                                                    <Key className="w-3.5 h-3.5" />
                                                    <span className="font-mono text-[10px] bg-[var(--color-neon-primary)]/10 px-1.5 py-0.5 rounded border border-[var(--color-neon-primary)]/20">
                                                        vura_...{user.apiKey.slice(-5)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-[var(--color-neon-muted)] font-mono">No API Integration</span>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/10">
                                                {user._count.events}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-[var(--color-neon-primary)]/10 text-[var(--color-neon-primary)] border border-[var(--color-neon-primary)]/10">
                                                {user._count.certificates}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            {user._count.apiUsageLogs > 0 ? (
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/10">
                                                    {user._count.apiUsageLogs} reqs
                                                </span>
                                            ) : (
                                                <span className="text-xs text-[var(--color-neon-muted)]">-</span>
                                            )}
                                        </td>
                                        <td className="text-right">
                                            <Link 
                                                href={`/admin/certificates?q=${encodeURIComponent(user.email || "")}`}
                                                className="inline-flex items-center gap-1 text-xs text-[var(--color-neon-primary)] hover:underline font-semibold"
                                            >
                                                Audit certs <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-[var(--color-neon-muted)]">
                                        No users match your search criteria.
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
                            href={`/admin/users?q=${encodeURIComponent(query)}&page=${currentPage - 1}`}
                            className={`btn-secondary text-xs px-4 py-2 flex items-center justify-center text-white border-[var(--color-neon-border)] ${currentPage <= 1 ? "opacity-50 pointer-events-none" : ""}`}
                        >
                            Previous
                        </Link>
                        <span className="text-xs text-[var(--color-neon-muted)]">
                            Page <span className="text-white font-bold">{currentPage}</span> of <span className="text-white font-bold">{totalPages}</span>
                        </span>
                        <Link
                            href={`/admin/users?q=${encodeURIComponent(query)}&page=${currentPage + 1}`}
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
