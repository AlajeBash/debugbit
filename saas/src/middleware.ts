import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  // Routes that can be accessed by unauthenticated users
  publicRoutes: [
    '/',
    '/api/sync',
    '/api/webhooks/clerk'
  ],
  
  // Routes that are fully ignored by the auth checks (e.g. static assets)
  ignoredRoutes: [
    '/api/sync' // Extension bulk-sync handles its own API key authentication
  ]
});

export const config = {
  matcher: [
    // Protect all dashboard routes while allowing public routes and webhooks
    '/((?!_next|[^?]*\\.(?:html|css|js|gif|svg|png|jpeg|jpg|webp|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)'
  ],
};
