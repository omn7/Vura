'use client'

import { TemplateField } from '@/types/template'

interface FieldBlockProps {
  field: TemplateField
  canvasWidth: number
  canvasHeight: number
  isSelected: boolean
  onSelect: (id: string) => void
  onPositionChange: (id: string, x: number, y: number) => void
}

export default function FieldBlock({
  field,
  canvasWidth,
  canvasHeight,
  isSelected,
  onSelect,
  onPositionChange,
}: FieldBlockProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(field.id)

    const startMouseX = e.clientX
    const startMouseY = e.clientY
    const startFieldX = field.x
    const startFieldY = field.y

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startMouseX
      const deltaY = moveEvent.clientY - startMouseY

      let newX = startFieldX + deltaX
      let newY = startFieldY + deltaY

      // Clamp to canvas bounds
      newX = Math.max(0, Math.min(newX, canvasWidth - 100))
      newY = Math.max(0, Math.min(newY, canvasHeight - 40))

      onPositionChange(field.id, newX, newY)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: `${field.x}px`,
        top: `${field.y}px`,
        fontSize: `${field.fontSize}px`,
        color: field.color,
      }}
      className={`absolute cursor-move select-none transition-shadow ${
        isSelected
          ? 'ring-2 ring-[var(--color-neon-primary)] ring-offset-1 ring-offset-transparent shadow-lg shadow-[var(--color-neon-primary)]/20'
          : 'ring-1 ring-white/30 hover:ring-white/60'
      }`}
    >
      <div
        className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-sm whitespace-nowrap ${
          isSelected ? 'bg-[var(--color-neon-primary)]/20' : 'bg-black/30'
        }`}
      >
        {field.label}
      </div>
    </div>
  )
}
