import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";
import { createLogger } from "@/lib/logger";

const logger = createLogger('MIDDLEWARE');

/**
 * Clerk SDK Middleware (v4 compatible)
 *
 * This middleware handles Clerk authentication for server-side functions like auth() and currentUser().
 * It allows both public and protected routes, with authentication checks handled by:
 * - Server-side: auth() and currentUser() in API routes and server components
 * - Client-side: useAuth() and useUser() hooks in client components
 *
 * CRITICAL: This middleware wrapper works with Clerk v6 clerkMiddleware():
 * 1. We call clerkMiddleware() - Clerk runs for all routes so auth() works in layout.tsx
 * 2. Clerk middleware runs for all routes (including public routes) so auth() works in layout.tsx
 * 3. The wrapper only intercepts 401/redirect responses for Playwright tests, it doesn't prevent Clerk from running
 *
 * This ensures:
 * - ✅ Playwright tests work (public routes don't get 401)
 * - ✅ auth() calls work in layout.tsx (Clerk middleware runs)
 * - ✅ Admin menu appears correctly (admin lookup in layout.tsx works via userRole === 'ADMIN')
 *
 * See: .cursor/rules/clerk_auth_admin_user_lookup.mdc for the complete pattern
 */

// Compute satellite config safely for production to avoid missing domain/proxyUrl
// CRITICAL: Disable satellite config for localhost to prevent 401 errors on public routes
const isLocalhost = process.env.NEXT_PUBLIC_APP_URL?.includes('localhost') ||
                    process.env.NEXT_PUBLIC_APP_URL?.includes('127.0.0.1') ||
                    !process.env.NEXT_PUBLIC_APP_URL;
const isSatEnv = !isLocalhost && (
  process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === 'true' ||
  process.env.NEXT_PUBLIC_APP_URL?.includes('mosc-temp.com')
);
const satDomain = process.env.NEXT_PUBLIC_CLERK_DOMAIN || (process.env.NEXT_PUBLIC_APP_URL?.includes('mosc-temp.com') ? 'www.mosc-temp.com' : undefined);
const satProxyUrl = process.env.NEXT_PUBLIC_CLERK_PROXY_URL;
const satConfig: any = {};
if (isSatEnv && !isLocalhost) {
  if (satDomain) {
    Object.assign(satConfig, { isSatellite: true, domain: satDomain });
  } else if (satProxyUrl) {
    Object.assign(satConfig, { isSatellite: true, proxyUrl: satProxyUrl });
  }
}

// Define public routes that don't require authentication
// CRITICAL: These routes must be accessible without session cookies (Playwright tests, curl, etc.)
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
  /^\/team/,
  /^\/gallery/,
  /^\/about/,
  /^\/contact/,
  /^\/polls/,
  /^\/charity-theme/,
  /^\/calendar/,
  /^\/focus-groups/,
  /^\/pricing/,
];

function isPublicRoute(pathname: string): boolean {
  return publicRoutePatterns.some(pattern => pattern.test(pathname));
}

// Clerk v6: public routes matcher (replaces authMiddleware publicRoutes)
const isPublicRouteClerk = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/api/webhooks(.*)',
  '/api/public(.*)',
  '/api/proxy(.*)',
  '/api/event/success(.*)',
  '/api/membership/success(.*)',
  '/api/events/donation/success(.*)',
  '/membership/success(.*)',
  '/membership/qr(.*)',
  '/api/diagnostic(.*)',
  '/api/logs(.*)',
  '/mosc(.*)',
  '/syro(.*)',
  '/events(.*)',
  '/sponsors(.*)',
  '/team(.*)',
  '/gallery(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/polls(.*)',
  '/charity-theme(.*)',
  '/calendar(.*)',
  '/focus-groups(.*)',
  '/pricing(.*)',
]);

