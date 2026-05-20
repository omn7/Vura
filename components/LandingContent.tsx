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

const REVIEWS = [
    { name: "Shivam Murkute", role: "Event Organizer", rating: 5, text: "Vura saved us countless hours during our last hackathon. Generating 500+ certificates took literally 2 seconds instead of a whole weekend. Incredibly reliable." },
    { name: "Swayam Polakhare", role: "Tech Lead", rating: 4.5, text: "The API integration is flawless. We plugged Vura directly into our internal LMS, and now every student receives a verifiable PDF the moment they finish a course." },
    { name: "Swaraj Singh", role: "Operations Head", rating: 4, text: "The QR verification system gives so much credibility to our workshops. Participants love being able to instantly prove their credentials online." },
    { name: "Mayank Tiwari", role: "University Administrator", rating: 5, text: "What used to be a massive logistical headache at the end of every semester is completely automated now. The visual template mapper is a lifesaver." },
    { name: "Sujal Dubey", role: "Community Manager", rating: 4.5, text: "Best certificate generator out there. Extremely fast, the Next.js performance is snappy, and the generated PDFs look incredibly professional." },
    { name: "Karan Sathe", role: "Startup Founder", rating: 5, text: "We needed a robust way to issue early-adopter certificates. Vura's AWS-backed storage and unique IDs gave us exactly the security and scale we required." },
]

const STEPS = [
    { n: "01", icon: User, title: "Create Account", desc: "Sign up and secure your API keys to get started with Vura." },
    { n: "02", icon: FileText, title: "Upload Template", desc: "Drop your blank PDF design. Use the visual mapper to pin name, course, date, and QR fields." },
    { n: "03", icon: FileSpreadsheet, title: "Map Your Data", desc: "Upload an Excel file with Name, Course, IssueDate columns — or POST via API with JSON." },
    { n: "04", icon: Sparkles, title: "Generate & Share", desc: "Click Generate. Vura builds, uploads to S3, and returns direct PDF + verify links instantly." },
]

