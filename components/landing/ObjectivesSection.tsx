'use client'

import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'

export default function ObjectivesSection() {
  return (
    <section className="bg-[#f7f9fb] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="mb-4 block text-xs font-bold tracking-[0.1em] text-[#3f6653] uppercase">
            CORE OBJECTIVES
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-[#111827] md:text-4xl">
            Mastering the IELTS Core
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          
          {/* Card A */}
          <div className="flex flex-col rounded-[12px] bg-white p-8 sm:p-10 shadow-[0_4px_24px_rgba(25,28,30,0.06)] transition-all hover:shadow-[0_8px_32px_rgba(25,28,30,0.08)] relative z-10">
            <img src="/icons/icon-gra.png" alt="Grammatical Range & Accuracy" className="mb-6 h-16 w-16 object-contain" />
            <h3 className="mb-3 text-xl font-bold tracking-tight text-[#111827]">
              Advanced Syntax Mastery
            </h3>
            <p className="mb-8 flex-grow text-[15px] leading-[1.6] text-gray-500">
              Program menguasai struktur complex-compound sentences secara mandiri untuk meningkatkan Grammatical Range &amp; Accuracy.
            </p>
            <Link
              href="/day/1"
              className="inline-flex w-fit items-center justify-center rounded-[12px] bg-[#111827] hover:bg-[#3f6653] px-6 py-2.5 text-sm font-medium text-white transition-colors"
            >
              Learn grammar
            </Link>
          </div>

          {/* Card B */}
          <div className="flex flex-col rounded-[12px] bg-white p-8 sm:p-10 shadow-[0_4px_24px_rgba(25,28,30,0.06)] transition-all hover:shadow-[0_8px_32px_rgba(25,28,30,0.08)] relative z-10">
            <img src="/icons/icon-lr.png" alt="Lexical Resource" className="mb-6 h-16 w-16 object-contain" />
            <h3 className="mb-3 text-xl font-bold tracking-tight text-[#111827]">
              High-Precision Lexical Depth
            </h3>
            <p className="mb-8 flex-grow text-[15px] leading-[1.6] text-gray-500">
              Perluas kosakata akademik sesuai topik IELTS melalui framework kognitif yang sistematis: <em>Discover, Practice, &amp; Review</em>.
            </p>
            
            <Dialog>
              <DialogTrigger 
                render={
                  <button
                    className="inline-flex w-fit items-center justify-center rounded-[12px] bg-[#111827] hover:bg-[#3f6653] px-6 py-2.5 text-sm font-medium text-white transition-colors"
                  >
                    Learn New Vocabularies
                  </button>
                }
              />
              <DialogContent className="sm:max-w-md rounded-[12px]">
                <DialogHeader>
                  <DialogTitle className="text-[#111827]">Fitur Belum Tersedia</DialogTitle>
                  <DialogDescription className="text-gray-500 leading-relaxed mt-2">
                    Wah maaf banget, fitur ini lagi development :)
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-6 flex justify-end">
                  <DialogClose 
                    render={
                      <button className="rounded-[12px] bg-[#111827] hover:bg-[#3f6653] px-5 py-2 text-sm font-medium text-white transition-colors">
                        ok, mengerti
                      </button>
                    } 
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>

        </div>
      </div>
    </section>
  )
}
