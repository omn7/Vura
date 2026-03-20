"use client"

import Link from 'next/link'
import { ArrowRight, ShieldCheck, Zap, Cloud, LayoutDashboard, CheckCircle, ChevronRight, Github, Twitter, Linkedin, Mail, User, LogOut, Menu, X, Key, Activity, Search, QrCode, FileSpreadsheet, FileText, Sparkles, Database } from 'lucide-react'
import { motion, useScroll, useTransform, AnimatePresence, Variants } from "framer-motion"
import { useEffect, useState, useRef } from 'react'
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import InteractiveShowcase from './InteractiveShowcase'

const HeroBackground = dynamic(() => import("@/components/HeroBackground"), { ssr: false })


const FEATURES = [
    { icon: Zap, title: "Bulk Generation", desc: "Process thousands of rows from Excel into pristine PDFs in seconds.", color: "#00e599", bg: "rgba(0,229,153,0.08)" },
    { icon: ShieldCheck, title: "Unique Cert IDs", desc: "Unforgeable CERT-XXXX identifiers in every document and QR code.", color: "#9d4edd", bg: "rgba(157,78,221,0.08)" },
    { icon: QrCode, title: "QR Verification", desc: "Anyone can scan to view a public authenticity page instantly.", color: "#007acc", bg: "rgba(0,122,204,0.08)" },
    { icon: Cloud, title: "Secure Cloud Storage", desc: "All assets stored in AWS S3, metadata in Neon Postgres.", color: "#e0aaff", bg: "rgba(224,170,255,0.08)" },
    { icon: Key, title: "API Access", desc: "Generate certificates from any system using your secret API key.", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
    { icon: Activity, title: "Usage Analytics", desc: "Track every API call — endpoint, status, cert ID, timestamp.", color: "#f87171", bg: "rgba(248,113,113,0.08)" },
]

const STEPS = [
    { n: "01", icon: FileText, title: "Upload Template", desc: "Drop your blank PDF design. Use the visual mapper to pin name, course, date, and QR fields." },
    { n: "02", icon: FileSpreadsheet, title: "Map Your Data", desc: "Upload an Excel file with Name, Course, IssueDate columns — or POST via API with JSON." },
    { n: "03", icon: Sparkles, title: "Generate & Share", desc: "Click Generate. Vura builds, uploads to S3, and returns direct PDF + verify links instantly." },
]

export default function LandingContent({ session }: { session: any }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [searchId, setSearchId] = useState("")
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const profileRef = useRef<HTMLDivElement>(null)
    const { scrollY } = useScroll()
    const router = useRouter()

    const navBg = useTransform(scrollY, [0, 50], ["rgba(3,3,3,0)", "rgba(3,3,3,0.93)"])
    const navBorder = useTransform(scrollY, [0, 50], ["rgba(34,34,34,0)", "rgba(34,34,34,1)"])

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const fadeUp: Variants = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }
    const stagger: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }

    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden">

            {/* ─── Navbar ─── */}
            <motion.header style={{ backgroundColor: navBg, borderBottomColor: navBorder, borderBottomWidth: 1, borderBottomStyle: 'solid' }}
                className="fixed top-0 z-50 w-full backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-neon-primary)] flex items-center justify-center shadow-[0_0_12px_rgba(0,229,153,0.45)] group-hover:shadow-[0_0_22px_rgba(0,229,153,0.65)] transition-all">
                            <div className="w-3 h-3 bg-black rounded-sm rotate-45" />
                        </div>
                        <span className="text-xl font-black tracking-widest uppercase text-white">VURA</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 text-sm text-[var(--color-neon-muted)]">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                        <Link href="/docs" className="text-[var(--color-neon-primary)] hover:text-white transition-colors">API Docs</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-[var(--color-neon-muted)] hover:text-white transition-colors p-2 flex items-center justify-center rounded-full hover:bg-white/5">
                                <Search className="w-4 h-4" />
                            </button>
                            <AnimatePresence>
                                {isSearchOpen && (
                                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-full mt-2 w-[320px] rounded-2xl bg-[rgba(10,10,10,0.95)] backdrop-blur-2xl border border-[var(--color-neon-border)] shadow-[0_8px_32px_rgba(0,0,0,0.8)] p-2 z-50 origin-top-right">
                                        <form onSubmit={(e) => { e.preventDefault(); if (searchId.trim()) router.push(`/verify/${searchId.trim()}`) }} className="relative flex items-center">
                                            <div className="absolute left-3 pointer-events-none"><QrCode className="w-4 h-4 text-[var(--color-neon-primary)] opacity-70" /></div>
                                            <input type="text" autoFocus value={searchId} onChange={(e) => setSearchId(e.target.value)} placeholder="Enter Certificate ID..."
                                                className="w-full bg-[rgba(20,20,20,0.6)] border border-[var(--color-neon-border)] rounded-xl py-2.5 pr-20 pl-9 text-sm text-white focus:outline-none focus:border-[var(--color-neon-primary)] focus:ring-1 focus:ring-[var(--color-neon-primary)]/30 transition-all placeholder-[var(--color-neon-muted)]" />
                                            <button type="submit" className="absolute right-1 top-1 bottom-1 bg-[var(--color-neon-surface-hover)] border border-[var(--color-neon-border)] hover:border-[var(--color-neon-primary)] hover:text-[#00e599] text-[var(--color-neon-muted)] text-xs font-semibold px-4 rounded-lg transition-colors">
                                                Verify
                                            </button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <a href="https://github.com/omn7/Vura" target="_blank" rel="noreferrer"
                            className="hidden sm:flex items-center gap-2 text-sm text-[var(--color-neon-muted)] hover:text-white transition-colors border-r border-[var(--color-neon-border)] pr-4">
                            <Github className="w-4 h-4" /> GitHub
                        </a>
                        {session ? (
                            <div className="flex items-center gap-3">
                                <Link href="/app" className="hidden sm:flex btn-primary py-2 px-4 text-sm items-center gap-1.5">
                                    Generator <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                                <div className="relative" ref={profileRef}>
                                    <button onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="w-9 h-9 rounded-full bg-[var(--color-neon-surface)] border border-[var(--color-neon-border)] flex items-center justify-center overflow-hidden hover:border-[var(--color-neon-primary)] transition-all focus:outline-none">
                                        {session.user?.image ? <img src={session.user.image} alt="User" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-[var(--color-neon-muted)]" />}
                                    </button>
                                    <AnimatePresence>
                                        {isProfileOpen && (
                                            <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }}
                                                className="absolute right-0 mt-2 w-52 rounded-xl bg-[rgba(10,10,10,0.97)] backdrop-blur-xl border border-[var(--color-neon-border)] shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden z-50">
                                                <div className="px-4 py-3 border-b border-[var(--color-neon-border)]">
                                                    <p className="text-sm font-semibold text-white truncate">{session.user?.name || "User"}</p>
                                                    <p className="text-xs text-[var(--color-neon-muted)] truncate">{session.user?.email}</p>
                                                </div>
                                                <div className="p-2 space-y-0.5">
                                                    <Link href="/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-neon-muted)] hover:text-white hover:bg-white/5 rounded-lg transition-colors"><LayoutDashboard className="w-4 h-4" /> Dashboard</Link>
                                                    <Link href="/app" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-neon-muted)] hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Sparkles className="w-4 h-4" /> Generator</Link>
                                                    <Link href="/dashboard/api-key" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-neon-muted)] hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Key className="w-4 h-4" /> API Key</Link>
                                                    <div className="border-t border-[var(--color-neon-border)] my-1" />
                                                    <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><LogOut className="w-4 h-4" /> Sign Out</button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-3">
                                <Link href="/login" className="text-sm text-[var(--color-neon-muted)] hover:text-white transition-colors">Sign In</Link>
                                <Link href="/register" className="btn-primary py-2 px-5 text-sm flex items-center gap-1.5">Get Started <ArrowRight className="w-3.5 h-3.5" /></Link>
                            </div>
                        )}
                        <button className="md:hidden text-white p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-[rgba(3,3,3,0.97)] backdrop-blur-xl border-b border-[var(--color-neon-border)] overflow-hidden">
                            <nav className="flex flex-col px-6 py-4 gap-4 text-sm text-[var(--color-neon-muted)]">
                                <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white py-1">Features</a>
                                <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white py-1">How It Works</a>
                                <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white py-1">Pricing</a>
                                {!session && (
                                    <div className="flex flex-col gap-3 pt-3 border-t border-[var(--color-neon-border)]">
                                        <Link href="/login" className="text-center py-2 text-white bg-white/5 rounded-xl">Sign In</Link>
                                        <Link href="/register" className="btn-primary py-2.5 text-center justify-center">Get Started</Link>
                                    </div>
                                )}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>

            <main className="flex-1 flex flex-col">

                {/* ─── HERO (Two-Column) ─── */}
                <section className="relative w-full overflow-hidden">
                    {/* Full-width background */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <HeroBackground />
                    </div>

                    {/* Constrained layout for content */}
                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 px-6 pt-16 pb-20 lg:pt-20 lg:pb-32 max-w-7xl mx-auto w-full">
                        <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-10 flex flex-col max-w-xl w-full">


                            <motion.h1 variants={fadeUp} className="text-[3.5rem] lg:text-[5rem] font-medium tracking-tight leading-[1] text-white">
                                Automated<br />
                                Certificate<br />
                                Generation at<br />
                                Scale. <br />

                            </motion.h1>

                            <motion.p variants={fadeUp} className="mt-8 text-xl text-white/80 leading-[1.6]">
                                We empower organizations with seamless automation and secure, verifiable credentials to issue bulk certificates faster.
                            </motion.p>

                            <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-4">
                                <Link href={session ? "/app" : "/register"} className="relative inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-[var(--color-neon-primary)] bg-transparent border border-[var(--color-neon-primary)] rounded-full hover:bg-[var(--color-neon-primary)]/10 hover:shadow-[0_0_20px_rgba(0,229,153,0.35)] hover:-translate-y-0.5 transition-all duration-300 group gap-2">
                                    Explore Vura <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <a href="https://github.com/omn7/Vura" target="_blank" rel="noreferrer" className="relative inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-[var(--color-neon-primary)] bg-transparent border border-[var(--color-neon-primary)] rounded-full hover:bg-[var(--color-neon-primary)]/10 hover:shadow-[0_0_20px_rgba(0,229,153,0.35)] hover:-translate-y-0.5 transition-all duration-300 gap-2">
                                    <Github className="w-4 h-4" /> View GitHub
                                </a>
                            </motion.div>

                            <motion.p variants={fadeUp} className="mt-8 text-sm text-[var(--color-neon-muted)] flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[var(--color-neon-primary)] animate-pulse shadow-[0_0_8px_#00e599]" />
                                Trusted by 50+ educators and event organizers · No credit card required
                            </motion.p>
                        </motion.div>

                        {/* Right — Interactive Showcase */}
                        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="relative z-10 w-full max-w-sm lg:max-w-md xl:max-w-lg shrink-0 flex items-center justify-center lg:-mt-32">
                            <InteractiveShowcase />
                        </motion.div>
                    </div>
                </section>

                {/* ─── Stats Bar ─── */}
                <section className="relative border-y border-[var(--color-neon-border)] bg-[rgba(10,10,10,0.8)] backdrop-blur-md py-12 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,153,0.05)_0%,transparent_70%)] pointer-events-none" />
                    <div className="relative z-10 max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[{ value: "500+", label: "Certificates Generated" }, { value: "20+", label: "Organizations Using Vura" }, { value: "99.9%", label: "Uptime SLA" }, { value: "<2s", label: "Avg Generation Time" }].map((s, i) => (
                            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center gap-1">
                                <span className="text-3xl font-extrabold text-white">{s.value}</span>
                                <span className="text-sm text-[var(--color-neon-muted)]">{s.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ─── How It Works ─── */}
                <section id="how-it-works" className="py-28 px-6 bg-[rgba(6,6,6,0.6)] border-b border-[var(--color-neon-border)]">
                    <div className="max-w-6xl mx-auto">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                            <h2 className="mt-5 text-4xl md:text-5xl font-bold text-white tracking-tight">From spreadsheet<br />to certificate in 3 steps</h2>
                        </motion.div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative mt-12 pt-4">
                            {/* Horizontal connecting line behind the badges */}
                            <div className="absolute top-4 left-[16.66%] right-[16.66%] h-px bg-[var(--color-neon-primary)]/30 hidden md:block z-0" />

                            {STEPS.map((s, i) => (
                                <motion.div key={s.n} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }}
                                    className="relative flex flex-col items-center text-center p-8 rounded-2xl border border-white/10 bg-[#070707] hover:border-[var(--color-neon-primary)]/40 transition-colors duration-300 z-10 w-full">
                                    
                                    {/* Number Badge placed on the top border */}
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[var(--color-neon-primary)] flex items-center justify-center text-[11px] font-black text-black ring-4 ring-[#070707] shadow-[0_0_15px_rgba(0,229,153,0.5)]">
                                        {i + 1}
                                    </div>
                                    
                                    {/* Icon Container with subtle borders similar to mockup */}
                                    <div className="w-16 h-16 rounded-xl border border-[var(--color-neon-primary)]/20 bg-[var(--color-neon-primary)]/[0.02] flex items-center justify-center mt-6 mb-8 group-hover:bg-[var(--color-neon-primary)]/[0.05] transition-colors">
                                        <s.icon className="w-6 h-6 text-[var(--color-neon-primary)]" strokeWidth={1.5} />
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-white mb-4 tracking-tight">{s.title}</h3>
                                    <p className="text-[14px] text-[var(--color-neon-muted)] leading-relaxed">{s.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── Features ─── */}
                <section id="features" className="py-28 px-6 relative">
                    <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(ellipse_at_top_right,rgba(157,78,221,0.08)_0%,transparent_60%)] pointer-events-none" />
                    <div className="max-w-7xl mx-auto relative z-10">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                            <span className="section-label inline-flex">Features</span>
                            <h2 className="mt-5 text-4xl md:text-5xl font-bold text-white">Everything you need,<br />nothing you don&apos;t</h2>
                            <p className="mt-4 text-[var(--color-neon-muted)] max-w-xl mx-auto">Vura is designed to stay out of your way — powerful under the hood, effortless on the surface.</p>
                        </motion.div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {FEATURES.map((f, i) => (
                                <motion.div key={f.title} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                                    whileHover={{ y: -5 }} className="glass-card flex flex-col gap-4 group transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: f.bg, border: `1px solid ${f.color}25` }}>
                                        <f.icon className="w-5 h-5" style={{ color: f.color }} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                                        <p className="text-sm text-[var(--color-neon-muted)] leading-relaxed">{f.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── Live Preview ─── */}
                <section className="py-24 px-6 border-y border-[var(--color-neon-border)] bg-[rgba(6,6,6,0.7)]">
                    <div className="max-w-6xl mx-auto">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
                            <span className="section-label inline-flex">Live Preview</span>
                            <h2 className="mt-5 text-4xl md:text-5xl font-bold text-white">See Vura in action</h2>
                            <p className="mt-4 text-[var(--color-neon-muted)] max-w-xl mx-auto">From API call to verified certificate — the full workflow in one view.</p>
                        </motion.div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                            {/* Terminal */}
                            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                                className="rounded-2xl overflow-hidden border border-[var(--color-neon-border)] bg-[#0d0d0d]">
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-neon-border)] bg-[#111]">
                                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" /><div className="w-3 h-3 rounded-full bg-[#ffbd2e]" /><div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                                    <span className="text-xs text-[var(--color-neon-muted)] ml-2 font-mono">POST /api/certificates/create</span>
                                </div>
                                <div className="p-5 font-mono text-xs leading-7 text-[#eaeaea]">
                                    <span className="text-[#9d4edd]">curl</span> <span className="text-[#00e599]">-X POST</span> <span className="text-[#eaeaea] opacity-60">https://vurakit.vercel.app/api</span><br />
                                    <span className="text-[#9d4edd]">{"  "}-H</span> <span className="text-amber-400">&quot;Authorization: Bearer sk_vura_...&quot;</span><br />
                                    <span className="text-[#9d4edd]">{"  "}-d</span> <span className="text-[#666]">&#123;</span><br />
                                    <span className="text-[#eaeaea]">{"       "}&quot;name&quot;:</span> <span className="text-amber-400">&quot;Om Narkhede&quot;</span><span className="text-[#666]">,</span><br />
                                    <span className="text-[#eaeaea]">{"       "}&quot;course&quot;:</span> <span className="text-amber-400">&quot;Full-Stack Engineering&quot;</span><span className="text-[#666]">,</span><br />
                                    <span className="text-[#eaeaea]">{"       "}&quot;issueDate&quot;:</span> <span className="text-amber-400">&quot;2026-03-21&quot;</span><br />
                                    <span className="text-[#666]">{"     "}&#125;</span><br /><br />
                                    <span className="text-[var(--color-neon-muted)]">{"// "} Response</span><br />
                                    <span className="text-[#666]">&#123;</span><br />
                                    <span className="text-[#00e599]">{"  "}&quot;certificateId&quot;</span><span className="text-[#eaeaea]">:</span> <span className="text-amber-400">&quot;CERT-A1B2C3D4&quot;</span><span className="text-[#666]">,</span><br />
                                    <span className="text-[#00e599]">{"  "}&quot;pdfUrl&quot;</span><span className="text-[#eaeaea]">:</span> <span className="text-amber-400">&quot;https://s3.aws.../cert.pdf&quot;</span><span className="text-[#666]">,</span><br />
                                    <span className="text-[#00e599]">{"  "}&quot;verifyUrl&quot;</span><span className="text-[#eaeaea]">:</span> <span className="text-amber-400 text-[10px]">&quot;https://vurakit.vercel.app/verify/CERT-A1B2C3D4&quot;</span><br />
                                    <span className="text-[#666]">&#125;</span>
                                </div>
                            </motion.div>

                            {/* Verify UI */}
                            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
                                className="rounded-2xl overflow-hidden border border-[#27c93f]/25 bg-[rgba(10,10,10,0.9)] flex flex-col">
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-neon-border)] bg-[#111]">
                                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" /><div className="w-3 h-3 rounded-full bg-[#ffbd2e]" /><div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                                    <div className="flex items-center gap-2 mx-auto bg-[#0d0d0d] border border-[#2a2a2a] rounded-md px-4 py-1 text-[11px] text-[#555]">
                                        <ShieldCheck className="w-3 h-3 text-[var(--color-neon-primary)]" /> vurakit.vercel.app/verify/CERT-A1B2C3D4
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
                                    <div className="w-16 h-16 rounded-full bg-[var(--color-neon-primary)]/10 border-2 border-[var(--color-neon-primary)]/40 flex items-center justify-center shadow-[0_0_32px_rgba(0,229,153,0.2)]">
                                        <CheckCircle className="w-8 h-8 text-[var(--color-neon-primary)]" />
                                    </div>
                                    <div className="badge-valid">✓ Valid Certificate</div>
                                    <div className="w-full space-y-3 mt-2">
                                        {[["Recipient", "Om Narkhede"], ["Course", "Full-Stack Engineering"], ["Date", "21 March 2026"], ["Cert ID", "CERT-A1B2C3D4"]].map(([label, val]) => (
                                            <div key={label} className="flex items-center justify-between py-2.5 border-b border-[var(--color-neon-border)]/50 text-sm">
                                                <span className="text-[var(--color-neon-muted)]">{label}</span>
                                                <span className={`text-white font-medium ${label === "Cert ID" ? "font-mono text-xs" : ""}`}>{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="w-full mt-2 py-3 rounded-xl bg-[var(--color-neon-primary)] text-black text-sm font-bold text-center shadow-[0_0_16px_rgba(0,229,153,0.3)]">View Original PDF</div>
                                    <div className="flex items-center gap-2 text-xs text-[var(--color-neon-muted)]">
                                        <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-neon-primary)]" /> Verified by Vura Certificate Authority
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ─── Pricing ─── */}
                <section id="pricing" className="py-28 px-6">
                    <div className="max-w-5xl mx-auto">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                            <span className="section-label inline-flex">Pricing</span>
                            <h2 className="mt-5 text-4xl md:text-5xl font-bold text-white">Simple, transparent pricing</h2>
                            <p className="mt-4 text-[var(--color-neon-muted)]">Start for free. Scale when you need it.</p>
                        </motion.div>
                        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                            {[
                                { name: "Free", price: "₹0", sub: "No credit card required", primary: false, features: ["Up to 100 certificates/month", "Google & Email login", "S3 cloud storage", "QR verification links", "API access + secret key", "Usage stats dashboard"] },
                                { name: "Pro", price: "₹999", sub: "For teams and events", primary: true, features: ["Unlimited certificates", "Everything in Free", "Custom branding", "Priority support", "Bulk export & analytics"] },
                            ].map((plan, i) => (
                                <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                    className={`glass-card p-8 flex flex-col gap-6 relative overflow-hidden ${plan.primary ? "border-[var(--color-neon-primary)]/30" : ""}`}>
                                    {plan.primary && (
                                        <>
                                            <div className="absolute top-4 right-4 px-3 py-1 text-xs font-bold bg-[var(--color-neon-primary)] text-black rounded-full shadow-[0_0_10px_rgba(0,229,153,0.5)]">Popular</div>
                                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,229,153,0.05),transparent_60%)] pointer-events-none" />
                                        </>
                                    )}
                                    <div>
                                        <p className={`text-sm font-semibold uppercase tracking-wider ${plan.primary ? "text-[var(--color-neon-primary)]" : "text-[var(--color-neon-muted)]"}`}>{plan.name}</p>
                                        <p className="text-4xl font-black text-white mt-2">{plan.price} <span className="text-lg text-[var(--color-neon-muted)] font-normal">/ mo</span></p>
                                        <p className="text-sm text-[var(--color-neon-muted)] mt-1">{plan.sub}</p>
                                    </div>
                                    <ul className="flex flex-col gap-3 flex-1">
                                        {plan.features.map(f => (<li key={f} className="flex items-center gap-3 text-sm text-[var(--color-neon-text)]"><CheckCircle className="w-4 h-4 shrink-0 text-[var(--color-neon-primary)]" />{f}</li>))}
                                    </ul>
                                    <Link href="/register" className={`py-3 text-center rounded-full font-semibold text-sm transition-all ${plan.primary ? 'btn-primary' : 'btn-secondary'}`}>
                                        {plan.primary ? "Start Free Trial" : "Get Started"}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── CTA ─── */}
                <section className="py-24 px-6 relative overflow-hidden border-t border-[var(--color-neon-border)] bg-[rgba(6,6,6,0.8)]">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,153,0.1)_0%,transparent_65%)] pointer-events-none" />
                    <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
                    <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center relative z-10">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to stop doing<br />this manually?</h2>
                        <p className="text-[var(--color-neon-muted)] mb-8 text-lg">Join educators and event organizers saving hours each month with Vura.</p>
                        <Link href={session ? "/app" : "/register"} className="relative inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-[var(--color-neon-primary)] bg-transparent border border-[var(--color-neon-primary)] rounded-full hover:bg-[var(--color-neon-primary)]/10 hover:shadow-[0_0_30px_rgba(0,229,153,0.4)] hover:-translate-y-1 transition-all duration-300 group gap-2">
                            Start Generating Certificates <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </section>
            </main>

            {/* ─── Footer ─── */}
            <footer className="border-t border-[var(--color-neon-border)] bg-[var(--color-neon-surface)] pt-14 pb-8 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
                        <div className="md:col-span-2">
                            <Link href="/" className="flex items-center gap-2 mb-4 w-fit group">
                                <div className="w-8 h-8 rounded-lg bg-[var(--color-neon-primary)] flex items-center justify-center group-hover:scale-105 transition-transform"><div className="w-3 h-3 bg-black rounded-sm rotate-45" /></div>
                                <span className="text-xl font-black tracking-widest uppercase text-white">VURA</span>
                            </Link>
                            <p className="text-sm text-[var(--color-neon-muted)] leading-relaxed max-w-sm">The modern certificate generation platform for educators, trainers, and event organizers. Built with Next.js, Prisma, and AWS.</p>
                            <div className="flex items-center gap-3 mt-5">
                                {[{ icon: Github, href: "https://github.com/omn7/Vura" }, { icon: Twitter, href: "https://x.com/mr_codex" }, { icon: Linkedin, href: "https://linkedin.com/in/omnarkhede/" }, { icon: Mail, href: "mailto:dev.om@outlook.com" }].map(({ icon: Icon, href }) => (
                                    <a key={href} href={href} target="_blank" rel="noreferrer" className="p-2 text-[var(--color-neon-muted)] hover:text-white hover:bg-white/5 rounded-full transition-colors"><Icon className="w-4 h-4" /></a>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</p>
                            <ul className="flex flex-col gap-3">
                                {[["Features", "#features"], ["How It Works", "#how-it-works"], ["Pricing", "#pricing"], ["Dashboard", "/dashboard"], ["API Docs", "/docs"]].map(([label, href]) => (<li key={label}><a href={href} className="text-sm text-[var(--color-neon-muted)] hover:text-white hover:translate-x-1 inline-block transition-all">{label}</a></li>))}
                            </ul>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</p>
                            <ul className="flex flex-col gap-3">
                                {[["About", "/about"], ["GitHub", "https://github.com/omn7/Vura"], ["Privacy", "/privacy"], ["Terms", "/terms"]].map(([label, href]) => (<li key={label}><a href={href} className="text-sm text-[var(--color-neon-muted)] hover:text-white hover:translate-x-1 inline-block transition-all">{label}</a></li>))}
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-[var(--color-neon-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-neon-muted)]">
                        <p>© {new Date().getFullYear()} <a href="https://omnarkhede.tech" target="_blank" rel="noreferrer" className="text-white hover:text-[var(--color-neon-primary)] font-medium transition-colors">Om Narkhede</a>. All rights reserved.</p>
                        <p>Built with ♥ for educators worldwide</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
