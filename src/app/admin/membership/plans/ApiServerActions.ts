"use server";
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getTenantId } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { MembershipPlanDTO } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Fetch all membership plans for admin
 */
export async function fetchAllMembershipPlansServer(): Promise<MembershipPlanDTO[]> {
  if (!API_BASE_URL) {
    throw new Error('API base URL not configured');
  }

  const params = new URLSearchParams();
  params.append('tenantId.equals', getTenantId());
  params.append('sort', 'createdAt,desc');

  const url = `${getAppUrl()}/api/proxy/membership-plans?${params.toString()}`;
  const res = await fetchWithJwtRetry(url, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('Failed to fetch membership plans:', res.status, await res.text());
    return [];
  }

  const plans = await res.json();

  // Convert featuresJson from string to object for frontend use
  return plans.map((plan: any) => ({
    ...plan,
    featuresJson: typeof plan.featuresJson === 'string'
      ? (plan.featuresJson ? JSON.parse(plan.featuresJson) : {})
      : plan.featuresJson || {}
  }));
}

/**
 * Create a new membership plan
 */
export async function createMembershipPlanServer(
  plan: Omit<MembershipPlanDTO, 'id' | 'createdAt' | 'updatedAt'>
): Promise<MembershipPlanDTO> {
  if (!API_BASE_URL) {
    throw new Error('API base URL not configured');
  }

  // Omit id field entirely for create operations - backend will generate it
  const { id, ...planWithoutId } = plan as any;

  // Convert featuresJson from object to JSON string (backend expects String, not JsonB)
  const featuresJsonString = typeof planWithoutId.featuresJson === 'string'
    ? planWithoutId.featuresJson
    : JSON.stringify(planWithoutId.featuresJson || {});

  const payload = withTenantId({
    ...planWithoutId,
    featuresJson: featuresJsonString,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // CRITICAL: Ensure body is stringified
  const body = JSON.stringify(payload);

  console.log('[SERVER ACTION] Creating membership plan with payload:', payload);
  console.log('[SERVER ACTION] Body stringified:', body);

  const url = `${getAppUrl()}/api/proxy/membership-plans`;
  const res = await fetchWithJwtRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body, // CRITICAL: Must include body
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('[SERVER ACTION] Failed to create membership plan:', res.status, errorBody);
    throw new Error(`Failed to create membership plan: ${errorBody}`);
  }

  const createdPlan = await res.json();

  // Convert featuresJson from string to object for frontend use
  return {
    ...createdPlan,
    featuresJson: typeof createdPlan.featuresJson === 'string'
      ? (createdPlan.featuresJson ? JSON.parse(createdPlan.featuresJson) : {})
      : createdPlan.featuresJson || {}
  };
}

/**
 * Update an existing membership plan
 */
export async function updateMembershipPlanServer(
  planId: number,
  plan: Partial<MembershipPlanDTO>
): Promise<MembershipPlanDTO> {
  if (!API_BASE_URL) {
    throw new Error('API base URL not configured');
  }

  // Convert featuresJson from object to JSON string if present (backend expects String, not JsonB)
  const featuresJsonString = plan.featuresJson !== undefined
    ? (typeof plan.featuresJson === 'string'
        ? plan.featuresJson
        : JSON.stringify(plan.featuresJson))
    : undefined;

  const finalPayload = withTenantId({
    ...plan,
    ...(featuresJsonString !== undefined && { featuresJson: featuresJsonString }),
    id: planId,
    updatedAt: new Date().toISOString(),
  });

  const url = `${getAppUrl()}/api/proxy/membership-plans/${planId}`;
  const res = await fetchWithJwtRetry(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/merge-patch+json',
    },
    body: JSON.stringify(finalPayload),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('Failed to update membership plan:', res.status, errorBody);
    throw new Error('Failed to update membership plan');
  }

  const updatedPlan = await res.json();

  // Convert featuresJson from string to object for frontend use
  return {
    ...updatedPlan,
    featuresJson: typeof updatedPlan.featuresJson === 'string'
      ? (updatedPlan.featuresJson ? JSON.parse(updatedPlan.featuresJson) : {})
      : updatedPlan.featuresJson || {}
  };
}

/**
 * Delete a membership plan
 */
export async function deleteMembershipPlanServer(planId: number): Promise<void> {
  if (!API_BASE_URL) {
    throw new Error('API base URL not configured');
  }

  const url = `${getAppUrl()}/api/proxy/membership-plans/${planId}`;
  const res = await fetchWithJwtRetry(url, {
    method: 'DELETE',
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('Failed to delete membership plan:', res.status, errorBody);
    throw new Error('Failed to delete membership plan');
  }
}

/**
 * Toggle plan active status
 */
export async function togglePlanActiveStatusServer(
  planId: number,
  isActive: boolean
): Promise<MembershipPlanDTO> {
  return updateMembershipPlanServer(planId, { isActive });
}


