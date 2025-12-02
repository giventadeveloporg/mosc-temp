"use server";
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getTenantId, getPaymentMethodDomainId } from '@/lib/env';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import type { MembershipPlanDTO } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Fetch a specific membership plan by ID
 */
export async function fetchMembershipPlanServer(planId: number): Promise<MembershipPlanDTO | null> {
  if (!API_BASE_URL) {
    throw new Error('API base URL not configured');
  }

  if (!planId) {
    return null;
  }

  const url = `${getAppUrl()}/api/proxy/membership-plans/${planId}`;
  const res = await fetchWithJwtRetry(url, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    console.error('Failed to fetch membership plan:', res.status, await res.text());
    throw new Error('Failed to fetch membership plan');
  }

  return res.json();
}

/**
 * Create a Stripe checkout session for subscription signup
 * CRITICAL: This is a server action - auth() works directly here
 */
export async function createSubscriptionCheckoutSessionServer(
  planId: number,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionUrl: string }> {
  // Get authenticated user - auth() works directly in server actions
  // Next.js 15+ requires headers() to be awaited before auth() uses it
  const { headers } = await import('next/headers');
  await headers(); // Ensure headers() is awaited before auth()
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized - Please sign in');
  }

  const baseUrl = getAppUrl();

  // Fetch membership plan details from backend
  const planRes = await fetchWithJwtRetry(
    `${baseUrl}/api/proxy/membership-plans/${planId}`,
    { cache: 'no-store' }
  );

  if (!planRes.ok) {
    const msg = await planRes.text();
    console.error('[MEMBERSHIP-CHECKOUT] Failed to fetch membership plan:', planRes.status, msg);
    throw new Error('Failed to fetch membership plan');
  }

  const plan: {
    id: number;
    price: number;
    currency: string;
    planName?: string;
    stripePriceId?: string;
    billingInterval?: string;
  } = await planRes.json();

  // Get tenant ID and Payment Method Domain ID
  let tenantId: string;
  let paymentMethodDomainId: string;

  try {
    tenantId = getTenantId();
  } catch (error) {
    console.error('[MEMBERSHIP-CHECKOUT] Missing NEXT_PUBLIC_TENANT_ID:', error);
    throw new Error('Server configuration error: Tenant ID not configured');
  }

  try {
    paymentMethodDomainId = getPaymentMethodDomainId();
  } catch (error) {
    console.error('[MEMBERSHIP-CHECKOUT] Missing NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID:', error);
    throw new Error('Server configuration error: Payment Method Domain ID not configured');
  }

  // Determine payment methods based on environment
  const isProduction = process.env.NODE_ENV === 'production';
  const paymentMethods: ('card' | 'link' | 'cashapp')[] = isProduction
    ? ['card', 'link', 'cashapp']
    : ['card', 'link'];

  // Convert billing interval to Stripe interval
  const stripeInterval = plan.billingInterval === 'MONTHLY' ? 'month' :
                        plan.billingInterval === 'QUARTERLY' ? 'month' :
                        plan.billingInterval === 'YEARLY' ? 'year' :
                        'month';
  const intervalCount = plan.billingInterval === 'QUARTERLY' ? 3 : 1;

  // Create Stripe Checkout Session
  const sessionParams: any = {
    payment_method_types: paymentMethods,
    mode: 'subscription',
    success_url: successUrl || `${baseUrl}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${baseUrl}/membership?canceled=true`,
    billing_address_collection: 'auto',
    metadata: {
      membershipPlanId: String(planId),
      userId: userId,
      tenantId: tenantId,
      paymentMethodDomainId: paymentMethodDomainId,
      metadataSource: 'membership_checkout',
      timestamp: new Date().toISOString(),
    },
    subscription_data: {
      metadata: {
        membershipPlanId: String(planId),
        userId: userId,
        tenantId: tenantId,
        paymentMethodDomainId: paymentMethodDomainId,
      },
    },
  };

  // If plan has stripePriceId, use it; otherwise create price_data
  if (plan.stripePriceId) {
    sessionParams.line_items = [{
      price: plan.stripePriceId,
      quantity: 1,
    }];
  } else {
    // Create price_data inline (for plans without Stripe Price ID)
    sessionParams.line_items = [{
      price_data: {
        currency: plan.currency?.toLowerCase() || 'usd',
        product_data: {
          name: plan.planName || `Membership Plan ${planId}`,
          description: `Membership subscription - ${plan.billingInterval || 'Monthly'}`,
        },
        unit_amount: Math.round(plan.price * 100), // Convert to cents
        recurring: {
          interval: stripeInterval,
          interval_count: intervalCount,
        },
      },
      quantity: 1,
    }];
  }

  const session = await stripe().checkout.sessions.create(sessionParams);

  if (!session.url) {
    throw new Error('Failed to create checkout session URL');
  }

  console.log('[MEMBERSHIP-CHECKOUT] Checkout session created:', {
    sessionId: session.id,
    url: session.url,
    membershipPlanId: planId,
    userId,
  });

  return { sessionUrl: session.url };
}



