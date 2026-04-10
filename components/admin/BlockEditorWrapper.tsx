'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Block, BlockType } from '@prisma/client'
import { useBlockEditorStore } from '@/lib/stores/useBlockEditorStore'
import TextEditor from './blocks/TextEditor'
import CalloutEditor from './blocks/CalloutEditor'
import TableEditor from './blocks/TableEditor'
import ImageEditor from './blocks/ImageEditor'
import { TextBlockContent, CalloutBlockContent, TableBlockContent, ImageBlockContent } from '@/lib/validators/blocks'
import { useCallback } from 'react'

function DividerPlaceholder() {
  return <div className="flex items-center gap-2 py-3"><div className="flex-1 border-t border-gray-300" /><span className="text-xs text-gray-400">Divider</span><div className="flex-1 border-t border-gray-300" /></div>
}

interface BlockEditorWrapperProps {
  block: Block
  dayId: number
}

export default function BlockEditorWrapper({ block, dayId }: BlockEditorWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const { updateBlock, removeBlock } = useBlockEditorStore()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleContentChange = useCallback((contentData: object) => {
    updateBlock(block.id, contentData)
  }, [block.id, updateBlock])

  const handleDelete = () => {
    removeBlock(block.id)
  }

  const renderEditor = () => {
    switch (block.type) {
      case BlockType.text:
        return <TextEditor data={block.contentData as any as TextBlockContent} onChange={handleContentChange} blockId={block.id} dayId={dayId} />
      case BlockType.callout:
        return <CalloutEditor data={block.contentData as any as CalloutBlockContent} onChange={handleContentChange} blockId={block.id} dayId={dayId} />
      case BlockType.table:
        return <TableEditor data={block.contentData as any as TableBlockContent} onChange={handleContentChange} />
      case BlockType.image:
        return <ImageEditor data={block.contentData as any as ImageBlockContent} onChange={handleContentChange} />
      case BlockType.divider:
        return <DividerPlaceholder />
      default:
        return null
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="group relative flex gap-2 items-start">
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-3 shrink-0 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Drag to reorder"
      >
        ⠿
      </button>

      {/* Block Content */}
      <div className="flex-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{block.type}</span>
          <button
            onClick={handleDelete}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            🗑 Delete
          </button>
        </div>
        {renderEditor()}
      </div>
    </div>
  )
}
