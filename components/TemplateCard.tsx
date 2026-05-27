'use client'

import Link from "next/link"
import { useState } from "react"

interface TemplateCardProps {
  event: {
    id: string
    name: string
    createdAt: Date
    template: {
      name: string
      bgImageUrl: string
      fields: any[]
      eventId?: string
    } | null
  }
}

export default function TemplateCard({ event }: TemplateCardProps) {
  const [deleting, setDeleting] = useState(false)
  const eventId = event.id || event.template?.eventId

  const handleDelete = async () => {
    if (!confirm(`Delete template "${event.template?.name}"?`)) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/templates/${event.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert("Failed to delete template")
      }
    } catch (error) {
      alert("Failed to delete template")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="bg-[var(--color-neon-surface)] border border-[var(--color-neon-border)] rounded-xl overflow-hidden hover:border-white/20 transition-all group">
      {/* Template Background Preview with Fields */}
      <div className="relative aspect-video overflow-hidden">
        {event.template?.bgImageUrl ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${event.template.bgImageUrl})` }}
            />
            <div className="absolute inset-0 bg-black/20" />
            {Array.isArray(event.template.fields) && event.template.fields.length > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {event.template.fields.map((field: any) => (
                  <div
                    key={field.id}
                    className="absolute text-white text-xs font-medium px-2 py-0.5 bg-black/40 rounded border border-white/20 backdrop-blur-sm"
                    style={{
                      left: `${(field.x / 794) * 100}%`,
                      top: `${(field.y / 562) * 100}%`,
                      fontSize: `${Math.max(8, (field.fontSize || 16) * 0.4)}px`,
                    }}
                  >
                    {field.label}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="aspect-video flex flex-col items-center justify-center bg-white/[0.02]">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-[var(--color-neon-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-[var(--color-neon-muted)] text-xs">No template yet</p>
          </div>
        )}
      </div>

      {/* Event Info */}
      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-white font-semibold text-base truncate">{event.name}</h3>
          {event.template && (
            <p className="text-xs text-[var(--color-neon-muted)] mt-1">
              Template: <span className="text-white/80">{event.template.name}</span>
            </p>
          )}
        </div>

        {/* Template Details */}
        {event.template && (
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-[var(--color-neon-muted)] text-xs font-medium mb-2">
              {Array.isArray(event.template.fields) ? event.template.fields.length : 0} fields configured
            </p>
            {Array.isArray(event.template.fields) && event.template.fields.length > 0 && (
              <div className="space-y-1">
                {event.template.fields.map((field: any) => (
                  <div key={field.id} className="flex items-center gap-2 text-xs text-[var(--color-neon-muted)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-neon-primary)] flex-shrink-0" />
                    {field.label}
                    <span className="text-white/30">({field.fontSize}px)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {event.template ? (
            <>
              <Link
                href={eventId ? `/dashboard/templates/new/${eventId}` : "/dashboard/templates"}
                className="flex-1 text-center text-sm font-medium border border-white/15 hover:border-white/30 text-white rounded-lg px-3 py-2 transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 text-sm font-medium border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 rounded-lg px-3 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </>
          ) : (
            <Link
              href={eventId ? `/dashboard/templates/new/${eventId}` : "/dashboard/templates"}
              className="w-full text-center text-sm font-semibold bg-[var(--color-neon-primary)] hover:bg-[#00ffaa] text-black rounded-lg px-4 py-2.5 transition-colors"
            >
              Create Template
            </Link>
          )}
        </div>

        {/* Created Date */}
        <p className="text-xs text-[var(--color-neon-muted)] border-t border-white/10 pt-3">
          Created {new Date(event.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
