import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { VocabularyAccordion } from '@/components/vocab/VocabularyAccordion'
import { NoContentFeature } from '@/components/NoContentFeature'

export default async function WordlistDetailPage({ params }: { params: Promise<{ wordlistId: string }> | { wordlistId: string } }) {
  const resolvedParams = await params;
  const wordlist = await prisma.wordlist.findUnique({
    where: { id: resolvedParams.wordlistId },
    include: {
      category: true,
      vocabularies: {
        include: {
          collocations: true,
          wordFamilies: true,
        }
      }
    }
  })

  if (!wordlist) {
    notFound()
  }

  if (wordlist.vocabularies.length === 0) {
    return <NoContentFeature backHref="/vocab" />
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div>
           <Link href="/vocab" className="text-sm text-blue-600 hover:underline mb-3 inline-block">← Back to Category</Link>
           <p className="text-sm text-gray-500 font-medium mb-1">{wordlist.category.name}</p>
           <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
             {wordlist.title}
           </h1>
           {wordlist.description && (
             <p className="text-gray-500 mt-2">{wordlist.description}</p>
           )}
        </div>

        <div className="space-y-4">
          {wordlist.vocabularies.map(vocab => (
            <VocabularyAccordion key={vocab.id} vocab={vocab} />
          ))}
        </div>
      </div>

      {/* Sticky Right Widget */}
      <div className="w-full lg:w-72 shrink-0">
        <div className="sticky top-10 w-full flex flex-col gap-4">
          <div className="w-full flex flex-col gap-1 p-1 bg-white rounded-xl shadow-md group">
          {/* Top Container */}
          <div 
            className="w-full h-20 flex justify-center items-center rounded-lg relative overflow-hidden"
            style={{
              background: (() => {
                const baseColor = wordlist.category?.labelColor || '#D3E0FB';
                const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(baseColor);
                const color100 = isValidHex ? `${baseColor}33` : 'rgba(255,255,255,0)';
                return `linear-gradient(180deg, ${baseColor} 0%, ${color100} 100%)`;
              })()
            }}
          >
            {/* Left object */}
            <img 
              src="/icons/wordlist-left.svg" 
              alt="" 
              className="absolute transition-all duration-300 ease-out opacity-0 translate-x-0 group-hover:opacity-100 group-hover:-translate-x-[52px] z-0 w-[48px] h-[64px]" 
            />
            {/* Right object */}
            <img 
              src="/icons/wordlist-right.svg" 
              alt="" 
              className="absolute transition-all duration-300 ease-out opacity-0 translate-x-0 group-hover:opacity-100 group-hover:translate-x-[52px] z-0 w-[50px] h-[64px]" 
            />
            {/* Middle object (Default) */}
            <img 
              src="/icons/wordlist-center.svg" 
              alt="" 
              className="absolute transition-all duration-300 opacity-100 group-hover:opacity-0 z-10 w-[72px] h-[64px]" 
            />
            {/* Middle object (Hovered) */}
            <img 
              src="/icons/wordlist-center-hovered.svg" 
              alt="" 
              className="absolute transition-all duration-300 opacity-0 group-hover:opacity-100 z-10 w-[72px] h-[64px]" 
            />
          </div>

          {/* Bottom Container */}
          <div className="w-full flex flex-col gap-1 p-2">
            {/* Text container */}
            <div className="flex w-full items-center justify-between pb-1">
              <h3 
                className="font-medium text-[#222631] truncate mr-2" 
                style={{ fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif', fontSize: '16px', lineHeight: '1.32', letterSpacing: '-0.005em' }}
              >
                Practice!
              </h3>
              <p 
                className="font-medium text-[#657084] whitespace-nowrap" 
                style={{ fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif', fontSize: '12px', lineHeight: '1.44', letterSpacing: '-0.005em' }}
              >
                {wordlist.vocabularies.length} Vocabulary
              </p>
            </div>

            {/* Button container */}
            <div className="flex flex-col w-full gap-2">
              <Link href={`/vocab/${wordlist.id}/discovery`} className="flex w-full items-center justify-center rounded-lg bg-white border border-[#F2F2F2] px-2 py-2.5 text-[14px] font-medium text-[#222631] hover:bg-gray-50 transition-colors" style={{ fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif' }}>
                Discover Them
              </Link>
              <Link href={`/vocab/${wordlist.id}/quiz`} className="flex w-full items-center justify-center rounded-lg bg-white border border-[#F2F2F2] px-2 py-2.5 text-[14px] font-medium text-[#222631] hover:bg-gray-50 transition-colors" style={{ fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif' }}>
                Quick Quiz
              </Link>
              <Link href={`/vocab/${wordlist.id}/paraphrase`} className="flex w-full items-center justify-center rounded-lg bg-white border border-[#F2F2F2] px-2 py-2.5 text-[14px] font-medium text-[#222631] hover:bg-gray-50 transition-colors" style={{ fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif' }}>
                Practice Paraphrase
              </Link>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
