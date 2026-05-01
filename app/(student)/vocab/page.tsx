import { prisma } from '@/lib/prisma'
import { WordlistCard } from '@/components/vocab/WordlistCard'

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
            <h2 className="text-2xl font-bold text-slate-700 mb-6 border-b pb-2">
              {category.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
