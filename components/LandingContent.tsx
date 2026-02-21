"use client"

import Link from 'next/link'
import { ArrowRight, Database, ShieldCheck, Zap, Cloud, LayoutDashboard, CheckCircle, ChevronRight, Github, Twitter, Linkedin, Mail, User, LogOut } from 'lucide-react'
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useEffect, useState, useRef } from 'react'
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"

export default function LandingContent({ session }: { session: any }) {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const profileRef = useRef<HTMLDivElement>(null)
    const { scrollY } = useScroll()

    // Make the navbar background more opaque on scroll
    const navBackground = useTransform(
        scrollY,
        [0, 50],
        ["rgba(3, 3, 3, 0)", "rgba(3, 3, 3, 0.8)"]
    )

    const navBorder = useTransform(
        scrollY,
        [0, 50],
        ["rgba(34, 34, 34, 0)", "rgba(34, 34, 34, 1)"]
    )

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Framer Motion Variants
    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    }

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    }

    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden bg-[var(--color-neon-bg)]">
            {/* ─── Sticky Animated Navbar ─── */}
            <motion.header
                style={{ backgroundColor: navBackground, borderBottomColor: navBorder, borderBottomWidth: 1, borderBottomStyle: 'solid' }}
                className="fixed top-0 z-50 w-full backdrop-blur-xl transition-all duration-300"
            >
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-neon-primary)] flex items-center justify-center shadow-[0_0_12px_rgba(0,229,153,0.4)] group-hover:shadow-[0_0_20px_rgba(0,229,153,0.6)] transition-all">
                            <div className="w-3 h-3 bg-black rounded-sm rotate-45"></div>
                        </div>
                        <span className="text-xl font-black tracking-widest uppercase text-white">VURA</span>
                    </Link>

                    {/* Nav links */}
                    <nav className="hidden md:flex items-center gap-8 text-sm text-[var(--color-neon-muted)]">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                        <Link href="/about" className="hover:text-white transition-colors flex items-center gap-1">About</Link>
                    </nav>

                    {/* CTA */}
                    <div className="flex items-center gap-4">
                        <a href="https://github.com/omn7/Vura" target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-2 text-sm text-[var(--color-neon-muted)] hover:text-white transition-colors border-r border-[var(--color-neon-border)] pr-4">
                            <Github className="w-5 h-5" /> GitHub
                        </a>

                        {session ? (
                            <div className="flex items-center gap-3">
                                <Link href="/dashboard" className="btn-secondary py-2 px-4 flex items-center gap-2 text-sm">
                                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                                </Link>
                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="w-10 h-10 rounded-full bg-[var(--color-neon-surface)] border border-[var(--color-neon-border)] flex items-center justify-center overflow-hidden hover:border-[var(--color-neon-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-neon-primary)]/50"
                                    >
                                        {session.user?.image ? (
                                            <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 text-[var(--color-neon-muted)]" />
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {isProfileOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 mt-3 w-56 rounded-xl bg-[rgba(10,10,10,0.95)] backdrop-blur-xl border border-[var(--color-neon-border)] shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50 text-left"
                                            >
                                                <div className="px-4 py-3 border-b border-[var(--color-neon-border)] bg-[var(--color-neon-surface)]/50">
                                                    <p className="text-sm font-medium text-white truncate">{session.user?.name || "User"}</p>
                                                    <p className="text-xs text-[var(--color-neon-muted)] truncate mt-0.5">{session.user?.email}</p>
                                                </div>
                                                <div className="p-2">
                                                    <button
                                                        onClick={() => signOut({ callbackUrl: '/' })}
                                                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg flex items-center gap-2 transition-colors group"
                                                    >
                                                        <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Sign Out
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/login" className="text-sm text-[var(--color-neon-muted)] hover:text-white transition-colors hidden sm:block">Sign In</Link>
                                <Link href="/register" className="btn-primary py-2 px-5 text-sm flex items-center gap-1.5">
                                    Get Started <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </motion.header>

            <main className="flex-1 flex flex-col pt-16">
                {/* ─── Hero Section ─── */}
                <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-32 overflow-hidden min-h-[90vh]">
                    {/* Animated Mesh / Grid Backgrounds */}
                    <div className="absolute inset-0 pointer-events-none bg-grid-pattern opacity-30"></div>
                    <div className="absolute inset-0 pointer-events-none">
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.15, 0.25, 0.15]
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(0,229,153,0.5)_0%,rgba(157,78,221,0.2)_45%,transparent_70%)] blur-[80px]"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.1, 0.2, 0.1]
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                            className="absolute bottom-0 left-1/4 w-[500px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(0,122,204,0.4)_0%,transparent_70%)] blur-[80px]"
                        />
                    </div>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="relative z-10 flex flex-col items-center"
                    >
                        {/* Badge */}
                        <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-neon-border)] bg-[rgba(10,10,10,0.5)] backdrop-blur-md text-xs text-[var(--color-neon-muted)] shadow-lg hover:border-[var(--color-neon-primary)]/50 transition-colors cursor-pointer">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-neon-primary)] animate-pulse inline-block shadow-[0_0_8px_#00e599]"></span>
                            Now with Google OAuth & Custom Credentials
                            <ChevronRight className="w-3 h-3" />
                        </motion.div>

                        {/* Headline */}
                        <motion.h1 variants={fadeUp} className="max-w-5xl text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500 pb-3">
                            Automate Certificate<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-neon-primary)] to-[var(--color-neon-secondary)]">
                                Generation at Scale
                            </span>
                        </motion.h1>

                        <motion.p variants={fadeUp} className="mt-6 text-lg md:text-xl text-[var(--color-neon-muted)] max-w-2xl leading-relaxed">
                            Upload an Excel sheet, drop your PDF template, and Vura bulk-generates verifiable certificates with unique QR codes in seconds — no code required.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
                            <Link href={session ? "/app" : "/register"} className="btn-primary text-base px-8 py-4 group">
                                Start Generating Free
                                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <a href="#how-it-works" className="btn-secondary text-base px-8 py-4 bg-[rgba(10,10,10,0.5)] backdrop-blur-sm">
                                See How It Works
                            </a>
                        </motion.div>

                        {/* Social proof microtext */}
                        <motion.p variants={fadeUp} className="mt-6 text-xs text-[var(--color-neon-muted)]">
                            Trusted by 50+ educators and event organizers · No credit card required
                        </motion.p>
                    </motion.div>

                    {/* Floating UI Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className="relative z-10 mt-20 w-full max-w-5xl mx-auto floating"
                    >
                        <div className="rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-[#333333] overflow-hidden bg-[#1a1a1a] backdrop-blur-xl">
                            {/* MacBook style Title Bar */}
                            <div className="h-10 bg-[#2a2a2a]/80 backdrop-blur-md flex items-center px-4 border-b border-[#333333] relative">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
                                </div>
                                <div className="absolute left-1/2 -translate-x-1/2 text-xs font-medium text-[#888888] flex items-center gap-2">
                                    <ShieldCheck className="w-3.5 h-3.5" /> vura-secure-dashboard.app
                                </div>
                            </div>

                            {/* Window Content */}
                            <div className="p-8 pb-10 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] relative">
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[var(--color-neon-secondary)] via-[var(--color-neon-primary)] to-[var(--color-neon-purple)] opacity-30"></div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {["CERT-A1B2C3D4", "CERT-E5F6G7H8", "CERT-I9J0K1L2"].map((id, i) => (
                                        <motion.div
                                            key={id}
                                            whileHover={{ scale: 1.05, translateY: -5 }}
                                            className={cn(
                                                "relative bg-[#0d0d0d] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)] border-[4px] border-[#2a2a2a] rounded-lg p-5 flex flex-col items-center text-center shadow-[0_20px_40px_rgba(0,0,0,0.9)] overflow-hidden min-h-[190px]",
                                                i === 1 ? "floating-delayed" : "floating"
                                            )}
                                        >
                                            {/* Outer Glow on hover */}
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_center,rgba(157,78,221,0.1),transparent_70%)] pointer-events-none"></div>

                                            {/* Inner Elegant Gold Border */}
                                            <div className="absolute inset-1.5 border border-[#c5a059]/40 rounded-sm pointer-events-none mix-blend-screen"></div>
                                            <div className="absolute inset-2 border-[0.5px] border-[#c5a059]/20 rounded-sm pointer-events-none"></div>

                                            <div className="text-[6px] font-bold text-[#c5a059] uppercase tracking-[0.3em] mt-1 mb-3">Certificate of Completion</div>

                                            <div className="text-[7px] italic text-[#888888] mb-1">This is to certify that</div>
                                            <div className="text-lg font-bold text-white font-serif mb-1 leading-tight tracking-wide drop-shadow-md">{["Aarav Patel", "Priya Sharma", "Rohan Gupta"][i]}</div>
                                            <div className="text-[7px] text-[#888888] mb-3 leading-none">has successfully completed the requirements for</div>

                                            <div className="text-xs font-bold text-[var(--color-neon-primary)] mb-auto tracking-widest uppercase leading-none bg-[var(--color-neon-primary)]/10 px-3 py-1.5 rounded border border-[var(--color-neon-primary)]/20 shadow-[0_0_10px_rgba(0,229,153,0.1)]">Next.js Architecture</div>

                                            <div className="w-full flex justify-between items-end mt-5 pt-3 border-t border-[#333333] relative z-10">
                                                <div className="flex flex-col items-start translate-y-1">
                                                    <div className="h-[0.5px] w-10 bg-[#555555] mb-1.5 shadow-sm"></div>
                                                    <div className="text-[4.5px] text-[#888888] uppercase tracking-wider">Issue Date</div>
                                                    <div className="text-[6px] font-medium text-[#cccccc]">Oct 24, 2023</div>
                                                </div>

                                                {/* Premium Gold Ribbon Seal */}
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffd700] via-[#daa520] to-[#b8860b] flex items-center justify-center shadow-[0_0_15px_rgba(218,165,32,0.4)] absolute left-1/2 -translate-x-1/2 bottom-[-8px] ring-2 ring-[#0d0d0d]">
                                                    <div className="w-8 h-8 rounded-full border-[0.5px] border-[#fff8dc]/70 border-dashed flex items-center justify-center bg-gradient-to-tr from-[#b8860b] to-[#ffd700]">
                                                        <ShieldCheck className="w-4 h-4 text-[#fff8dc] drop-shadow-sm" />
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end translate-y-1">
                                                    <div className="h-[0.5px] w-10 bg-[#555555] mb-1.5 shadow-sm"></div>
                                                    <div className="text-[4.5px] text-[#888888] uppercase tracking-wider">Verifier ID</div>
                                                    <div className="text-[6px] font-mono text-[#cccccc]">{id}</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* ─── Stats Bar ─── */}
                <section className="border-y border-[var(--color-neon-border)] bg-[rgba(10,10,10,0.8)] backdrop-blur-md py-12 relative overflow-hidden">
                    <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
                        {[
                            { value: "500+", label: "Certificates Generated" },
                            { value: "20+", label: "Organizations Using Vura" },
                            { value: "99.9%", label: "Uptime SLA" },
                            { value: "<2s", label: "Average Generation Time" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="flex flex-col items-center gap-1"
                            >
                                <span className="text-3xl font-extrabold text-white">{stat.value}</span>
                                <span className="text-sm text-[var(--color-neon-muted)]">{stat.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ─── Features Section ─── */}
                <section id="features" className="py-28 px-6 relative">
                    <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(ellipse_at_top_right,rgba(157,78,221,0.1)_0%,transparent_60%)] pointer-events-none"></div>

                    <div className="max-w-7xl mx-auto relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-neon-primary)] bg-[var(--color-neon-primary)]/10 px-3 py-1 rounded-full border border-[var(--color-neon-primary)]/20">Features</span>
                            <h2 className="mt-6 text-4xl md:text-5xl font-bold text-white">Everything you need,<br />nothing you don&apos;t</h2>
                            <p className="mt-4 text-[var(--color-neon-muted)] max-w-xl mx-auto">Vura is designed to stay out of your way — powerful under the hood, effortless on the surface.</p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {[
                                { icon: <Zap className="w-6 h-6 text-[var(--color-neon-primary)]" />, title: "Bulk Generation", desc: "Process thousands of rows from Excel (.xlsx) into pristine PDFs in seconds.", color: "rgba(0,229,153,0.1)", border: "rgba(0,229,153,0.3)" },
                                { icon: <ShieldCheck className="w-6 h-6 text-[var(--color-neon-purple)]" />, title: "Unique Verification IDs", desc: "Unforgeable CERT-XXXX identifiers embedded in each document and QR code.", color: "rgba(157,78,221,0.1)", border: "rgba(157,78,221,0.3)" },
                                { icon: <Database className="w-6 h-6 text-[#007acc]" />, title: "Instant Verification", desc: "Anyone can scan the QR code to view a public authenticity page in real-time.", color: "rgba(0,122,204,0.1)", border: "rgba(0,122,204,0.3)" },
                                { icon: <Cloud className="w-6 h-6 text-[#e0aaff]" />, title: "Secure Cloud Storage", desc: "All generated assets automatically stored in AWS S3, metadata in Neon Postgres.", color: "rgba(224,170,255,0.1)", border: "rgba(224,170,255,0.3)" },
                            ].map((f, i) => (
                                <motion.div
                                    key={f.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    whileHover={{ y: -5, borderColor: f.border, boxShadow: `0 10px 30px -10px ${f.color}` }}
                                    className="glass-card flex flex-col gap-4 group transition-all duration-300"
                                >
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-transparent group-hover:border-white/10 transition-colors" style={{ backgroundColor: f.color }}>
                                        {f.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                                        <p className="text-sm text-[var(--color-neon-muted)] leading-relaxed">{f.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── How It Works ─── */}
                <section id="how-it-works" className="py-28 px-6 bg-[rgba(10,10,10,0.5)] border-y border-[var(--color-neon-border)] relative">
                    <div className="max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-neon-secondary)] bg-[var(--color-neon-secondary)]/10 px-3 py-1 rounded-full border border-[var(--color-neon-secondary)]/20">Process</span>
                            <h2 className="mt-6 text-4xl md:text-5xl font-bold text-white">From spreadsheet to<br />certificate in 3 steps</h2>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                            <div className="absolute top-10 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-transparent via-[var(--color-neon-border)] to-transparent hidden md:block"></div>
                            {[
                                { n: "01", title: "Upload Template", desc: "Drop your blank PDF certificate design. Drag markers to set exact text positions for name, course, and date." },
                                { n: "02", title: "Map Your Data", desc: "Upload an Excel file with columns: Name, Course, IssueDate. Vura reads every row automatically." },
                                { n: "03", title: "Generate & Share", desc: "Click generate. Vura builds, uploads to S3, and provides direct PDF links for every certificate instantly." },
                            ].map((s, i) => (
                                <motion.div
                                    key={s.n}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.15 }}
                                    className="flex flex-col items-center text-center gap-4 p-8 rounded-2xl border border-[var(--color-neon-border)] bg-[var(--color-neon-bg)] hover:border-[var(--color-neon-primary)]/40 transition-colors group shadow-lg"
                                >
                                    <div className="w-14 h-14 rounded-full bg-[var(--color-neon-surface)] border border-[var(--color-neon-border)] text-[var(--color-neon-primary)] flex items-center justify-center font-black text-lg group-hover:bg-[var(--color-neon-primary)] group-hover:text-black group-hover:border-transparent group-hover:shadow-[0_0_20px_rgba(0,229,153,0.5)] transition-all">
                                        {s.n}
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">{s.title}</h3>
                                    <p className="text-sm text-[var(--color-neon-muted)] leading-relaxed">{s.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── Pricing ─── */}
                <section id="pricing" className="py-28 px-6">
                    <div className="max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <span className="text-xs font-semibold uppercase tracking-widest text-[#9d4edd] bg-[#9d4edd]/10 px-3 py-1 rounded-full border border-[#9d4edd]/20">Pricing</span>
                            <h2 className="mt-6 text-4xl md:text-5xl font-bold text-white">Simple, transparent pricing</h2>
                            <p className="mt-4 text-[var(--color-neon-muted)]">Start for free. Scale when you need it.</p>
                        </motion.div>
                        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                            {/* Free */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="glass-card p-8 flex flex-col gap-6"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-[var(--color-neon-muted)] uppercase tracking-wider">Free</p>
                                    <p className="text-5xl font-black text-white mt-2">₹0 <span className="text-lg text-[var(--color-neon-muted)] font-normal">/ mo</span></p>
                                    <p className="text-sm text-[var(--color-neon-muted)] mt-1">No credit card required</p>
                                </div>
                                <ul className="flex flex-col gap-3 my-4">
                                    {["Up to 100 certificates/month", "Google & Email login", "S3 cloud storage", "QR verification links", "Dashboard access"].map(f => (
                                        <li key={f} className="flex items-center gap-3 text-sm text-[var(--color-neon-text)]"><CheckCircle className="w-4 h-4 text-[var(--color-neon-primary)] shrink-0" />{f}</li>
                                    ))}
                                </ul>
                                <Link href="/register" className="btn-secondary py-3 text-center mt-auto w-full">Get Started</Link>
                            </motion.div>
                            {/* Pro */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="glass-card p-8 flex flex-col gap-6 border-[var(--color-neon-primary)]/40 relative overflow-hidden"
                            >
                                <div className="absolute top-4 right-4 px-3 py-1 text-xs font-bold bg-[var(--color-neon-primary)] text-black rounded-full shadow-[0_0_10px_rgba(0,229,153,0.5)]">Popular</div>
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,229,153,0.06),transparent_60%)] pointer-events-none"></div>
                                <div className="relative">
                                    <p className="text-sm font-semibold text-[var(--color-neon-primary)] uppercase tracking-wider">Pro</p>
                                    <p className="text-5xl font-black text-white mt-2">₹999 <span className="text-lg text-[var(--color-neon-muted)] font-normal">/ mo</span></p>
                                    <p className="text-sm text-[var(--color-neon-muted)] mt-1">For teams and events</p>
                                </div>
                                <ul className="flex flex-col gap-3 my-4 relative">
                                    {["Unlimited certificates", "Everything in Free", "Custom branding", "Priority support", "Bulk export & analytics"].map(f => (
                                        <li key={f} className="flex items-center gap-3 text-sm text-[var(--color-neon-text)]"><CheckCircle className="w-4 h-4 text-[var(--color-neon-primary)] shrink-0" />{f}</li>
                                    ))}
                                </ul>
                                <Link href="/register" className="btn-primary py-3 text-center mt-auto w-full">Start Free Trial</Link>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ─── CTA Banner ─── */}
                <section className="py-24 px-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,153,0.15)_0%,transparent_65%)] pointer-events-none mix-blend-screen"></div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto text-center relative z-10 glass-card p-12 border-[var(--color-neon-primary)]/20 shadow-[0_0_50px_rgba(0,229,153,0.1)]"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to stop doing this manually?</h2>
                        <p className="text-[var(--color-neon-muted)] mb-8 text-lg max-w-2xl mx-auto">Join hundreds of educators and event organizers saving hours each month with Vura.</p>
                        <Link href={session ? "/app" : "/register"} className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2 group">
                            Start for Free <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </motion.div>
                </section>
            </main>

            {/* ─── Footer ─── */}
            <footer className="border-t border-[var(--color-neon-border)] bg-[var(--color-neon-surface)] pt-16 pb-8 px-6 relative">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <Link href="/" className="flex items-center gap-2 mb-4 group inline-flex">
                                <div className="w-8 h-8 rounded-lg bg-[var(--color-neon-primary)] flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <div className="w-3 h-3 bg-black rounded-sm rotate-45"></div>
                                </div>
                                <span className="text-xl font-black tracking-widest uppercase text-white">VURA</span>
                            </Link>
                            <p className="text-sm text-[var(--color-neon-muted)] leading-relaxed max-w-sm mt-2">
                                The modern certificate generation platform for educators, trainers, and event organizers. Built with Next.js, Prisma, and AWS.
                            </p>
                            <div className="flex items-center gap-4 mt-6">
                                <a href="https://github.com/omn7/Vura" target="_blank" rel="noreferrer" className="text-[var(--color-neon-muted)] hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"><Github className="w-5 h-5" /></a>
                                <a href="https://x.com/mr_codex" className="text-[var(--color-neon-muted)] hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"><Twitter className="w-5 h-5" /></a>
                                <a href="https://www.linkedin.com/in/omnarkhede/" className="text-[var(--color-neon-muted)] hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"><Linkedin className="w-5 h-5" /></a>
                                <a href="mailto:dev.om@outlook.com" className="text-[var(--color-neon-muted)] hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"><Mail className="w-5 h-5" /></a>
                            </div>
                        </div>

                        {/* Links */}
                        <div>
                            <p className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</p>
                            <ul className="flex flex-col gap-3">
                                {[["Features", "#features"], ["How It Works", "#how-it-works"], ["Pricing", "#pricing"], ["Dashboard", "/dashboard"], ["About", "/about"]].map(([label, href]) => (
                                    <li key={label}><a href={href} className="text-sm text-[var(--color-neon-muted)] hover:text-white hover:translate-x-1 inline-block transition-all">{label}</a></li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</p>
                            <ul className="flex flex-col gap-3">
                                {[["GitHub", "https://github.com/omn7/Vura"], ["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"], ["Contact Us", "mailto:dev.om@outlook.com"]].map(([label, href]) => (
                                    <li key={label}><a href={href} className="text-sm text-[var(--color-neon-muted)] hover:text-white hover:translate-x-1 inline-block transition-all">{label}</a></li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="pt-8 border-t border-[var(--color-neon-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-neon-muted)]">
                        <p>© {new Date().getFullYear()} <a href="https://omnarkhede.tech" target="_blank" rel="noreferrer" className="text-white hover:text-[var(--color-neon-primary)] transition-colors inline-block font-medium">Om Narkhede</a>. All rights reserved.</p>
                        <p className="flex items-center gap-1">
                            <a href="https://omnarkhede.tech" target="_blank" rel="noreferrer" className="hover:text-white transition-colors underline underline-offset-4 hover:decoration-[var(--color-neon-primary)]">Visit Dev</a>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
