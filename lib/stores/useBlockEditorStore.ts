import { create } from 'zustand'
import { Block } from '@prisma/client'
import { arrayMove } from '@dnd-kit/sortable'

interface BlockEditorState {
  blocks: Block[]
  syncStatus: 'idle' | 'saving' | 'error' | 'saved'
  hasUnsavedChanges: boolean

  setBlocks: (blocks: Block[]) => void
  addBlock: (block: Omit<Block, 'id'> & { id?: string }) => void
  updateBlock: (id: string, contentData: object, type?: string) => void
  removeBlock: (id: string) => void
  reorderBlocks: (activeId: string, overId: string) => void
  setSyncStatus: (status: 'idle' | 'saving' | 'error' | 'saved') => void
  markSaved: () => void
}

export const useBlockEditorStore = create<BlockEditorState>((set, get) => ({
  blocks: [],
  syncStatus: 'idle',
  hasUnsavedChanges: false,

  setBlocks: (blocks) => set({ blocks, hasUnsavedChanges: false }),

  addBlock: (block) => {
    // Generate a temporary ID for local drafting
    const newBlock = { ...block, id: block.id || `temp-${Date.now()}` } as Block
    set((state) => ({ 
      blocks: [...state.blocks, newBlock],
      hasUnsavedChanges: true,
      syncStatus: 'idle' 
    }))
  },

  updateBlock: (id, contentData, type) =>
    set((state) => ({
      blocks: state.blocks.map((b) =>
        b.id === id
          ? { ...b, contentData: contentData as any, ...(type ? { type: type as any } : {}) }
          : b
      ),
      hasUnsavedChanges: true,
      syncStatus: 'idle'
    })),

  removeBlock: (id) =>
    set((state) => ({ 
      blocks: state.blocks.filter((b) => b.id !== id),
      hasUnsavedChanges: true,
      syncStatus: 'idle'
    })),

  reorderBlocks: (activeId, overId) => {
    const { blocks } = get()
    const oldIndex = blocks.findIndex((b) => b.id === activeId)
    const newIndex = blocks.findIndex((b) => b.id === overId)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(blocks, oldIndex, newIndex)
    set({ 
      blocks: reordered, 
      hasUnsavedChanges: true,
      syncStatus: 'idle'
    })
  },

  setSyncStatus: (status) => set({ syncStatus: status }),
  
  markSaved: () => set({ hasUnsavedChanges: false, syncStatus: 'saved' }),
}))
