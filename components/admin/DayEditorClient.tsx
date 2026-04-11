'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
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

/** Default valid contentData per block type — prevents null/empty DB writes */
const DEFAULT_CONTENT: Record<BlockType, object> = {
  text: { variant: 'body-md', content: '' },
  callout: { emoji: '💡', color: 'blue', content: '' },
  table: { headers: ['Column 1', 'Column 2'], rows: [['']] },
  divider: {},
  image: { url: '' },
}

const DRAFT_KEY = (dayId: number) => `structua_draft_${dayId}`
const DEBOUNCE_MS = 2000

export default function DayEditorClient({ day }: { day: DayData }) {
  const {
    blocks,
    setBlocks,
    addBlock,
    reorderBlocks,
    syncStatus,
    setSyncStatus,
    hasUnsavedChanges,
    markSaved,
  } = useBlockEditorStore()

  const [isPublished, setIsPublished] = useState(day.isPublished)
  const [savedDraft, setSavedDraft] = useState<Block[] | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // On mount: initialise the store and check for a locally-stored draft
  useEffect(() => {
    setBlocks(day.blocks)

    try {
      const raw = localStorage.getItem(DRAFT_KEY(day.id))
      if (raw) {
        const parsed = JSON.parse(raw) as Block[]
        setSavedDraft(parsed)
      }
    } catch {
      // ignore corrupt localStorage entry
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day.id])

  // Warn before navigating away with unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // ─── Core save ─────────────────────────────────────────────────────────────
  const saveBlocks = useCallback(
    async (blocksToSave: Block[]) => {
      setSyncStatus('saving')

      // Sanitise payload: always a plain object, never undefined/null/Date
      const payload = blocksToSave.map((b, i) => ({
        id: b.id,
        type: b.type,
        orderIndex: i * 1000,
        contentData:
          b.contentData && typeof b.contentData === 'object' && !Array.isArray(b.contentData)
            ? (b.contentData as object)
            : DEFAULT_CONTENT[b.type] ?? {},
      }))

      try {
        const res = await fetch(`/api/days/${day.id}/blocks`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blocks: payload }),
        })

        if (!res.ok) {
          // Persist draft locally so the admin doesn't lose work
          try {
            localStorage.setItem(DRAFT_KEY(day.id), JSON.stringify(blocksToSave))
          } catch { /* storage full — best-effort */ }
          const detail = await res.json().catch(() => ({}))
          console.error('[DayEditor] Save failed', res.status, detail)
          setSyncStatus('error')
          return
        }

        // Success — clear any stale draft
        localStorage.removeItem(DRAFT_KEY(day.id))
        setSavedDraft(null)
        markSaved()
      } catch (err) {
        try {
          localStorage.setItem(DRAFT_KEY(day.id), JSON.stringify(blocksToSave))
        } catch { /* best-effort */ }
        console.error('[DayEditor] Network error', err)
        setSyncStatus('error')
      }
    },
    [day.id, markSaved, setSyncStatus]
  )

  // ─── Debounced auto-save ───────────────────────────────────────────────────
  useEffect(() => {
    if (!hasUnsavedChanges) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => saveBlocks(blocks), DEBOUNCE_MS)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [blocks, hasUnsavedChanges, saveBlocks])

  // ─── Manual save ──────────────────────────────────────────────────────────
  const handleManualSave = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    saveBlocks(blocks)
  }

  // ─── DnD ──────────────────────────────────────────────────────────────────
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

  // ─── Add Block ─────────────────────────────────────────────────────────────
  const handleAddBlock = (type: BlockType) => {
    addBlock({
      dayId: day.id,
      type,
      orderIndex: blocks.length * 1000,
      contentData: DEFAULT_CONTENT[type] as any,
    } as any)
  }

  // ─── Publish toggle ────────────────────────────────────────────────────────
  const handlePublishToggle = async () => {
    const next = !isPublished
    setIsPublished(next)
    await fetch(`/api/days/${day.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: next }),
    })
  }

  // ─── Draft recovery ────────────────────────────────────────────────────────
  const handleRecoverDraft = () => {
    if (!savedDraft) return
    setBlocks(savedDraft)
    setSavedDraft(null)
    saveBlocks(savedDraft)
  }

  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_KEY(day.id))
    setSavedDraft(null)
  }

  // ─── Save button label ─────────────────────────────────────────────────────
  const saveLabel =
    syncStatus === 'saving'
      ? 'Saving…'
      : hasUnsavedChanges
      ? 'Save Now'
      : syncStatus === 'saved'
      ? '✓ Saved'
      : 'Save'

  return (
    <div className="mx-auto max-w-3xl p-6 pb-24">
      {/* Draft recovery banner */}
      {savedDraft && (
        <div className="mb-4 flex items-center justify-between gap-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
          <span className="text-amber-800">
            ⚠️ A draft from a previous failed save was found. Recover it?
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleRecoverDraft}
              className="rounded-md bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700"
            >
              Recover Draft
            </button>
            <button
              onClick={handleDiscardDraft}
              className="rounded-md border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400 mb-1">
            Week {day.week.order} · Day {day.globalDayIndex}
          </p>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{day.lessonTitle}</h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* Auto-save status indicator */}
          <span className={`text-xs font-medium transition-colors ${
            syncStatus === 'saving'  ? 'text-blue-500'  :
            syncStatus === 'saved'   ? 'text-green-600' :
            syncStatus === 'error'   ? 'text-red-500'   :
            hasUnsavedChanges       ? 'text-amber-500' : 'text-gray-400'
          }`}>
            {syncStatus === 'saving' && '⟳ Auto-saving…'}
            {syncStatus === 'saved' && !hasUnsavedChanges && '✓ All changes saved'}
            {syncStatus === 'error' && '✗ Save failed — draft stored locally'}
            {syncStatus === 'idle' && hasUnsavedChanges && '● Unsaved changes'}
          </span>

          <button
            id="save-changes-btn"
            onClick={handleManualSave}
            disabled={(!hasUnsavedChanges && syncStatus !== 'error') || syncStatus === 'saving'}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveLabel}
          </button>

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
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              <span>{emoji}</span> {label}
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Tip: type <kbd className="bg-gray-100 border border-gray-300 rounded px-1">/</kbd> in any
          text block for quick insert&nbsp;·&nbsp;Changes auto-save after 2s of inactivity
        </p>
      </div>
    </div>
  )
}
