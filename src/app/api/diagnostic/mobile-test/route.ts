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

  // Enhanced mobile detection: Include WhatsApp, mobile browsers, and CloudFront headers
  const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|WhatsApp|Mobile|CriOS|FxiOS/i.test(userAgent);
  const cloudfrontMobile = req.headers.get('cloudfront-is-mobile-viewer') === 'true';
  const cloudfrontAndroid = req.headers.get('cloudfront-is-android-viewer') === 'true';
  const cloudfrontIOS = req.headers.get('cloudfront-is-ios-viewer') === 'true';
  const isMobile = userAgentMobile || cloudfrontMobile || cloudfrontAndroid || cloudfrontIOS;

  // CRITICAL: Log immediately to verify this endpoint is being called
  console.log('[MOBILE-DIAGNOSTIC] ===== MOBILE TEST ENDPOINT CALLED =====');
  console.log('[MOBILE-DIAGNOSTIC] Timestamp:', timestamp);
  console.log('[MOBILE-DIAGNOSTIC] User-Agent:', userAgent);
  console.log('[MOBILE-DIAGNOSTIC] User-Agent Mobile Match:', userAgentMobile);
  console.log('[MOBILE-DIAGNOSTIC] CloudFront Mobile:', cloudfrontMobile);
  console.log('[MOBILE-DIAGNOSTIC] CloudFront Android:', cloudfrontAndroid);
  console.log('[MOBILE-DIAGNOSTIC] CloudFront iOS:', cloudfrontIOS);
  console.log('[MOBILE-DIAGNOSTIC] Final Is Mobile:', isMobile);
  console.log('[MOBILE-DIAGNOSTIC] Request URL:', req.url);
  console.log('[MOBILE-DIAGNOSTIC] Request Method:', req.method);
  console.log('[MOBILE-DIAGNOSTIC] ===== END MOBILE TEST =====');

  // Return response with proper CORS headers for mobile browsers
  return NextResponse.json({
    success: true,
    message: 'Mobile diagnostic endpoint reached successfully',
    diagnostic: {
      timestamp,
      userAgent,
      isMobile,
      userAgentMobile,
      cloudfrontMobile,
      cloudfrontAndroid,
      cloudfrontIOS,
      url: req.url,
      method: req.method,
    },
    instructions: 'If you see this in CloudWatch logs, mobile can reach API routes. If not, there is a routing/middleware issue.',
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function OPTIONS(req: NextRequest) {
  // Handle CORS preflight requests for mobile browsers
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
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

