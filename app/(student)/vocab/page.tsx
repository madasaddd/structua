import { prisma } from '@/lib/prisma'
import { WordlistCard } from '@/components/vocab/WordlistCard'

export const dynamic = 'force-dynamic'

export default async function VocabStudentPage() {
  const categories = await prisma.vocabCategory.findMany({
    orderBy: { orderIndex: 'asc' },
    include: {
      wordlists: {
        orderBy: { orderIndex: 'asc' },
        include: {
          vocabularies: {
            include: {
              collocations: true,
              wordFamilies: true,
            }
          }
        }
      }
    }
  })

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-12">
        Structua Vocab
      </h1>
      
      <div className="space-y-16">
        {categories.map((category) => (
          <section key={category.id} id={`category-${category.id}`} className="scroll-mt-12">
            <h2 className="text-2xl font-bold text-[#222631] mb-6">
              {category.name}
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-4">
              {category.wordlists.map((wordlist) => (
                <WordlistCard key={wordlist.id} wordlist={wordlist} category={category} />
              ))}
            </div>
            {category.wordlists.length === 0 && (
              <p className="text-sm text-gray-500 italic">No wordlists available yet.</p>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
