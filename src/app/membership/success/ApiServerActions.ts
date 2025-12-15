"use server";
import { stripe } from '@/lib/stripe';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getTenantId } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { MembershipPlanDTO, MembershipSubscriptionDTO, UserProfileDTO } from '@/types';

/**
 * Get session ID from payment intent
 */
async function getSessionIdFromPaymentIntent(paymentIntentId: string): Promise<string | null> {
  try {
    console.log('[MEMBERSHIP-SUCCESS] Looking up session for payment intent:', paymentIntentId);

    // Get the payment intent from Stripe
    const paymentIntent = await stripe().paymentIntents.retrieve(paymentIntentId);

    // The session ID should be in the metadata or we need to search for it
    if (paymentIntent.metadata?.session_id) {
      console.log('[MEMBERSHIP-SUCCESS] Found session_id in metadata:', paymentIntent.metadata.session_id);
      return paymentIntent.metadata.session_id;
    }

    // If not in metadata, we need to search checkout sessions
    const sessions = await stripe().checkout.sessions.list({
      payment_intent: paymentIntentId,
      limit: 1
    });

    if (sessions.data.length > 0) {
      const sessionId = sessions.data[0].id;
      console.log('[MEMBERSHIP-SUCCESS] Found session_id via lookup:', sessionId);
      return sessionId;
    }

    console.log('[MEMBERSHIP-SUCCESS] No session found for payment intent:', paymentIntentId);
    return null;
  } catch (error) {
    console.error('[MEMBERSHIP-SUCCESS] Error looking up session:', error);
    return null;
  }
}

/**
 * Find subscription by Stripe checkout session ID
 * Looks up subscription by retrieving session from Stripe, then finding by stripeSubscriptionId
 */
export async function findSubscriptionBySessionId(
  sessionId: string,
): Promise<MembershipSubscriptionDTO | null> {
  try {
    // First, get the Stripe subscription ID from the checkout session
    const session = await stripe().checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    const stripeSubscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : (session.subscription as any)?.id;

    if (!stripeSubscriptionId) {
      console.log('[MEMBERSHIP-SUCCESS] No Stripe subscription ID in session:', sessionId);
      return null;
    }

    // Look up subscription by Stripe subscription ID
    return await findSubscriptionByStripeSubscriptionId(stripeSubscriptionId);
  } catch (error) {
    console.error('[MEMBERSHIP-SUCCESS] Error finding subscription by session ID:', error);
    return null;
  }
}

/**
 * Find subscription by Stripe payment intent ID
 * Looks up subscription by retrieving payment intent, finding session, then subscription
 */
export async function findSubscriptionByPaymentIntentId(
  paymentIntentId: string,
): Promise<MembershipSubscriptionDTO | null> {
  try {
    // Get session ID from payment intent
    const sessionId = await getSessionIdFromPaymentIntent(paymentIntentId);
    if (!sessionId) {
      console.log('[MEMBERSHIP-SUCCESS] No session ID found for payment intent:', paymentIntentId);
      return null;
    }

    // Use session ID lookup
    return await findSubscriptionBySessionId(sessionId);
  } catch (error) {
    console.error('[MEMBERSHIP-SUCCESS] Error finding subscription by payment intent ID:', error);
    return null;
  }
}

/**
 * Find subscription by Stripe subscription ID (backend field: stripeSubscriptionId)
 */
async function findSubscriptionByStripeSubscriptionId(
  stripeSubscriptionId: string,
): Promise<MembershipSubscriptionDTO | null> {
  try {
    const tenantId = getTenantId();
    const params = new URLSearchParams({
      'stripeSubscriptionId.equals': stripeSubscriptionId,
      'tenantId.equals': tenantId,
    });
    const response = await fetchWithJwtRetry(
      `${getAppUrl()}/api/proxy/membership-subscriptions?${params.toString()}`,
      { cache: 'no-store' }
    );
    if (!response.ok) return null;
    const items: MembershipSubscriptionDTO[] = await response.json();
    return items.length > 0 ? items[0] : null;
  } catch (error) {
    console.error('[MEMBERSHIP-SUCCESS] Error finding subscription by Stripe subscription ID:', error);
    return null;
  }
}

/**
 * Fetch user profile by Clerk userId
 */
