import { NoContentFeature } from '@/components/NoContentFeature'

export default async function ParaphrasePage({ params }: { params: Promise<{ wordlistId: string }> | { wordlistId: string } }) {
  const resolvedParams = await params
  
  // Practice Paraphrase feature is currently under construction.
  // We immediately return the NoContentFeature for now.
  return <NoContentFeature backHref={`/vocab/${resolvedParams.wordlistId}`} />
}
