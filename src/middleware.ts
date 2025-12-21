import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";

const logger = createLogger('MIDDLEWARE');

/**
 * Clerk SDK Middleware (v4 compatible)
 *
 * This middleware handles Clerk authentication for server-side functions like auth() and currentUser().
 * It allows both public and protected routes, with authentication checks handled by:
 * - Server-side: auth() and currentUser() in API routes and server components
 * - Client-side: useAuth() and useUser() hooks in client components
 */

// Compute satellite config safely for production to avoid missing domain/proxyUrl
const isSatEnv = process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === 'true' || process.env.NEXT_PUBLIC_APP_URL?.includes('mosc-temp.com') || false;
const satDomain = process.env.NEXT_PUBLIC_CLERK_DOMAIN || (process.env.NEXT_PUBLIC_APP_URL?.includes('mosc-temp.com') ? 'www.mosc-temp.com' : undefined);
const satProxyUrl = process.env.NEXT_PUBLIC_CLERK_PROXY_URL;
const satConfig: any = {};
if (isSatEnv) {
  if (satDomain) {
    Object.assign(satConfig, { isSatellite: true, domain: satDomain });
  } else if (satProxyUrl) {
    Object.assign(satConfig, { isSatellite: true, proxyUrl: satProxyUrl });
  }
}

