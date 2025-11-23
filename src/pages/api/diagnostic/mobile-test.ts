import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Mobile Diagnostic Test Endpoint (Pages Router)
 *
 * This endpoint is designed to verify that mobile browsers can reach API routes.
 * It logs immediately and returns diagnostic information.
 *
 * CRITICAL: This uses Pages Router to match the proxy routes pattern.
 *
 * Usage: Call from mobile browser: /api/diagnostic/mobile-test
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const timestamp = new Date().toISOString();
  const userAgent = req.headers['user-agent'] || 'unknown';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  // CRITICAL: Log immediately to verify this endpoint is being called
  console.log('[MOBILE-DIAGNOSTIC-PAGES] ===== MOBILE TEST ENDPOINT CALLED (PAGES ROUTER) =====');
  console.log('[MOBILE-DIAGNOSTIC-PAGES] Timestamp:', timestamp);
  console.log('[MOBILE-DIAGNOSTIC-PAGES] User-Agent:', userAgent);
  console.log('[MOBILE-DIAGNOSTIC-PAGES] Is Mobile:', isMobile);
  console.log('[MOBILE-DIAGNOSTIC-PAGES] Request URL:', req.url);
  console.log('[MOBILE-DIAGNOSTIC-PAGES] Request Method:', req.method);
  console.log('[MOBILE-DIAGNOSTIC-PAGES] Query:', req.query);
  console.log('[MOBILE-DIAGNOSTIC-PAGES] Headers:', req.headers);
  console.log('[MOBILE-DIAGNOSTIC-PAGES] ===== END MOBILE TEST (PAGES ROUTER) =====');

  res.status(200).json({
    success: true,
    message: 'Mobile diagnostic endpoint reached successfully (Pages Router)',
    diagnostic: {
      timestamp,
      userAgent,
      isMobile,
      url: req.url,
      method: req.method,
      query: req.query,
      headers: req.headers,
    },
    instructions: 'If you see [MOBILE-DIAGNOSTIC-PAGES] in CloudWatch logs, mobile can reach Pages Router API routes.',
  });
}