async function fetchUserProfileByUserId(userId: string): Promise<UserProfileDTO | null> {
  try {
    const url = `${getAppUrl()}/api/proxy/user-profiles/by-user/${userId}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error('[MEMBERSHIP-SUCCESS] Error fetching user profile:', error);
    return null;
  }
}

/**
 * Process Stripe checkout session and create subscription
 */
export async function processMembershipSubscriptionSessionServer(
  sessionId: string,
): Promise<{ subscription: MembershipSubscriptionDTO | null; plan: MembershipPlanDTO | null; userProfile: UserProfileDTO | null } | null> {
  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'subscription', 'customer'],
    });

    if (session.payment_status !== 'paid' || !session.metadata) {
      console.error('[MEMBERSHIP-SUCCESS] Session not paid or missing metadata:', {
        payment_status: session.payment_status,
        hasMetadata: !!session.metadata,
      });
      return null;
    }

    // CRITICAL: Check if subscription already exists (backend webhook may have created it)
    const existingSubscription = await findSubscriptionBySessionId(sessionId);
    if (existingSubscription) {
      console.log('[MEMBERSHIP-SUCCESS] Subscription already exists for session:', {
        sessionId,
        subscriptionId: existingSubscription.id,
        timestamp: new Date().toISOString(),
        message: 'Backend webhook already created subscription - returning existing subscription'
      });
      // Fetch plan and user profile for return
      const plan = existingSubscription.membershipPlan || await fetchMembershipPlanById(existingSubscription.membershipPlanId);
      const userProfile = existingSubscription.userProfile || await fetchUserProfileById(existingSubscription.userProfileId);
      return { subscription: existingSubscription, plan, userProfile };
    }

    // Extract metadata
    const membershipPlanId = session.metadata.membershipPlanId;
    const userId = session.metadata.userId;
    const tenantId = session.metadata.tenantId || getTenantId();

    if (!membershipPlanId || !userId) {
      console.error('[MEMBERSHIP-SUCCESS] Missing required metadata:', { membershipPlanId, userId });
      return null;
    }

    // Fetch user profile
    const userProfile = await fetchUserProfileByUserId(userId);
    if (!userProfile?.id) {
      console.error('[MEMBERSHIP-SUCCESS] User profile not found for userId:', userId);
      return null;
    }

    // Fetch membership plan
    const plan = await fetchMembershipPlanById(parseInt(membershipPlanId, 10));
    if (!plan) {
      console.error('[MEMBERSHIP-SUCCESS] Membership plan not found:', membershipPlanId);
      return null;
    }

    // Get Stripe subscription from session
    const stripeSubscription = session.subscription as any;
    const stripeSubscriptionId = stripeSubscription?.id || null;
    const stripeCustomerId = typeof session.customer === 'string' ? session.customer : (session.customer as any)?.id || null;

    // CRITICAL: Double-check by stripeSubscriptionId before creating (race condition fix)
    // This prevents duplicates when multiple requests come in simultaneously
    if (stripeSubscriptionId) {
      const existingByStripeId = await findSubscriptionByStripeSubscriptionId(stripeSubscriptionId);
      if (existingByStripeId) {
        console.log('[MEMBERSHIP-SUCCESS] Subscription already exists by Stripe subscription ID:', {
          stripeSubscriptionId,
          existingSubscriptionId: existingByStripeId.id,
          timestamp: new Date().toISOString(),
          message: 'Duplicate prevented - subscription already exists with this Stripe subscription ID'
        });
        // Fetch plan and user profile for return
        const plan = existingByStripeId.membershipPlan || await fetchMembershipPlanById(existingByStripeId.membershipPlanId);
        const userProfile = existingByStripeId.userProfile || await fetchUserProfileById(existingByStripeId.userProfileId);
        return { subscription: existingByStripeId, plan, userProfile };
      }
    }

    // Calculate trial dates if applicable
    const trialStart = plan.trialDays && plan.trialDays > 0 ? new Date().toISOString() : undefined;
    const trialEnd = plan.trialDays && plan.trialDays > 0
      ? new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    // Get current period dates from Stripe subscription
    const currentPeriodStart = stripeSubscription?.current_period_start
      ? new Date(stripeSubscription.current_period_start * 1000).toISOString()
      : new Date().toISOString();
    const currentPeriodEnd = stripeSubscription?.current_period_end
      ? new Date(stripeSubscription.current_period_end * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Default to 30 days

    // Determine subscription status
    const subscriptionStatus = plan.trialDays && plan.trialDays > 0 ? 'TRIAL' : 'ACTIVE';

    // Create subscription payload
    const subscriptionPayload = withTenantId({
      userProfileId: userProfile.id,
      membershipPlanId: plan.id!,
      subscriptionStatus,
      currentPeriodStart,
      currentPeriodEnd,
      trialStart,
      trialEnd,
      cancelAtPeriodEnd: false,
      stripeSubscriptionId,
      stripeCustomerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create subscription via backend API
    const baseUrl = getAppUrl();
    const createRes = await fetchWithJwtRetry(
      `${baseUrl}/api/proxy/membership-subscriptions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionPayload),
        cache: 'no-store',
      }
    );

    if (!createRes.ok) {
      const errorBody = await createRes.text();
      console.error('[MEMBERSHIP-SUCCESS] Failed to create subscription:', createRes.status, errorBody);
      return null;
    }

    const createdSubscription: MembershipSubscriptionDTO = await createRes.json();

    console.log('[MEMBERSHIP-SUCCESS] Subscription created successfully:', {
      subscriptionId: createdSubscription.id,
      sessionId,
      userId,
      membershipPlanId,
      timestamp: new Date().toISOString(),
    });

    return { subscription: createdSubscription, plan, userProfile };
  } catch (error) {
    console.error('[MEMBERSHIP-SUCCESS] Error processing subscription session:', error);
    return null;
  }
}

