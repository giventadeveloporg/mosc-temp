import { NextRequest, NextResponse } from 'next/server';

/**
 * Mobile Diagnostic Test Endpoint
 *
 * This endpoint is designed to verify that mobile browsers can reach API routes.
 * It logs immediately and returns diagnostic information.
 *
 * Usage: Call from mobile browser: /api/diagnostic/mobile-test
 */
export async function GET(req: NextRequest) {
  const timestamp = new Date().toISOString();
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  // CRITICAL: Log immediately to verify this endpoint is being called
  console.log('[MOBILE-DIAGNOSTIC] ===== MOBILE TEST ENDPOINT CALLED =====');
  console.log('[MOBILE-DIAGNOSTIC] Timestamp:', timestamp);
  console.log('[MOBILE-DIAGNOSTIC] User-Agent:', userAgent);
  console.log('[MOBILE-DIAGNOSTIC] Is Mobile:', isMobile);
  console.log('[MOBILE-DIAGNOSTIC] Request URL:', req.url);
  console.log('[MOBILE-DIAGNOSTIC] Request Method:', req.method);
  console.log('[MOBILE-DIAGNOSTIC] Headers:', Object.fromEntries(req.headers.entries()));
  console.log('[MOBILE-DIAGNOSTIC] ===== END MOBILE TEST =====');

  return NextResponse.json({
    success: true,
    message: 'Mobile diagnostic endpoint reached successfully',
    diagnostic: {
      timestamp,
      userAgent,
      isMobile,
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
    },
    instructions: 'If you see this in CloudWatch logs, mobile can reach API routes. If not, there is a routing/middleware issue.',
  });
}

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  let body = null;
  try {
    body = await req.json();
  } catch (e) {
    body = { error: 'Could not parse body' };
  }

  console.log('[MOBILE-DIAGNOSTIC] ===== MOBILE TEST POST CALLED =====');
  console.log('[MOBILE-DIAGNOSTIC] Timestamp:', timestamp);
  console.log('[MOBILE-DIAGNOSTIC] User-Agent:', userAgent);
  console.log('[MOBILE-DIAGNOSTIC] Is Mobile:', isMobile);
  console.log('[MOBILE-DIAGNOSTIC] Request Body:', body);
  console.log('[MOBILE-DIAGNOSTIC] ===== END MOBILE TEST POST =====');

  return NextResponse.json({
    success: true,
    message: 'Mobile diagnostic POST endpoint reached successfully',
    diagnostic: {
      timestamp,
      userAgent,
      isMobile,
      body,
    },
  });
}

