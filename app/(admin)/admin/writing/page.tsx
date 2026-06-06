import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminWritingPage() {
  const categories = await prisma.vocabCategory.findMany({
    where: {
      name: {
        not: 'Writing Task 1'
      }
    },
    orderBy: { orderIndex: 'asc' },
    include: {
      _count: {
        select: { writingPromptGroups: true }
      }
    }
  })

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-[#475569] mb-8">Structua Writing</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex flex-col">
            <h2 className="font-bold text-[#334155] text-lg mb-1">{cat.name}</h2>
            <p className="text-xs text-[#94A3B8] mb-6">{cat._count.writingPromptGroups} prompt{cat._count.writingPromptGroups !== 1 ? 's' : ''}</p>
            
            <div className="mt-auto">
              <Link 
                href={`/admin/writing/${cat.id}`}
                className="block w-full py-2 bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#334155] text-center rounded-md font-medium text-sm transition-colors"
              >
                Manage Content
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
