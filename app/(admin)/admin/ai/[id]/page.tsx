import { prisma } from '@/lib/prisma'
import AiConfigForm from './AiConfigForm'

export default async function EditAiConfigPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const configId = resolvedParams.id
  
  const typeMapping: Record<string, string> = {
    'grammar': 'grammar',
    'vocab-discovery': 'vocab-discovery'
  }

  const type = typeMapping[configId] || configId

  const config = await prisma.aiConfig.findFirst({
    where: { type }
  })

  // Serialize to plain object — Next.js cannot pass Prisma Date objects to Client Components
  const serializedConfig = config ? {
    ...config,
    updatedAt: config.updatedAt.toISOString()
  } : null

  return <AiConfigForm initialData={serializedConfig} configId={configId} />
}
