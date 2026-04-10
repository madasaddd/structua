import Link from 'next/link'

export default function CtaSection() {
  return (
    <section className="bg-[#111827] px-6 py-24 text-center md:py-32 relative overflow-hidden">
      {/* Subtle background glow effect if desired, otherwise pure dark */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#111827] to-[#1e293b] opacity-50"></div>
      
      <div className="relative z-10 mx-auto max-w-3xl flex flex-col items-center">
        <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
          Targetkan Skor Band 7+ Sekarang.
        </h2>
        <p className="mb-10 text-[17px] leading-[1.6] text-gray-300 md:text-lg">
          Kuasai konstruksi kalimat kompleks dan kosakata strategis melalui kurikulum 50 hari yang terukur.
        </p>
        <Link
          href="/day/1"
          className="inline-flex items-center justify-center rounded-[12px] bg-white px-8 py-3.5 text-base font-semibold text-[#111827] transition-colors hover:bg-gray-100 shadow-md"
        >
          Get Started with Structua
        </Link>
      </div>
    </section>
  )
}
