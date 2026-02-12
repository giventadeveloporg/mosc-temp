import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CLERK_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

console.log('[MIDDLEWARE-MODULE] Middleware module loaded, Clerk:', CLERK_KEY ? 'enabled' : 'disabled');

/**
 * Middleware handler.
 *
 * When Clerk is configured: uses clerkMiddleware to process auth sessions,
 * then sets x-pathname header. This enables server-side auth() to work.
 *
 * When Clerk is NOT configured (e.g., Amplify without Clerk env vars):
 * simple passthrough that sets x-pathname header only.
 */
function plainMiddleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

// Use Clerk middleware when configured, plain middleware otherwise
const middleware = CLERK_KEY
  ? clerkMiddleware((auth, req) => {
      const pathname = req.nextUrl.pathname;
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-pathname', pathname);
      return NextResponse.next({ request: { headers: requestHeaders } });
    })
  : plainMiddleware;

export default middleware;

// Match all routes except static assets and Next.js internals
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/|uploads/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
