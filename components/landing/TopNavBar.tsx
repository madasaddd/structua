import Link from 'next/link'

export default function TopNavBar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-[#111827]">Structua</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="#" className="text-sm font-medium text-gray-500 hover:text-[#111827] transition-colors">
            Library
          </Link>
          <Link
            href="/day/1"
            className="rounded-[12px] bg-[#111827] px-5 py-2 text-sm font-medium text-white transition-all hover:bg-[#3f6653]"
          >
            Access Portal
          </Link>
        </div>
      </div>
    </header>
  )
}
