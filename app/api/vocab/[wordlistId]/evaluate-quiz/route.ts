import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ wordlistId: string }> | { wordlistId: string } }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    const { student_submission } = body

    if (!Array.isArray(student_submission)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Determine the question type from the first submission (case-insensitive)
    const firstSubmissionType = student_submission[0]?.type?.toLowerCase()
    
    const typeMapping: Record<string, string> = {
      'cloze test': 'vocab-quiz-cloze',
      'collocation matching': 'vocab-quiz-collocation',
      'word mapping (morphology)': 'vocab-quiz-morphology',
      'pushed output': 'vocab-quiz-pushed'
    }

    const aiConfigType = firstSubmissionType ? (typeMapping[firstSubmissionType] || 'vocab-quiz') : 'vocab-quiz'

    // Fetch AI config for quiz, trying specific type first
    let config = await prisma.aiConfig.findFirst({
      where: { type: aiConfigType }
    })

    // Fallback to legacy 'vocab-quiz' if specific config not found
    if (!config && aiConfigType !== 'vocab-quiz') {
      config = await prisma.aiConfig.findFirst({
        where: { type: 'vocab-quiz' }
      })
    }

    if (!config || !config.baseUrl || !config.apiKey || !config.modelName) {
      return NextResponse.json({ error: 'AI Configuration missing or incomplete' }, { status: 500 })
    }

    // Build the structured JSON to send to the AI
    const userMessage = JSON.stringify({ student_submission }, null, 2)

    const systemPrompt = config.globalPrompt || 'You are an English language evaluator for quizzes.'
    
    // Append strict JSON instruction
    const finalSystemPrompt = `${systemPrompt}

You MUST return your response as a raw JSON object with the following structure:
{
  "results": [
    {
      "question_id": "the id of the question",
      "status": "correct", "incorrect", or "could_be_improved",
      "reason": "explanation of why the answer is correct or incorrect based on grammatical and semantic correctness in context"
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
    let aiContent = data.choices?.[0]?.message?.content || '{}'
    
    // Sanitize aiContent to remove markdown code blocks
    aiContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    try {
      const parsedData = JSON.parse(aiContent)
      console.log('Parsed AI Response:', JSON.stringify(parsedData, null, 2))
      return NextResponse.json(parsedData)
    } catch (parseErr) {
      console.error('Failed to parse AI JSON:', aiContent)
      return NextResponse.json({ error: 'AI returned malformed JSON', rawContent: aiContent }, { status: 500 })
    }

  } catch (error) {
    console.error('Error evaluating quiz:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
