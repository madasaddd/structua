import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ wordlistId: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    const { original_paragraph, user_answer, hint_vocabularies } = body

    if (!original_paragraph || !user_answer || !Array.isArray(hint_vocabularies)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Fetch AI config
    const config = await prisma.aiConfig.findFirst({
      where: { type: 'vocab-paraphrase' }
    })

    if (!config || !config.baseUrl || !config.apiKey || !config.modelName) {
      return NextResponse.json({ error: 'AI Configuration missing or incomplete' }, { status: 500 })
    }

    // Fetch Grammar Materials (published Days)
    const publishedDays = await prisma.day.findMany({
      where: { isPublished: true },
      select: { id: true, lessonTitle: true },
      orderBy: { order: 'asc' }
    })

    const grammar_materials = publishedDays.map(d => ({
      id: String(d.id),
      topic: d.lessonTitle
    }))

    // Build the structured JSON to send to the AI
    const userMessage = JSON.stringify({ 
      original_paragraph, 
      user_answer, 
      hint_vocabularies,
      grammar_materials
    }, null, 2)

    const systemPrompt = config.globalPrompt || 'You are an IELTS writing evaluator.'
    
    // Append strict JSON instruction matching the planned output schema
    const finalSystemPrompt = `${systemPrompt}

You MUST return your response as a raw JSON object with exactly this structure:
{
  "top_badge": "string",
  "lexical_resources": [
    {
      "user_wrote": "string",
      "wordlist_base": "string or null",
      "upgrade_options": ["string", "string"]
    }
  ],
  "grammatical_range_accuracy": {
    "text_segments": [
      { "type": "text", "value": "..." },
      { "type": "correction", "original": "...", "correction": "..." }
    ],
    "error_topic_ids": ["string"]
  },
  "cohesive_devices": {
    "judgment": "string",
    "suggestions": [
      {
        "note": "string",
        "examples": ["string"]
      }
    ]
  },
  "model_answer": {
    "text_segments": [
      { "type": "neutral", "value": "..." },
      { "type": "wordlist", "value": "..." },
      { "type": "upgrade", "value": "..." }
    ],
    "model_answer_grammar_topic_ids": ["string"]
  }
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
      
      // Enrich with grammar material titles
      if (parsedData.grammatical_range_accuracy?.error_topic_ids) {
        parsedData.grammatical_range_accuracy.error_topics = parsedData.grammatical_range_accuracy.error_topic_ids.map((id: string) => {
          const match = grammar_materials.find(m => m.id === id)
          return match ? { id, title: match.topic } : { id, title: 'Unknown Topic' }
        })
      }

      if (parsedData.model_answer?.model_answer_grammar_topic_ids) {
        parsedData.model_answer.grammar_topics = parsedData.model_answer.model_answer_grammar_topic_ids.map((id: string) => {
          const match = grammar_materials.find(m => m.id === id)
          return match ? { id, title: match.topic } : { id, title: 'Unknown Topic' }
        })
      }

      return NextResponse.json(parsedData)
    } catch (parseErr) {
      console.error('Failed to parse AI JSON:', aiContent)
      return NextResponse.json({ error: 'AI returned malformed JSON' }, { status: 500 })
    }

  } catch (error) {
    console.error('Error evaluating paraphrase:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
