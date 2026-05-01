import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import DiscoveryClient from './DiscoveryClient'

export default async function DiscoveryPage({ params }: { params: Promise<{ wordlistId: string }> | { wordlistId: string } }) {
  const resolvedParams = await params
  
  const wordlist = await prisma.wordlist.findUnique({
    where: { id: resolvedParams.wordlistId },
    include: {
      category: true,
      vocabularies: { orderBy: { word: 'asc' } },
      discoveryTask: {
        include: {
          paragraphs: {
            orderBy: { orderIndex: 'asc' },
            include: {
              options: {
                include: {
                  questions: { orderBy: { orderIndex: 'asc' } }
                }
              }
            }
          }
        }
      }
    }
  })

  if (!wordlist || !wordlist.discoveryTask || wordlist.discoveryTask.paragraphs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Discovery Task Not Found</h1>
        <p className="text-gray-500">There are no discovery tasks available for this wordlist yet.</p>
      </div>
    )
  }

  return <DiscoveryClient wordlist={wordlist} />
}
