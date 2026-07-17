import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('[Resend] Warning: RESEND_API_KEY is not defined in your environment variables.');
}

export const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key_123');
