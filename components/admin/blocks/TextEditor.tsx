'use client'

import { TextBlockContent } from '@/lib/validators/blocks'
import RichTextEditor from '@/components/admin/RichTextEditor'

const VARIANTS = [
  { value: 'h1', label: 'H1' },
  { value: 'h2', label: 'H2' },
  { value: 'h3', label: 'H3' },
  { value: 'body-lg', label: 'Body LG' },
  { value: 'body-md', label: 'Body MD' },
  { value: 'body-sm', label: 'Body SM' },
] as const

interface TextEditorProps {
  data: TextBlockContent
  onChange: (data: TextBlockContent) => void
  blockId: string
  dayId: number
}

export default function TextEditor({ data, onChange, blockId, dayId }: TextEditorProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {VARIANTS.map((v) => (
          <button
            key={v.value}
            type="button"
            onClick={() => onChange({ ...data, variant: v.value })}
            className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
              data.variant === v.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-gray-200 p-2 bg-white">
        <RichTextEditor
          content={data.content}
          onUpdate={(html) => onChange({ ...data, content: html })}
          enableHighlight={true}
          placeholder='Start writing… or type "/" for blocks'
          blockId={blockId}
          dayId={dayId}
        />
      </div>
    </div>
  )
}
