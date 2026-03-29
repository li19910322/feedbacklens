import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert feedback analyst. Analyze the given feedback and provide:
1. A sentiment score from -1 (very negative) to 1 (very positive)
2. A concise summary (max 100 words)
3. Key themes as a JSON array of strings

Respond in JSON format: {"sentiment": number, "summary": string, "themes": string[]}`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.7,
    });

    const responseText = completion.choices[0].message.content;
    const result = JSON.parse(responseText || '{}');

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to analyze feedback' },
      { status: 500 }
    );
  }
}
