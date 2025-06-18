import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' })

export async function POST(req: Request) {
  try {
    const { input, domain } = await req.json()
    if (!input || !domain) {
      return NextResponse.json({ output: 'Invalid request.' }, { status: 400 })
    }

    const model = domain === 'business' ? 'gpt-4o' : 'gpt-4o-mini'
    const output = await queryOpenAI(model, input)

    return NextResponse.json({ output })
  } catch (err) {
    return NextResponse.json({ output: 'Server error.' }, { status: 500 })
  }
}

async function queryOpenAI(model: string, prompt: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })
  return completion.choices[0]?.message?.content || ''
}