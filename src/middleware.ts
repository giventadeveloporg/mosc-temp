import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createLogger } from "@/lib/logger";

const logger = createLogger('MIDDLEWARE');
const DEBUG_MIDDLEWARE = process.env.NEXT_PUBLIC_DEBUG_MIDDLEWARE === 'true';
const debugLog = (...args: unknown[]) => { if (DEBUG_MIDDLEWARE) console.log(...args); };

/**
 * Clerk v6 Middleware
 *
 * CRITICAL: Clerk 6 requires the default export to be the return value of clerkMiddleware()
 * so it can detect usage and allow auth() in layout.tsx. Do not wrap in a custom function.
 *
 * - Public routes: do not call auth.protect(), return NextResponse.next() with x-pathname.
 * - Protected routes: call auth.protect(), then return NextResponse.next() with x-pathname.
 * - x-pathname on request headers so layout can read it via headers() (Next.js 15+).
 *
 * See: .cursor/rules/clerk_auth_admin_user_lookup.mdc
 */

// Satellite config (disabled for localhost)
const isLocalhost = process.env.NEXT_PUBLIC_APP_URL?.includes('localhost') ||
                    process.env.NEXT_PUBLIC_APP_URL?.includes('127.0.0.1') ||
                    !process.env.NEXT_PUBLIC_APP_URL;
const isSatEnv = !isLocalhost && (
  process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === 'true' ||
  process.env.NEXT_PUBLIC_APP_URL?.includes('mosc-temp.com')
);
const satDomain = process.env.NEXT_PUBLIC_CLERK_DOMAIN || (process.env.NEXT_PUBLIC_APP_URL?.includes('mosc-temp.com') ? 'www.mosc-temp.com' : undefined);
const satProxyUrl = process.env.NEXT_PUBLIC_CLERK_PROXY_URL;
const satConfig: Record<string, unknown> = {};
if (isSatEnv && !isLocalhost) {
  if (satDomain) {
    Object.assign(satConfig, { isSatellite: true, domain: satDomain });
  } else if (satProxyUrl) {
    Object.assign(satConfig, { isSatellite: true, proxyUrl: satProxyUrl });
  }
}

// Clerk v6: public routes – do not call auth.protect() for these
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
  '/mosc-old(.*)',
  '/mosc(.*)',
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

// Clerk 6: default export MUST be clerkMiddleware() so auth() is detected in layout
export default clerkMiddleware(
  async (auth, req: NextRequest) => {
    const pathname = req.nextUrl.pathname;
    const isApiRoute = pathname.startsWith('/api/');
    const isApiProxy = pathname.startsWith('/api/proxy');
    const isDiagnostic = pathname.startsWith('/api/diagnostic');
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Protect only non-public routes (v6: opt-in protection)
    if (!isPublicRouteClerk(req)) {
      await auth.protect();
    }

    // PERFORMANCE: Only resolve auth() for non-public routes.
    // auth() makes a network call to Clerk API (~300-800ms on Lambda cold start).
    // Public routes (/, /mosc-old, /mosc, /events, etc.) don't need auth state in middleware,
    // so skipping this call saves significant latency on the critical render path.
    let resolvedAuth: { userId?: string | null; sessionId?: string | null } | null = null;
    if (!isPublicRouteClerk(req)) {
      resolvedAuth = await auth();
    }
    debugLog('[MIDDLEWARE] afterAuth called for:', pathname);
    debugLog('[MIDDLEWARE] Auth state:', { userId: resolvedAuth?.userId ?? null, sessionId: resolvedAuth?.sessionId ?? null });

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
      debugLog('[MIDDLEWARE] ===== API REQUEST DETECTED =====');
      debugLog('[MIDDLEWARE] Pathname:', pathname);
      debugLog('[MIDDLEWARE] Method:', req.method);
      debugLog('[MIDDLEWARE] Is Mobile:', isMobile);
      debugLog('[MIDDLEWARE] Is Proxy:', isApiProxy);
      debugLog('[MIDDLEWARE] Is Diagnostic:', isDiagnostic);
      debugLog('[MIDDLEWARE] User-Agent:', userAgent.substring(0, 150));
      debugLog('[MIDDLEWARE] Timestamp:', new Date().toISOString());
      debugLog('[MIDDLEWARE] ===== END API REQUEST LOG =====');
    }

    // Next.js 15+: pass x-pathname so layout can read it via headers()
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', pathname);

    const response = NextResponse.next({ request: { headers: requestHeaders } });
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

export const config = {
  matcher: [
    // Skip Next.js internals and static files (Clerk-recommended pattern)
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
