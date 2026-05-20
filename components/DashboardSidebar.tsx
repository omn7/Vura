"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard, Key, ShieldCheck, User, Settings,
    LogOut, ChevronRight, X, Activity, Mail
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useState } from "react"

const NAV = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Certificates" },
    { href: "/dashboard/deliveries", icon: Mail, label: "Deliveries" },
    { href: "/dashboard/api-key", icon: Key, label: "API Key" },
    { href: "/dashboard/usage", icon: Activity, label: "Usage" },
    { href: "/dashboard/verify", icon: ShieldCheck, label: "Verify" },
    { href: "/dashboard/profile", icon: User, label: "Profile" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

interface Props {
    user: { name?: string | null; email?: string | null; image?: string | null }
}

export default function DashboardSidebar({ user }: Props) {
    const path = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-[var(--color-neon-border)]">
                <Link href="/" className="flex items-center gap-2 group">
                    <img src="/vuralogo.png" alt="Vura Logo" className="w-10 h-10 object-contain transition-transform group-hover:scale-105" />
                    <span className="text-lg font-black tracking-widest uppercase text-white">VURA</span>
                </Link>
            </div>

            {/* User info */}
            <div className="px-4 py-4 border-b border-[var(--color-neon-border)]">
                <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-[var(--color-neon-surface)]">
                    {user.image ? (
                        <img src={user.image} alt="avatar" className="w-9 h-9 rounded-full border-2 border-[var(--color-neon-primary)]/50 shrink-0 object-cover" />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-[var(--color-neon-primary)]/20 border border-[var(--color-neon-primary)]/30 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-[var(--color-neon-primary)]" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user.name ?? "User"}</p>
                        <p className="text-xs text-[var(--color-neon-muted)] truncate">{user.email}</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-neon-muted)] px-3 mb-3">Navigation</p>
                {NAV.map(({ href, icon: Icon, label }) => {
                    const active = path === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${active
                                ? "bg-[var(--color-neon-primary)]/15 text-[var(--color-neon-primary)] border border-[var(--color-neon-primary)]/30"
                                : "text-[var(--color-neon-muted)] hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[var(--color-neon-primary)]" : "group-hover:text-white"}`} />
                            <span className="flex-1">{label}</span>
                            {active && <ChevronRight className="w-3.5 h-3.5" />}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom */}
            <div className="px-4 py-4 border-t border-[var(--color-neon-border)] space-y-2">
                <Link href="/docs" className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-[var(--color-neon-muted)] hover:text-white hover:bg-white/5 transition-all">
                    API Docs <span className="ml-auto text-[var(--color-neon-primary)]">↗</span>
                </Link>
                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition-all"
                >
                    <LogOut className="w-4 h-4 shrink-0" />
                    Sign Out
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden md:flex w-64 shrink-0 flex-col h-screen sticky top-0 bg-[#080808] border-r border-[var(--color-neon-border)]">
                <SidebarContent />
            </aside>

            {/* Mobile: hamburger button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-[#0a0a0a] border border-[var(--color-neon-border)] flex items-center justify-center shadow-lg"
            >
                <LayoutDashboard className="w-5 h-5 text-[var(--color-neon-primary)]" />
            </button>

            {/* Mobile: overlay drawer */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <aside className="relative w-72 bg-[#080808] border-r border-[var(--color-neon-border)] flex flex-col h-full">
                        <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-[var(--color-neon-muted)] hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                        <SidebarContent />
                    </aside>
                </div>
            )}
        </>
    )
}