// Clerk v6: clerkMiddleware replaces authMiddleware; protect only non-public routes
const clerkMiddlewareInstance = clerkMiddleware(
  async (auth, req) => {
    const pathname = req.nextUrl.pathname;
    const isApiRoute = pathname.startsWith('/api/');
    const isApiProxy = pathname.startsWith('/api/proxy');
    const isDiagnostic = pathname.startsWith('/api/diagnostic');
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Protect non-public routes (v6: opt-in protection)
    if (!isPublicRouteClerk(req)) {
      await auth.protect();
    }

    const resolvedAuth = await auth();
    console.log('[MIDDLEWARE] afterAuth called for:', pathname);
    console.log('[MIDDLEWARE] Auth state:', { userId: resolvedAuth?.userId || null, sessionId: resolvedAuth?.sessionId || null });

    const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|WhatsApp|Mobile|CriOS|FxiOS/i.test(userAgent);
    const cloudfrontMobile = req.headers.get('cloudfront-is-mobile-viewer') === 'true';
    const cloudfrontAndroid = req.headers.get('cloudfront-is-android-viewer') === 'true';
    const cloudfrontIOS = req.headers.get('cloudfront-is-ios-viewer') === 'true';
    const isMobile = userAgentMobile || cloudfrontMobile || cloudfrontAndroid || cloudfrontIOS;

    if (isApiRoute) {
      logger.info('API REQUEST DETECTED', {
        pathname,
        method: req.method,
        isMobile,
        isProxy: isApiProxy,
        isDiagnostic,
        userAgent: userAgent.substring(0, 150),
        timestamp: new Date().toISOString(),
      });
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

    const response = NextResponse.next();
    response.headers.set('x-pathname', pathname);
    return response;
  },
  {
    ...satConfig,
    signInUrl: process.env.NEXT_PUBLIC_APP_URL?.includes('amplifyapp.com') || process.env.NEXT_PUBLIC_APP_URL?.includes('mosc-temp.com')
      ? `https://${process.env.NEXT_PUBLIC_PRIMARY_DOMAIN || 'www.event-site-manager.com'}/sign-in`
      : '/sign-in',
  }
);

// CRITICAL: Custom middleware wrapper that intercepts Clerk's 401 responses for public routes
// This prevents Clerk from returning 401 for public routes when there's no session cookie
//
// IMPORTANT: Next.js 15+ - Pass x-pathname in REQUEST headers so layout's headers() can read it.
// Layout uses pathname for admin check; without it auth() triggers "headers() should be awaited" errors.
//
// This ensures:
// - ✅ Playwright tests work (public routes don't get 401)
// - ✅ auth() calls work in layout.tsx (Clerk middleware runs)
// - ✅ Admin menu appears correctly (admin lookup in layout.tsx works)
export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  const pathname = req.nextUrl.pathname;
  const isPublic = isPublicRoute(pathname);

  if (isPublic) {
    console.log('[MIDDLEWARE] Public route detected:', pathname);
  }

  // CRITICAL: Add x-pathname to REQUEST headers so layout can read it via headers()
  // Next.js 15+ requires this for layout to avoid "headers() should be awaited" when calling auth()
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', pathname);

  // Always call Clerk middleware (even for public routes) so auth() works in layout.tsx
  let response = clerkMiddlewareInstance(req, event);
  if (response instanceof Promise) {
    response = await response;
  }

  // Build response that forwards request with x-pathname
  const nextRes = NextResponse.next({ request: { headers: requestHeaders } });

  if (isPublic && response instanceof NextResponse) {
    const location = response.headers.get('location');
    const isRedirectToSignIn = location && (location.includes('/sign-in') || location.includes('sign-in'));
    const isUnauthorized = response.status === 401 || response.status === 307 || response.status === 308;

    console.log('[MIDDLEWARE] Response for public route', pathname, ':', {
      status: response.status,
      location,
      isRedirectToSignIn,
      isUnauthorized
    });

    if (isUnauthorized || isRedirectToSignIn) {
      console.log('[MIDDLEWARE] ⚠️ Clerk returned', response.status, 'for public route', pathname, '- overriding to 200');
      nextRes.headers.set('x-pathname', pathname);
      response.headers.forEach((value, key) => {
        if ((key.startsWith('x-') || key === 'set-cookie') && key !== 'location') {
          nextRes.headers.set(key, value);
        }
      });
      return nextRes;
    }
    console.log('[MIDDLEWARE] ✅ Public route', pathname, 'allowed through with status', response.status);
  }

  // Use the response that has request headers (x-pathname) so layout and routes receive them.
  // For redirects (307/308) or 401, return Clerk's response so the client redirects or gets 401.
  if (response instanceof NextResponse) {
    const isRedirectOrUnauthorized = response.status === 401 || response.status === 307 || response.status === 308;
    if (isRedirectOrUnauthorized) return response;
    // Success: copy Clerk's headers (e.g. set-cookie) onto nextRes and return it so request keeps x-pathname.
    response.headers.forEach((value, key) => nextRes.headers.set(key, value));
    return nextRes;
  }

  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.[\\w]+$).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
