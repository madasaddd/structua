import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="bg-white px-6 pb-24 pt-32 text-center md:pt-40 md:pb-32">
      <div className="mx-auto max-w-4xl flex flex-col items-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-1.5 rounded-full bg-[#e6f4ea] px-3 py-1 text-xs font-bold tracking-wide text-[#3f6653] uppercase">
          <span>🚀</span> BOOST YOUR IELTS SCORE
        </div>

        {/* Headlines */}
        <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-[-0.02em] text-[#111827] sm:text-6xl md:text-7xl">
          Structured Learning.<br />
          Independent Mastery.
        </h1>
        
        <p className="mx-auto max-w-2xl mb-10 text-[17px] leading-[1.6] text-gray-500 sm:text-lg">
          Sistem belajar yang dirancang khusus untuk memperkuat <em>lexical resource</em> serta <em>grammatical range & accuracy</em> kamu secara maksimal.
        </p>

        {/* CTA */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/day/1"
            className="rounded-[12px] bg-[#111827] hover:bg-gradient-to-r hover:from-[#111827] hover:to-[#475569] px-8 py-3.5 text-base font-semibold text-white transition-all shadow-sm hover:shadow"
          >
            Belajar Sekarang &rarr;
          </Link>
        </div>

        {/* Divider & Social Proof */}
        <div className="mt-20 w-full max-w-2xl border-t border-gray-100 pt-10">
          <div className="grid grid-cols-2 gap-8 text-[#111827]">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold tracking-tight mb-1">100+</span>
              <span className="text-sm font-medium text-gray-500">Pelajar telah mencoba</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold tracking-tight mb-1">10+</span>
              <span className="text-sm font-medium text-gray-500">Tutor yang mengkurasi</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
