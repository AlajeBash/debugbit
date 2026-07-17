/**
 * local-first enterprise PII Redactor Scrubber.
 * Executed inside the browser extension sandbox before any telemetry payload is ever
 * synchronized or uploaded to the Next.js SaaS API Gateway.
 */
export function scrubTelemetry<T = any>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  try {
    let serialized = JSON.stringify(data);

    // 1. Redact Bearer / Basic / OAuth HTTP headers and fields
    serialized = serialized.replace(
      /"authorization":\s*"[^"]+"/gi, 
      '"authorization": "[REDACTED_JWT_TOKEN]"'
    );
    serialized = serialized.replace(
      /bearer\s+[A-Za-z0-9\-._~+/+=]+/gi, 
      'Bearer [REDACTED_BEARER_TOKEN]'
    );
    serialized = serialized.replace(
      /basic\s+[A-Za-z0-9\-._~+/+=]+/gi, 
      'Basic [REDACTED_BASIC_TOKEN]'
    );

    // 2. Redact query parameters in URLs (e.g., api_key, access_token)
    serialized = serialized.replace(
      /api_key=[a-zA-Z0-9_-]+/gi, 
      'api_key=[REDACTED_API_KEY]'
    );
    serialized = serialized.replace(
      /access_token=[a-zA-Z0-9_-]+/gi, 
      'access_token=[REDACTED_ACCESS_TOKEN]'
    );

    // 3. Redact common cookie storage stringifications
    serialized = serialized.replace(
      /"cookie":\s*"[^"]+"/gi, 
      '"cookie": "[REDACTED_SESSION_COOKIES]"'
    );

    // 4. Redact numeric patterns resembling standard credit cards
    serialized = serialized.replace(
      /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, 
      '[REDACTED_CREDIT_CARD]'
    );

    // 5. Redact SSN formats (9-digit numbers)
    serialized = serialized.replace(
      /\b\d{3}-\d{2}-\d{4}\b/g, 
      '[REDACTED_SSN]'
    );

    return JSON.parse(serialized);
  } catch (err) {
    console.error('[Telemetry Scrubber] Redaction sweep encountered structural failure:', err);
    return data;
  }
}
