"use server";
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getTenantId } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
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
 */
export async function createSubscriptionCheckoutSessionServer(
  planId: number,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionUrl: string }> {
  if (!API_BASE_URL) {
    throw new Error('API base URL not configured');
  }

  // Call backend endpoint to create checkout session
  // This endpoint should be created in the backend to handle Stripe checkout session creation
  const payload = withTenantId({
    membershipPlanId: planId,
    successUrl,
    cancelUrl,
  });

  const url = `${API_BASE_URL}/api/billing/manage-subscription`;
  const res = await fetchWithJwtRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('Failed to create checkout session:', res.status, errorBody);
    throw new Error('Failed to create checkout session');
  }

  return res.json();
}



