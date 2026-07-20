import { authMiddleware, redirectToSignIn } from '@clerk/nextjs';
import { createClient as updateSupabaseSession } from '@/utils/supabase/middleware';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/api/sync',
    '/api/webhooks/clerk',
    '/todos',
    '/dashboard',
    '/dashboard(.*)',
    '/sign-in',
    '/sign-in(.*)',
    '/sign-up',
    '/sign-up(.*)'
  ],
  
  // Routes that are fully ignored by the auth checks (e.g. static assets)
  ignoredRoutes: [
    '/api/sync' // Extension bulk-sync handles its own API key authentication
  ],

  afterAuth(auth, req, evt) {
    // Handle redirect for unauthenticated users trying to access protected routes
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // Keep Supabase session refreshed by updating cookies
    return updateSupabaseSession(req);
  }
});

export const config = {
  matcher: [
    // Protect all dashboard routes while allowing public routes and webhooks
    '/((?!_next|[^?]*\\.(?:html|css|js|gif|svg|png|jpeg|jpg|webp|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*'
  ],
};

