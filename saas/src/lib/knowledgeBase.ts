export interface HistoricalResolution {
  id: string;
  title: string;
  errorSignature: string;
  route: string;
  category: 'network' | 'console' | 'database';
  resolvedBy: string;
  resolvedAt: string;
  rootCause: string;
  gitDiff: string;
  score?: number;
}

export const historicalResolutions: HistoricalResolution[] = [
  {
    id: 'res-001',
    title: 'Stripe Payment checkout undef token crash',
    errorSignature: "TypeError: Cannot read properties of undefined (reading 'paymentMethod')",
    route: 'POST /v1/checkout/payment',
    category: 'console',
    resolvedBy: 'Alex Rivera (Staff Engineer)',
    resolvedAt: '2026-07-15',
    rootCause: 'Stripe token binding hook triggered on legacy browsers does not populate the complete inner payload array when form autocomplete is used, leading to null values propagating to the state handler.',
    gitDiff: `diff --git a/src/components/CheckoutButton.tsx b/src/components/CheckoutButton.tsx
index 4a123bc..f890123 100644
--- a/src/components/CheckoutButton.tsx
+++ b/src/components/CheckoutButton.tsx
@@ -43,5 +43,9 @@ export function CheckoutButton({ amount }) {
   const handlePayment = async () => {
     const result = await stripe.confirmCardPayment(clientSecret);
-    const method = result.paymentIntent.paymentMethod;
+    // FIX: Safely check if paymentIntent and paymentMethod are resolved
+    const method = result?.paymentIntent?.paymentMethod || 'standard_card';
+    if (!result?.paymentIntent) {
+      console.warn('[Stripe Bridge] Payment Intent unresolved fallback active.');
+    }
     processPayment(method);
   };`
  },
  {
    id: 'res-002',
    title: 'CORS Preflight request origin header omission',
    errorSignature: "blocked by CORS policy: Response to preflight request doesn't pass access control check",
    route: 'POST /api/sync',
    category: 'network',
    resolvedBy: 'Elena Rostova (Lead DevOps)',
    resolvedAt: '2026-07-18',
    rootCause: 'Chrome security sandbox locks down cross-origin requests from unpacked extension origins. The Next.js middleware did not explicitly respond to CORS preflight OPTIONS handshakes with Access-Control-Allow-Headers.',
    gitDiff: `diff --git a/saas/src/middleware.ts b/saas/src/middleware.ts
index e234abc..b345cde 100644
--- a/saas/src/middleware.ts
+++ b/saas/src/middleware.ts
@@ -12,4 +12,12 @@ export function middleware(request: NextRequest) {
   const response = NextResponse.next();
   
+  // FIX: Explicit preflight CORS handshake response
+  if (request.method === 'OPTIONS') {
+    return new NextResponse(null, {
+      status: 204,
+      headers: {
+        'Access-Control-Allow-Origin': '*',
+        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
+        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
+      }
+    });
+  }
+  return response;
 }`
  },
  {
    id: 'res-003',
    title: 'Database Connection Pool Exhaustion crash',
    errorSignature: "FATAL: remaining connection slots are reserved for non-replication superuser connections",
    route: 'GET /api/sessions',
    category: 'database',
    resolvedBy: 'Devon Miller (Principal Architect)',
    resolvedAt: '2026-07-12',
    rootCause: 'Dynamic Next.js serverless functions instantiated on every poll opened a new Supabase client connection pool without calling client.release() or reusing the global connection cache.',
    gitDiff: `diff --git a/saas/src/lib/db.ts b/saas/src/lib/db.ts
index f112d8a..a556bc1 100644
--- a/saas/src/lib/db.ts
+++ b/saas/src/lib/db.ts
@@ -4,4 +4,11 @@ import { createClient } from '@supabase/supabase-js';
-export const supabase = createClient(URL, KEY);
+// FIX: Prevent multiple instances of client in hot-reloading development runs
+const globalForSupabase = global as unknown as { supabase: any };
+export const supabase = globalForSupabase.supabase || createClient(URL, KEY);
+if (process.env.NODE_ENV !== 'production') {
+  globalForSupabase.supabase = supabase;
+}
 `
  }
];

/**
 * Heuristic Token Similarity Matcher
 */
export function findKnowledgeBaseMatch(errorSignature: string, route: string): HistoricalResolution | null {
  if (!errorSignature) return null;

  const tokenize = (str: string) => 
    str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 2);

  const queryTokens = tokenize(`${errorSignature} ${route}`);
  if (queryTokens.length === 0) return null;

  let bestMatch: HistoricalResolution | null = null;
  let highestScore = 0;

  historicalResolutions.forEach(res => {
    const resTokens = tokenize(`${res.errorSignature} ${res.route} ${res.title}`);
    
    // Calculate Jaccard similarity or token intersection
    const intersection = queryTokens.filter(t => resTokens.includes(t));
    const score = intersection.length / Math.max(queryTokens.length, 1);

    if (score > highestScore && score >= 0.4) { // Minimum threshold 0.4 for robustness
      highestScore = score;
      bestMatch = { ...res, score };
    }
  });

  return bestMatch;
}
