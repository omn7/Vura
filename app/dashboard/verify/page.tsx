"use client"

import { useState } from "react"
import { ShieldCheck, Search, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import DOMPurify from 'dompurify'; // Import DOMPurify for sanitization

export default function VerifyPage() {
    const [id, setId] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ status: number; data: Record<string, unknown> } | null>(null)

    async function verify() {
        if (!id.trim()) return
        setLoading(true)
        setResult(null)
        
        const trimmedId = id.trim().toUpperCase();
        
        try {
            const res = await fetch(`/api/verify/${trimmedId}`)
            const data = await res.json()
            setResult({ status: res.status, data })
        } catch (error) {
            console.error("Verification API call failed:", error);
            setResult({ status: 500, data: { error: "Failed to connect to verification service." } });
        } finally {
            setLoading(false);
        }
    }

    const StatusIcon = () => {
        if (!result) return null
        if (result.status === 200) return <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        if (result.status === 403) return <AlertTriangle className="w-8 h-8 text-amber-400" />
        return <XCircle className="w-8 h-8 text-red-400" />
    }

    const statusStyle =
        result?.status === 200 ? "border-emerald-400/30 bg-emerald-400/5 text-emerald-400"
            : result?.status === 403 ? "border-amber-400/30 bg-amber-400/5 text-amber-400"
                : result ? "border-red-400/30 bg-red-400/5 text-red-400"
                    : ""

    // Helper to safely render strings from API response
    const renderSafeString = (value: unknown) => {
        if (typeof value !== 'string') return String(value); // Convert to string safely
        return DOMPurify.sanitize(value, { USE_PROFILES: { html: false } }); // Sanitize, no HTML allowed
    };

    return (
        <div className="space-y-8 max-w-xl">
            <div>
                <h1 className="text-2xl font-bold text-white">Verify a Certificate</h1>
                <p className="text-sm text-[var(--color-neon-muted)] mt-1">
                    Enter a certificate ID to check its authenticity against the Vura database.
                </p>
            </div>

            <div className="glass-card p-6 space-y-4">
                <div className="flex gap-3">
                    <div className="flex-1 flex items-center gap-3 bg-[#0d0d0d] border border-[var(--color-neon-border)] rounded-xl px-4 py-3 focus-within:border-[var(--color-neon-primary)] transition-colors">
                        <Search className="w-4 h-4 text-[var(--color-neon-muted)] shrink-0" />
                        <input
                            value={id}
                            onChange={e => setId(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && verify()}
                            placeholder="CERT-A1B2C3D4"
                            className="flex-1 bg-transparent outline-none text-white placeholder-[#444] font-mono text-sm"
                        />
                    </div>
                    <button
                        onClick={verify}
                        disabled={loading || !id.trim()}
                        className="btn-primary px-6 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {loading ? "…" : "Verify"}
                    </button>
                </div>

                {result && (
                    <div className={`rounded-xl border p-6 space-y-4 ${statusStyle}`}>
                        <div className="flex items-center gap-3">
                            <StatusIcon />
                            <div>
                                <p className="font-bold text-lg">
                                    {result.status === 200 ? "✅ Verified"
                                        : result.status === 403 ? "⚠️ Revoked"
                                            : "❌ Not Found"}
                                </p>
                                <p className="text-xs opacity-70">HTTP {result.status}</p>
                            </div>
                        </div>
                        {result.status === 200 && (
                            <div className="space-y-2 text-sm">
                                {[ 
                                    ["Recipient", renderSafeString(result.data.recipient)],
                                    ["Course", renderSafeString(result.data.course)],
                                    ["Issued On", renderSafeString(result.data.issuedOn)],
                                    ["Certificate ID", renderSafeString(result.data.certificateId)],
                                ].map(([k, v]) => (
                                    <div key={k} className="flex justify-between gap-4 py-2 border-b border-white/10 last:border-0">
                                        <span className="opacity-60">{k}</span>
                                        <span className="font-medium text-right font-mono">{v}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {result.status !== 200 && (
                            <p className="text-sm opacity-80">{renderSafeString(result.data.error)}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
