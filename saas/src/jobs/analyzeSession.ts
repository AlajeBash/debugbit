import { eventTrigger } from '@trigger.dev/sdk';
import { triggerClient } from '../lib/trigger';
import { dbAdmin } from '../lib/db';
import { getAIProvider, type DiagnosticContext } from '../lib/providers/aiFactory';
import { resend } from '../lib/resend';
import { getReportReadyEmailHTML } from '../lib/emails/templates';

// Define the asynchronous job for non-blocking telemetry analysis
export const analyzeSessionJob = triggerClient.defineJob({
  id: 'analyze-session',
  name: 'Asynchronous Session AI Diagnostics Run',
  version: '2.0.0',
  trigger: eventTrigger({
    name: 'session.synced',
  }),
  run: async (payload: { sessionId: string }, io, ctx) => {
    const { sessionId } = payload;

    // 1. Log beginning of background execution task
    await io.logger.info(`[AI Job Worker] Starting diagnostics run for Session: ${sessionId}`);

    // 2. Fetch target Session header
    const { data: session, error: sessErr } = await dbAdmin
      .from('sessions')
      .select('url, user_id')
      .eq('id', sessionId)
      .single();

    if (sessErr || !session) {
      const errMsg = `Session not found or query error: ${sessErr?.message || 'Empty result'}`;
      await io.logger.error(errMsg);
      throw new Error(errMsg);
    }

    // 3. Parallel query for matching Console Logs & Network logs
    const [consoleLogsRes, networkLogsRes] = await Promise.all([
      dbAdmin
        .from('console_logs')
        .select('type, message, timestamp, stack')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true }),
      dbAdmin
        .from('network_logs')
        .select('method, url, status, duration')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true })
    ]);

    if (consoleLogsRes.error) {
      await io.logger.warn(`Failed fetching console logs: ${consoleLogsRes.error.message}`);
    }
    if (networkLogsRes.error) {
      await io.logger.warn(`Failed fetching network logs: ${networkLogsRes.error.message}`);
    }

    const consoleLogs = consoleLogsRes.data || [];
    const networkLogs = networkLogsRes.data || [];

    await io.logger.info(`[AI Job Worker] Fetched logs. Console lines: ${consoleLogs.length}, Network counts: ${networkLogs.length}`);

    // 4. Synthesize diagnostic context
    const context: DiagnosticContext = {
      url: session.url,
      consoleLogs: consoleLogs.map(l => ({
        type: l.type,
        message: l.message,
        timestamp: new Date(l.timestamp).getTime(),
        stack: l.stack || undefined
      })),
      networkLogs: networkLogs.map(n => ({
        method: n.method,
        url: n.url,
        status: n.status,
        duration: n.duration
      }))
    };

    // 5. Select Provider and retrieve API key securely on serverless worker
    const providerName = process.env.DEFAULT_AI_PROVIDER || 'gemini';
    const provider = getAIProvider(providerName);

    let apiKey = '';
    if (providerName.toLowerCase() === 'gemini') {
      apiKey = process.env.GEMINI_API_KEY || '';
    } else if (providerName.toLowerCase() === 'openai') {
      apiKey = process.env.OPENAI_API_KEY || '';
    } else if (providerName.toLowerCase() === 'anthropic') {
      apiKey = process.env.ANTHROPIC_API_KEY || '';
    }

    if (!apiKey) {
      const keyError = `API key for provider ${providerName} is missing. Please set ${providerName.toUpperCase()}_API_KEY inside your platform environment variables.`;
      await io.logger.error(keyError);
      throw new Error(keyError);
    }

    // 6. Request analysis report from selected provider
    await io.logger.info(`[AI Job Worker] Prompting provider: ${providerName}...`);
    const analysisReport = await provider.analyze(context, apiKey);

    // 7. Store completion report in Supabase Postgres Cache
    const { error: insertErr } = await dbAdmin
      .from('ai_reports')
      .insert({
        session_id: sessionId,
        model_used: providerName,
        content: analysisReport,
        created_at: new Date().toISOString()
      });

    if (insertErr) {
      const saveError = `Failed to cache AI report: ${insertErr.message}`;
      await io.logger.error(saveError);
      throw new Error(saveError);
    }

    await io.logger.info(`[AI Job Worker] Diagnostics complete! Cached report for session: ${sessionId}`);

    // 8. Resolve target user profile email to trigger Resend Alert
    if (session.user_id) {
      try {
        const { data: user } = await dbAdmin
          .from('users')
          .select('email, first_name')
          .eq('id', session.user_id)
          .single();

        if (user?.email) {
          await io.logger.info(`[AI Job Worker] Dispatching transactional diagnostic email alert to: ${user.email}`);
          
          await resend.emails.send({
            from: 'DebugBit Alerts <alerts@debugbit.io>',
            to: user.email,
            subject: `🚨 [DebugBit] AI Diagnostics Ready — Session #${sessionId.slice(0, 8)}`,
            html: getReportReadyEmailHTML(
              sessionId, 
              session.url, 
              analysisReport.split('\n').slice(0, 8).join('\n') + '\n...'
            ),
          });
          
          await io.logger.info('[AI Job Worker] Email notification sent successfully via Resend!');
        }
      } catch (emailErr: any) {
        await io.logger.warn(`[AI Job Worker] Failed sending Resend email notification: ${emailErr.message}`);
      }
    }

    return {
      status: 'success',
      sessionId,
      provider: providerName,
      reportLength: analysisReport.length
    };
  }
});
