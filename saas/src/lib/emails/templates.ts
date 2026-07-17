/**
 * Premium, responsive HTML transactional email templates for DebugBit SaaS.
 * Highly aligned with our dark-mode neon brand palette (#a78bfa, #7c3aed, etc.).
 */

export function getWelcomeEmailHTML(userName: string): string {
  const name = userName || 'Developer';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to DebugBit</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #030712; color: #d1d5db; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #0b0f19; border: 1px solid #1f2937; border-radius: 16px; padding: 40px; }
        .logo { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 1px; margin-bottom: 20px; }
        .logo span { color: #a78bfa; }
        h1 { font-size: 20px; font-weight: bold; color: #ffffff; margin-top: 0; }
        p { font-size: 14px; line-height: 1.6; color: #9ca3af; }
        .btn { display: inline-block; background-color: #7c3aed; color: #ffffff !important; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 14px; margin-top: 20px; }
        .footer { margin-top: 40px; font-size: 12px; color: #4b5563; text-align: center; border-t: 1px solid #1f2937; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">Debug<span>Bit</span></div>
        <h1>Welcome, ${name}!</h1>
        <p>Your Developer Intelligence cockpit is ready. DebugBit combines local-first browser logging with secure backend AI mapping to diagnose errors in seconds.</p>
        <p>To begin, configure your unique API Key inside your browser extension and start tracking sessions on your active project tabs.</p>
        <a href="https://debugbit.io/dashboard" class="btn">Open Dashboard</a>
        <div class="footer">
          &copy; 2026 DebugBit Inc. All rights reserved.<br>
          Enterprise Developer Intelligence Platform
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getTeamInviteEmailHTML(inviteUrl: string, teamName: string): string {
  const targetTeam = teamName || 'your engineering organization';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Teammate Invitation</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #030712; color: #d1d5db; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #0b0f19; border: 1px solid #1f2937; border-radius: 16px; padding: 40px; }
        .logo { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 1px; margin-bottom: 20px; }
        .logo span { color: #a78bfa; }
        h1 { font-size: 20px; font-weight: bold; color: #ffffff; margin-top: 0; }
        p { font-size: 14px; line-height: 1.6; color: #9ca3af; }
        .btn { display: inline-block; background-color: #7c3aed; color: #ffffff !important; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 14px; margin-top: 20px; }
        .footer { margin-top: 40px; font-size: 12px; color: #4b5563; text-align: center; border-t: 1px solid #1f2937; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">Debug<span>Bit</span></div>
        <h1>Join ${targetTeam} on DebugBit</h1>
        <p>A teammate has invited you to join the organization <strong>${targetTeam}</strong> to collaborate on application error diagnosis, log inspection, and performance bottlenecks tracking.</p>
        <p>Click below to accept your invitation and configure your account permissions.</p>
        <a href="${inviteUrl}" class="btn">Accept Invitation</a>
        <div class="footer">
          &copy; 2026 DebugBit Inc. All rights reserved.<br>
          Enterprise Developer Intelligence Platform
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getReportReadyEmailHTML(sessionId: string, projectUrl: string, reportPreview: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>AI Diagnostics Ready</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #030712; color: #d1d5db; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #0b0f19; border: 1px solid #1f2937; border-radius: 16px; padding: 40px; }
        .logo { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 1px; margin-bottom: 20px; }
        .logo span { color: #a78bfa; }
        h1 { font-size: 20px; font-weight: bold; color: #ffffff; margin-top: 0; }
        p { font-size: 14px; line-height: 1.6; color: #9ca3af; }
        .preview { background-color: #030712; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; font-family: monospace; font-size: 12px; color: #a78bfa; margin: 20px 0; max-height: 120px; overflow: hidden; white-space: pre-wrap; }
        .btn { display: inline-block; background-color: #7c3aed; color: #ffffff !important; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 14px; }
        .footer { margin-top: 40px; font-size: 12px; color: #4b5563; text-align: center; border-t: 1px solid #1f2937; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">Debug<span>Bit</span></div>
        <h1>🚨 AI Diagnostic Report Compiled</h1>
        <p>Our serverless background analyzer has finished parsing telemetry logs for synced session <strong>#${sessionId.slice(0, 8)}</strong> from <strong>${projectUrl}</strong>.</p>
        <p><strong>Diagnosis Highlights:</strong></p>
        <div class="preview">${reportPreview || 'Analysis reports generated successfully. Open dashboard for details.'}</div>
        <a href="https://debugbit.io/dashboard" class="btn">View Inspector Report</a>
        <div class="footer">
          &copy; 2026 DebugBit Inc. All rights reserved.<br>
          Enterprise Developer Intelligence Platform
        </div>
      </div>
    </body>
    </html>
  `;
}
