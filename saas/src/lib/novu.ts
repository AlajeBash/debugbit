import { Novu } from '@novu/node';

if (!process.env.NOVU_API_KEY) {
  console.warn('[Novu] Warning: NOVU_API_KEY is not defined in your environment variables.');
}

export const novu = new Novu(process.env.NOVU_API_KEY || 'nv_mock_key_123');
