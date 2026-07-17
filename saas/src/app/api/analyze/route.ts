import { NextRequest, NextResponse } from 'next/server';
import { getAIProvider, type DiagnosticContext } from '../../../lib/providers/aiFactory';
import { dbAdmin } from '../../../lib/db';

interface AnalyzeRequestPayload {
  sessionId: string;
  projectId: string;
  provider: string; // 'gemini' | 'openai' | 'anthropic'
  context: DiagnosticContext;
}

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeRequestPayload = await req.json();
    const { sessionId, projectId, provider, context } = body;

    if (!sessionId || !projectId || !provider || !context) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, projectId, provider, context' },
        { status: 400 }
      );
    }

    // 1. Verify Project Key validation inside PostgreSQL to protect SaaS consumption
    const { data: project, error: dbError } = await dbAdmin
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .single();

    if (dbError || !project) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid SaaS Project Key.' },
        { status: 401 }
      );
    }

    // 2. Select corresponding API Key from environment variables securely
    let apiKey: string | undefined;
    const normalizedProvider = provider.toLowerCase().trim();

    if (normalizedProvider === 'gemini') {
      apiKey = process.env.GEMINI_API_KEY;
    } else if (normalizedProvider === 'openai') {
      apiKey = process.env.OPENAI_API_KEY;
    } else if (normalizedProvider === 'anthropic') {
      apiKey = process.env.ANTHROPIC_API_KEY;
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: `API key for provider "${provider}" is not configured on the server.` },
        { status: 500 }
      );
    }

    // 3. Trigger provider execution using abstraction factory
    const aiProvider = getAIProvider(provider);
    const reportMarkdown = await aiProvider.analyze(context, apiKey);

    // 4. Save/Upsert the AI Report inside our PostgreSQL schema for historical analytics
    const { error: insertError } = await dbAdmin
      .from('ai_reports')
      .upsert(
        {
          session_id: sessionId,
          model_used: `${provider}-saas-gateway`,
          content: reportMarkdown,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'session_id' }
      );

    if (insertError) {
      console.warn('[AI Gateway] Failed to cache AI report in DB:', insertError.message);
    }

    return NextResponse.json({
      status: 'success',
      report: reportMarkdown,
      cached: !insertError,
    });

  } catch (err: any) {
    console.error('[AI Gateway] Critical analysis failure:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}
