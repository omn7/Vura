'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { TemplateField, TemplateData } from '@/types/template'
import TemplateCanvas from '@/components/template-builder/TemplateCanvas'
import FieldControls from '@/components/template-builder/FieldControls'
import ImageUploader from '@/components/template-builder/ImageUploader'

const DEFAULT_FIELDS: TemplateField[] = [
  {
    id: 'name',
    label: 'Participant Name',
    x: 300,
    y: 250,
    fontSize: 28,
    color: '#000000',
    align: 'center',
  },
  {
    id: 'course',
    label: 'Event Title',
    x: 300,
    y: 180,
    fontSize: 18,
    color: '#333333',
    align: 'center',
  },
  {
    id: 'issueDate',
    label: 'Date',
    x: 300,
    y: 310,
    fontSize: 14,
    color: '#666666',
    align: 'center',
  },
]

export default function TemplateBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string

  const [templateName, setTemplateName] = useState<string>('')
  const [bgImageUrl, setBgImageUrl] = useState<string>('')
  const [fields, setFields] = useState<TemplateField[]>(DEFAULT_FIELDS)
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const response = await fetch(`/api/templates/${eventId}`)
        if (response.ok) {
          const template: TemplateData = await response.json()
          setTemplateName(template.name)
          setBgImageUrl(template.bgImageUrl)
          setFields(template.fields)
        }
      } catch {
        // Template doesn't exist yet, which is fine
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      loadTemplate()
    }
  }, [eventId])

  const handleFieldMove = (id: string, x: number, y: number) => {
    setFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, x, y } : field))
    )
  }

  const handleFieldUpdate = (updated: TemplateField) => {
    setFields((prev) => prev.map((field) => (field.id === updated.id ? updated : field)))
  }

  const handleSave = async () => {
    setError(null)
    setSuccess(false)

    if (!templateName.trim()) {
      setError('Template name is required')
      return
    }

    if (!bgImageUrl) {
      setError('Background image is required')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName.trim(),
          eventId,
          bgImageUrl,
          fields,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save template')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Save failed'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-[var(--color-neon-muted)]">Loading template...</p>
      </div>
    )
  }

  const selectedField = fields.find((f) => f.id === selectedFieldId) ?? null

  return (
    <div className="flex h-screen bg-[var(--color-neon-bg)] overflow-hidden">
      {/* Left: Canvas area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h1 className="text-white font-semibold text-base">Template Builder</h1>
            <p className="text-[var(--color-neon-muted)] text-xs">Event: {eventId}</p>
          </div>
          <Link
            href="/dashboard/templates"
            className="text-[var(--color-neon-muted)] hover:text-white text-sm transition-colors"
          >
            Back to Templates
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          {!bgImageUrl ? (
            <ImageUploader onUploadComplete={setBgImageUrl} />
          ) : (
            <TemplateCanvas
              bgImageUrl={bgImageUrl}
              fields={fields}
              selectedFieldId={selectedFieldId}
              onFieldSelect={setSelectedFieldId}
              onFieldMove={handleFieldMove}
            />
          )}
        </div>
      </div>

      {/* Right: Controls sidebar */}
      <div className="w-80 flex flex-col border-l border-white/10 bg-[var(--color-neon-surface)] overflow-y-auto">
        <div className="p-5 border-b border-white/10">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-neon-muted)] mb-2">
            Template Name
          </label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="e.g. Graduation 2024"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-[var(--color-neon-muted)] focus:outline-none focus:border-[var(--color-neon-primary)]/50 focus:ring-1 focus:ring-[var(--color-neon-primary)]/20 transition-all"
          />
        </div>

        <div className="p-5 border-b border-white/10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-neon-muted)] mb-3">Fields</p>
          <div className="space-y-1.5">
            {fields.map((field) => (
              <button
                key={field.id}
                onClick={() => setSelectedFieldId(field.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                  selectedFieldId === field.id
                    ? 'bg-[var(--color-neon-primary)]/10 border border-[var(--color-neon-primary)]/30 text-[var(--color-neon-primary)]'
                    : 'bg-white/5 border border-white/5 text-white/80 hover:bg-white/10'
                }`}
              >
                <span className="font-medium">{field.label}</span>
                <span className="text-xs ml-2 opacity-50">
                  {field.x.toFixed(0)}, {field.y.toFixed(0)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 border-b border-white/10 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-neon-muted)] mb-3">Field Settings</p>
          {selectedFieldId ? (
            <FieldControls field={selectedField} onChange={handleFieldUpdate} />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-[var(--color-neon-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                </svg>
              </div>
              <p className="text-[var(--color-neon-muted)] text-xs">Click a field on the canvas to edit it</p>
            </div>
          )}
        </div>

        <div className="p-5 space-y-3">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-[var(--color-neon-primary)]/10 border border-[var(--color-neon-primary)]/20 rounded-lg px-3 py-2">
              <p className="text-[var(--color-neon-primary)] text-xs">Template saved successfully! Redirecting...</p>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !bgImageUrl || !templateName.trim()}
            className="w-full bg-[var(--color-neon-primary)] hover:bg-[#00ffaa] disabled:bg-white/10 disabled:text-[var(--color-neon-muted)] disabled:cursor-not-allowed text-black font-semibold rounded-lg px-4 py-2.5 text-sm transition-all"
          >
            {saving ? 'Saving...' : 'Save Template'}
          </button>

          {bgImageUrl && (
            <button
              onClick={() => setBgImageUrl('')}
              className="w-full border border-white/10 hover:border-white/20 text-[var(--color-neon-muted)] hover:text-white rounded-lg px-4 py-2 text-sm transition-colors"
            >
              Change Background
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
