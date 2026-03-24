'use client'

import { CalloutBlockContent } from '@/lib/validators/blocks'
import RichTextEditor from '@/components/admin/RichTextEditor'

const COLORS = ['blue', 'yellow', 'green', 'red', 'purple', 'gray'] as const
const COLOR_LABELS: Record<string, string> = {
  blue: '🔵', yellow: '🟡', green: '🟢', red: '🔴', purple: '🟣', gray: '⚪',
}

interface CalloutEditorProps {
  data: CalloutBlockContent
  onChange: (data: CalloutBlockContent) => void
  blockId: string
  dayId: number
}

export default function CalloutEditor({ data, onChange, blockId, dayId }: CalloutEditorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={data.emoji}
          onChange={(e) => onChange({ ...data, emoji: e.target.value })}
          className="w-12 text-center rounded-lg border border-gray-200 py-1 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          maxLength={2}
        />
        <div className="flex gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ ...data, color: c })}
              className={`rounded-full px-2 py-0.5 text-sm transition-all ${data.color === c ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
              title={c}
            >
              {COLOR_LABELS[c]}
            </button>
          ))}
        </div>
      </div>
      <input
        type="text"
        placeholder="Title (optional)…"
        value={data.title || ''}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <div className="rounded-lg border border-gray-200 p-2 bg-white">
        <RichTextEditor
          content={data.content}
          onUpdate={(html) => onChange({ ...data, content: html })}
          enableHighlight={false}
          placeholder="Callout content…"
          blockId={blockId}
          dayId={dayId}
        />
      </div>
    </div>
  )
}
