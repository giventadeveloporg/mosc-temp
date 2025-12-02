import { NextRequest, NextResponse } from 'next/server';
import {
  findSubscriptionBySessionId,
  findSubscriptionByPaymentIntentId,
  processMembershipSubscriptionSessionServer,
  fetchMembershipSubscriptionDetailsServer,
} from '@/app/membership/success/ApiServerActions';

export const dynamic = 'force-dynamic';

// Function to get session_id from payment intent
async function getSessionIdFromPaymentIntent(paymentIntentId: string): Promise<string | null> {
  try {
    const { stripe } = await import('@/lib/stripe');
    console.log('[MEMBERSHIP-PROCESS] Looking up session for payment intent:', paymentIntentId);

    const paymentIntent = await stripe().paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.metadata?.session_id) {
      console.log('[MEMBERSHIP-PROCESS] Found session_id in metadata:', paymentIntent.metadata.session_id);
      return paymentIntent.metadata.session_id;
    }

    const sessions = await stripe().checkout.sessions.list({
      payment_intent: paymentIntentId,
      limit: 1
    });

    if (sessions.data.length > 0) {
      const sessionId = sessions.data[0].id;
      console.log('[MEMBERSHIP-PROCESS] Found session_id via lookup:', sessionId);
      return sessionId;
    }

    console.log('[MEMBERSHIP-PROCESS] No session found for payment intent:', paymentIntentId);
    return null;
  } catch (error) {
    console.error('[MEMBERSHIP-PROCESS] Error looking up session:', error);
    return null;
  }
}

/**
 * GET /api/membership/success/process
 * Look up existing subscription by session_id or payment_intent
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get('session_id');
    const pi = searchParams.get('pi');
    const skip_qr = searchParams.get('skip_qr') === 'true';

    console.log('[MEMBERSHIP-PROCESS GET] Received:', { session_id, pi, skip_qr });

    if (!session_id && !pi) {
      return NextResponse.json({ error: 'Missing session_id or pi (payment_intent)' }, { status: 400 });
    }

    // First check if subscription already exists
    let existingSubscription = null;
    if (session_id) {
      if (session_id.startsWith('pi_')) {
        console.log('[MEMBERSHIP-PROCESS GET] session_id parameter is actually a payment intent ID:', session_id);
        existingSubscription = await findSubscriptionByPaymentIntentId(session_id);
      } else {
        existingSubscription = await findSubscriptionBySessionId(session_id);
      }
    } else if (pi) {
      existingSubscription = await findSubscriptionByPaymentIntentId(pi);
    }

    if (existingSubscription) {
      console.log('[MEMBERSHIP-PROCESS GET] Subscription found:', existingSubscription.id);

      // Fetch plan details
      const details = await fetchMembershipSubscriptionDetailsServer(
        session_id || undefined,
        pi || undefined
      );

      return NextResponse.json({
        subscription: existingSubscription,
        plan: details?.plan || null,
        amount: details?.amount || null,
        currency: details?.currency || null,
      });
    }

    // Subscription not found yet (webhook may still be processing)
    return NextResponse.json({
      subscription: null,
      plan: null,
      message: 'Subscription not found yet. Webhook may still be processing.',
    });
  } catch (error) {
    console.error('[MEMBERSHIP-PROCESS GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/membership/success/process
 * Create subscription from Stripe session if webhook failed
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, pi, skip_qr } = body;

    console.log('[MEMBERSHIP-PROCESS POST] Received:', { session_id, pi, skip_qr });

    if (!session_id && !pi) {
      return NextResponse.json({ error: 'Missing session_id or pi (payment_intent)' }, { status: 400 });
    }

    // First check if subscription already exists
    let existingSubscription = null;
    let resolvedSessionId: string | null = null;

    if (session_id) {
      if (session_id.startsWith('pi_')) {
        console.log('[MEMBERSHIP-PROCESS POST] session_id parameter is actually a payment intent ID:', session_id);
        existingSubscription = await findSubscriptionByPaymentIntentId(session_id);
        resolvedSessionId = await getSessionIdFromPaymentIntent(session_id);
      } else {
        existingSubscription = await findSubscriptionBySessionId(session_id);
        resolvedSessionId = session_id;
      }
    } else if (pi) {
      existingSubscription = await findSubscriptionByPaymentIntentId(pi);
      resolvedSessionId = await getSessionIdFromPaymentIntent(pi);
    }

    if (existingSubscription) {
      console.log('[MEMBERSHIP-PROCESS POST] Subscription already exists:', existingSubscription.id);

      const details = await fetchMembershipSubscriptionDetailsServer(
        resolvedSessionId || undefined,
        pi || undefined
      );

      return NextResponse.json({
        subscription: existingSubscription,
        plan: details?.plan || null,
        amount: details?.amount || null,
        currency: details?.currency || null,
      });
    }

    // No existing subscription - try to create from Stripe session
    if (!resolvedSessionId) {
      console.log('[MEMBERSHIP-PROCESS POST] Could not resolve session ID from payment intent');
      return NextResponse.json({
        subscription: null,
        plan: null,
        message: 'Could not resolve session ID. Please wait for webhook processing.',
      });
    }

    console.log('[MEMBERSHIP-PROCESS POST] No subscription found, creating from session:', resolvedSessionId);
    const result = await processMembershipSubscriptionSessionServer(resolvedSessionId);

    if (!result || !result.subscription) {
      return NextResponse.json({
        subscription: null,
        plan: null,
        message: 'Failed to create subscription. Please contact support.',
      });
    }

    // Fetch amount and currency from session details
    const details = await fetchMembershipSubscriptionDetailsServer(
      resolvedSessionId || undefined,
      pi || undefined
    );

    return NextResponse.json({
      subscription: result.subscription,
      plan: result.plan,
      userProfile: result.userProfile,
      amount: details?.amount || result.plan?.price || null,
      currency: details?.currency || result.plan?.currency || 'USD',
    });
  } catch (error) {
    console.error('[MEMBERSHIP-PROCESS POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}

