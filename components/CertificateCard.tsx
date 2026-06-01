"use client"

import { useState } from "react"
import { CheckCircle, Trash2, ExternalLink } from "lucide-react"
import DOMPurify from 'dompurify'; // Import DOMPurify for sanitization

interface Props {
    cert: {
        certificateId: string
        name: string
        course: string
        issueDate: string
        pdfUrl: string
        revoked: boolean
    }
    onDeleted: (id: string) => void
}

export default function CertificateCard({ cert, onDeleted }: Props) {
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [deleting, setDeleting] = useState(false)

    async function handleDelete() {
        if (!confirmDelete) { setConfirmDelete(true); return }
        setDeleting(true)
        
        try {
            // The backend API (`app/api/certificates/[id]/route.ts`) must enforce that
            // the requesting user owns the certificate (`cert.userId !== session.user.id`).
            // This component assumes that server-side authorization is in place.
            const res = await fetch(`/api/certificates/${cert.certificateId}`, { method: "DELETE" })
            if (res.ok) {
                onDeleted(cert.certificateId)
            } else {
                console.error("Failed to delete certificate:", await res.json());
                // Optionally, show an error message to the user
                setDeleting(false)
                setConfirmDelete(false)
            }
        } catch (error) {
            console.error("Network or unexpected error during deletion:", error);
            // Optionally, show a generic error message to the user
            setDeleting(false)
            setConfirmDelete(false)
        }
    }

    // Helper to safely render strings
    const renderSafeString = (value: string) => DOMPurify.sanitize(value, { USE_PROFILES: { html: false } });

    return (
        <div className="glass-card flex flex-col p-5 hover:border-[var(--color-neon-primary)]/40 transition-colors group relative">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 pr-2">
                    <h3 className="font-semibold text-white truncate">{renderSafeString(cert.name)}</h3>
                    <p className="text-xs text-[var(--color-neon-muted)] truncate mt-0.5">{renderSafeString(cert.course)}</p>
                </div>
                {cert.revoked ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-400/10 text-red-400 border border-red-400/20 shrink-0">Revoked</span>
                ) : (
                    <CheckCircle className="w-4 h-4 text-[var(--color-neon-primary)] shrink-0 mt-0.5" />
                )}
            </div>

            {/* ID */}
            <div className="bg-black/30 px-3 py-2 rounded-lg mb-2 font-mono text-xs text-[var(--color-neon-primary)] truncate">
                {renderSafeString(cert.certificateId)}
            </div>
            <p className="text-xs text-[var(--color-neon-muted)] mb-4">Issued: {renderSafeString(cert.issueDate)}</p>

            {/* Actions */}
            <div className="flex gap-2 mt-auto">
                <a href={renderSafeString(cert.pdfUrl)} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 flex-1 text-xs py-2 rounded-lg border border-[var(--color-neon-border)] hover:border-[var(--color-neon-primary)] text-[var(--color-neon-muted)] hover:text-white transition-colors">
                    <ExternalLink className="w-3 h-3" /> PDF
                </a>
                <a href={`/verify/${encodeURIComponent(cert.certificateId)}`} target="_blank" rel="noreferrer"
                    className="flex-1 text-center text-xs py-2 rounded-lg bg-[var(--color-neon-primary)] text-black font-semibold hover:brightness-110 transition-all">
                    Verify
                </a>
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    onBlur={() => setConfirmDelete(false)}
                    title={confirmDelete ? "Click again to confirm" : "Delete certificate"}
                    className={`flex items-center justify-center px-3 py-2 rounded-lg border text-xs font-medium transition-all shrink-0 ${confirmDelete
                            ? "border-red-400 bg-red-400/10 text-red-400"
                            : "border-[var(--color-neon-border)] text-[var(--color-neon-muted)] hover:border-red-400/50 hover:text-red-400"
                        } disabled:opacity-40`}
                >
                    {deleting ? (
                        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                    ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                    )}
                    {confirmDelete && !deleting && <span className="ml-1">Sure?</span>}
                </button>
            </div>
        </div>
    )
}
