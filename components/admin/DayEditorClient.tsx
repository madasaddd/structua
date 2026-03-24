'use client'

import { useEffect, useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Block, BlockType } from '@prisma/client'
import { useBlockEditorStore } from '@/lib/stores/useBlockEditorStore'
import BlockEditorWrapper from '@/components/admin/BlockEditorWrapper'

type DayData = {
  id: number
  lessonTitle: string
  order: number
  globalDayIndex: number
  isPublished: boolean
  week: { order: number; themeTitle: string }
  blocks: Block[]
}

const ADD_BLOCK_TYPES: { type: BlockType; label: string; emoji: string }[] = [
  { type: BlockType.text, label: 'Text', emoji: '📝' },
  { type: BlockType.callout, label: 'Callout', emoji: '💡' },
  { type: BlockType.table, label: 'Table', emoji: '📊' },
  { type: BlockType.image, label: 'Image', emoji: '🖼' },
  { type: BlockType.divider, label: 'Divider', emoji: '—' },
]

export default function DayEditorClient({ day }: { day: DayData }) {
  const { blocks, setBlocks, addBlock, reorderBlocks, syncStatus } = useBlockEditorStore()
  const [isPublished, setIsPublished] = useState(day.isPublished)
  const [addingBlock, setAddingBlock] = useState(false)

  useEffect(() => {
    setBlocks(day.blocks)
  }, [day.blocks, setBlocks])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorderBlocks(active.id as string, over.id as string)
    }
  }

  const handleAddBlock = async (type: BlockType) => {
    setAddingBlock(true)
    try {
      const res = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayId: day.id, type }),
      })
      if (!res.ok) return
      const block = await res.json()
      addBlock(block)
    } finally {
      setAddingBlock(false)
    }
  }

  const handlePublishToggle = async () => {
    const next = !isPublished
    setIsPublished(next)
    await fetch(`/api/days/${day.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: next }),
    })
  }

  return (
    <div className="mx-auto max-w-3xl p-6 pb-24">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400 mb-1">
            Week {day.week.order} · Day {day.globalDayIndex}
          </p>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{day.lessonTitle}</h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {syncStatus === 'saving' && <span className="text-xs text-gray-400 animate-pulse">Saving…</span>}
          {syncStatus === 'error' && <span className="text-xs text-red-500">Save failed</span>}
          <button
            onClick={handlePublishToggle}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              isPublished
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isPublished ? '✓ Published' : 'Draft'}
          </button>
        </div>
      </div>

      {/* Block List */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {blocks.map((block) => (
              <BlockEditorWrapper key={block.id} block={block} dayId={day.id} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && (
        <div className="py-16 text-center text-gray-400">
          <p className="text-4xl mb-3">✏️</p>
          <p className="text-sm font-medium">This day is empty.</p>
          <p className="text-xs">Use the buttons below to add your first block.</p>
        </div>
      )}

      {/* Add Block Bar */}
      <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-3">
        <p className="text-xs text-gray-400 text-center mb-2 font-medium">Add Block</p>
        <div className="flex flex-wrap justify-center gap-2">
          {ADD_BLOCK_TYPES.map(({ type, label, emoji }) => (
            <button
              key={type}
              onClick={() => handleAddBlock(type)}
              disabled={addingBlock}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors disabled:opacity-50"
            >
              <span>{emoji}</span> {label}
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Tip: type <kbd className="bg-gray-100 border border-gray-300 rounded px-1">/</kbd> in any text block for quick insert
        </p>
      </div>
    </div>
  )
}
