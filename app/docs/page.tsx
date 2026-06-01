"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
    ShieldCheck, Copy, Check, Terminal, Globe,
    AlertTriangle, CheckCircle2, XCircle, ArrowRight,
    Code2, Zap, Key, Plus, Search, ExternalLink, Menu, X
} from "lucide-react"
import { motion, type Variants, AnimatePresence } from "framer-motion"
import DOMPurify from 'dompurify'; // Import DOMPurify for sanitization

// ─────────────────────────────────────────────
// Code snippets
// ─────────────────────────────────────────────
const verifySnippets = {
    curl: `curl -X GET \
  "https://vurakit.vercel.app/api/verify/CERT-A1B2C3D4"`,
    js: `const res = await fetch(
  "https://vurakit.vercel.app/api/verify/CERT-A1B2C3D4"
);
const data = await res.json();

if (res.ok) {
  console.log("Recipient:", data.recipient);
  console.log("Course:   ", data.course);
}`,
    python: `import requests

res = requests.get(
    "https://vurakit.vercel.app/api/verify/CERT-A1B2C3D4"
)
data = res.json()

if res.status_code == 200:
    print(f"✅ {data['recipient']} — {data['course']}")`,
}

const createSnippets = {
    curl: `curl -X POST \
  "https://vurakit.vercel.app/api/certificates/create" \
  -H "Authorization: Bearer vura_your_api_key" \  # <<< REPLACE WITH YOUR REAL API KEY
  -H "Content-Type: application/json" \
  -d '{
    "recipient":   "Aarav Patel",
    "course":      "Next.js Architecture",
    "issueDate":   "Mar 3, 2026",
    "templateUrl": "https://your-bucket.s3.amazonaws.com/template.pdf"
  }'`,
    js: `const res = await fetch(
  "https://vurakit.vercel.app/api/certificates/create",
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer vura_your_api_key", // <<< REPLACE WITH YOUR REAL API KEY
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient:   "Aarav Patel",
      course:      "Next.js Architecture",
      issueDate:   "Mar 3, 2026",
      templateUrl: "https://your-bucket.s3.amazonaws.com/template.pdf",
    }),
  }
);
const data = await res.json();
// { success, certificateId, pdfUrl, verifyUrl }
console.log("Certificate ID:", data.certificateId);`,
    python: `import requests

res = requests.post(
    "https://vurakit.vercel.app/api/certificates/create",
    headers={
        "Authorization": "Bearer vura_your_api_key", # <<< REPLACE WITH YOUR REAL API KEY
        "Content-Type": "application/json",
    },
    json={
        "recipient":   "Aarav Patel",
        "course":      "Next.js Architecture",
        "issueDate":   "Mar 3, 2026",
        "templateUrl": "https://your-bucket.s3.amazonaws.com/template.pdf",
    },
)
data = res.json()
print(data["certificateId"])`,
}

// ─────────────────────────────────────────────
// Integrations
// ─────────────────────────────────────────────
const INTEGRATIONS = [
    {
        name: "OpenClaw",
        emoji: "🦞",
        color: "from-orange-500/20 to-red-500/10 border-orange-500/30",
        textColor: "text-orange-400",
        desc: "Register both endpoints as tools in your OpenClaw agent — let it create and verify certs on command.",
        badge: "AI Agent",
    },
    {
        name: "Telegram",
        emoji: "✈️",
        color: "from-blue-500/20 to-cyan-500/10 border-blue-500/30",
        textColor: "text-blue-400",
        desc: "Build a bot: users send a certificate ID, get an instant verification reply with all details.",
        badge: "Bot",
    },
    {
        name: "Discord",
        emoji: "🎮",
        color: "from-indigo-500/20 to-purple-500/10 border-indigo-500/30",
        textColor: "text-indigo-400",
        desc: "Add a /verify slash command to your Discord server and auto-verify member certificates.",
        badge: "Bot",
    },
    {
        name: "Make / Zapier",
        emoji: "⚡",
        color: "from-purple-500/20 to-pink-500/10 border-purple-500/30",
        textColor: "text-purple-400",
        desc: "Trigger certificate generation from Google Forms, Airtable, Notion, or any webhook-compatible source.",
        badge: "Automation",
    },
    {
        name: "Custom Website",
        emoji: "🌐",
        color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
        textColor: "text-emerald-400",
        desc: "Embed a certificate creator or verifier widget directly on your organization's website.",
        badge: "Web",
    },
    {
        name: "ChatGPT / GPTs",
        emoji: "🤖",
        color: "from-gray-500/20 to-slate-500/10 border-gray-500/30",
        textColor: "text-gray-300",
        desc: "Create a custom GPT with both endpoints as actions — AI verifies or issues certs in plain English.",
        badge: "AI",
    },
]

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
    const [ok, setOk] = useState(false)
    return (
        <button
            onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000) }}
            className="p-1.5 rounded-md hover:bg-white/10 text-[var(--color-neon-muted)] hover:text-white transition-colors"
        >
            {ok ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
    )
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
    return (
        <div className="rounded-xl bg-[#0d0d0d] border border-[var(--color-neon-border)] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-neon-border)] bg-[#111] text-xs text-[var(--color-neon-muted)]">
                <span className="font-mono uppercase tracking-wider">{lang}</span>
                <CopyButton text={code} />
            </div>
            <pre className="p-4 text-sm text-gray-300 font-mono overflow-x-auto leading-relaxed whitespace-pre">{code}</pre>
        </div>
    )
}

