import { create } from 'zustand'
import { Block } from '@prisma/client'
import { arrayMove } from '@dnd-kit/sortable'

interface BlockEditorState {
  blocks: Block[]
  syncStatus: 'idle' | 'saving' | 'error'
  _debounceTimer: ReturnType<typeof setTimeout> | null

  setBlocks: (blocks: Block[]) => void
  addBlock: (block: Block) => void
  updateBlock: (id: string, contentData: object, type?: string) => void
  removeBlock: (id: string) => void
  reorderBlocks: (activeId: string, overId: string) => void
  setSyncStatus: (status: 'idle' | 'saving' | 'error') => void
}

export const useBlockEditorStore = create<BlockEditorState>((set, get) => ({
  blocks: [],
  syncStatus: 'idle',
  _debounceTimer: null,

  setBlocks: (blocks) => set({ blocks }),

  addBlock: (block) =>
    set((state) => ({ blocks: [...state.blocks, block] })),

  updateBlock: (id, contentData, type) =>
    set((state) => ({
      blocks: state.blocks.map((b) =>
        b.id === id
          ? { ...b, contentData: contentData as any, ...(type ? { type: type as any } : {}) }
          : b
      ),
    })),

  removeBlock: (id) =>
    set((state) => ({ blocks: state.blocks.filter((b) => b.id !== id) })),

  reorderBlocks: (activeId, overId) => {
    const { blocks } = get()
    const oldIndex = blocks.findIndex((b) => b.id === activeId)
    const newIndex = blocks.findIndex((b) => b.id === overId)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(blocks, oldIndex, newIndex)
    set({ blocks: reordered, syncStatus: 'saving' })

    // Debounced persist: fire after 500ms of inactivity
    const prev = get()._debounceTimer
    if (prev) clearTimeout(prev)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/blocks/reorder', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: get().blocks.map((b) => b.id) }),
        })
        if (!res.ok) throw new Error('Reorder failed')
        set({ syncStatus: 'idle' })
      } catch {
        set({ blocks, syncStatus: 'error' })
      }
    }, 500)
    set({ _debounceTimer: timer })
  },

  setSyncStatus: (status) => set({ syncStatus: status }),
}))
