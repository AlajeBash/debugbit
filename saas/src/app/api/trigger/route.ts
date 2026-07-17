import { createAppRoute } from '@trigger.dev/nextjs';
import { triggerClient } from '../../../lib/trigger';

// Import our background jobs to register them with TriggerClient
import '../../../jobs/analyzeSession';

// Export the routes needed for the Trigger.dev dev server handshakes
export const { POST, GET } = createAppRoute(triggerClient);
