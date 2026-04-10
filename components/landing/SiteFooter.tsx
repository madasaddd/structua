import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="bg-[#f8fafc] border-t border-gray-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <span className="text-xl font-bold tracking-tight text-[#303e51]">Structua</span>
            <p className="text-xs text-gray-500">
              © 2024 Structua Academic Press. All intellectual property reserved.
            </p>
          </div>
          <div className="flex gap-6 text-sm font-medium text-gray-500">
            <Link href="#" className="hover:text-[#303e51] transition-colors">Give feedback</Link>
            <Link href="#" className="hover:text-[#303e51] transition-colors">Contact the creator</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