/**
 * Fetch membership plan by ID
 */
async function fetchMembershipPlanById(planId: number): Promise<MembershipPlanDTO | null> {
  try {
    const url = `${getAppUrl()}/api/proxy/membership-plans/${planId}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('[MEMBERSHIP-SUCCESS] Error fetching membership plan:', error);
    return null;
  }
}

/**
 * Fetch user profile by ID
 */
async function fetchUserProfileById(userProfileId: number): Promise<UserProfileDTO | null> {
  try {
    const url = `${getAppUrl()}/api/proxy/user-profiles/${userProfileId}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('[MEMBERSHIP-SUCCESS] Error fetching user profile:', error);
    return null;
  }
}

/**
 * Fetch membership subscription details from Stripe session or payment intent
 */
export async function fetchMembershipSubscriptionDetailsServer(
  sessionId?: string,
  paymentIntentId?: string
): Promise<{
  plan: MembershipPlanDTO | null;
  sessionId: string | null;
  amount: number | null;
  currency: string | null;
} | null> {
  try {
    let resolvedSessionId: string | null = null;

    // Resolve session ID from payment intent if needed
    if (paymentIntentId && !sessionId) {
      resolvedSessionId = await getSessionIdFromPaymentIntent(paymentIntentId);
    } else if (sessionId) {
      resolvedSessionId = sessionId;
    }

    if (!resolvedSessionId) {
      console.error('[MEMBERSHIP-SUCCESS] No session ID available');
      return null;
    }

    // Retrieve the Stripe checkout session
    const session = await stripe().checkout.sessions.retrieve(resolvedSessionId, {
      expand: ['line_items', 'subscription'],
    });

    // Get membership plan ID from metadata
    const membershipPlanId = session.metadata?.membershipPlanId ||
                             (session.subscription as any)?.metadata?.membershipPlanId;

    if (!membershipPlanId) {
      console.error('[MEMBERSHIP-SUCCESS] No membershipPlanId in session metadata');
      return null;
    }

    // Fetch membership plan details from backend
    const baseUrl = getAppUrl();
    const planRes = await fetchWithJwtRetry(
      `${baseUrl}/api/proxy/membership-plans/${membershipPlanId}`,
      { cache: 'no-store' }
    );

    if (!planRes.ok) {
      console.error('[MEMBERSHIP-SUCCESS] Failed to fetch membership plan:', planRes.status);
      return null;
    }

    const plan: MembershipPlanDTO = await planRes.json();

    // Get amount and currency from session
    // For subscriptions, amount_total might be 0 if it's a free trial or first payment deferred
    // Use plan price as fallback
    const amountTotal = session.amount_total || 0;
    const amountInDollars = amountTotal / 100; // Convert from cents
    const currency = session.currency?.toUpperCase() || 'USD';

    return {
      plan,
      sessionId: resolvedSessionId,
      amount: amountInDollars > 0 ? amountInDollars : plan.price || null, // Use plan price if session amount is 0
      currency: currency || plan.currency || 'USD',
    };
  } catch (error) {
    console.error('[MEMBERSHIP-SUCCESS] Error fetching subscription details:', error);
    return null;
  }
}
