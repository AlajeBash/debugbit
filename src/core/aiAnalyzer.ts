import { type UnifiedTelemetryEvent } from '../store/useTelemetryStore';

const SYSTEM_PROMPT = `You are an expert AI Senior Software Engineer and Browser Debugging Specialist.
Analyze the following chronological telemetry log (consisting of console logs, network errors, and unhandled exceptions) captured from a developer's browser session.

Your objective is to:
1. Correlate network failures with console printouts and exceptions.
2. Formulate a clear, plain-English explanation of the root cause.
3. Provide a concrete, production-ready code patch to resolve the issue.

Format your response strictly in GitHub-Flavored Markdown using this exact outline:

# 🔍 Root Cause Analysis

### 🚨 What Happened
[2-3 sentences summarizing the high-level symptom and immediate user-facing failure.]

### 💀 Why It Failed
[Technical correlation of logs. Explain how network requests relate to unhandled exceptions. Highlight CORS, missing headers, bad statuses, or empty payloads.]

---

# 🛠️ Actionable Code Fix

### 💡 Suggested Fix
[Explain the solution in plain English.]

### 💻 Code Modification
[Provide a syntax-highlighted code block demonstrating the exact fix. Use a side-by-side or Before/After format inside the code block.]

---

# 🛡️ Prevention Recommendations
- [Bullet points outlining how to avoid this issue in the future (e.g. interceptors, schemas, boundary checks).]`;

/**
 * Packages telemetry events and queries Gemini 2.5 Flash to generate a diagnostic report.
 */
export async function analyzeTelemetryTimeline(
  geminiKey: string,
  events: UnifiedTelemetryEvent[]
): Promise<string> {
  if (!geminiKey) {
    throw new Error('Gemini API Key is missing. Please save your key in settings.');
  }

  if (events.length === 0) {
    throw new Error('No telemetry events found in the active session to analyze.');
  }

  // 1. Serialize timeline into a compressed, token-efficient structure
  const serializedEvents = events.map((ev) => {
    const timestamp = new Date(ev.timestamp).toLocaleTimeString([], { hour12: false });
    
    if (ev.category === 'network') {
      const net = ev.data;
      return {
        time: timestamp,
        category: 'NETWORK',
        method: net.method,
        url: net.url,
        status: net.status === 0 ? 'FAILED/BLOCKED' : net.status,
        duration: `${Math.round(net.duration)}ms`,
        requestHeaders: net.requestHeaders ? truncateObjectValues(net.requestHeaders) : undefined,
        responseHeaders: net.responseHeaders ? truncateObjectValues(net.responseHeaders) : undefined,
        requestPayload: net.requestBody ? net.requestBody.substring(0, 400) : undefined,
        responsePayload: net.responseBody ? net.responseBody.substring(0, 800) : undefined
      };
    } else {
      const cons = ev.data;
      return {
        time: timestamp,
        category: 'CONSOLE',
        level: cons.type.toUpperCase(),
        message: cons.message,
        stackTrace: cons.stack ? cons.stack.substring(0, 1000) : undefined
      };
    }
  });

  const promptText = `
${SYSTEM_PROMPT}

==================================
CHRONOLOGICAL TELEMETRY TIMELINE DATA:
==================================
${JSON.stringify(serializedEvents, null, 2)}
`;

  let authorizedModels: string[] = [];

  // 1.5. Run a direct REST diagnostic check to identify API key/permission issues
  try {
    console.log('[AI Analyzer] Running direct REST diagnostic check...');
    const diagRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
    if (!diagRes.ok) {
      const diagErr = await diagRes.json();
      console.error('[AI Analyzer] Google REST validation failed. API Response details:', diagErr);
      
      if (diagErr.error) {
        throw new Error(
          `Google API validation failed: ${diagErr.error.message} (Status: ${diagErr.error.status}).`
        );
      }
    } else {
      const diagData = await diagRes.json();
      authorizedModels = diagData.models?.map((m: any) => m.name.split('/').pop()) || [];
      console.log('[AI Analyzer] API Key verified successfully! Authorized models list:', authorizedModels);
    }
  } catch (diagErr: any) {
    console.warn('[AI Analyzer] Direct API diagnostic failed or was blocked:', diagErr.message || diagErr);
    if (diagErr.message && diagErr.message.includes('Google API validation failed')) {
      throw diagErr;
    }
  }

  // 2. Query Gemini models with a highly robust vanilla REST fallback mechanism
  const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite'
  ];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[AI Analyzer] Querying Gemini model via vanilla REST POST: ${modelName}`);
      
      const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;
      const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
        }
      };

      const response = await fetch(restUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errPayload = await response.json().catch(() => ({}));
        throw new Error(errPayload.error?.message || `HTTP ${response.status} Error`);
      }

      const resData = await response.json();
      const text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        console.log(`[AI Analyzer] Successfully generated report using model: ${modelName} via REST`);
        return text;
      } else {
        throw new Error('Response did not contain valid text candidates.');
      }
    } catch (err: any) {
      console.warn(`[AI Analyzer] Model ${modelName} REST query failed:`, err.message || err);
      lastError = err;
      // Continue to try the next model in the fallback chain!
    }
  }

  // If we exhaust all models, bubble up a detailed and actionable error
  console.error('[AI Analyzer] All Gemini models in fallback chain failed:', lastError);
  const errorMessage = lastError?.message || 'Failed to generate AI analysis report.';
  const modelsMsg = authorizedModels.length > 0 
    ? `Authorized models for your API Key: [${authorizedModels.join(', ')}].` 
    : `Could not verify model permissions. Please ensure the "Generative Language API" is enabled in your Google Cloud Console.`;
  
  throw new Error(
    `[GoogleGenerativeAI Error]: ${errorMessage}. ` +
    `(${modelsMsg} Note: Please verify that your API Key is valid, active, and has sufficient quota/billing enabled for your region.)`
  );
}

/**
 * Truncates object field values to prevent sending large tokens (like authorization strings or large cookies).
 */
function truncateObjectValues(obj: Record<string, any>): Record<string, string> {
  const truncated: Record<string, string> = {};
  for (const [key, val] of Object.entries(obj)) {
    const strVal = String(val);
    truncated[key] = strVal.length > 120 ? `${strVal.substring(0, 120)}... [truncated]` : strVal;
  }
  return truncated;
}
