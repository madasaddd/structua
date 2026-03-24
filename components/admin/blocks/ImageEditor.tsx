'use client'

import { useState, useRef } from 'react'
import { ImageBlockContent } from '@/lib/validators/blocks'

interface ImageEditorProps {
  data: ImageBlockContent
  onChange: (data: ImageBlockContent) => void
}

export default function ImageEditor({ data, onChange }: ImageEditorProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setUploading(true)
    setError(null)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Upload failed')
      onChange({ url: json.url, caption: data.caption })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-3">
      {data.url ? (
        <div className="relative">
          <img src={data.url} alt={data.caption || ''} className="w-full max-h-80 object-contain rounded-lg bg-gray-50" />
          <button
            onClick={() => onChange({ url: '', caption: data.caption })}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-1.5 shadow text-xs transition-colors"
          >
            ✕ Remove
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-10 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <span className="text-2xl">🖼</span>
          <p className="text-sm text-gray-600 font-medium">
            {uploading ? 'Uploading…' : 'Drop image here or click to upload'}
          </p>
          <p className="text-xs text-gray-400">JPEG, PNG, WebP or GIF · Max 5 MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <input
        type="text"
        placeholder="Caption (optional)…"
        value={data.caption || ''}
        onChange={(e) => onChange({ ...data, caption: e.target.value })}
        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
    </div>
  )
}
