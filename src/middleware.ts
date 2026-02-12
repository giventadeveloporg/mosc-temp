import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";
import { createLogger } from "@/lib/logger";

const logger = createLogger('MIDDLEWARE');

/**
 * Clerk SDK Middleware (v6 compatible with Next.js 15)
 *
 * Uses clerkMiddleware so auth() in layout works with Next.js 15 async request APIs.
 * All routes are public by default; we add x-pathname and allow through without protecting.
 */

// Compute satellite config for production
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
    satConfig.isSatellite = true;
    satConfig.domain = satDomain;
  } else if (satProxyUrl) {
    satConfig.isSatellite = true;
    satConfig.proxyUrl = satProxyUrl;
  }
}
const signInUrl = process.env.NEXT_PUBLIC_APP_URL?.includes('amplifyapp.com') || process.env.NEXT_PUBLIC_APP_URL?.includes('mosc-temp.com')
  ? `https://${process.env.NEXT_PUBLIC_PRIMARY_DOMAIN || 'www.event-site-manager.com'}/sign-in`
  : '/sign-in';

// Public route patterns (for logging and 401 override only; v6 does not protect by default)
const publicRoutePatterns = [
  /^\/$/, /^\/sign-in/, /^\/sign-up/, /^\/sso-callback/, /^\/api\/webhooks/, /^\/api\/public/, /^\/api\/proxy/,
  /^\/api\/event\/success/, /^\/api\/membership\/success/, /^\/membership\/success/, /^\/membership\/qr/,
  /^\/api\/diagnostic/, /^\/api\/logs/, /^\/mosc/, /^\/syro/, /^\/events/, /^\/sponsors/, /^\/team/,
  /^\/gallery/, /^\/about/, /^\/contact/, /^\/polls/, /^\/charity-theme/, /^\/calendar/, /^\/focus-groups/, /^\/pricing/,
];
function isPublicRoute(pathname: string): boolean {
  return publicRoutePatterns.some(pattern => pattern.test(pathname));
}

export default clerkMiddleware(
  async (auth, req: NextRequest) => {
    const pathname = req.nextUrl.pathname;
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', pathname);
    let nextRes: NextResponse;

    try {
      const authData = await auth();
      console.log('[MIDDLEWARE] afterAuth called for:', pathname);
      console.log('[MIDDLEWARE] Auth state:', { userId: authData?.userId ?? null, sessionId: (authData as { sessionId?: string })?.sessionId ?? null });
    } catch (middlewareErr: unknown) {
      const err = middlewareErr instanceof Error ? middlewareErr : new Error(String(middlewareErr));
      console.error('[MIDDLEWARE-ERROR]', err.message, err.stack);
    }

    try {
      const isApiRoute = pathname.startsWith('/api/');
      const isApiProxy = pathname.startsWith('/api/proxy');
      const isDiagnostic = pathname.startsWith('/api/diagnostic');
      const userAgent = req.headers.get('user-agent') || 'unknown';
      const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|WhatsApp|Mobile|CriOS|FxiOS/i.test(userAgent);
      const isMobile = userAgentMobile ||
        req.headers.get('cloudfront-is-mobile-viewer') === 'true' ||
        req.headers.get('cloudfront-is-android-viewer') === 'true' ||
        req.headers.get('cloudfront-is-ios-viewer') === 'true';

      if (isApiRoute) {
        try {
          logger.info('API REQUEST DETECTED', {
            pathname,
            method: req.method,
            isMobile,
            isProxy: isApiProxy,
            isDiagnostic,
            userAgent: userAgent.substring(0, 150),
            timestamp: new Date().toISOString(),
          });
        } catch (_) {}
        console.log('[MIDDLEWARE] ===== API REQUEST DETECTED =====', pathname, req.method);
      }

      nextRes = NextResponse.next({ request: { headers: requestHeaders } });
      const isPublic = isPublicRoute(pathname);

      if (isPublic) {
        console.log('[MIDDLEWARE] ✅ Public route', pathname, 'allowed through');
      }
      return nextRes;
    } catch (wrapErr: unknown) {
      const err = wrapErr instanceof Error ? wrapErr : new Error(String(wrapErr));
      console.error('[MIDDLEWARE-ERROR] Unhandled:', err.message, err.stack);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
  },
  {
    ...satConfig,
    signInUrl,
  } as Parameters<typeof clerkMiddleware>[1]
);

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.[\\w]+$).*)',
    '/(api|trpc)(.*)',
  ],
};
