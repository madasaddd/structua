'use client'

import { useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { BlockType } from '@prisma/client'
import { useBlockEditorStore } from '@/lib/stores/useBlockEditorStore'

const SLASH_COMMANDS = [
  { label: '/callout', description: 'Add highlighted callout box', type: 'callout' as BlockType },
  { label: '/table', description: 'Add data table', type: 'table' as BlockType },
  { label: '/image', description: 'Upload an image', type: 'image' as BlockType },
  { label: '/divider', description: 'Add horizontal rule', type: 'divider' as BlockType },
]

function createSlashPlugin(onCommand: (type: BlockType) => void) {
  let menuEl: HTMLDivElement | null = null
  let selectedIndex = 0
  let active = false
  let filtered = SLASH_COMMANDS

  const hide = () => {
    active = false
    if (menuEl) { menuEl.style.display = 'none' }
  }

  const show = (anchor: HTMLElement, query: string) => {
    active = true
    filtered = SLASH_COMMANDS.filter(
      (c) => c.label.slice(1).startsWith(query) || c.description.toLowerCase().includes(query)
    )
    if (filtered.length === 0) { hide(); return }
    selectedIndex = 0

    if (!menuEl) {
      menuEl = document.createElement('div')
      menuEl.className = [
        'absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 w-64',
        'text-sm overflow-hidden',
      ].join(' ')
      document.body.appendChild(menuEl)
    }

    const rect = anchor.getBoundingClientRect()
    menuEl.style.display = 'block'
    menuEl.style.left = `${rect.left + window.scrollX}px`
    menuEl.style.top = `${rect.bottom + window.scrollY + 4}px`

    render()
  }

  const render = () => {
    if (!menuEl) return
    menuEl.innerHTML = ''
    filtered.forEach((cmd, i) => {
      const item = document.createElement('button')
      item.className = `flex flex-col w-full px-3 py-2 text-left transition-colors ${
        i === selectedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
      }`
      item.innerHTML = `<span class="font-medium">${cmd.label}</span><span class="text-xs text-gray-400">${cmd.description}</span>`
      item.addEventListener('mousedown', (e) => {
        e.preventDefault()
        onCommand(cmd.type)
        hide()
      })
      menuEl!.appendChild(item)
    })
  }

  return new Plugin({
    key: new PluginKey('slashCommand'),
    view() {
      return {
        update(view) {
          const { state } = view
          const { selection } = state
          const { $from } = selection
          const lineText = $from.parent.textBetween(0, $from.parentOffset, undefined, '\ufffc')
          const slashIdx = lineText.lastIndexOf('/')
          if (slashIdx !== -1) {
            const query = lineText.slice(slashIdx + 1).toLowerCase()
            const el = view.domAtPos($from.pos)?.node?.parentElement as HTMLElement | null
            if (el) show(el, query)
          } else {
            hide()
          }
        },
        destroy() {
          if (menuEl) { document.body.removeChild(menuEl); menuEl = null }
        },
      }
    },
    props: {
      handleKeyDown(_view, event) {
        if (!active || !filtered.length) return false
        if (event.key === 'ArrowDown') {
          selectedIndex = (selectedIndex + 1) % filtered.length
          render(); return true
        }
        if (event.key === 'ArrowUp') {
          selectedIndex = (selectedIndex - 1 + filtered.length) % filtered.length
          render(); return true
        }
        if (event.key === 'Enter') {
          onCommand(filtered[selectedIndex].type); hide(); return true
        }
        if (event.key === 'Escape') { hide(); return true }
        return false
      },
    },
  })
}

function SlashCommandExtension(onCommand: (type: BlockType) => void) {
  return Extension.create({
    name: 'slashCommand',
    addProseMirrorPlugins() {
      return [createSlashPlugin(onCommand)]
    },
  })
}

interface RichTextEditorProps {
  content: string
  onUpdate: (html: string) => void
  enableHighlight?: boolean
  placeholder?: string
  blockId: string
  dayId: number
}

export default function RichTextEditor({
  content,
  onUpdate,
  enableHighlight = false,
  blockId,
  dayId,
}: RichTextEditorProps) {
  const addBlock = useBlockEditorStore((s) => s.addBlock)

  const handleSlashCommand = useCallback(
    async (type: BlockType) => {
      try {
        const res = await fetch('/api/blocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dayId, type }),
        })
        if (!res.ok) return
        const block = await res.json()
        addBlock(block)
      } catch (e) {
        console.error(e)
      }
    },
    [dayId, addBlock]
  )

  const editor = useEditor({
    extensions: [
      StarterKit,
      ...(enableHighlight ? [Highlight.configure({ multicolor: true })] : []),
      SlashCommandExtension(handleSlashCommand),
    ],
    content,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onUpdate(editor.getHTML())
    },
  })

  if (!editor) return null

  return (
    <div className="rich-text-editor">
      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 pb-1 mb-1 border-b border-gray-100">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run() }}
          className={`p-1.5 rounded text-xs font-bold hover:bg-gray-100 transition-colors ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
        >B</button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }}
          className={`p-1.5 rounded text-xs italic hover:bg-gray-100 transition-colors ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
        >I</button>
        {enableHighlight && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run() }}
            className={`p-1.5 rounded text-xs hover:bg-gray-100 transition-colors ${editor.isActive('highlight') ? 'bg-yellow-200' : ''}`}
          >
            <span className="bg-yellow-200 px-0.5 rounded">H</span>
          </button>
        )}
      </div>

      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[1.5em]"
      />
    </div>
  )
}
