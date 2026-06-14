'use client'

import { useState, useRef } from 'react'

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void
}

export default function ImageUploader({ onUploadComplete }: ImageUploaderProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Convert image to base64 data URL (no S3 needed)
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        onUploadComplete(dataUrl)
        setLoading(false)
      }
      reader.onerror = () => {
        setError('Failed to read file')
        setLoading(false)
      }
      reader.readAsDataURL(file)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div
      className="flex flex-col items-center justify-center w-[794px] h-[562px] rounded-lg border-2 border-dashed border-white/20 hover:border-white/30 transition-colors bg-white/[0.02] cursor-pointer"
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-[var(--color-neon-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <p className="text-white font-medium text-sm">Upload certificate background</p>
      <p className="text-[var(--color-neon-muted)] text-xs mt-1">PNG, JPG up to 10MB</p>
      {loading && (
        <div className="mt-4 flex items-center gap-2 text-[var(--color-neon-primary)] text-xs">
          <div className="w-3 h-3 rounded-full border-2 border-[var(--color-neon-primary)] border-t-transparent animate-spin" />
          Uploading...
        </div>
      )}
      {error && <p className="mt-3 text-red-400 text-xs">{error}</p>}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
    </div>
  )
}
