import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const configId = resolvedParams.id
    const body = await request.json()
    
    const { type, name, baseUrl, apiKey, modelName, globalPrompt } = body

    if (!type || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Sequential queries (pgbouncer Transaction mode compatible)
    await prisma.aiConfig.deleteMany({ where: { type } })
    const config = await prisma.aiConfig.create({
      data: { type, name, baseUrl, apiKey, modelName, globalPrompt }
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating AI config:', error)
    return NextResponse.json({ error: 'Failed to update configuration' }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const type = resolvedParams.id === 'grammar' ? 'grammar' : 'vocab-discovery'
    
    const config = await prisma.aiConfig.findFirst({
      where: { type }
    })

    return NextResponse.json(config || { error: 'Not found' })
  } catch (error) {
    console.error('Error fetching AI config:', error)
    return NextResponse.json({ error: 'Failed to fetch configuration' }, { status: 500 })
  }
}
