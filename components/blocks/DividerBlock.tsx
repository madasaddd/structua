import { DividerBlockContent } from '@/lib/validators/blocks'

export default function DividerBlock({ data }: { data: DividerBlockContent }) {
  return (
    <div className="relative py-8">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-200" />
      </div>
    </div>
  )
}
