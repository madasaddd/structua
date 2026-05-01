import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Bold from '@tiptap/extension-bold'
import { useEffect } from 'react'

export default function RichTextEditor({ 
  value, 
  onChange 
}: { 
  value: string, 
  onChange: (value: string) => void 
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bold: false // Disable default bold to override it
      }),
      Bold.extend({
        renderHTML({ HTMLAttributes }) {
          // Output <b> instead of <strong> to match the frontend expectations
          return ['b', HTMLAttributes, 0]
        },
      })
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none min-h-[150px] font-sans leading-relaxed prose prose-sm max-w-none prose-p:my-1',
      },
    },
    onUpdate: ({ editor }) => {
      // Get HTML, but tiptap wraps in <p>. We can just save the raw HTML.
      onChange(editor.getHTML())
    },
  })

  // Update content when value changes externally (e.g. switching tabs/options)
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  return (
    <EditorContent editor={editor} />
  )
}
