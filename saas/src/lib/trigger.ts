import { TriggerClient } from '@trigger.dev/sdk';

export const triggerClient = new TriggerClient({
  id: 'debugbit-saas',
  apiKey: process.env.TRIGGER_API_KEY || 'trigger_placeholder_key',
  apiUrl: process.env.TRIGGER_API_URL, // Defaults to Trigger.dev cloud endpoint
});
