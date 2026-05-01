import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import WordlistManager from './WordlistManager'

export default async function AdminWordlistEditorPage({ params }: { params: Promise<{ wordlistId: string }> | { wordlistId: string } }) {
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
      },
      discoveryTask: {
        include: {
          paragraphs: {
            include: {
              options: {
                include: {
                  questions: true
                }
              }
            }
          }
        }
      }
    }
  })

  if (!wordlist) notFound()

  return (
    <WordlistManager wordlist={wordlist} />
  )
}
