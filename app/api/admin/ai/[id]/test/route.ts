import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { baseUrl, apiKey, modelName } = body

    if (!baseUrl || !apiKey || !modelName) {
      return NextResponse.json({ error: 'Missing required configuration for testing' }, { status: 400 })
    }

    // Assuming OpenAI-compatible endpoint for testing, or generic REST
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: 'Say "Test successful" if you receive this.' }],
        max_tokens: 10
      })
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('AI Test Error Response:', errorText)
      return NextResponse.json({ error: `Provider returned status ${res.status}` }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({ success: true, response: data })
  } catch (error: any) {
    console.error('Error testing AI config:', error)
    return NextResponse.json({ error: error.message || 'Failed to test configuration' }, { status: 500 })
  }
}
