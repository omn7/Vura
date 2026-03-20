"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Table2, Terminal, ShieldCheck, QrCode, CheckCircle2, Fingerprint, Zap, FileSpreadsheet, ChevronRight, Cloud, Database, User } from "lucide-react"

const TABS = [
    {
        id: "mapping",
        icon: <Table2 className="w-5 h-5" />,
        color: "bg-emerald-500",
        left: (
            <div className="bg-[rgba(15,15,15,0.7)] backdrop-blur-md border border-[var(--color-neon-border)] rounded-2xl p-5 w-[260px] shadow-2xl min-h-[340px] flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                    <FileSpreadsheet className="w-4 h-4 text-[var(--color-neon-muted)]" />
                    <h4 className="text-sm font-semibold text-white">Map Data Fields</h4>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                        <span className="font-mono text-white/60">name_col</span>
                        <ChevronRight className="w-3 h-3 text-white/30" />
                        <span className="text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded">{'{{Name}}'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                        <span className="font-mono text-white/60">date_col</span>
                        <ChevronRight className="w-3 h-3 text-white/30" />
                        <span className="text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded">{'{{Date}}'}</span>
                    </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Status</span>
                    <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Mapped</span>
                </div>
            </div>
        ),
        right: (
            <div className="bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-5 w-[280px] shadow-[0_0_40px_rgba(16,185,129,0.1)] min-h-[340px] flex flex-col justify-center">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    Live Preview
                </h4>
                <div className="bg-[rgba(255,255,255,0.05)] aspect-[4/3] rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Simulated PDF Watermark/Seal */}
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full border border-emerald-500/30 flex items-center justify-center opacity-50">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-serif italic text-white/90 mb-1">Om Narkhede</div>
                    <div className="text-[10px] text-emerald-100/50 uppercase tracking-widest text-center px-4">
                        For successful completion of Full-Stack Engineering
                    </div>
                    <div className="mt-4 w-12 h-1 bg-emerald-500/40 rounded-full" />
                </div>
            </div>
        )
    },
    {
        id: "api",
        icon: <Terminal className="w-5 h-5" />,
        color: "bg-blue-500",
        left: (
            <div className="bg-[#0D1117]/90 backdrop-blur-md border border-white/10 rounded-2xl p-5 w-[260px] shadow-2xl font-mono text-xs overflow-hidden min-h-[340px] flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                    <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/80" /><div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" /><div className="w-2.5 h-2.5 rounded-full bg-green-500/80" /></div>
                    <span className="text-white/40 text-[10px]">generate.ts</span>
                </div>
                <div className="text-white/40 mb-2">// Bulk generate via API</div>
                <div className="text-emerald-400">await <span className="text-blue-400">fetch</span><span className="text-white">('/api/v1/generate', {'{'}</span></div>
                <div className="pl-4 text-white">method: <span className="text-amber-300">'POST'</span>,</div>
                <div className="pl-4 text-white">headers: {'{'}</div>
                <div className="pl-8 text-white"><span className="text-cyan-300">'Authorization'</span>: <span className="text-amber-300">'Bearer sk_...'</span></div>
                <div className="pl-4 text-white">{'}'},</div>
                <div className="pl-4 text-white">body: <span className="text-orange-300">payload</span></div>
                <div className="text-white">{'}'})</div>
            </div>
        ),
        right: (
            <div className="bg-blue-500/10 backdrop-blur-md border border-blue-500/20 rounded-2xl p-5 w-[280px] shadow-[0_0_40px_rgba(59,130,246,0.1)] flex flex-col items-center justify-center min-h-[340px]">
                <div className="text-5xl font-black text-white mb-2 tracking-tight">1,492</div>
                <div className="flex items-center gap-1.5 text-xs text-blue-300 uppercase tracking-widest font-semibold">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    Certificates Generated
                </div>

                {/* Simulated Chart/Progress */}
                <div className="w-full mt-8 space-y-2">
                    <div className="flex justify-between text-[10px] text-white/50"><span className="uppercase">Batch Progress</span><span>98%</span></div>
                    <div className="w-full bg-blue-900/40 h-2 rounded-full overflow-hidden">
                        <motion.div
                            className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: "98%" }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "verify",
        icon: <ShieldCheck className="w-5 h-5" />,
        color: "bg-amber-500",
        left: (
            <div className="bg-[rgba(15,15,15,0.7)] backdrop-blur-md border border-[var(--color-neon-border)] rounded-2xl p-5 w-[260px] shadow-2xl flex flex-col items-center justify-center text-center min-h-[340px]">
                <div className="mb-4 text-sm font-semibold text-white/80">Scan to Verify</div>
                <div className="w-32 h-32 bg-white rounded-xl p-3 flex items-center justify-center relative shadow-[0_0_30px_rgba(255,255,255,0.1)] group cursor-pointer hover:scale-105 transition-transform duration-300">
                    <QrCode className="w-full h-full text-black" />
                    {/* Simulated laser scan line */}
                    <motion.div
                        className="absolute top-0 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_red]"
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                </div>
                <div className="mt-4 text-[10px] text-white/40 font-mono">CERT-A1B2C3D4</div>
            </div>
        ),
        right: (
            <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/20 rounded-2xl p-6 w-[280px] shadow-[0_0_40px_rgba(245,158,11,0.1)] flex flex-col items-center justify-center text-center min-h-[340px]">
                <div className="relative mb-5">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 flex items-center justify-center relative z-10">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                </div>
                <div className="text-lg font-bold text-white mb-1">Cryptographically Valid</div>
                <div className="text-xs text-white/60 leading-relaxed">
                    Authenticity confirmed on Vura's secure ledger.
                </div>
                <div className="mt-5 flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                    <Fingerprint className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] font-mono text-white/50">0x8f...3a92</span>
                </div>
            </div>
        )
    },
    {
        id: "cloud",
        icon: <Cloud className="w-5 h-5" />,
        color: "bg-purple-500",
        left: (
            <div className="bg-[#1a0b2e]/90 backdrop-blur-md border border-purple-500/30 rounded-2xl p-5 w-[260px] shadow-[0_0_30px_rgba(168,85,247,0.15)] overflow-hidden relative min-h-[340px] flex flex-col justify-center">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2 mb-4 relative z-10">
                    <Cloud className="w-4 h-4 text-purple-400" />
                    <h4 className="text-sm font-semibold text-white">AWS S3 Archiving</h4>
                </div>
                <div className="space-y-2 relative z-10">
                    <div className="flex items-center justify-between text-xs bg-white/5 px-2 py-2 rounded-md border border-white/5">
                        <span className="text-white/60">cert_1492.pdf</span>
                        <span className="text-purple-300 font-mono text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded">s3://vura-assets/</span>
                    </div>
                    <div className="flex items-center justify-between text-xs bg-white/5 px-2 py-2 rounded-md border border-white/5">
                        <span className="text-white/60">cert_1493.pdf</span>
                        <span className="text-purple-300 font-mono text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded">s3://vura-assets/</span>
                    </div>
                </div>
            </div>
        ),
        right: (
            <div className="bg-[#0b1219]/90 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-5 w-[280px] shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden min-h-[340px] flex flex-col justify-center">
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2 mb-4 relative z-10">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-semibold text-white">Neon Postgres</h4>
                </div>
                <div className="relative z-10 bg-black/40 rounded-lg p-3 border border-white/10 font-mono text-[10px] text-white/70 overflow-hidden">
                    <div className="text-cyan-400 mb-1">SELECT * FROM certificates;</div>
                    <div className="grid grid-cols-3 gap-2 border-b border-white/10 pb-1 mb-1 text-white/40">
                        <span>id</span><span>issued_to</span><span>s3_url</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 truncate">
                        <span className="text-amber-300">A1B2...</span><span className="text-emerald-300">john@..</span><span className="text-cyan-300">s3://...</span>
                    </div>
                </div>
                <div className="mt-4 text-xs text-white/50 text-center relative z-10">
                    Assets strictly joined via metadata
                </div>
            </div>
        )
    }
]

export default function InteractiveShowcase() {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)

    // Auto-cycle tabs
    useEffect(() => {
        if (isHovered) return
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % TABS.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [isHovered])

    const activeTab = TABS[activeIndex]

    return (
        <div
            className="relative w-full flex flex-col lg:flex-row items-center justify-center lg:h-[450px] lg:-mt-32 gap-6 lg:gap-0"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Center Vertical Nav Pill -> Horizontal on mobile */}
            <div className="relative z-20 w-[95%] sm:w-auto flex flex-row lg:flex-col items-center gap-2 bg-[rgba(20,20,20,0.6)] backdrop-blur-xl border border-white/10 rounded-full lg:rounded-[2rem] p-2 lg:py-3 shadow-2xl overflow-x-auto no-scrollbar">

                {/* Vura Logo at Top */}
                <div className="w-10 h-10 rounded-full bg-[var(--color-neon-primary)] flex items-center justify-center shadow-[0_0_15px_rgba(0,229,153,0.3)] shrink-0 lg:mb-2 lg:mt-1">
                    <div className="w-3.5 h-3.5 bg-black rounded-[2px] rotate-45" />
                </div>

                <div className="hidden lg:block w-6 h-[1px] bg-white/10 lg:mb-2" />
                <div className="lg:hidden h-6 w-[1px] bg-white/10 mx-1 shrink-0" />

                {TABS.map((tab, idx) => {
                    const isActive = idx === activeIndex
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveIndex(idx)}
                            className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${isActive ? "text-white shadow-lg" : "text-white/40 hover:text-white/80 hover:bg-white/5"
                                }`}
                        >
                            {/* Active Background Bubble */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeBubble"
                                    className={`absolute inset-0 rounded-full ${tab.color}`}
                                    style={{ opacity: 0.9 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                />
                            )}
                            <div className="relative z-10">
                                {tab.icon}
                            </div>
                        </button>
                    )
                })}
                
                {/* Decorative Avatar to increase height */}
                <div className="hidden lg:flex w-12 h-12 items-center justify-center shrink-0 mt-1">
                    <img src="https://i.pravatar.cc/150?img=11" alt="User Avatar" className="w-8 h-8 rounded-full border-[1.5px] border-[var(--color-neon-primary)]/40 object-cover pointer-events-none shadow-[0_0_10px_rgba(0,229,153,0.2)]" />
                </div>
            </div>

            {/* Left Floating Card -> Stacked top on mobile */}
            <div className="relative lg:absolute lg:right-[calc(50%+44px)] xl:right-[calc(50%+48px)] z-10 lg:origin-right w-full lg:w-auto flex justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`left-${activeTab.id}`}
                        initial={{ opacity: 0, x: 20, rotateY: -15 }}
                        animate={{ opacity: 1, x: 0, rotateY: 0 }}
                        exit={{ opacity: 0, x: -20, rotateY: 15 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="transform perspective-[1000px]"
                    >
                        {activeTab.left}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Right Floating Card -> Stacked bottom on mobile */}
            <div className="relative lg:absolute lg:left-[calc(50%+44px)] xl:left-[calc(50%+48px)] z-10 lg:origin-left w-full lg:w-auto flex justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`right-${activeTab.id}`}
                        initial={{ opacity: 0, x: -20, rotateY: 15 }}
                        animate={{ opacity: 1, x: 0, rotateY: 0 }}
                        exit={{ opacity: 0, x: 20, rotateY: -15 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="transform perspective-[1000px]"
                    >
                        {activeTab.right}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Background ambient glow matching active tab */}
            <motion.div
                className={`absolute inset-0 rounded-[100%] blur-[100px] opacity-20 -z-10 mix-blend-screen transition-colors duration-1000 ${activeTab.color.replace('bg-', 'bg-')}`}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
            />
        </div>
    )
}
