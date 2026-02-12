import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

console.log('[MIDDLEWARE-MODULE] Middleware module loaded');

/**
 * Middleware handler.
 *
 * Clerk authentication is currently disabled (not configured in Amplify).
 * This middleware simply sets x-pathname header and passes through all requests.
 * When Clerk is re-enabled, restore clerkMiddleware wrapping.
 */
export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', pathname);
  console.log('[MIDDLEWARE]', req.method, pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

// TEMPORARILY disabled matcher to test if middleware causes 500 on Amplify
// If the app works with empty matcher, the issue is in middleware Edge Runtime
export const config = {
  matcher: [],
};
