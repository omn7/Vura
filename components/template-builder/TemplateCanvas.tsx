'use client'

import { useState } from 'react'
import { TemplateField, DraggingState } from '@/types/template'
import FieldBlock from './FieldBlock'

interface TemplateCanvasProps {
  bgImageUrl: string
  fields: TemplateField[]
  selectedFieldId: string | null
  onFieldSelect: (id: string) => void
  onFieldMove: (id: string, x: number, y: number) => void
}

// A4 landscape ratio: 794 x 562 pixels (standard print size)
const CANVAS_WIDTH = 794
const CANVAS_HEIGHT = 562

export default function TemplateCanvas({
  bgImageUrl,
  fields,
  selectedFieldId,
  onFieldSelect,
  onFieldMove,
}: TemplateCanvasProps) {
  const [draggingState, setDraggingState] = useState<DraggingState | null>(null)

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingState) return

    const deltaX = e.clientX - draggingState.startMouseX
    const deltaY = e.clientY - draggingState.startMouseY

    let newX = draggingState.startFieldX + deltaX
    let newY = draggingState.startFieldY + deltaY

    // Clamp to canvas bounds
    newX = Math.max(0, Math.min(newX, CANVAS_WIDTH - 100))
    newY = Math.max(0, Math.min(newY, CANVAS_HEIGHT - 40))

    onFieldMove(draggingState.fieldId, newX, newY)
  }

  const handleCanvasMouseUp = () => {
    setDraggingState(null)
  }

  return (
    <div
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseUp}
      className="relative overflow-hidden rounded-lg shadow-2xl cursor-crosshair select-none"
      style={{
        width: `${CANVAS_WIDTH}px`,
        height: `${CANVAS_HEIGHT}px`,
        backgroundImage: `url(${bgImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Subtle grid overlay for editing */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Field blocks */}
      <div className="relative w-full h-full">
        {fields.map((field) => (
          <FieldBlock
            key={field.id}
            field={field}
            canvasWidth={CANVAS_WIDTH}
            canvasHeight={CANVAS_HEIGHT}
            isSelected={selectedFieldId === field.id}
            onSelect={onFieldSelect}
            onPositionChange={onFieldMove}
          />
        ))}
      </div>
    </div>
  )
}
