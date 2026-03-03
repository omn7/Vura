"use client"

import { useState } from "react"
import Link from "next/link"
import {
    ShieldCheck, Copy, Check, Terminal, Globe, AlertTriangle,
    CheckCircle2, XCircle, ArrowRight, Code2, Zap
} from "lucide-react"
import { motion } from "framer-motion"

// ---------- Code snippets ----------
const snippets = {
    curl: `curl -X GET \\
  "https://vurakit.vercel.app/api/verify/CERT-A1B2C3D4"`,

    js: `const res = await fetch(
  "https://vurakit.vercel.app/api/verify/CERT-A1B2C3D4"
);
const data = await res.json();

if (res.ok) {
  console.log("Verified:", data.recipient);
} else {
  console.error(data.error);
}`,

    python: `import requests

res = requests.get(
    "https://vurakit.vercel.app/api/verify/CERT-A1B2C3D4"
)
data = res.json()

if res.status_code == 200:
    print(f"Verified: {data['recipient']}")
else:
    print(f"Error: {data['error']}")`,
}

const STATUS_CODES = [
    {
        code: "200",
        label: "Verified",
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
        border: "border-emerald-400/30",
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
        desc: "Certificate is valid and authentic.",
        body: `{
  "verified": true,
  "certificateId": "CERT-A1B2C3D4",
  "recipient": "Aarav Patel",
  "course": "Next.js Architecture",
  "issuedOn": "Oct 24, 2023"
}`,
    },
    {
        code: "403",
        label: "Revoked",
        color: "text-amber-400",
        bg: "bg-amber-400/10",
        border: "border-amber-400/30",
        icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
        desc: "Certificate exists but has been revoked by the issuer.",
        body: `{
  "error": "This certificate has been revoked by the issuer."
}`,
    },
    {
        code: "404",
        label: "Not Found",
        color: "text-red-400",
        bg: "bg-red-400/10",
        border: "border-red-400/30",
        icon: <XCircle className="w-4 h-4 text-red-400 shrink-0" />,
        desc: "No certificate with this ID exists in the database.",
        body: `{
  "error": "Certificate not found."
}`,
    },
    {
        code: "500",
        label: "Server Error",
        color: "text-gray-400",
        bg: "bg-gray-400/10",
        border: "border-gray-400/30",
        icon: <XCircle className="w-4 h-4 text-gray-400 shrink-0" />,
        desc: "An unexpected error occurred on the server.",
        body: `{
  "error": "Internal server error. Please try again later."
}`,
    },
]

// ---------- Helper components ----------
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)
    return (
        <button
            onClick={() => {
                navigator.clipboard.writeText(text)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            }}
            className="p-1.5 rounded-md hover:bg-white/10 text-[var(--color-neon-muted)] hover:text-white transition-colors"
            title="Copy"
        >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
    )
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
    return (
        <div className="relative rounded-xl bg-[#0d0d0d] border border-[var(--color-neon-border)] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-neon-border)] bg-[#111] text-xs text-[var(--color-neon-muted)]">
                <span className="font-mono uppercase tracking-wider">{lang}</span>
                <CopyButton text={code} />
            </div>
            <pre className="p-4 text-sm text-gray-300 font-mono overflow-x-auto leading-relaxed whitespace-pre">{code}</pre>
        </div>
    )
}

