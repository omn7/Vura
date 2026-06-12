"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, Users, Award, Activity, 
    ChevronRight, X, User, LogOut, ShieldAlert, Home
} from "lucide-react";
import { logoutAdmin } from "@/app/admin/actions";
import { useState } from "react";

const ADMIN_NAV = [
    { href: "/admin", icon: LayoutDashboard, label: "Overview" },
    { href: "/admin/users", icon: Users, label: "Users Stats" },
    { href: "/admin/certificates", icon: Award, label: "Certificates Audit" },
    { href: "/admin/system", icon: Activity, label: "System Activity" },
];

interface Props {
    user: { name?: string | null; email?: string | null; image?: string | null };
}

export default function AdminSidebar({ user }: Props) {
    const path = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleSignOut = async () => {
        await logoutAdmin();
        router.push("/admin/login");
        router.refresh();
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[#080808]">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-[var(--color-neon-border)] flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <img src="/vuralogo.png" alt="Vura Logo" className="w-10 h-10 object-contain transition-transform group-hover:scale-105" />
                    <div className="flex flex-col">
                        <span className="text-lg font-black tracking-widest uppercase text-white leading-none">VURA</span>
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest leading-none mt-1">ADMIN</span>
                    </div>
                </Link>
            </div>

            {/* Admin info */}
            <div className="px-4 py-4 border-b border-[var(--color-neon-border)]">
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-red-950/10 border border-red-500/20">
                    {user.image ? (
                        <img src={user.image} alt="avatar" className="w-9 h-9 rounded-full border-2 border-red-500/50 shrink-0 object-cover" />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-red-400" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user.name ?? "Admin"}</p>
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Super Administrator</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-neon-muted)] px-3 mb-3">Admin Console</p>
                {ADMIN_NAV.map(({ href, icon: Icon, label }) => {
                    const active = path === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${active
                                ? "bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
                                : "text-[var(--color-neon-muted)] hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <Icon className={`w-4 h-4 shrink-0 ${active ? "text-red-400" : "group-hover:text-white"}`} />
                            <span className="flex-1">{label}</span>
                            {active && <ChevronRight className="w-3.5 h-3.5" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="px-4 py-4 border-t border-[var(--color-neon-border)] space-y-2">
                <Link 
                    href="/dashboard" 
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--color-neon-muted)] hover:text-white hover:bg-white/5 transition-all group"
                >
                    <Home className="w-4 h-4 shrink-0 group-hover:text-[var(--color-neon-primary)]" />
                    <span>User Dashboard</span>
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-neon-primary)]/10 text-[var(--color-neon-primary)]">exit</span>
                </Link>
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition-all"
                >
                    <LogOut className="w-4 h-4 shrink-0" />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden md:flex w-64 shrink-0 flex-col h-screen sticky top-0 bg-[#080808] border-r border-[var(--color-neon-border)] z-30">
                <SidebarContent />
            </aside>

            {/* Mobile: hamburger button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-[#0a0a0a] border border-[var(--color-neon-border)] flex items-center justify-center shadow-lg"
            >
                <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse-glow" />
            </button>

            {/* Mobile: overlay drawer */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <aside className="relative w-72 bg-[#080808] border-r border-[var(--color-neon-border)] flex flex-col h-full">
                        <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-[var(--color-neon-muted)] hover:text-white z-50">
                            <X className="w-5 h-5" />
                        </button>
                        <SidebarContent />
                    </aside>
                </div>
            )}
        </>
    );
}
