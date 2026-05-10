import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import DiscoveryClient from './DiscoveryClient'
import { NoContentFeature } from '@/components/NoContentFeature'

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
    return <NoContentFeature backHref={`/vocab/${resolvedParams.wordlistId}`} />
  }

  return <DiscoveryClient wordlist={wordlist} />
}
