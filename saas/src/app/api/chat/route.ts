import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages = [] } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server environment.' },
        { status: 500 }
      );
    }

    // Map messages into Gemini's specific API format
    // Roles in Gemini must be: 'user' or 'model'
    const formattedContents = messages
      .filter((msg: any) => msg.role === 'user' || msg.role === 'assistant' || msg.role === 'model')
      .map((msg: any) => {
        const role = msg.role === 'assistant' ? 'model' : msg.role;
        return {
          role: role,
          parts: [{ text: msg.content }]
        };
      });

    // Provide baseline system rules for DebugBit
    const systemPrompt = `You are DebugBit AI Copilot, a premier agentic AI debugging assistant integrated directly inside the Unified Developer SaaS Cockpit. 
Your tone is professional, highly technical, yet helpful and humble. 
Use Markdown to structure code snippets, logs, tables, and lists. 
Provide extremely precise diagnostics when developers ask about errors, WebVitals performance logs, network payload statuses, or code refactor strategies. 
Keep your solutions clear, concise, and production-ready.`;

    const requestPayload = {
      contents: formattedContents,
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    };

    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Gemini API response failure: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const resData = await response.json();
    const replyText = resData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response returned from the AI model.';

    return NextResponse.json({ text: replyText });

  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message || err },
      { status: 500 }
    );
  }
}