export default function LandingContent({ session }: { session: any }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [searchId, setSearchId] = useState("")
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [activeStep, setActiveStep] = useState(0)
    const profileRef = useRef<HTMLDivElement>(null)
    const howItWorksRef = useRef<HTMLElement>(null)
    const { scrollY } = useScroll()
    const { scrollYProgress: howItWorksScrollProgress } = useScroll({
        target: howItWorksRef,
        offset: ["start 60%", "end 40%"]
    })
    const router = useRouter()

    useEffect(() => {
        return howItWorksScrollProgress.on("change", (latest) => {
            const stepCount = STEPS.length;
            let step = Math.floor(latest * stepCount);
            if (step >= stepCount) step = stepCount - 1;
            if (step < 0) step = 0;
            setActiveStep(step);
        });
    }, [howItWorksScrollProgress])

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
                        <img src="/vuralogo.png" alt="Vura Logo" className="w-10 h-10 object-contain transition-transform group-hover:scale-105" />
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
                                        className="absolute right-0 top-full mt-2 w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl bg-[rgba(10,10,10,0.95)] backdrop-blur-2xl border border-[var(--color-neon-border)] shadow-[0_8px_32px_rgba(0,0,0,0.8)] p-2 z-50 origin-top-right">
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
                            className="hidden md:flex items-center gap-2 text-sm text-[var(--color-neon-muted)] hover:text-white transition-colors border-r border-[var(--color-neon-border)] pr-4">
                            <Github className="w-4 h-4" /> GitHub
                        </a>
                        {session ? (
                            <div className="flex items-center gap-3">
                                <Link href="/app" className="hidden md:flex btn-primary py-2 px-4 text-sm items-center gap-1.5">
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
                            <div className="hidden md:flex items-center gap-3">
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
                                <Link
                                    href="/docs"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-[var(--color-neon-primary)] hover:text-white py-1 transition-colors"
                                >
                                    API Docs
                                </Link>
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
                            className="relative z-10 w-full max-w-sm lg:max-w-md xl:max-w-lg shrink-0 flex items-center justify-center lg:-mt-8">
                            <InteractiveShowcase />
                        </motion.div>
                    </div>
                </section>

                {/* ─── Stats Bar ─── */}
                <section className="relative bg-[rgba(10,10,10,0.8)] backdrop-blur-md py-12 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,153,0.05)_0%,transparent_70%)] pointer-events-none" />
                    <div className="relative z-10 max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[{ value: "500+", label: "Certificates Generated" }, { value: "20+", label: "Organizations Using Vura" }, { value: "99.9%", label: "Uptime SLA" }, { value: "<2s", label: "Avg Generation Time" }].map((s, i) => (
                            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center gap-1">
                                <span className="text-3xl font-medium tracking-tight text-white">{s.value}</span>
                                <span className="text-sm font-medium tracking-tight text-[var(--color-neon-muted)]">{s.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ─── How It Works ─── */}
                <section id="how-it-works" ref={howItWorksRef} className="py-28 px-6 bg-[rgba(6,6,6,0.6)] z-10 relative">
                    <div className="max-w-6xl mx-auto">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                            <span className="section-label inline-flex">Workflow</span>
                            <h2 className="mt-5 text-4xl md:text-5xl font-medium tracking-tight text-white">From spreadsheet<br />to certificate in 4 steps</h2>
                        </motion.div>

                        <div className="relative mx-auto mt-20 max-w-5xl">
                            {/* Visual Connecting Line (Desktop) */}
                            <div className="hidden md:block absolute top-[17px] left-[12.5%] right-[12.5%] h-[2px] bg-[#222] z-0">
                                <div className="h-full bg-[var(--color-neon-primary)] transition-all duration-500 shadow-[0_0_8px_rgba(0,229,153,0.4)]" style={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }} />
                            </div>

                            <div className="flex flex-col md:flex-row relative z-10 w-full justify-between gap-12 md:gap-4">
                                {STEPS.map((s, i) => {
                                    const isActive = i === activeStep
                                    const isCompleted = i < activeStep
                                    const isInactive = i > activeStep
                                    const isLast = i === STEPS.length - 1

                                    return (
                                        <div
                                            key={s.n}
                                            className="relative flex-1 flex flex-row md:flex-col gap-6 md:gap-0 group items-start md:items-center text-left md:text-center"
                                        >
                                            {/* Visual Connecting Line (Mobile) */}
                                            {!isLast && (
                                                <div className="md:hidden absolute left-[17px] top-[36px] bottom-[-48px] w-[2px] bg-[#222] z-0">
                                                    <div className={`w-full h-full transition-colors duration-500 ${isCompleted ? 'bg-[var(--color-neon-primary)]' : 'bg-transparent'}`} />
                                                </div>
                                            )}

                                            {/* Step Node */}
                                            <div className="relative shrink-0 flex flex-col items-center z-10 bg-[#060606] p-1 rounded-full md:mb-8">
                                                <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center relative bg-[#070707]">
                                                    {/* Outer Halo for active */}
                                                    {isActive && (
                                                        <motion.div layoutId="stepper-halo" className="absolute inset-[-8px] rounded-full bg-[var(--color-neon-primary)]/20 shadow-[0_0_20px_rgba(0,229,153,0.3)] pointer-events-none" />
                                                    )}

                                                    {/* Inner Circle / Dot */}
                                                    {isCompleted && (
                                                        <div className="w-full h-full rounded-full bg-[var(--color-neon-primary)] flex items-center justify-center shadow-[0_0_12px_rgba(0,229,153,0.5)] z-10 transition-all duration-300">
                                                            <CheckCircle className="w-4 h-4 text-black" strokeWidth={3} />
                                                        </div>
                                                    )}

                                                    {isActive && (
                                                        <div className="w-full h-full rounded-full bg-[var(--color-neon-primary)] flex items-center justify-center shadow-[0_0_12px_rgba(0,229,153,0.5)] z-10 transition-all duration-300 scale-110">
                                                            <div className="w-[8px] h-[8px] rounded-full bg-white shadow-sm" />
                                                        </div>
                                                    )}

                                                    {isInactive && (
                                                        <div className="w-full h-full rounded-full bg-[#111] border-2 border-[#333] flex items-center justify-center z-10 transition-all duration-300 group-hover:border-[#555]">
                                                            <div className="w-[6px] h-[6px] rounded-full bg-[#444] group-hover:bg-[#666] transition-colors" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Step Content */}
                                            <div className={`flex flex-col items-start md:items-center transition-all duration-300 w-full pt-4 ${isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'}`}>

                                                <h3 className="text-lg font-medium tracking-tight text-white mb-3">
                                                    {s.title}
                                                </h3>
                                                <p className="text-[14px] text-[var(--color-neon-muted)] leading-relaxed md:max-w-[220px] lg:max-w-[260px] md:mx-auto">
                                                    {s.desc}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── Features ─── */}
                <section id="features" className="py-28 px-6 relative overflow-hidden bg-[rgba(3,3,3,0.8)]">

                    {/* Dark Green Grid Overlay */}
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(0, 229, 153, 0.02) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0, 229, 153, 0.02) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                        maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 90%)',
                        WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 90%)'
                    }} />

                    {/* Fixed Startry Background Field */}
                    <div className="absolute inset-0 pointer-events-none z-0">
                        {[
                            { top: "12%", left: "18%", delay: "0s" },
                            { top: "25%", left: "68%", delay: "1.2s" },
                            { top: "45%", left: "12%", delay: "0.5s" },
                            { top: "58%", left: "55%", delay: "2.1s" },
                            { top: "82%", left: "35%", delay: "1.5s" },
                            { top: "72%", left: "85%", delay: "0.2s" },
                            { top: "18%", left: "38%", delay: "2.8s" },
                            { top: "88%", left: "68%", delay: "1.1s" },
                            { top: "8%", left: "82%", delay: "0.8s" },
                            { top: "65%", left: "8%", delay: "1.8s" },
                            { top: "92%", left: "22%", delay: "0.3s" },
                            { top: "32%", left: "88%", delay: "2.5s" },
                        ].map((s, i) => (
                            <div key={i} className="absolute w-[1.5px] h-[1.5px] bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)] opacity-60"
                                style={{ top: s.top, left: s.left, animationDelay: s.delay, animationDuration: '3s' }} />
                        ))}
                    </div>

                    {/* Shooting Stars */}
                    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                        <div className="animate-shooting-star" style={{ top: '-10%', right: '10%', animationDelay: '0s', animationDuration: '4s' }} />
                        <div className="animate-shooting-star" style={{ top: '20%', right: '-5%', animationDelay: '1.5s', animationDuration: '3.5s' }} />
                        <div className="animate-shooting-star" style={{ top: '5%', right: '40%', animationDelay: '3s', animationDuration: '4.5s' }} />
                    </div>

                    {/* Massive Soft Green Glow Center */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-[radial-gradient(ellipse_at_center,rgba(0,229,153,0.03)_0%,transparent_60%)] pointer-events-none mix-blend-screen" />



                    <div className="max-w-[1400px] mx-auto relative z-10">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16 relative">
                            <span className="section-label inline-flex !bg-[rgba(0,229,153,0.15)] !border-[rgba(0,229,153,0.4)] !text-[#00e599] backdrop-blur-md shadow-[0_0_20px_rgba(0,229,153,0.1)]">Features</span>
                            <h2 className="mt-5 text-4xl md:text-5xl font-medium tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">Everything you need,<br />nothing you don&apos;t</h2>
                        </motion.div>

                        {/* Desktop Features Grid */}
                        <div className="hidden md:grid md:grid-cols-3 xl:flex xl:flex-nowrap xl:justify-between gap-5 pb-10 pt-4 w-full">
                            {FEATURES.map((f, i) => (
                                <motion.div key={f.title} initial={{ opacity: 0, scale: 0.95, y: 20 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    className="md:w-auto xl:flex-1 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300 relative overflow-hidden backdrop-blur-xl cursor-pointer group hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
                                    style={{ backgroundColor: f.bg, border: `1px solid ${f.color}90` }}>

                                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    <div className="relative z-10 transition-transform duration-300 group-hover:scale-110 mb-5 text-[var(--color-neon-primary)]" style={{ color: f.color }}>
                                        <f.icon className="w-12 h-12" strokeWidth={1.5} />
                                    </div>

                                    <h3 className="text-[17px] md:text-lg font-medium tracking-tight mb-3 relative z-10 leading-tight px-2 transition-colors duration-300" style={{ color: f.color }}>
                                        {f.title}
                                    </h3>

                                    <p className="text-[14px] leading-relaxed relative z-10 opacity-90 transition-colors duration-300 max-w-[200px]" style={{ color: f.color }}>
                                        {f.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Mobile Auto-Scrolling Features Marquee */}
                        <div className="md:hidden relative flex overflow-hidden w-full py-4 -mx-6 px-6" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
                            <div className="flex shrink-0 gap-4 w-max animate-marquee pb-4">
                                {[...FEATURES, ...FEATURES].map((f, i) => (
                                    <div key={`${f.title}-${i}`}
                                        className="shrink-0 w-[240px] rounded-[2rem] flex flex-col items-center justify-center p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300 relative overflow-hidden backdrop-blur-xl cursor-pointer group hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
                                        style={{ backgroundColor: f.bg, border: `1px solid ${f.color}90` }}>

                                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        <div className="relative z-10 transition-transform duration-300 group-hover:scale-110 mb-5 text-[var(--color-neon-primary)]" style={{ color: f.color }}>
                                            <f.icon className="w-12 h-12" strokeWidth={1.5} />
                                        </div>

                                        <h3 className="text-[17px] font-medium tracking-tight mb-3 relative z-10 leading-tight px-2 transition-colors duration-300" style={{ color: f.color }}>
                                            {f.title}
                                        </h3>

                                        <p className="text-[14px] leading-relaxed relative z-10 opacity-90 transition-colors duration-300 max-w-[200px]" style={{ color: f.color }}>
                                            {f.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── Testimonials ─── */}
                <div className="px-4 py-12 md:px-8 w-full max-w-[1400px] mx-auto">
                    <section id="reviews" className="py-24 px-6 border border-[var(--color-neon-border)] bg-[#030604] relative overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_0_80px_rgba(3,6,4,0.8)]">

                        <div className="max-w-6xl mx-auto relative z-10">
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16 relative">
                                <span className="section-label inline-flex !bg-[rgba(0,229,153,0.15)] !border-[rgba(0,229,153,0.4)] !text-[#00e599] backdrop-blur-md shadow-[0_0_20px_rgba(0,229,153,0.1)]">Wall of Love</span>
                                <h2 className="mt-5 text-4xl md:text-5xl font-medium tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">Loved by creators<br />and organizations</h2>
                            </motion.div>

                            <div className="relative flex overflow-hidden w-full max-w-7xl mx-auto py-8 lg:-mx-12 px-6 lg:px-12" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
                                <div className="flex shrink-0 gap-6 w-max animate-marquee">
                                    {[...REVIEWS, ...REVIEWS].map((r, i) => (
                                        <div key={`${r.name}-${i}`}
                                            className="w-[340px] md:w-[380px] p-8 rounded-3xl bg-[rgba(10,10,10,0.8)] border border-[var(--color-neon-border)] backdrop-blur-xl hover:border-[var(--color-neon-primary)]/40 transition-colors shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex flex-col justify-between gap-6 group hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => {
                                                    const pathD = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";
                                                    if (r.rating >= star) {
                                                        return <svg key={star} className="w-5 h-5 text-[#00e599]" fill="currentColor" viewBox="0 0 20 20"><path d={pathD} /></svg>;
                                                    } else if (r.rating >= star - 0.5) {
                                                        return (
                                                            <div key={star} className="relative w-5 h-5 text-[#00e599]">
                                                                <svg className="absolute inset-0 w-5 h-5 opacity-30" fill="currentColor" viewBox="0 0 20 20"><path d={pathD} /></svg>
                                                                <div className="absolute inset-y-0 left-0 w-[50%] overflow-hidden">
                                                                    <svg className="w-5 h-5 max-w-none" fill="currentColor" viewBox="0 0 20 20"><path d={pathD} /></svg>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return <svg key={star} className="w-5 h-5 text-[#00e599] opacity-30" fill="currentColor" viewBox="0 0 20 20"><path d={pathD} /></svg>;
                                                })}
                                                <span className="text-[var(--color-neon-primary)] text-sm font-bold ml-1.5">{r.rating.toFixed(1)}</span>
                                            </div>
                                            <p className="text-[15px] text-white/70 leading-relaxed flex-1 group-hover:text-white transition-colors duration-300">
                                                &quot;{r.text}&quot;
                                            </p>
                                            <div className="flex items-center gap-4 pt-6 border-t border-[var(--color-neon-border)]/50">
                                                <div className="w-12 h-12 rounded-full bg-[var(--color-neon-primary)]/10 flex items-center justify-center text-[var(--color-neon-primary)] font-black text-lg border border-[var(--color-neon-primary)]/30 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,229,153,0.2)]">
                                                    {r.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold text-sm">{r.name}</p>
                                                    <p className="text-[12px] text-[var(--color-neon-muted)] mt-0.5">{r.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* ─── Pricing ─── */}
                <section id="pricing" className="py-28 px-6">
                    <div className="max-w-5xl mx-auto">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-4 leading-tight">Simple, transparent pricing</h2>
                            <p className="text-lg text-[var(--color-neon-muted)]">Start for free. Scale when you need it.</p>
                        </motion.div>
                        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto relative relative z-10">
                            {[
                                { name: "Free", price: "₹0", sub: "No credit card required", primary: false, features: ["Up to 100 certificates/month", "Google & Email login", "S3 cloud storage", "QR verification links", "API access + secret key", "Usage stats dashboard"] },
                                { name: "Pro", price: "₹999", sub: "For teams and events", primary: true, features: ["Unlimited certificates", "Everything in Free", "Custom branding", "Priority support", "Bulk export & analytics"] },
                            ].map((plan, i) => (
                                <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                    className={`bg-[#050505] rounded-2xl p-8 flex flex-col relative border transition-all duration-300 overflow-hidden ${plan.primary ? "border-[var(--color-neon-primary)]/40 hover:border-[var(--color-neon-primary)] shadow-[0_4px_30px_rgba(0,0,0,0.8)]" : "border-white/10 hover:border-white/20 shadow-xl"}`}>
                                    {plan.primary && (
                                        <div className="absolute top-0 right-0 px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase bg-[var(--color-neon-primary)]/10 text-[var(--color-neon-primary)] border-b border-l border-[var(--color-neon-primary)]/20 rounded-bl-2xl">
                                            Popular
                                        </div>
                                    )}
                                    <div className="mb-6">
                                        <p className={`text-[12px] font-semibold uppercase tracking-[0.2em] mb-4 ${plan.primary ? "text-[var(--color-neon-primary)]" : "text-[#888]"}`}>{plan.name}</p>
                                        <div className="flex items-baseline gap-2 mb-2">
                                            <span className="text-5xl font-semibold tracking-tighter text-white">{plan.price}</span>
                                            <span className="text-sm font-medium text-[var(--color-neon-muted)]">/ mo</span>
                                        </div>
                                        <p className="text-[14px] text-[var(--color-neon-muted)] leading-relaxed">{plan.sub}</p>
                                    </div>

                                    <div className="w-full h-[1px] bg-white/[0.06] mb-8" />

                                    <ul className="flex flex-col gap-4 flex-1 mb-8">
                                        {plan.features.map(f => (
                                            <li key={f} className="flex items-start gap-3.5 text-[14px] text-white/80">
                                                <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${plan.primary ? "bg-[var(--color-neon-primary)]/10 border-[var(--color-neon-primary)]/30" : "bg-white/5 border-white/10"}`}>
                                                    <CheckCircle className={`w-[10px] h-[10px] ${plan.primary ? "text-[var(--color-neon-primary)]" : "text-white/60"}`} strokeWidth={3} />
                                                </div>
                                                <span className="leading-tight">{f}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Link href="/register" className={`w-full py-3.5 rounded-xl text-center text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 group ${plan.primary ? 'text-[var(--color-neon-primary)] border border-[var(--color-neon-primary)] hover:bg-[var(--color-neon-primary)]/10 text-[var(--color-neon-primary)]' : 'text-white border border-white/20 hover:bg-white/5 hover:border-white/40'}`}>
                                        {plan.primary ? "Start Free Trial" : "Get Started"}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── CTA ─── */}
                <div className="px-4 py-12 md:px-8 w-full max-w-[1400px] mx-auto">
                    <section className="py-24 px-6 relative overflow-hidden bg-[#030604] rounded-[2.5rem] md:rounded-[3.5rem] border border-[var(--color-neon-border)] shadow-2xl">

                        {/* Crisp Geometric Grid Background */}
                        <div className="absolute inset-0 z-0 pointer-events-none" style={{
                            backgroundImage: `
                                linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
                            `,
                            backgroundSize: '48px 48px',
                            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 100%)'
                        }} />

                        {/* Top Accent Line */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-neon-primary)]/40 to-transparent" />

                        <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center relative z-10">
                            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6 leading-[1.1]">Ready to stop doing<br />this manually?</h2>
                            <p className="text-[var(--color-neon-muted)] mb-10 text-lg md:text-xl max-w-xl mx-auto">Join educators and event organizers saving hours each month with Vura.</p>
                            <Link href={session ? "/app" : "/register"} className="relative inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-[var(--color-neon-primary)] bg-transparent border border-[var(--color-neon-primary)] rounded-full hover:bg-[var(--color-neon-primary)]/10 hover:shadow-[0_0_20px_rgba(0,229,153,0.35)] hover:-translate-y-0.5 transition-all duration-300 group gap-2">
                                Start Generating Certificates <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    </section>
                </div>
            </main>

            {/* ─── Footer ─── */}
            <footer className="relative bg-[#02040A] pt-16 pb-8 px-6 border-t border-[var(--color-neon-border)]/50 mt-20">
                {/* Subtle top glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-neon-primary)]/20 to-transparent" />

                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 mb-16">
                        <div className="col-span-2 flex flex-col items-start">
                            <Link href="/" className="flex items-center gap-2 mb-6 w-fit group">
                                <img src="/vuralogo.png" alt="Vura Logo" className="w-8 h-8 object-contain transition-transform group-hover:scale-110" />
                                <span className="text-lg font-bold tracking-widest uppercase text-white">Vura</span>
                            </Link>
                            <p className="text-[13px] text-[var(--color-neon-muted)] leading-relaxed max-w-xs mb-6">
                                The modern certificate generation platform for educators, trainers, and startup events.
                            </p>
                            <div className="flex items-center gap-4">
                                {[{ icon: Github, href: "https://github.com/omn7/Vura" }, { icon: Twitter, href: "https://x.com/mr_codex" }, { icon: Linkedin, href: "https://linkedin.com/in/omnarkhede/" }, { icon: Mail, href: "mailto:dev.om@outlook.com" }].map(({ icon: Icon, href }) => (
                                    <a key={href} href={href} target="_blank" rel="noreferrer" className="text-[#888] hover:text-[#00e599] transition-colors">
                                        <Icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="col-span-1">
                            <p className="text-xs font-semibold text-white uppercase tracking-wider mb-5">Product</p>
                            <ul className="flex flex-col gap-3.5">
                                {[["Features", "#features"], ["How It Works", "#how-it-works"], ["Pricing", "#pricing"], ["Dashboard", "/dashboard"], ["API Docs", "/docs"]].map(([label, href]) => (
                                    <li key={label}>
                                        <a href={href} className="text-[13px] text-[#888] hover:text-white transition-colors">{label}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="col-span-1">
                            <p className="text-xs font-semibold text-white uppercase tracking-wider mb-5">Company</p>
                            <ul className="flex flex-col gap-3.5">
                                {[["About", "/about"], ["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"], ["Contact", "mailto:dev.om@outlook.com"]].map(([label, href]) => (
                                    <li key={label}>
                                        <a href={href} className="text-[13px] text-[#888] hover:text-white transition-colors">{label}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-[12px] text-[#666]">
                            © {new Date().getFullYear()} <a href="https://omnarkhede.tech" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Om Narkhede</a>. All rights reserved.
                        </p>
                        <div className="flex items-center gap-2 text-[12px] text-[#666]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00e599] animate-pulse" />
                            All systems operational
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
