import { prisma } from '@/lib/prisma'
import AdminVocabDashboardClient from './AdminVocabDashboardClient'

export default async function AdminVocabPage() {
  const categories = await prisma.vocabCategory.findMany({
    orderBy: { orderIndex: 'asc' },
    include: {
      wordlists: {
        orderBy: { orderIndex: 'asc' },
        include: {
          vocabularies: {
            select: { id: true }
          }
        }
      }
    }
  })

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Structua Vocab</h1>
      <AdminVocabDashboardClient initialCategories={categories} />
    </div>
  )
}
