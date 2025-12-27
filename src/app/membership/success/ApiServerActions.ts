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
 * First tries to find by stripePaymentIntentId field, then falls back to session lookup
 */
export async function findSubscriptionByPaymentIntentId(
  paymentIntentId: string,
): Promise<MembershipSubscriptionDTO | null> {
  try {
    // First, try to find by stripePaymentIntentId field (for Payment Intents created directly)
    const tenantId = getTenantId();
    const params = new URLSearchParams({
      'stripePaymentIntentId.equals': paymentIntentId,
      'tenantId.equals': tenantId,
    });
    const response = await fetchWithJwtRetry(
      `${getAppUrl()}/api/proxy/membership-subscriptions?${params.toString()}`,
      { cache: 'no-store' }
    );
    if (response.ok) {
      const items: MembershipSubscriptionDTO[] = await response.json();
      if (items.length > 0) {
        // CRITICAL: Filter out cancelled/expired subscriptions - they should not be returned
        // Caller should create a new subscription instead
        const activeSubscriptions = items.filter(sub =>
          sub.subscriptionStatus !== 'CANCELLED' && sub.subscriptionStatus !== 'EXPIRED'
        );

        if (activeSubscriptions.length > 0) {
          console.log('[MEMBERSHIP-SUCCESS] Found active subscription by stripePaymentIntentId:', activeSubscriptions[0].id);
          return activeSubscriptions[0];
        } else {
          console.log('[MEMBERSHIP-SUCCESS] Found cancelled/expired subscription by stripePaymentIntentId - will be ignored:', items[0].id);
          return null; // Return null so caller creates a new subscription
        }
      }
    }

    // Fallback: Get session ID from payment intent (for Payment Intents created via Checkout Session)
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
 * Fetch user profile by email (for public routes where userId is not available)
 */
async function fetchUserProfileByEmail(email: string): Promise<UserProfileDTO | null> {
  try {
    if (!email) return null;
    const tenantId = getTenantId();
    const params = new URLSearchParams({
      'email.equals': email,
      'tenantId.equals': tenantId,
      'size': '1',
    });
    const url = `${getAppUrl()}/api/proxy/user-profiles?${params.toString()}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    const items = Array.isArray(data) ? data : (data.content || []);
    return items.length > 0 ? items[0] : null;
  } catch (error) {
    console.error('[MEMBERSHIP-SUCCESS] Error fetching user profile by email:', error);
    return null;
  }
}

/**
 * Process Payment Intent and create subscription (for desktop Stripe Elements flow)
 */
export async function processMembershipSubscriptionFromPaymentIntent(
  paymentIntentId: string,
  userId?: string | null,
): Promise<{ subscription: MembershipSubscriptionDTO | null; plan: MembershipPlanDTO | null; userProfile: UserProfileDTO | null } | null> {
  try {
    console.log('[MEMBERSHIP-SUCCESS] Processing subscription from Payment Intent:', { paymentIntentId, userId: userId || 'will be extracted from email' });

    // Retrieve Payment Intent from Stripe (expand payment_method to get payment method details)
    const paymentIntent = await stripe().paymentIntents.retrieve(paymentIntentId, {
      expand: ['payment_method'],
    });

    // Check if payment succeeded or requires capture (both indicate successful payment)
    // Payment Intents can be in 'succeeded' or 'requires_capture' status after successful payment
    if (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'requires_capture') {
      console.log('[MEMBERSHIP-SUCCESS] Payment Intent not in succeeded state:', paymentIntent.status);
      return null;
    }

    // Extract metadata
    const metadata = paymentIntent.metadata || {};
    const membershipPlanId = metadata.membershipPlanId;
    const tenantId = metadata.tenantId || getTenantId();
    const customerEmail = metadata.customerEmail || paymentIntent.receipt_email || '';

    if (!membershipPlanId) {
      console.error('[MEMBERSHIP-SUCCESS] Missing membershipPlanId in Payment Intent metadata');
      return null;
    }

    // CRITICAL: Get userId from email if not provided (for public routes)
    let finalUserId = userId;
    let userProfile: UserProfileDTO | null = null;

    if (!finalUserId && customerEmail) {
      console.log('[MEMBERSHIP-SUCCESS] userId not provided - looking up by email:', customerEmail);
      userProfile = await fetchUserProfileByEmail(customerEmail);
      if (userProfile?.userId) {
        finalUserId = userProfile.userId;
        console.log('[MEMBERSHIP-SUCCESS] Found userId from email lookup:', finalUserId);
      } else {
        console.error('[MEMBERSHIP-SUCCESS] User profile not found for email:', customerEmail);
        return null;
      }
    } else if (finalUserId) {
      // Fetch user profile by userId
      userProfile = await fetchUserProfileByUserId(finalUserId);
    }

    if (!userProfile?.id) {
      console.error('[MEMBERSHIP-SUCCESS] User profile not found:', { userId: finalUserId, email: customerEmail });
      return null;
    }

    if (!finalUserId) {
      console.error('[MEMBERSHIP-SUCCESS] Missing userId - could not determine from email or provided value');
      return null;
    }

    // Fetch membership plan
    const plan = await fetchMembershipPlanById(parseInt(membershipPlanId, 10));
    if (!plan) {
      console.error('[MEMBERSHIP-SUCCESS] Membership plan not found:', membershipPlanId);
      return null;
    }

    // CRITICAL: Verify plan has required Stripe fields
    console.log('[MEMBERSHIP-SUCCESS] Plan details:', {
      planId: plan.id,
      planName: plan.planName,
      stripePriceId: plan.stripePriceId,
      stripeProductId: plan.stripeProductId,
      billingInterval: plan.billingInterval,
      price: plan.price,
      currency: plan.currency,
      trialDays: plan.trialDays,
    });

    if (!plan.stripePriceId) {
      console.error('[MEMBERSHIP-SUCCESS] ⚠️ Plan missing stripePriceId - cannot create Stripe Subscription:', {
        planId: plan.id,
        planName: plan.planName,
      });
    }

    // CRITICAL: Check if subscription already exists (backend webhook may have created it)
    // First try to find by Payment Intent ID (if stored)
    let existingSubscription = await findSubscriptionByPaymentIntentId(paymentIntentId);

    // CRITICAL: Only accept ACTIVE or TRIAL subscriptions - ignore CANCELLED ones
    // If a cancelled subscription is found, we need to create a new one
    if (existingSubscription && (existingSubscription.subscriptionStatus === 'CANCELLED' || existingSubscription.subscriptionStatus === 'EXPIRED')) {
      console.log('[MEMBERSHIP-SUCCESS] Found cancelled/expired subscription - will create new one:', {
        subscriptionId: existingSubscription.id,
        status: existingSubscription.subscriptionStatus,
        paymentIntentId,
      });
      existingSubscription = null; // Reset to null so we create a new subscription
    }

    // If not found by Payment Intent ID, check for active subscription for this user and plan
    // (prevents duplicates when Payment Intent ID isn't stored)
    if (!existingSubscription && userProfile.id && membershipPlanId) {
      try {
        const tenantId = getTenantId();
        const params = new URLSearchParams({
          'userProfileId.equals': String(userProfile.id),
          'membershipPlanId.equals': String(membershipPlanId),
          'tenantId.equals': tenantId,
          'subscriptionStatus.in': 'ACTIVE,TRIAL', // Check for active or trial subscriptions only
        });
        const response = await fetchWithJwtRetry(
          `${getAppUrl()}/api/proxy/membership-subscriptions?${params.toString()}`,
          { cache: 'no-store' }
        );
        if (response.ok) {
          const items: MembershipSubscriptionDTO[] = await response.json();
          // Get the most recent subscription (created within last 10 minutes to avoid old subscriptions)
          const recentSubscriptions = items.filter(sub => {
            if (!sub.createdAt) return false;
            const createdAt = new Date(sub.createdAt);
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
            return createdAt > tenMinutesAgo;
          });
          if (recentSubscriptions.length > 0) {
            // Sort by createdAt descending and take the most recent
            recentSubscriptions.sort((a, b) => {
              const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return bTime - aTime;
            });
            existingSubscription = recentSubscriptions[0];
            console.log('[MEMBERSHIP-SUCCESS] Found existing active subscription by user and plan:', {
              subscriptionId: existingSubscription.id,
              paymentIntentId,
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        console.error('[MEMBERSHIP-SUCCESS] Error checking for existing subscription by user and plan:', error);
        // Continue with creation if check fails
      }
    }

    if (existingSubscription && (existingSubscription.subscriptionStatus === 'ACTIVE' || existingSubscription.subscriptionStatus === 'TRIAL')) {
      console.log('[MEMBERSHIP-SUCCESS] Subscription already exists for Payment Intent:', {
        paymentIntentId,
        subscriptionId: existingSubscription.id,
        status: existingSubscription.subscriptionStatus,
        timestamp: new Date().toISOString(),
        message: 'Backend webhook already created subscription - returning existing subscription'
      });
      // Fetch plan and user profile for return (already fetched above)
      const plan = existingSubscription.membershipPlan || plan;
      const userProfile = existingSubscription.userProfile || userProfile;
      return { subscription: existingSubscription, plan, userProfile };
    }

    // CRITICAL: Get or create Stripe Customer from Payment Intent
    // Payment Intents may not have a customer attached initially, so we need to create/get one
    let stripeCustomerId: string | null = null;

    if (paymentIntent.customer) {
      // Customer already attached to Payment Intent
      stripeCustomerId = typeof paymentIntent.customer === 'string'
        ? paymentIntent.customer
        : (paymentIntent.customer as any)?.id || null;
      console.log('[MEMBERSHIP-SUCCESS] Found customer on Payment Intent:', stripeCustomerId);
    } else {
      // No customer attached - create/get customer from email
      console.log('[MEMBERSHIP-SUCCESS] No customer on Payment Intent - creating/getting customer from email:', customerEmail);
      try {
        // Search for existing customer by email
        const existingCustomers = await stripe().customers.list({
          email: customerEmail,
          limit: 1,
        });

        if (existingCustomers.data.length > 0) {
          stripeCustomerId = existingCustomers.data[0].id;
          console.log('[MEMBERSHIP-SUCCESS] Found existing Stripe customer:', stripeCustomerId);
        } else {
          // Create new customer
          const newCustomer = await stripe().customers.create({
            email: customerEmail,
            name: userProfile.firstName && userProfile.lastName
              ? `${userProfile.firstName} ${userProfile.lastName}`
              : undefined,
            phone: userProfile.phone || undefined,
            metadata: {
              userId: finalUserId,
              tenantId: tenantId,
              userProfileId: String(userProfile.id),
            },
          });
          stripeCustomerId = newCustomer.id;
          console.log('[MEMBERSHIP-SUCCESS] Created new Stripe customer:', stripeCustomerId);
        }
      } catch (customerError) {
        console.error('[MEMBERSHIP-SUCCESS] Error creating/getting Stripe customer:', customerError);
        // Continue without customer ID - subscription will still be created
      }
    }

    // Calculate trial dates if applicable
    const trialStart = plan.trialDays && plan.trialDays > 0 ? new Date().toISOString() : undefined;
    const trialEnd = plan.trialDays && plan.trialDays > 0
      ? new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    // Calculate current period dates based on billing interval (fallback if Stripe Subscription not created)
    let currentPeriodStart = new Date().toISOString();
    let periodDays = 30; // Default to 30 days (monthly)
    if (plan.billingInterval === 'QUARTERLY') {
      periodDays = 90; // 3 months
    } else if (plan.billingInterval === 'YEARLY') {
      periodDays = 365; // 1 year
    } else if (plan.billingInterval === 'MONTHLY') {
      periodDays = 30; // 1 month
    }
    let currentPeriodEnd = new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000).toISOString();

    // CRITICAL: Create Stripe Subscription for recurring billing
    // For membership subscriptions, we need a Stripe Subscription object for recurring charges
    let stripeSubscriptionId: string | null = null;
    let finalStripePriceId: string | null = plan.stripePriceId || null;

    // CRITICAL: If plan doesn't have stripePriceId, create/get Stripe Price on the fly
    if (!finalStripePriceId && stripeCustomerId) {
      console.log('[MEMBERSHIP-SUCCESS] Plan missing stripePriceId - creating Stripe Price on the fly:', {
        planId: plan.id,
        planName: plan.planName,
        price: plan.price,
        currency: plan.currency,
        billingInterval: plan.billingInterval,
      });

      try {
        // Determine Stripe Price interval based on billing interval
        let priceInterval: 'month' | 'year' = 'month';
        if (plan.billingInterval === 'YEARLY') {
          priceInterval = 'year';
        } else if (plan.billingInterval === 'QUARTERLY') {
          // Stripe doesn't support quarterly directly - use monthly with interval_count
          priceInterval = 'month';
        }

        // Get or create Stripe Product
        let stripeProductId = plan.stripeProductId;
        if (!stripeProductId) {
          console.log('[MEMBERSHIP-SUCCESS] Creating Stripe Product:', plan.planName);
          const stripeProduct = await stripe().products.create({
            name: plan.planName || `Membership Plan ${plan.id}`,
            description: plan.description || undefined,
            metadata: {
              membershipPlanId: String(membershipPlanId),
              tenantId: tenantId,
            },
          });
          stripeProductId = stripeProduct.id;
          console.log('[MEMBERSHIP-SUCCESS] ✅ Created Stripe Product:', stripeProductId);
        }

        // Create Stripe Price
        const priceParams: any = {
          product: stripeProductId,
          unit_amount: Math.round((plan.price || 0) * 100), // Convert to cents
          currency: (plan.currency || 'USD').toLowerCase(),
          recurring: {
            interval: priceInterval,
            ...(plan.billingInterval === 'QUARTERLY' ? { interval_count: 3 } : {}),
          },
          metadata: {
            membershipPlanId: String(membershipPlanId),
            tenantId: tenantId,
          },
        };

        const stripePrice = await stripe().prices.create(priceParams);
        finalStripePriceId = stripePrice.id;
        console.log('[MEMBERSHIP-SUCCESS] ✅ Created Stripe Price:', {
          priceId: finalStripePriceId,
          productId: stripeProductId,
          amount: plan.price,
          currency: plan.currency,
          interval: priceInterval,
        });
      } catch (priceError: any) {
        console.error('[MEMBERSHIP-SUCCESS] ❌ Error creating Stripe Price:', {
          error: priceError.message,
          type: priceError.type,
          code: priceError.code,
          planId: plan.id,
        });
        // Continue without Stripe Price - subscription will be created without Stripe Subscription
      }
    }

    if (stripeCustomerId && finalStripePriceId) {
      try {
        // CRITICAL: Payment methods from confirmed Payment Intents cannot be reused
        // Instead, we'll create the subscription and let Stripe handle payment method collection
        // Check if customer has any existing payment methods
        let hasPaymentMethod = false;
        try {
          const paymentMethods = await stripe().paymentMethods.list({
            customer: stripeCustomerId,
            limit: 1,
          });
          hasPaymentMethod = paymentMethods.data.length > 0;

          if (hasPaymentMethod) {
            console.log('[MEMBERSHIP-SUCCESS] Customer has existing payment methods:', {
              customerId: stripeCustomerId,
              paymentMethodCount: paymentMethods.data.length,
              defaultPaymentMethod: paymentMethods.data[0]?.id,
            });
          } else {
            console.log('[MEMBERSHIP-SUCCESS] Customer has no existing payment methods - will create subscription with default_incomplete behavior:', {
              customerId: stripeCustomerId,
            });
          }
        } catch (pmListError: any) {
          console.warn('[MEMBERSHIP-SUCCESS] Could not list customer payment methods:', pmListError.message);
        }

        console.log('[MEMBERSHIP-SUCCESS] Creating Stripe Subscription for recurring billing:', {
          customerId: stripeCustomerId,
          priceId: finalStripePriceId,
          trialDays: plan.trialDays,
          hasPaymentMethod,
        });

        const subscriptionParams: any = {
          customer: stripeCustomerId,
          items: [{ price: finalStripePriceId }],
          metadata: {
            membershipPlanId: String(membershipPlanId),
            tenantId: tenantId,
            userId: finalUserId,
            userProfileId: String(userProfile.id),
            paymentIntentId: paymentIntentId,
          },
          // CRITICAL: Use default_incomplete to allow subscription creation without payment method
          // The subscription will be created but may require payment method setup for future invoices
          payment_behavior: 'default_incomplete',
          payment_settings: {
            save_default_payment_method: 'on_subscription',
          },
          expand: ['latest_invoice.payment_intent'],
        };

        // Add trial period if applicable
        if (plan.trialDays && plan.trialDays > 0) {
          subscriptionParams.trial_period_days = plan.trialDays;
        }

        const stripeSubscription = await stripe().subscriptions.create(subscriptionParams);

        // Update current period dates from Stripe Subscription (more accurate than calculated dates)
        if (stripeSubscription.current_period_start) {
          currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000).toISOString();
        }
        if (stripeSubscription.current_period_end) {
          currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000).toISOString();
        }

        stripeSubscriptionId = stripeSubscription.id;
        console.log('[MEMBERSHIP-SUCCESS] ✅ Created Stripe Subscription:', {
          subscriptionId: stripeSubscriptionId,
          status: stripeSubscription.status,
          latestInvoiceStatus: (stripeSubscription.latest_invoice as any)?.status || 'N/A',
          currentPeriodStart,
          currentPeriodEnd,
          customerId: stripeCustomerId,
          priceId: finalStripePriceId,
          hasPaymentMethod: hasPaymentMethod,
          paymentBehavior: 'default_incomplete',
        });

        // Log warning if subscription is incomplete and needs payment method
        if (stripeSubscription.status === 'incomplete' || stripeSubscription.status === 'incomplete_expired') {
          console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Subscription created but is incomplete - payment method may be required:', {
            subscriptionId: stripeSubscriptionId,
            status: stripeSubscription.status,
            latestInvoiceStatus: (stripeSubscription.latest_invoice as any)?.status,
            message: 'Subscription ID is created but may need payment method for future invoices',
          });
        }
      } catch (subscriptionError: any) {
        console.error('[MEMBERSHIP-SUCCESS] ❌ Error creating Stripe Subscription:', {
          error: subscriptionError.message,
          type: subscriptionError.type,
          code: subscriptionError.code,
          statusCode: subscriptionError.statusCode,
          customerId: stripeCustomerId,
          priceId: finalStripePriceId,
          planId: plan.id,
          planName: plan.planName,
          stack: subscriptionError.stack?.substring(0, 500), // Limit stack trace length
        });
        // Continue without Stripe Subscription ID - subscription will still be created in database
        // This allows manual reconciliation later
      }
    } else {
      console.warn('[MEMBERSHIP-SUCCESS] ⚠️ Skipping Stripe Subscription creation - missing requirements:', {
        hasCustomerId: !!stripeCustomerId,
        hasPriceId: !!finalStripePriceId,
        customerId: stripeCustomerId || 'MISSING',
        priceId: finalStripePriceId || 'MISSING',
        planId: plan.id,
        planName: plan.planName,
      });
    }

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
      stripePaymentIntentId: paymentIntentId, // CRITICAL: Store Payment Intent ID for tracking
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create subscription via backend API
    const baseUrl = getAppUrl();
    console.log('[MEMBERSHIP-SUCCESS] Creating subscription with payload (all fields):', {
      // Required fields
      tenantId: subscriptionPayload.tenantId,
      userProfileId: subscriptionPayload.userProfileId,
      membershipPlanId: subscriptionPayload.membershipPlanId,
      subscriptionStatus: subscriptionPayload.subscriptionStatus,
      currentPeriodStart: subscriptionPayload.currentPeriodStart,
      currentPeriodEnd: subscriptionPayload.currentPeriodEnd,
      cancelAtPeriodEnd: subscriptionPayload.cancelAtPeriodEnd,
      // Stripe fields
      stripeSubscriptionId: subscriptionPayload.stripeSubscriptionId || 'NULL (will be set if Stripe Subscription created)',
      stripeCustomerId: subscriptionPayload.stripeCustomerId || 'NULL',
      stripePaymentIntentId: subscriptionPayload.stripePaymentIntentId || 'NULL',
      // Optional fields
      trialStart: subscriptionPayload.trialStart || 'NULL',
      trialEnd: subscriptionPayload.trialEnd || 'NULL',
      createdAt: subscriptionPayload.createdAt,
      updatedAt: subscriptionPayload.updatedAt,
    });

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
      console.error('[MEMBERSHIP-SUCCESS] ❌ Failed to create subscription:', {
        status: createRes.status,
        statusText: createRes.statusText,
        errorBody,
        paymentIntentId,
        userId,
      });
      return null;
    }

    const createdSubscription: MembershipSubscriptionDTO = await createRes.json();

    console.log('[MEMBERSHIP-SUCCESS] ✅ Subscription created successfully from Payment Intent:', {
      subscriptionId: createdSubscription.id,
      subscriptionStatus: createdSubscription.subscriptionStatus,
      paymentIntentId,
      userId: finalUserId,
      stripePaymentIntentId: createdSubscription.stripePaymentIntentId,
      stripeCustomerId: createdSubscription.stripeCustomerId,
      stripeSubscriptionId: createdSubscription.stripeSubscriptionId,
      currentPeriodStart: createdSubscription.currentPeriodStart,
      currentPeriodEnd: createdSubscription.currentPeriodEnd,
      membershipPlanId,
      timestamp: new Date().toISOString(),
    });

    return { subscription: createdSubscription, plan, userProfile };
  } catch (error) {
    console.error('[MEMBERSHIP-SUCCESS] Error processing subscription from Payment Intent:', error);
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
