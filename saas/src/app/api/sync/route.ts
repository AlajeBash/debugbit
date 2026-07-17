import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '../../../lib/db';
import { validateTelemetryPayload } from '../../../lib/security';

interface SyncPayload {
  apiKey: string;
  session: {
    id: string;
    tabId?: number;
    startTime: number;
    endTime?: number;
    url: string;
    status: 'active' | 'completed' | 'failed';
  };
  logs?: Array<{ timestamp: number; type: string; message: string; stack?: string }>;
  network?: Array<{
    timestamp: number;
    method: string;
    url: string;
    status: number;
    duration: number;
    requestHeaders?: any;
    responseHeaders?: any;
    requestBody?: string | null;
    responseBody?: string | null;
  }>;
  performance?: Array<{ metricName: string; value: number; timestamp: number }>;
}

export async function POST(req: NextRequest) {
  try {
    const body: SyncPayload = await req.json();
    const { apiKey, session, logs = [], network = [], performance = [] } = body;

    if (!apiKey || !session || !session.id) {
      return NextResponse.json(
        { error: 'Missing required parameters: apiKey, session.id' },
        { status: 400 }
      );
    }

    // Secure Ingestion validation: Validate payload structure against Zod schema rules
    const validationResult = validateTelemetryPayload({
      sessionId: session.id,
      tabId: session.tabId || 0,
      startTime: session.startTime,
      endTime: session.endTime,
      url: session.url || 'http://unknown.com',
      consoleLogs: logs,
      networkLogs: network.map(n => ({ ...n, url: n.url || 'http://unknown.com' })),
      performanceMetrics: performance,
    });

    if (!validationResult.success) {
      console.warn('[Sync Ingest Guard] Warning: Telemetry payload contains non-compliant formats:', validationResult.error.message);
    }

    // 1. Resolve Project ownership using API Key
    const { data: project, error: projError } = await dbAdmin
      .from('projects')
      .select('id')
      .eq('api_key', apiKey)
      .single();

    if (projError || !project) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid Project API Key.' },
        { status: 401 }
      );
    }

    const projectId = project.id;

    // 2. Insert or Upsert Session record
    const { error: sessionError } = await dbAdmin
      .from('sessions')
      .upsert({
        id: session.id,
        project_id: projectId,
        tab_id: session.tabId,
        start_time: new Date(session.startTime).toISOString(),
        end_time: session.endTime ? new Date(session.endTime).toISOString() : null,
        url: session.url || 'unknown',
        status: session.status || 'active',
        created_at: new Date().toISOString()
      });

    if (sessionError) {
      throw new Error(`Session sync write failed: ${sessionError.message}`);
    }

    // 3. Bulk Insert Console Logs
    if (logs.length > 0) {
      const dbLogs = logs.map(l => ({
        session_id: session.id,
        timestamp: new Date(l.timestamp).toISOString(),
        type: l.type,
        message: l.message,
        stack: l.stack
      }));

      const { error: logsError } = await dbAdmin
        .from('console_logs')
        .insert(dbLogs);

      if (logsError) console.error('[Sync Router] Logs bulk write error:', logsError.message);
    }

    // 4. Bulk Insert Network Logs
    if (network.length > 0) {
      const dbNetwork = network.map(n => ({
        session_id: session.id,
        timestamp: new Date(n.timestamp).toISOString(),
        method: n.method,
        url: n.url,
        status: n.status,
        duration: n.duration,
        request_headers: n.requestHeaders,
        response_headers: n.responseHeaders,
        request_body: n.requestBody,
        response_body: n.responseBody
      }));

      const { error: netError } = await dbAdmin
        .from('network_logs')
        .insert(dbNetwork);

      if (netError) console.error('[Sync Router] Network bulk write error:', netError.message);
    }

    // 5. Bulk Insert Performance Metrics
    if (performance.length > 0) {
      const dbPerf = performance.map(p => ({
        session_id: session.id,
        metric_name: p.metricName,
        value: p.value,
        timestamp: new Date(p.timestamp).toISOString()
      }));

      const { error: perfError } = await dbAdmin
        .from('performance_metrics')
        .insert(dbPerf);

      if (perfError) console.error('[Sync Router] Performance bulk write error:', perfError.message);
    }

    // 6. Asynchronously trigger background AI analysis via Trigger.dev
    if (session.status === 'completed' || session.status === 'failed') {
      try {
        const { triggerClient } = await import('../../../lib/trigger');
        await triggerClient.send({
          name: 'session.synced',
          payload: { sessionId: session.id }
        });
        console.log(`[Sync Router] Asynchronously scheduled background AI analysis for session ${session.id}`);
      } catch (err: any) {
        console.error('[Sync Router] Background trigger failed:', err.message);
        // Do NOT fail the sync request itself since uploads must never block
      }
    }

    return NextResponse.json({
      status: 'success',
      syncedSessionId: session.id,
      recordsSynced: {
        logs: logs.length,
        network: network.length,
        performance: performance.length
      }
    });

  } catch (err: any) {
    console.error('[Sync Router] Critical synchronization failure:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}