function Badge({ label, color }: { label: string; color: string }) {
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${color}`}>{label}</span>
}

// ─────────────────────────────────────────────
// Live verifier
// ─────────────────────────────────────────────
function LiveVerifier() {
    const [id, setId] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ status: number; data: unknown } | null>(null)

    async function run() {
        if (!id.trim()) return
        setLoading(true); setResult(null)
        
        const trimmedId = id.trim().toUpperCase();

        try {
            const res = await fetch(`/api/verify/${trimmedId}`)
            const data = await res.json()
            setResult({ status: res.status, data })
        } catch (error) {
            console.error("Live verifier API call failed:", error);
            setResult({ status: 500, data: { error: "Failed to connect to verification service." } });
        } finally {
            setLoading(false)
        }
    }

    const sc = result?.status === 200 ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/5"
        : result?.status === 403 ? "text-amber-400 border-amber-400/30 bg-amber-400/5"
            : "text-red-400 border-red-400/30 bg-red-400/5"

    const renderSafeJson = (data: unknown) => {
        const stringifiedData = JSON.stringify(data, null, 2);
        // Sanitize stringified JSON to prevent any script injection if data itself contains malicious strings
        // Although JSON.stringify helps, an extra layer against strange chars is good practice in docs.
        return DOMPurify.sanitize(stringifiedData, { USE_PROFILES: { html: false } });
    };

    return (
        <div className="rounded-2xl border border-[var(--color-neon-border)] bg-[#0a0a0a] overflow-hidden">
            <div className="px-5 py-3 border-b border-[var(--color-neon-border)] bg-[#111] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[var(--color-neon-primary)]" />
                <span className="text-sm font-semibold text-white">Live Tester</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">GET /verify</span>
            </div>
            <div className="p-5 space-y-3">
                <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 bg-[#111] border border-[var(--color-neon-border)] rounded-xl px-3 py-2.5 focus-within:border-[var(--color-neon-primary)] transition-colors">
                        <Search className="w-3.5 h-3.5 text-[var(--color-neon-muted)] shrink-0" />
                        <input value={id} onChange={e => setId(e.target.value)} onKeyDown={e => e.key === "Enter" && run()}
                            placeholder="CERT-A1B2C3D4" className="flex-1 bg-transparent text-sm text-white outline-none font-mono placeholder-[#444]" />
                    </div>
                    <button onClick={run} disabled={loading || !id.trim()}
                        className="btn-primary px-4 text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                        {loading ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> : <ArrowRight className="w-4 h-4" />}
                        {loading ? "…" : "Send"}
                    </button>
                </div>
                {result && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl border p-4 ${sc}`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono font-bold">HTTP {result.status}</span>
                            <CopyButton text={JSON.stringify(result.data, null, 2)} />
                        </div>
                        <pre className="text-xs font-mono leading-relaxed overflow-x-auto">{renderSafeJson(result.data)}</pre>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
type Mode = "verify" | "create"
type Lang = "curl" | "js" | "python"

export default function DocsPage() {
    const [mode, setMode] = useState<Mode>("verify")
    const [lang, setLang] = useState<Lang>("curl")
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const fadeUp: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    }

    const snippets = mode === "verify" ? verifySnippets : createSnippets

    return (
        <div className="min-h-screen bg-[var(--color-neon-bg)] text-white">

            {/* ── Navbar ── */}
            <header className="sticky top-0 z-50 border-b border-[var(--color-neon-border)] bg-[rgba(3,3,3,0.85)] backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <Image
                            src="/vuralogo.png"
                            alt="Vura Logo"
                            width={32}
                            height={32}
                            className="rounded-lg object-contain shadow-[0_0_12px_rgba(0,229,153,0.4)] group-hover:shadow-[0_0_20px_rgba(0,229,153,0.6)] transition-all"
                        />
                        <span className="text-xl font-black tracking-widest uppercase text-white">
                            VURA
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--color-neon-muted)]">
                        <Link href="/" className="hover:text-white transition-colors">
                            Home
                        </Link>

                        <Link href="/dashboard" className="hover:text-white transition-colors">
                            Dashboard
                        </Link>

                        <Link href="/sponsor" className="hover:text-white transition-colors">
                            Sponsor
                        </Link>

                        <span className="text-[var(--color-neon-primary)] font-semibold">
                            API Docs
                        </span>
                    </nav>

                    {/* Mobile Hamburger */}
                    <button
                        className="md:hidden text-white p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="absolute top-16 left-0 w-full md:hidden bg-[rgba(3,3,3,0.97)] backdrop-blur-xl border-b border-[var(--color-neon-border)] overflow-hidden z-50"
                        >
                            <nav className="flex flex-col px-6 py-4 gap-4 text-sm text-[var(--color-neon-muted)]">

                                <Link
                                    href="/"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="hover:text-white py-1 transition-colors"
                                >
                                    Home
                                </Link>

                                <Link
                                    href="/dashboard"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="hover:text-white py-1 transition-colors"
                                >
                                    Dashboard
                                </Link>

                                <Link
                                    href="/sponsor"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="hover:text-white py-1 transition-colors"
                                >
                                    Sponsor
                                </Link>

                                <Link
                                    href="/docs"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-[var(--color-neon-primary)] py-1 font-semibold"
                                >
                                    API Docs
                                </Link>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-16 space-y-24">

                {/* ── Hero ── */}
                <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center max-w-3xl mx-auto">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-neon-primary)]/30 bg-[var(--color-neon-primary)]/10 text-xs font-semibold text-[var(--color-neon-primary)] tracking-widest uppercase mb-6">
                        <Code2 className="w-3.5 h-3.5" /> Developer API
                    </span>
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-5">
                        One API. Two Powers.
                    </h1>
                    <p className="text-lg text-[var(--color-neon-muted)] leading-relaxed mb-8">
                        The Vura API lets you <strong className="text-white">verify</strong> any certificate publicly, and <strong className="text-white">create</strong> new certificates programmatically from your own system using an API key.
                    </p>

                    {/* Mode switcher */}
                    <div className="inline-flex gap-1 p-1.5 rounded-2xl bg-[#111] border border-[var(--color-neon-border)]">
                        <button onClick={() => setMode("verify")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${mode === "verify" ? "bg-[var(--color-neon-primary)] text-black shadow-[0_0_20px_rgba(0,229,153,0.3)]" : "text-[var(--color-neon-muted)] hover:text-white"}`}>
                            <Search className="w-4 h-4" /> Verify API
                        </button>
                        <button onClick={() => setMode("create")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${mode === "create" ? "bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]" : "text-[var(--color-neon-muted)] hover:text-white"}`}>
                            <Plus className="w-4 h-4" /> Create API
                        </button>
                    </div>
                </motion.div>

                {/* ── Dynamic API section ── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="space-y-12"
                    >
                        {mode === "verify" ? (
                            <>
                                {/* Verify header */}
                                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6 flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 shrink-0">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-1">Certificate Verification API</h2>
                                        <p className="text-sm text-[var(--color-neon-muted)]">
                                            Public endpoint — <strong className="text-white">no API key required</strong>. Anyone can call this to check if a certificate is real, revoked, or doesn't exist. Perfect for embedding in your app, bot, or automation.
                                        </p>
                                    </div>
                                </div>

                                {/* Endpoint */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-400" /> Endpoint</h3>
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 rounded-2xl border border-[var(--color-neon-border)] bg-[#0d0d0d] px-6 py-4">
                                        <span className="text-xs font-bold px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">GET</span>
                                        <code className="flex-1 text-sm text-white font-mono break-all">
                                            https://vurakit.vercel.app/api/verify/<span className="text-emerald-400">{"{"}&#123;id&#125;{"}"}</span>
                                        </code>
                                        <CopyButton text="https://vurakit.vercel.app/api/verify/{id}" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[ 
                                            { icon: <Key className="w-4 h-4" />, label: "Auth", value: "None — public" },
                                            { icon: <Terminal className="w-4 h-4" />, label: "Parameter", value: "{id} in URL" },
                                            { icon: <Globe className="w-4 h-4" />, label: "CORS", value: "All origins (*)" },
                                        ].map(i => (
                                            <div key={i.label} className="rounded-xl border border-[var(--color-neon-border)] bg-[#0a0a0a] px-4 py-3 flex items-start gap-3">
                                                <span className="text-emerald-400 mt-0.5">{i.icon}</span>
                                                <div><p className="text-xs text-[var(--color-neon-muted)] mb-0.5">{i.label}</p><p className="text-sm text-white">{i.value}</p></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Response codes */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white">Response Codes</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[ 
                                            { code: "200", icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, label: "Verified", desc: "Certificate is authentic. Returns recipient, course, issuedOn.", color: "border-emerald-400/20 bg-emerald-400/5" },
                                            { code: "403", icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, label: "Revoked", desc: "Certificate exists but has been revoked by the issuer.", color: "border-amber-400/20 bg-amber-400/5" },
                                            { code: "404", icon: <XCircle className="w-4 h-4 text-red-400" />, label: "Not Found", desc: "No certificate with this ID exists in the database.", color: "border-red-400/20 bg-red-400/5" },
                                            { code: "500", icon: <XCircle className="w-4 h-4 text-gray-400" />, label: "Server Error", desc: "Unexpected server-side error. Try again later.", color: "border-gray-400/20 bg-gray-400/5" },
                                        ].map(s => (
                                            <div key={s.code} className={`rounded-xl border p-4 flex gap-4 ${s.color}`}>
                                                <div className="mt-0.5">{s.icon}</div>
                                                <div>
                                                    <p className="font-bold text-white text-sm">{s.code} {s.label}</p>
                                                    <p className="text-xs text-[var(--color-neon-muted)] mt-0.5">{s.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Create header */}
                                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                                        <Key className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-1">Certificate Creation API</h2>
                                        <p className="text-sm text-[var(--color-neon-muted)]">
                                            Authenticated endpoint — requires your <strong className="text-white">secret API key</strong>. Use this to create certificates programmatically from any system. Each certificate gets a unique ID, QR code, and a public verification URL instantly.
                                        </p>
                                    </div>
                                </div>

                                {/* Get API Key */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Key className="w-4 h-4 text-purple-400" /> Step 1 — Get Your API Key</h3>
                                    <div className="rounded-2xl border border-purple-500/20 bg-[#0d0d0d] p-6 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <span className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xs font-bold shrink-0">1</span>
                                            <p className="text-sm text-[var(--color-neon-muted)] pt-0.5">Log into your <Link href="/dashboard/api-key" className="text-purple-400 hover:underline underline-offset-2">Dashboard → API Key</Link></p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xs font-bold shrink-0">2</span>
                                            <p className="text-sm text-[var(--color-neon-muted)] pt-0.5">Click <strong className="text-white">Generate API Key</strong> — your key is only created when you explicitly request it.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xs font-bold shrink-0">3</span>
                                            <p className="text-sm text-[var(--color-neon-muted)] pt-0.5">Click the 👁 icon to reveal it, copy it, then pass it in every request: <code className="bg-black/50 px-2 py-0.5 rounded text-purple-300 text-xs">Authorization: Bearer vura_xxxxx</code></p>
                                        </div>
                                        <div className="flex items-start gap-3 pt-1 border-t border-[var(--color-neon-border)]">
                                            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                                            <p className="text-xs text-amber-400/80">Keep your key secret. Anyone with it can create certificates on your account. Use <strong>Rotate Key</strong> if it gets exposed — this immediately invalidates the old key.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Endpoint */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Globe className="w-4 h-4 text-purple-400" /> Step 2 — Call the Endpoint</h3>
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 rounded-2xl border border-[var(--color-neon-border)] bg-[#0d0d0d] px-6 py-4">
                                        <span className="text-xs font-bold px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-full">POST</span>
                                        <code className="flex-1 text-sm text-white font-mono break-all">https://vurakit.vercel.app/api/certificates/create</code>
                                        <CopyButton text="https://vurakit.vercel.app/api/certificates/create" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Request body */}
                                        <div className="space-y-3">
                                            <p className="text-sm font-semibold text-white">Request Body (JSON)</p>
                                            <CodeBlock lang="json" code={`{
  "recipient":   "Aarav Patel",
  "course":      "Next.js Architecture",
  "issueDate":   "Mar 3, 2026",
  "templateUrl": "https://...pdf"
}`} />
                                            <div className="rounded-xl border border-[var(--color-neon-border)] bg-[#0a0a0a] overflow-hidden text-xs">
                                                <table className="w-full">
                                                    <thead className="bg-[#111] border-b border-[var(--color-neon-border)]">
                                                        <tr>
                                                            <th className="text-left px-3 py-2 text-[var(--color-neon-muted)] uppercase tracking-wider">Field</th>
                                                            <th className="text-left px-3 py-2 text-[var(--color-neon-muted)] uppercase tracking-wider">Notes</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[var(--color-neon-border)]">
                                                        {[ 
                                                            ["recipient", "Full name on the certificate"],
                                                            ["course", "Course or credential name"],
                                                            ["issueDate", "Any date string"],
                                                            ["templateUrl", "Public URL to a PDF template"],
                                                        ].map(([f, n]) => (
                                                            <tr key={f}>
                                                                <td className="px-3 py-2.5 font-mono text-purple-400">{f}</td>
                                                                <td className="px-3 py-2.5 text-[var(--color-neon-muted)]">{n}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        {/* Response */}
                                        <div className="space-y-3">
                                            <p className="text-sm font-semibold text-white">Response <span className="text-emerald-400 text-xs">(201 Created)</span></p>
                                            <CodeBlock lang="json" code={`{
  "success": true,
  "certificateId": "CERT-A1B2C3D4",
  "pdfUrl": "https://s3.amazonaws.com/...pdf",
  "verifyUrl": "https://vurakit.vercel.app/verify/CERT-A1B2C3D4"
}`} />
                                            <div className="rounded-xl border border-[var(--color-neon-border)] bg-[#0a0a0a] overflow-hidden text-xs">
                                                <table className="w-full">
                                                    <thead className="bg-[#111] border-b border-[var(--color-neon-border)]">
                                                        <tr>
                                                            <th className="text-left px-3 py-2 text-[var(--color-neon-muted)] uppercase">Field</th>
                                                            <th className="text-left px-3 py-2 text-[var(--color-neon-muted)] uppercase">Description</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[var(--color-neon-border)]">
                                                        {[ 
                                                            ["certificateId", "Unique ID — use this to verify later"],
                                                            ["pdfUrl", "Direct link to the generated PDF"],
                                                            ["verifyUrl", "Public verification page URL"],
                                                        ].map(([f, n]) => (
                                                            <tr key={f}>
                                                                <td className="px-3 py-2.5 font-mono text-emerald-400">{f}</td>
                                                                <td className="px-3 py-2.5 text-[var(--color-neon-muted)]">{n}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── Code examples + Live tester (shared) ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Code2 className="w-4 h-4 text-[var(--color-neon-primary)]" /> Code Examples</h3>
                                <div className="flex gap-1.5 p-1 rounded-xl bg-[#111] border border-[var(--color-neon-border)] w-fit">
                                    {(["curl", "js", "python"] as Lang[]).map(l => (
                                        <button key={l} onClick={() => setLang(l)}
                                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${lang === l ? "bg-[var(--color-neon-primary)] text-black" : "text-[var(--color-neon-muted)] hover:text-white"}`}>
                                            {l === "js" ? "JavaScript" : l === "python" ? "Python" : "cURL"}
                                        </button>
                                    ))}
                                </div>
                                <AnimatePresence mode="wait">
                                    <motion.div key={`${mode}-${lang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <CodeBlock code={snippets[lang]} lang={lang === "js" ? "javascript" : lang} />
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                            {mode === "verify" ? (
                                <div>
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4"><Zap className="w-4 h-4 text-[var(--color-neon-primary)]" /> Try It Live</h3>
                                    <LiveVerifier />
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-[var(--color-neon-border)] bg-[#0a0a0a] p-6 space-y-4">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Zap className="w-4 h-4 text-purple-400" /> What Happens Next</h3>
                                    {[ 
                                        { n: "1", t: "Template fetched", d: "Vura downloads the PDF template from your templateUrl." },
                                        { n: "2", t: "Certificate generated", d: "Name, course, date and a QR code are stamped onto the PDF." },
                                        { n: "3", t: "Uploaded to S3", d: "The PDF is stored and a permanent URL is assigned." },
                                        { n: "4", t: "Saved to database", d: "The cert record is linked to your account and immediately verifiable." },
                                        { n: "5", t: "Response returned", d: "You get back certificateId, pdfUrl and verifyUrl in one call." },
                                    ].map(s => (
                                        <div key={s.n} className="flex items-start gap-3">
                                            <span className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xs font-bold shrink-0 mt-0.5">{s.n}</span>
                                            <div>
                                                <p className="text-sm font-semibold text-white">{s.t}</p>
                                                <p className="text-xs text-[var(--color-neon-muted)]">{s.d}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* ── Integrations ── */}
                <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-3">Built for Every Platform</h2>
                        <p className="text-[var(--color-neon-muted)] max-w-xl mx-auto">
                            The Vura API works with any tool that can make HTTP requests — from AI agents to no-code automation.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {INTEGRATIONS.map(int => (
                            <div key={int.name} className={`rounded-2xl border bg-gradient-to-br p-6 ${int.color} hover:scale-[1.02] transition-transform`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{int.emoji}</span>
                                        <span className="font-bold text-white">{int.name}</span>
                                    </div>
                                    <Badge label={int.badge} color={`border-current ${int.textColor} bg-current/10`} />
                                </div>
                                <p className="text-sm text-[var(--color-neon-muted)] leading-relaxed">{int.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* ── What you can do ── */}
                <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-3">What You Can Build</h2>
                        <p className="text-[var(--color-neon-muted)]">Real use-cases powered by the two API endpoints</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[ 
                            {
                                tag: "Verify API", tagColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
                                title: "Public Verification Widget",
                                desc: "Embed a \"Verify Certificate\" form on your school or company website. Students share their ID, anyone can confirm it's real — no login required.",
                                icon: "🔍",
                            },
                            {
                                tag: "Create API", tagColor: "text-purple-400 bg-purple-400/10 border-purple-400/20",
                                title: "Automated Certificate Issuance",
                                desc: "Connect a Google Form → Make/Zapier → Vura API pipeline. Every form submission auto-generates a certificate and emails it to the recipient.",
                                icon: "🤖",
                            },
                            {
                                tag: "Verify API", tagColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
                                title: "Telegram / Discord Verification Bot",
                                desc: "Users drop a certificate ID in chat; the bot calls /api/verify and replies with a formatted card showing recipient, course and issue date.",
                                icon: "🤝",
                            },
                            {
                                tag: "Both APIs", tagColor: "text-blue-400 bg-blue-400/10 border-blue-400/20",
                                title: "OpenClaw / GPT Agent Tool",
                                desc: "Register both endpoints as tools in your AI agent. The agent can create certs after marking a course complete and verify them on demand — all in natural language.",
                                icon: "🦞",
                            },
                        ].map(c => (
                            <div key={c.title} className="glass-card p-6 flex gap-5">
                                <span className="text-3xl shrink-0">{c.icon}</span>
                                <div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.tagColor} mr-2`}>{c.tag}</span>
                                    <h3 className="font-bold text-white mt-2 mb-1">{c.title}</h3>
                                    <p className="text-sm text-[var(--color-neon-muted)] leading-relaxed">{c.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* ── CTA ── */}
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                    className="rounded-2xl border border-[var(--color-neon-primary)]/20 bg-[radial-gradient(ellipse_at_top,rgba(0,229,153,0.08),transparent_60%)] p-12 text-center space-y-5">
                    <h2 className="text-3xl font-bold text-white">Ready to integrate?</h2>
                    <p className="text-[var(--color-neon-muted)] max-w-lg mx-auto">
                        Create a free Vura account to get your API key and start generating verifiable certificates in minutes.
                    </p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <Link href="/register" className="inline-flex items-center gap-2 btn-primary px-8 py-3 text-sm group">
                            Get Started Free <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link href="/dashboard/api-key" className="inline-flex items-center gap-2 border border-[var(--color-neon-border)] text-[var(--color-neon-muted)] hover:text-white hover:border-white/30 px-8 py-3 rounded-xl text-sm transition-all">
                            <ExternalLink className="w-4 h-4" /> Dashboard → API Key
                        </Link>
                    </div>
                </motion.div>
            </main>

            <footer className="border-t border-[var(--color-neon-border)] py-8 px-6 text-center text-xs text-[var(--color-neon-muted)]">
                © {new Date().getFullYear()} <a href="https://omnarkhede.tech" className="text-white hover:text-[var(--color-neon-primary)] transition-colors">Om Narkhede</a>. All rights reserved.
            </footer>
        </div >
    )
}
