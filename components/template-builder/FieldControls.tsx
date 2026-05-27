'use client'

import { TemplateField } from '@/types/template'

interface FieldControlsProps {
  field: TemplateField | null
  onChange: (updated: TemplateField) => void
}

export default function FieldControls({ field, onChange }: FieldControlsProps) {
  if (!field) {
    return (
      <div className="p-4 bg-white/5 rounded border border-white/10">
        <p className="text-sm text-[var(--color-neon-muted)]">Select a field to edit</p>
      </div>
    )
  }

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(8, Math.min(72, parseInt(e.target.value) || 8))
    onChange({ ...field, fontSize: value })
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...field, color: e.target.value })
  }

  const handleXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value)
    const clamped = Math.max(0, Math.min(794, Number.isNaN(parsed) ? 0 : parsed))
    onChange({ ...field, x: clamped })
  }

  const handleYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value)
    const clamped = Math.max(0, Math.min(562, Number.isNaN(parsed) ? 0 : parsed))
    onChange({ ...field, y: clamped })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-[var(--color-neon-muted)] mb-1.5">Font Size</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="8"
            max="72"
            value={field.fontSize}
            onChange={handleFontSizeChange}
            className="flex-1 accent-[var(--color-neon-primary)]"
          />
          <span className="text-white text-xs w-10 text-right">{field.fontSize}px</span>
        </div>
      </div>

      <div>
        <label className="block text-xs text-[var(--color-neon-muted)] mb-1.5">Text Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={field.color}
            onChange={handleColorChange}
            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
          />
          <span className="text-xs text-[var(--color-neon-muted)] font-mono">{field.color}</span>
        </div>
      </div>

      <div>
        <label className="block text-xs text-[var(--color-neon-muted)] mb-1.5">Position</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-[var(--color-neon-muted)]">X</label>
            <input
              type="number"
              value={Math.round(field.x)}
              onChange={handleXChange}
              className="w-full mt-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-[var(--color-neon-primary)]/50"
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-neon-muted)]">Y</label>
            <input
              type="number"
              value={Math.round(field.y)}
              onChange={handleYChange}
              className="w-full mt-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-[var(--color-neon-primary)]/50"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
