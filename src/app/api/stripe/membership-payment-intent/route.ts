import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getAppUrl, getTenantId, getPaymentMethodDomainId } from '@/lib/env';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const membershipPlanId: number = body.membershipPlanId;
    const email: string | undefined = body.email;
    const customerName: string | undefined = body.customerName;
    const customerPhone: string | undefined = body.customerPhone;

    if (!membershipPlanId) {
      return NextResponse.json({ error: 'Membership plan ID is required' }, { status: 400 });
    }

    const baseUrl = getAppUrl();

    // Fetch membership plan details from backend
    const planRes = await fetch(
      `${baseUrl}/api/proxy/membership-plans/${membershipPlanId}`,
      { cache: 'no-store' }
    );
    if (!planRes.ok) {
      const msg = await planRes.text();
      console.error('[MEMBERSHIP-PI] Failed to fetch membership plan:', planRes.status, msg);
      return NextResponse.json({ error: 'Failed to fetch membership plan' }, { status: 500 });
    }
    const plan: { id: number; price: number; currency: string; planName?: string } = await planRes.json();

    // Compute total in cents (convert to cents)
    const priceInCents = Math.round(plan.price * 100);
    if (priceInCents <= 0) {
      return NextResponse.json({ error: 'Plan price must be greater than zero' }, { status: 400 });
    }

    // Build idempotency key to prevent duplicate intents
    const timestampWindow = Math.floor(Date.now() / 30000);
    const idemSource = `membership|${membershipPlanId}|${email || ''}|${priceInCents}|${timestampWindow}`;
    const idempotencyKey = crypto.createHash('sha256').update(idemSource).digest('hex');

    console.log('[MEMBERSHIP-PI] Creating PaymentIntent:', {
      priceInCents,
      membershipPlanId,
      email,
      customerName: customerName || 'NOT_PROVIDED',
      customerPhone: customerPhone || 'NOT_PROVIDED',
      timestampWindow,
      idempotencyKey: idempotencyKey.substring(0, 8) + '...',
      timestamp: new Date().toISOString()
    });

    // Get tenant ID and Payment Method Domain ID
    let tenantId: string;
    let paymentMethodDomainId: string;

    try {
      tenantId = getTenantId();
    } catch (error) {
      console.error('[MEMBERSHIP-PI] Missing NEXT_PUBLIC_TENANT_ID:', error);
      return NextResponse.json({
        error: 'Server configuration error: Tenant ID not configured',
        details: 'NEXT_PUBLIC_TENANT_ID environment variable is required'
      }, { status: 500 });
    }

    try {
      paymentMethodDomainId = getPaymentMethodDomainId();
    } catch (error) {
      console.error('[MEMBERSHIP-PI] Missing NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID:', error);
      return NextResponse.json({
        error: 'Server configuration error: Payment Method Domain ID not configured',
        details: 'NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID environment variable is required'
      }, { status: 500 });
    }

    // Create PaymentIntent with automatic payment methods (enables wallets)
    const pi = await stripe().paymentIntents.create({
      amount: priceInCents,
      currency: plan.currency?.toLowerCase() || 'usd',
      receipt_email: email,
      automatic_payment_methods: { enabled: true },
      metadata: {
        membershipPlanId: String(membershipPlanId),
        tenantId: tenantId,
        paymentMethodDomainId: paymentMethodDomainId,
        customerEmail: email || '',
        ...(customerName ? { customerName: customerName } : {}),
        ...(customerPhone ? { customerPhone: customerPhone } : {}),
        metadataSource: 'membership_mobile_payment_intent',
        timestamp: new Date().toISOString(),
      },
    }, { idempotencyKey });

    console.log('[MEMBERSHIP-PI] PaymentIntent created successfully:', {
      id: pi.id,
      amount: pi.amount,
      status: pi.status,
      currency: pi.currency,
      created: pi.created,
      automatic_payment_methods: pi.automatic_payment_methods?.enabled
    });

    return NextResponse.json({
      clientSecret: pi.client_secret,
      paymentIntentId: pi.id,
      amount: priceInCents,
      currency: plan.currency?.toLowerCase() || 'usd',
      status: pi.status
    });
  } catch (err) {
    console.error('[MEMBERSHIP-PI] Error creating PaymentIntent:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}