// ---------- Interactive Tester ----------
function LiveTester() {
    const [id, setId] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ status: number; data: unknown } | null>(null)

    async function verify() {
        if (!id.trim()) return
        setLoading(true)
        setResult(null)
        try {
            const res = await fetch(`/api/verify/${id.trim().toUpperCase()}`)
            const data = await res.json()
            setResult({ status: res.status, data })
        } catch {
            setResult({ status: 0, data: { error: "Network error — could not reach the server." } })
        } finally {
            setLoading(false)
        }
    }

    const statusColor =
        result?.status === 200 ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/5"
            : result?.status === 403 ? "text-amber-400 border-amber-400/30 bg-amber-400/5"
                : result?.status === 404 ? "text-red-400 border-red-400/30 bg-red-400/5"
                    : "text-gray-400 border-gray-400/30 bg-gray-400/5"

    return (
        <div className="rounded-2xl border border-[var(--color-neon-border)] bg-[#0a0a0a] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[var(--color-neon-border)] bg-[#111] flex items-center gap-3">
                <Zap className="w-4 h-4 text-[var(--color-neon-primary)]" />
                <span className="text-sm font-semibold text-white">Live API Tester</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                    Connected
                </span>
            </div>

            <div className="p-6 space-y-4">
                {/* URL bar */}
                <div className="flex items-center gap-2 rounded-xl border border-[var(--color-neon-border)] bg-[#111] px-4 py-3 text-sm font-mono text-[var(--color-neon-muted)]">
                    <span className="text-xs font-bold px-2 py-0.5 bg-[var(--color-neon-primary)]/10 text-[var(--color-neon-primary)] border border-[var(--color-neon-primary)]/30 rounded">GET</span>
                    <span className="text-gray-500">/api/verify/</span>
                    <input
                        value={id}
                        onChange={e => setId(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && verify()}
                        placeholder="CERT-A1B2C3D4"
                        className="flex-1 bg-transparent outline-none text-white placeholder-[#444] min-w-0"
                    />
                </div>

                <button
                    onClick={verify}
                    disabled={loading || !id.trim()}
                    className="w-full py-3 rounded-xl bg-[var(--color-neon-primary)] text-black font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                    ) : (
                        <ArrowRight className="w-4 h-4" />
                    )}
                    {loading ? "Verifying…" : "Send Request"}
                </button>

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-xl border p-4 ${statusColor}`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-mono font-bold">HTTP {result.status}</span>
                            <CopyButton text={JSON.stringify(result.data, null, 2)} />
                        </div>
                        <pre className="text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre">
                            {JSON.stringify(result.data, null, 2)}
                        </pre>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

// ---------- Page ----------
export default function DocsPage() {
    const [activeTab, setActiveTab] = useState<keyof typeof snippets>("curl")
    const [activeStatus, setActiveStatus] = useState(0)

    const fadeUp = {
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
    }

    return (
        <div className="min-h-screen bg-[var(--color-neon-bg)] text-white">
            {/* ── Navbar ── */}
            <header className="sticky top-0 z-50 border-b border-[var(--color-neon-border)] bg-[rgba(3,3,3,0.8)] backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-neon-primary)] flex items-center justify-center shadow-[0_0_12px_rgba(0,229,153,0.4)] group-hover:shadow-[0_0_20px_rgba(0,229,153,0.6)] transition-all">
                            <div className="w-3 h-3 bg-black rounded-sm rotate-45" />
                        </div>
                        <span className="text-xl font-black tracking-widest uppercase text-white">VURA</span>
                    </Link>
                    <nav className="flex items-center gap-6 text-sm text-[var(--color-neon-muted)]">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                        <span className="text-[var(--color-neon-primary)] font-semibold">API Docs</span>
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-16 space-y-20">

                {/* ── Hero ── */}
                <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center max-w-3xl mx-auto">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-neon-primary)]/30 bg-[var(--color-neon-primary)]/10 text-xs font-semibold text-[var(--color-neon-primary)] tracking-widest uppercase mb-6">
                        <Code2 className="w-3.5 h-3.5" /> Developer API
                    </span>
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-5">
                        Certificate Verification API
                    </h1>
                    <p className="text-lg text-[var(--color-neon-muted)] leading-relaxed">
                        Validate any Vura certificate in real-time from your app, bot, or automation pipeline.
                        One simple <strong className="text-white">GET</strong> request, no API key required.
                    </p>
                </motion.div>

                {/* ── Endpoint ── */}
                <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-[var(--color-neon-primary)]" />
                        <h2 className="text-2xl font-bold text-white">Endpoint</h2>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 rounded-2xl border border-[var(--color-neon-border)] bg-[#0d0d0d] px-6 py-5">
                        <span className="text-xs font-bold px-3 py-1.5 bg-[var(--color-neon-primary)]/10 text-[var(--color-neon-primary)] border border-[var(--color-neon-primary)]/30 rounded-full tracking-widest">GET</span>
                        <code className="flex-1 text-sm md:text-base text-white font-mono break-all">
                            https://vurakit.vercel.app/api/verify/<span className="text-[var(--color-neon-primary)]">{"{id}"}</span>
                        </code>
                        <CopyButton text="https://vurakit.vercel.app/api/verify/{id}" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { icon: <ShieldCheck className="w-4 h-4" />, label: "Auth Required", value: "None — public endpoint" },
                            { icon: <Terminal className="w-4 h-4" />, label: "Parameter", value: "{id} — the certificate ID" },
                            { icon: <Globe className="w-4 h-4" />, label: "CORS", value: "All origins allowed (*)" },
                        ].map(item => (
                            <div key={item.label} className="rounded-xl border border-[var(--color-neon-border)] bg-[#0a0a0a] px-5 py-4 flex items-start gap-3">
                                <span className="mt-0.5 text-[var(--color-neon-primary)]">{item.icon}</span>
                                <div>
                                    <p className="text-xs text-[var(--color-neon-muted)] mb-1">{item.label}</p>
                                    <p className="text-sm text-white font-medium">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* ── Code Snippets + Tester (2-col) ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Code snippets */}
                    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Code2 className="w-5 h-5 text-[var(--color-neon-primary)]" />
                            <h2 className="text-2xl font-bold text-white">Code Examples</h2>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 p-1 rounded-xl bg-[#111] border border-[var(--color-neon-border)] w-fit">
                            {(Object.keys(snippets) as Array<keyof typeof snippets>).map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => setActiveTab(lang)}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === lang
                                            ? "bg-[var(--color-neon-primary)] text-black"
                                            : "text-[var(--color-neon-muted)] hover:text-white"
                                        }`}
                                >
                                    {lang === "js" ? "JavaScript" : lang === "python" ? "Python" : "cURL"}
                                </button>
                            ))}
                        </div>

                        <CodeBlock code={snippets[activeTab]} lang={activeTab === "js" ? "javascript" : activeTab} />
                    </motion.section>

                    {/* Live tester */}
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                        <div className="flex items-center gap-3 mb-4">
                            <Zap className="w-5 h-5 text-[var(--color-neon-primary)]" />
                            <h2 className="text-2xl font-bold text-white">Try It Live</h2>
                        </div>
                        <LiveTester />
                    </motion.div>
                </div>

                {/* ── Response Codes ── */}
                <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="space-y-6">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-[var(--color-neon-primary)]" />
                        <h2 className="text-2xl font-bold text-white">Response Codes</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {STATUS_CODES.map((s, i) => (
                            <button
                                key={s.code}
                                onClick={() => setActiveStatus(i)}
                                className={`flex items-center gap-3 px-5 py-4 rounded-xl border text-left transition-all ${activeStatus === i
                                        ? `${s.bg} ${s.border} border`
                                        : "bg-[#0a0a0a] border-[var(--color-neon-border)] hover:border-white/20"
                                    }`}
                            >
                                {s.icon}
                                <div>
                                    <p className={`text-lg font-black ${activeStatus === i ? s.color : "text-white"}`}>{s.code}</p>
                                    <p className="text-xs text-[var(--color-neon-muted)]">{s.label}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <motion.div
                        key={activeStatus}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-2xl border p-6 space-y-4 ${STATUS_CODES[activeStatus].bg} ${STATUS_CODES[activeStatus].border} border`}
                    >
                        <div className="flex items-center gap-2">
                            {STATUS_CODES[activeStatus].icon}
                            <span className={`font-bold ${STATUS_CODES[activeStatus].color}`}>
                                {STATUS_CODES[activeStatus].code} — {STATUS_CODES[activeStatus].label}
                            </span>
                        </div>
                        <p className="text-sm text-[var(--color-neon-muted)]">{STATUS_CODES[activeStatus].desc}</p>
                        <CodeBlock code={STATUS_CODES[activeStatus].body} lang="json" />
                    </motion.div>
                </motion.section>

                {/* ── Response Schema ── */}
                <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="space-y-6">
                    <h2 className="text-2xl font-bold text-white">Response Schema (200 OK)</h2>
                    <div className="rounded-2xl border border-[var(--color-neon-border)] bg-[#0a0a0a] overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[var(--color-neon-border)] bg-[#111]">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-neon-muted)] uppercase tracking-wider">Field</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-neon-muted)] uppercase tracking-wider">Type</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-neon-muted)] uppercase tracking-wider">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-neon-border)]">
                                {[
                                    ["verified", "boolean", "Always true on 200 response"],
                                    ["certificateId", "string", "The unique certificate ID (e.g. CERT-A1B2C3D4)"],
                                    ["recipient", "string", "Full name of the certificate holder"],
                                    ["course", "string", "Name of the course or credential"],
                                    ["issuedOn", "string", "Issue date as stored (e.g. Oct 24, 2023)"],
                                ].map(([field, type, desc]) => (
                                    <tr key={field} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 font-mono text-[var(--color-neon-primary)]">{field}</td>
                                        <td className="px-6 py-4 text-gray-400 font-mono">{type}</td>
                                        <td className="px-6 py-4 text-[var(--color-neon-muted)]">{desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.section>

                {/* ── Use cases ── */}
                <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="space-y-6">
                    <h2 className="text-2xl font-bold text-white">Use Cases</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                            { icon: "🤖", title: "Telegram / Discord Bots", desc: "Let users paste a certificate ID in chat and get instant verification without leaving the app." },
                            { icon: "🌐", title: "Your Own Website", desc: "Embed a verify widget on your school or organization's site using a simple fetch call." },
                            { icon: "⚡", title: "AI Agent Tool", desc: "Register the endpoint as an OpenClaw / GPT tool so your AI assistant can verify certificates on demand." },
                        ].map(c => (
                            <div key={c.title} className="rounded-2xl border border-[var(--color-neon-border)] bg-[#0a0a0a] p-6 hover:border-[var(--color-neon-primary)]/40 transition-colors">
                                <div className="text-3xl mb-4">{c.icon}</div>
                                <h3 className="font-bold text-white mb-2">{c.title}</h3>
                                <p className="text-sm text-[var(--color-neon-muted)] leading-relaxed">{c.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* ── CTA ── */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="rounded-2xl border border-[var(--color-neon-primary)]/20 bg-[radial-gradient(ellipse_at_top,rgba(0,229,153,0.08),transparent_60%)] p-12 text-center space-y-5"
                >
                    <h2 className="text-3xl font-bold text-white">Start generating certificates</h2>
                    <p className="text-[var(--color-neon-muted)] max-w-lg mx-auto">
                        Create a free Vura account to bulk-generate verifiable certificates and get unique IDs you can verify with this API.
                    </p>
                    <Link href="/register" className="inline-flex items-center gap-2 btn-primary px-8 py-3 text-sm group">
                        Get Started Free <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="border-t border-[var(--color-neon-border)] mt-20 py-8 px-6 text-center text-xs text-[var(--color-neon-muted)]">
                © {new Date().getFullYear()} <a href="https://omnarkhede.tech" className="text-white hover:text-[var(--color-neon-primary)] transition-colors">Om Narkhede</a>. All rights reserved.
            </footer>
        </div>
    )
}
