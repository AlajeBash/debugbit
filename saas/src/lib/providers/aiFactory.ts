export interface DiagnosticContext {
  url: string;
  consoleLogs: Array<{ type: string; message: string; timestamp: number; stack?: string }>;
  networkLogs: Array<{ method: string; url: string; status: number; duration: number }>;
}

export abstract class BaseAIProvider {
  abstract getName(): string;
  abstract analyze(context: DiagnosticContext, apiKey: string): Promise<string>;
  
  protected formatPrompt(context: DiagnosticContext): string {
    return `You are DebugBit, an advanced AI Developer Intelligence system. Analyze the following frontend execution telemetry, find any bugs or performance bottlenecks, explain the root causes, and provide high-quality code fix diffs.

EXECUTION TIMELINE:
- Inspected URL: ${context.url}

CONSOLE LOGS:
${context.consoleLogs.map(l => `[${l.type.toUpperCase()}] ${l.message} ${l.stack ? `\nStack:\n${l.stack}` : ''}`).join('\n')}

NETWORK REQUESTS:
${context.networkLogs.map(n => `[${n.method}] ${n.url} - Status: ${n.status} (${n.duration}ms)`).join('\n')}

Please output a comprehensive markdown debugging report with sections:
1. 🔍 Root Cause Diagnosis: Pinpoint precisely where and why failure occurred.
2. ⚡ Performance Impact: Identify any bottlenecks (LCP, FID, API slowness).
3. 🛠️ Code Resolution: Provide exact code diffs of the fix.
`;
  }
}

export class GeminiProvider extends BaseAIProvider {
  getName() { return 'gemini'; }
  
  async analyze(context: DiagnosticContext, apiKey: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: this.formatPrompt(context) }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response returned from Gemini.';
  }
}

export class OpenAIProvider extends BaseAIProvider {
  getName() { return 'openai'; }
  
  async analyze(context: DiagnosticContext, apiKey: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: this.formatPrompt(context) }],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response returned from OpenAI.';
  }
}

export class AnthropicProvider extends BaseAIProvider {
  getName() { return 'anthropic'; }
  
  async analyze(context: DiagnosticContext, apiKey: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'Anthropic-Version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [{ role: 'user', content: this.formatPrompt(context) }],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || 'No response returned from Anthropic.';
  }
}

/**
 * Creates and returns the appropriate concrete AI provider class.
 */
export function getAIProvider(providerName: string): BaseAIProvider {
  const normalized = providerName.toLowerCase().trim();
  switch (normalized) {
    case 'gemini':
      return new GeminiProvider();
    case 'openai':
    case 'gpt4':
      return new OpenAIProvider();
    case 'anthropic':
    case 'claude':
      return new AnthropicProvider();
    default:
      throw new Error(`Unsupported AI gateway provider: "${providerName}". Supported choices are gemini, openai, anthropic.`);
  }
}