export default authMiddleware({
  // Define public routes that don't require authentication
  // IMPORTANT: Public API routes allow unauthenticated users to fetch public data
  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/sso-callback(.*)',
    '/api/webhooks(.*)',
    '/api/public(.*)',
    '/api/proxy(.*)',  // Public API proxy routes for public data (events, etc.)
    '/api/event/success(.*)',  // Public payment success processing (no auth required - uses Payment Intent/Session ID)
    '/api/membership/success(.*)',  // Public membership success processing (no auth required - uses Payment Intent/Session ID)
    '/membership/success(.*)',  // Membership success page (public - uses Payment Intent/Session ID)
    '/membership/qr(.*)',  // Membership QR page (public - uses Payment Intent/Session ID)
    '/api/diagnostic(.*)',  // Diagnostic endpoints for debugging
    '/api/logs(.*)',  // Client log forwarding endpoint
    '/mosc(.*)',
    '/events(.*)',
    '/sponsors(.*)',  // Public sponsor pages
    '/gallery(.*)',
    '/about(.*)',
    '/contact(.*)',
    '/polls(.*)',
    '/charity-theme(.*)',
    '/calendar(.*)',
    '/focus-groups(.*)',
    '/pricing(.*)',  // Public pricing page (no auth required for viewing)
  ],

  // Satellite domain configuration (only applied when envs are set)
  ...satConfig,

  // For Amplify domains or satellite domains, point to primary domain for sign-in
  signInUrl: process.env.NEXT_PUBLIC_APP_URL?.includes('amplifyapp.com') || process.env.NEXT_PUBLIC_APP_URL?.includes('mosc-temp.com')
    ? `https://${process.env.NEXT_PUBLIC_PRIMARY_DOMAIN || 'www.event-site-manager.com'}/sign-in`
    : '/sign-in',

  // Ignore authentication on prefetch requests for public routes
  ignoredRoutes: [
    // Ignore Next.js RSC prefetch requests for public routes
    '/(.*)?_rsc=(.*)$',
    // CRITICAL: Completely ignore API proxy routes (don't even apply Clerk middleware)
    '/api/webhooks/(.*)',
    '/api/proxy/(.*)',
    '/api/event/success/(.*)',  // CRITICAL: Ignore payment success processing (mobile browser compatibility)
    '/api/membership/success/(.*)',  // CRITICAL: Ignore membership success processing (mobile browser compatibility)
    '/api/stripe/payment-intent(.*)',  // Ignore payment intent route (mobile wallet)
    '/api/stripe/event-checkout(.*)',  // Ignore event checkout route
    '/api/stripe/membership-payment-intent(.*)',  // Ignore membership payment intent route (mobile wallet)
    // NOTE: /api/stripe/membership-checkout is NOT ignored - it needs Clerk middleware for auth()
    '/api/payment/(.*)',
    '/api/billing/(.*)',
    '/api/checkout/(.*)',
    '/api/diagnostic(.*)',
    '/api/logs(.*)',
    // CRITICAL: Ignore public page routes to allow Playwright/automated tests
    // These routes bypass Clerk middleware completely, allowing access without session cookies
    // NOTE: Routes are also in publicRoutes for consistency, but ignoredRoutes takes precedence
    // IMPORTANT: /polls and /pricing are NOT in ignoredRoutes because they call auth() and need Clerk middleware
    // They remain in publicRoutes so they're accessible without authentication, but middleware must run for auth() to work
    '/',  // Homepage (exact match)
    '/events(.*)',  // Events pages
    '/sponsors(.*)',  // Sponsors pages
    '/gallery(.*)',  // Gallery pages
    '/calendar(.*)',  // Calendar pages
    '/mosc(.*)',  // MOSC pages
    '/charity-theme(.*)',  // Charity theme pages
    '/focus-groups(.*)',  // Focus groups pages
    // NOTE: /polls and /pricing are NOT ignored - they need Clerk middleware for auth() calls
  ],

  // Custom logic to add pathname header and handle prefetch requests
  afterAuth(auth, req) {
    // CRITICAL: Log ALL API requests to verify they're reaching middleware
    const pathname = req.nextUrl.pathname;
    const isApiRoute = pathname.startsWith('/api/');
    const isApiProxy = pathname.startsWith('/api/proxy');
    const isDiagnostic = pathname.startsWith('/api/diagnostic');
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Enhanced mobile detection: Include WhatsApp, mobile browsers, and CloudFront headers
    const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|WhatsApp|Mobile|CriOS|FxiOS/i.test(userAgent);
    const cloudfrontMobile = req.headers.get('cloudfront-is-mobile-viewer') === 'true';
    const cloudfrontAndroid = req.headers.get('cloudfront-is-android-viewer') === 'true';
    const cloudfrontIOS = req.headers.get('cloudfront-is-ios-viewer') === 'true';
    const isMobile = userAgentMobile || cloudfrontMobile || cloudfrontAndroid || cloudfrontIOS;

    // CRITICAL: Log ALL API requests using robust logger (can't be stripped)
    if (isApiRoute) {
      // Use robust logger that can't be stripped by Next.js
      logger.info('API REQUEST DETECTED', {
        pathname,
        method: req.method,
        isMobile,
        isProxy: isApiProxy,
        isDiagnostic,
        userAgent: userAgent.substring(0, 150),
        timestamp: new Date().toISOString(),
      });

      // Also use console.log for backward compatibility
      console.log('[MIDDLEWARE] ===== API REQUEST DETECTED =====');
      console.log('[MIDDLEWARE] Pathname:', pathname);
      console.log('[MIDDLEWARE] Method:', req.method);
      console.log('[MIDDLEWARE] Is Mobile:', isMobile);
      console.log('[MIDDLEWARE] Is Proxy:', isApiProxy);
      console.log('[MIDDLEWARE] Is Diagnostic:', isDiagnostic);
      console.log('[MIDDLEWARE] User-Agent:', userAgent.substring(0, 150));
      console.log('[MIDDLEWARE] Timestamp:', new Date().toISOString());
      console.log('[MIDDLEWARE] ===== END API REQUEST LOG =====');
    }

    // CRITICAL: Explicitly allow public routes even if auth check fails
    // This ensures public routes work even without session cookies (e.g., Playwright tests, curl)
    // Note: pathname is already declared above (line 90), so we reuse it here

    // Define public route patterns (must match publicRoutes array)
    const publicRoutePatterns = [
      /^\/$/,
      /^\/sign-in/,
      /^\/sign-up/,
      /^\/sso-callback/,
      /^\/api\/webhooks/,
      /^\/api\/public/,
      /^\/api\/proxy/,
      /^\/api\/event\/success/,
      /^\/api\/membership\/success/,
      /^\/membership\/success/,
      /^\/membership\/qr/,
      /^\/api\/diagnostic/,
      /^\/api\/logs/,
      /^\/mosc/,
      /^\/events/,
      /^\/sponsors/,
      /^\/gallery/,
      /^\/about/,
      /^\/contact/,
      /^\/polls/,
      /^\/charity-theme/,
      /^\/calendar/,
      /^\/focus-groups/,
      /^\/pricing/,
    ];

    // Check if this is a public route
    const isPublicRoute = publicRoutePatterns.some(pattern => pattern.test(pathname));

    // Add pathname header for layout detection (used by ConditionalLayout)
    const response = NextResponse.next();
    response.headers.set('x-pathname', pathname);

    // For public routes, always allow them through (even without auth)
    // This fixes Playwright/curl tests that don't have session cookies
    if (isPublicRoute) {
      return response;
    }

    // For prefetch requests on public routes, always allow them through
    if (req.nextUrl.searchParams.has('_rsc')) {
      // This is a Next.js prefetch/RSC request, allow it through without auth
      return response;
    }

    return response;
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.[\\w]+$).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};