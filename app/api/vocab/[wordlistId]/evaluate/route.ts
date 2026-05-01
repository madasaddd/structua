import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ wordlistId: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    const { context, tasks } = body

    if (!context?.paragraph || !Array.isArray(tasks)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Fetch AI config
    const config = await prisma.aiConfig.findFirst({
      where: { type: 'vocab-discovery' }
    })

    if (!config || !config.baseUrl || !config.apiKey || !config.modelName) {
      return NextResponse.json({ error: 'AI Configuration missing or incomplete' }, { status: 500 })
    }

    // Build the structured JSON to send to the AI
    const userMessage = JSON.stringify({ context, tasks }, null, 2)

    const systemPrompt = config.globalPrompt || 'You are an English language evaluator.'
    
    // Append strict JSON instruction
    const finalSystemPrompt = `${systemPrompt}

You MUST return your response as a raw JSON object with the following structure:
{
  "results": [
    {
      "status": "correct" or "incorrect",
      "vocabulary": "the word being evaluated",
      "part_of_speech": "noun, verb, etc.",
      "reason": "explanation of why the answer is correct or incorrect",
      "definition_eng": "dictionary definition of the word in English"
    }
  ]
}
`

    const baseUrl = config.baseUrl.replace(/\/$/, '')
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.modelName,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: finalSystemPrompt },
          { role: 'user', content: userMessage }
        ]
      })
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('AI Error:', errText)
      return NextResponse.json({ error: 'AI request failed' }, { status: res.status })
    }

    const data = await res.json()
    const aiContent = data.choices?.[0]?.message?.content || '{}'
    
    try {
      const parsedData = JSON.parse(aiContent)
      return NextResponse.json(parsedData)
    } catch (parseErr) {
      console.error('Failed to parse AI JSON:', aiContent)
      return NextResponse.json({ error: 'AI returned malformed JSON' }, { status: 500 })
    }

  } catch (error) {
    console.error('Error evaluating discovery:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
