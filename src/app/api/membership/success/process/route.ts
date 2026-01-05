import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@clerk/nextjs/server';
import {
  findSubscriptionBySessionId,
  findSubscriptionByPaymentIntentId,
  processMembershipSubscriptionSessionServer,
  processMembershipSubscriptionFromPaymentIntent,
  fetchMembershipSubscriptionDetailsServer,
} from '@/app/membership/success/ApiServerActions';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getTenantId } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { MembershipSubscriptionDTO } from '@/types';

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
 * CRITICAL: Desktop flow - creates subscription immediately if payment succeeded (webhook fallback)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get('session_id');
    const pi = searchParams.get('pi');
    const skip_qr = searchParams.get('skip_qr') === 'true';
    const _poll = searchParams.get('_poll'); // Polling attempt number (for logging)

    // CRITICAL: Server-side mobile detection for CloudWatch logging
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const cloudfrontMobile = req.headers.get('cloudfront-is-mobile-viewer') === 'true';
    const cloudfrontAndroid = req.headers.get('cloudfront-is-android-viewer') === 'true';
    const cloudfrontIOS = req.headers.get('cloudfront-is-ios-viewer') === 'true';

    // Enhanced mobile detection (same logic as client-side)
    const mobileRegexMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS|EdgiOS/i.test(userAgent);
    const platformMatch = /iPhone|iPad|iPod|Android|BlackBerry|Windows Phone/i.test(userAgent);
    const isMobile = mobileRegexMatch || platformMatch || cloudfrontMobile || cloudfrontAndroid || cloudfrontIOS;

    console.log('[MEMBERSHIP-PROCESS GET] Received:', { session_id, pi, skip_qr, _poll, isMobile });

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

        // CRITICAL: If not found by session_id, try to look up by userProfileId (backend filter for stripeSubscriptionId doesn't work correctly)
        // This handles the case where Stripe subscription was created but database record creation failed
        if (!existingSubscription) {
          try {
            const { stripe } = await import('@/lib/stripe');
            const session = await stripe().checkout.sessions.retrieve(session_id, {
              expand: ['subscription'],
            });

            // Get userProfileId from session metadata and look up ACTIVE subscription for the user
            const userId = session.metadata?.userId;
            if (userId) {
              const { fetchUserProfileServer } = await import('@/app/profile/ApiServerActions');
              const userProfile = await fetchUserProfileServer(userId);

              if (userProfile?.id) {
                const tenantId = getTenantId();
                const params = new URLSearchParams({
                  'userProfileId.equals': String(userProfile.id),
                  'tenantId.equals': tenantId, // Explicitly include tenantId (proxy handler also adds it, but explicit is fine)
                  'subscriptionStatus.in': 'ACTIVE,TRIAL', // Only look for active subscriptions
                  'sort': 'createdAt,desc', // Get most recent first
                  'size': '1', // Only need one result
                });

                console.log('[MEMBERSHIP-PROCESS GET] Trying early lookup by userProfileId:', userProfile.id);
                const lookupRes = await fetchWithJwtRetry(
                  `${getAppUrl()}/api/proxy/membership-subscriptions?${params.toString()}`,
                  { cache: 'no-store' }
                );

                if (lookupRes.ok) {
                  const items: MembershipSubscriptionDTO[] = await lookupRes.json();
                  // CRITICAL: Filter out CANCELLED/EXPIRED subscriptions - backend filter may not work correctly
                  const activeSubscriptions = items.filter(sub =>
                    sub.subscriptionStatus === 'ACTIVE' || sub.subscriptionStatus === 'TRIAL'
                  );
                  if (activeSubscriptions.length > 0) {
                    existingSubscription = activeSubscriptions[0]; // Get the most recent active one
                    console.log('[MEMBERSHIP-PROCESS GET] ✅ Found subscription by userProfileId (early lookup):', {
                      id: existingSubscription.id,
                      status: existingSubscription.subscriptionStatus,
                      planId: existingSubscription.membershipPlanId,
                    });
                  }
                }
              }
            }
          } catch (earlyLookupError) {
            console.warn('[MEMBERSHIP-PROCESS GET] Early lookup by userProfileId failed (non-fatal):', earlyLookupError);
          }
        }
      }
    } else if (pi) {
      existingSubscription = await findSubscriptionByPaymentIntentId(pi);
    }

    // CRITICAL: Only return existing subscription if it's ACTIVE or TRIAL
    // If it's CANCELLED or EXPIRED, we need to create a new one
    if (existingSubscription) {
      if (existingSubscription.subscriptionStatus === 'CANCELLED' || existingSubscription.subscriptionStatus === 'EXPIRED') {
        console.log('[MEMBERSHIP-PROCESS GET] Found cancelled/expired subscription - will create new one:', {
          subscriptionId: existingSubscription.id,
          status: existingSubscription.subscriptionStatus,
          paymentIntentId: pi,
          sessionId: session_id,
        });
        // Reset to null so we proceed to create a new subscription
        existingSubscription = null;
      } else {
        console.log('[MEMBERSHIP-PROCESS GET] Subscription found:', existingSubscription.id, 'Status:', existingSubscription.subscriptionStatus);

        // CRITICAL: First check if the existing subscription's plan ID matches the session's plan ID
        // If they DON'T match, the existing subscription itself is for a different plan and should be cancelled
        // This handles plan switches (e.g., switching from Plan 2 to Plan 1)
        try {
          // Get plan ID from session if available
          let sessionPlanId: number | null = null;
          if (session_id && !session_id.startsWith('pi_')) {
            try {
              const { stripe } = await import('@/lib/stripe');
              const session = await stripe().checkout.sessions.retrieve(session_id);
              if (session.metadata?.membershipPlanId) {
                sessionPlanId = parseInt(session.metadata.membershipPlanId, 10);
              }
            } catch (sessionError) {
              console.warn('[MEMBERSHIP-PROCESS GET] Could not retrieve session to get plan ID:', sessionError);
            }
          }

          // CRITICAL: Check if existing subscription's plan ID matches session's plan ID
          if (sessionPlanId) {
            const existingPlanId = typeof existingSubscription.membershipPlanId === 'number'
              ? existingSubscription.membershipPlanId
              : parseInt(String(existingSubscription.membershipPlanId), 10);

            console.log('[MEMBERSHIP-PROCESS GET] Checking plan match:', {
              existingSubscriptionId: existingSubscription.id,
              existingPlanId,
              sessionPlanId,
              planIdsMatch: existingPlanId === sessionPlanId,
            });

            // If plan IDs DON'T match, the existing subscription is for a different plan - cancel it
            if (existingPlanId !== sessionPlanId) {
              console.log('[MEMBERSHIP-PROCESS GET] ⚠️ Existing subscription is for DIFFERENT plan - will cancel and proceed to create new one:', {
                existingSubscriptionId: existingSubscription.id,
                existingPlanId,
                sessionPlanId,
                message: 'Plan switch detected - will cancel old subscription and create new one'
              });

              // Cancel the existing subscription (it's for the wrong plan)
              try {
                const cancelPayload = withTenantId({
                  id: existingSubscription.id!,
                  cancelAtPeriodEnd: true,
                  cancellationReason: `Switched to plan ${sessionPlanId}`,
                  subscriptionStatus: 'CANCELLED',
                  cancelledAt: new Date().toISOString(),
                });

                await fetchWithJwtRetry(
                  `${getAppUrl()}/api/proxy/membership-subscriptions/${existingSubscription.id}`,
                  {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/merge-patch+json' },
                    body: JSON.stringify(cancelPayload),
                    cache: 'no-store',
                  },
                  '[MEMBERSHIP-PROCESS GET] cancel-existing-wrong-plan-subscription'
                );

                console.log('[MEMBERSHIP-PROCESS GET] ✅ Cancelled existing subscription (wrong plan) in database:', existingSubscription.id);

                // Also cancel the Stripe subscription if it exists
                if (existingSubscription.stripeSubscriptionId) {
                  try {
                    const { stripe } = await import('@/lib/stripe');
                    const stripeSub = await stripe().subscriptions.retrieve(existingSubscription.stripeSubscriptionId);
                    if (stripeSub.status !== 'canceled' && stripeSub.status !== 'incomplete_expired') {
                      await stripe().subscriptions.update(existingSubscription.stripeSubscriptionId, {
                        cancel_at_period_end: true,
                        metadata: {
                          ...stripeSub.metadata,
                          cancellation_reason: `Switched to plan ${sessionPlanId}`,
                          cancelled_at: new Date().toISOString(),
                        },
                      });
                      console.log('[MEMBERSHIP-PROCESS GET] ✅ Cancelled Stripe subscription (wrong plan):', existingSubscription.stripeSubscriptionId);
                    } else {
                      console.log('[MEMBERSHIP-PROCESS GET] ⚠️ Stripe subscription already cancelled/incomplete_expired:', existingSubscription.stripeSubscriptionId);
                    }
                  } catch (stripeError) {
                    console.error('[MEMBERSHIP-PROCESS GET] ⚠️ Failed to cancel Stripe subscription (non-fatal):', stripeError);
                  }
                }

                // Reset to null so we proceed to create/find the subscription for the NEW plan
                existingSubscription = null;
              } catch (cancelError) {
                console.error('[MEMBERSHIP-PROCESS GET] ⚠️ Failed to cancel existing subscription (non-fatal):', cancelError);
                // Reset to null anyway so we proceed to create/find the subscription for the NEW plan
                existingSubscription = null;
              }
            } else {
              // Plan IDs match - this is the correct subscription
              console.log('[MEMBERSHIP-PROCESS GET] ✅ Existing subscription matches plan - will check for other subscriptions and return');

              // PERFORMANCE: Skip checking for other subscriptions if the current one matches the plan
              // The existing subscription already matches the session plan, so no need to cancel others
              // This avoids unnecessary queries and iterations
              console.log('[MEMBERSHIP-PROCESS GET] ✅ Existing subscription matches plan - no need to check for other subscriptions');
            }
            }
          } catch (error) {
            console.error('[MEMBERSHIP-PROCESS GET] Error checking for other plan subscriptions:', error);
            // Continue - subscription is still valid
          }

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
    }

    // CRITICAL: Desktop flow - create subscription immediately if payment succeeded (webhook fallback)
    // This is separate from mobile workflow (which uses POST endpoint via /membership/qr page)
    // Desktop flow persists subscription from frontend when webhook hasn't processed yet
    if (!isMobile) {
      // Handle Checkout Session (cs_...)
      if (session_id && !session_id.startsWith('pi_')) {
        console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] No subscription found - attempting to create from Checkout Session:', session_id);
        try {
          const { stripe } = await import('@/lib/stripe');
          const { processMembershipSubscriptionSessionServer } = await import('@/app/membership/success/ApiServerActions');

          // Retrieve Checkout Session from Stripe to validate payment succeeded
          const session = await stripe().checkout.sessions.retrieve(session_id, {
            expand: ['subscription', 'customer'],
          });

          // Only create subscription if payment succeeded
          if (session.payment_status !== 'paid') {
            console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] Checkout Session not paid:', session.payment_status);
            return NextResponse.json({
              subscription: null,
              plan: null,
              message: `Payment not completed yet. Status: ${session.payment_status}`,
            }, { status: 200 });
          }

          // Validate metadata matches environment variables
          const metadata = session.metadata || {};
          const metadataTenantId = metadata.tenantId || metadata.tenant_id;
          const metadataPaymentMethodDomainId = metadata.paymentMethodDomainId || metadata.payment_method_domain_id;
          const { getTenantId, getPaymentMethodDomainId } = await import('@/lib/env');
          const expectedTenantId = getTenantId();
          const expectedPaymentMethodDomainId = getPaymentMethodDomainId();

          if (metadataTenantId && metadataTenantId !== expectedTenantId) {
            console.error('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ⚠️⚠️⚠️ TENANT ID MISMATCH:', {
              metadataTenantId,
              expectedTenantId,
              sessionId: session_id
            });
            return NextResponse.json({
              subscription: null,
              plan: null,
              error: 'Tenant ID mismatch',
              message: `Checkout Session tenant ID (${metadataTenantId}) does not match configured tenant ID (${expectedTenantId}).`
            }, { status: 403 });
          }

          if (metadataPaymentMethodDomainId && metadataPaymentMethodDomainId !== expectedPaymentMethodDomainId) {
            console.error('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ⚠️⚠️⚠️ PAYMENT METHOD DOMAIN ID MISMATCH:', {
              metadataPaymentMethodDomainId,
              expectedPaymentMethodDomainId,
              sessionId: session_id
            });
            return NextResponse.json({
              subscription: null,
              plan: null,
              error: 'Payment Method Domain ID mismatch',
              message: `Checkout Session Payment Method Domain ID (${metadataPaymentMethodDomainId}) does not match configured Payment Method Domain ID (${expectedPaymentMethodDomainId}).`
            }, { status: 403 });
          }

          // Create subscription from session (same function used by POST endpoint)
          const result = await processMembershipSubscriptionSessionServer(session_id);

          if (result && result.subscription) {
            console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ✅ Successfully created subscription:', result.subscription.id);

            // Fetch plan details
            const details = await fetchMembershipSubscriptionDetailsServer(
              session_id || undefined,
              pi || undefined
            );

            return NextResponse.json({
              subscription: result.subscription,
              plan: result.plan || details?.plan || null,
              amount: details?.amount || result.plan?.price || null,
              currency: details?.currency || result.plan?.currency || 'USD',
            });
          } else {
            console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] Failed to create subscription from session - attempting final lookup');

            // CRITICAL: Try multiple lookup methods to find the subscription
            // 1. First try by session ID
            let finalLookup = await findSubscriptionBySessionId(session_id);
            console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] Lookup by session_id result:', finalLookup ? { id: finalLookup.id, status: finalLookup.subscriptionStatus } : 'not found');

            // 2. If not found, try by userProfileId (backend filter for stripeSubscriptionId doesn't work correctly)
            // Look up ACTIVE subscription for the user instead
            if (!finalLookup) {
              try {
                // Get userProfileId from session metadata
                const userId = session.metadata?.userId;
                if (userId) {
                  // Get user profile first to get userProfileId
                  const { fetchUserProfileServer } = await import('@/app/profile/ApiServerActions');
                  const userProfile = await fetchUserProfileServer(userId);

                  if (userProfile?.id) {
                    const tenantId = getTenantId();
                    const params = new URLSearchParams({
                      'userProfileId.equals': String(userProfile.id),
                      'tenantId.equals': tenantId,
                      'subscriptionStatus.in': 'ACTIVE,TRIAL', // Only look for active subscriptions
                      'sort': 'createdAt,desc', // Get most recent first
                      'size': '1', // Only need one result
                    });

                    console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] Trying lookup by userProfileId:', userProfile.id);
                    const lookupRes = await fetchWithJwtRetry(
                      `${getAppUrl()}/api/proxy/membership-subscriptions?${params.toString()}`,
                      { cache: 'no-store' }
                    );

                    if (lookupRes.ok) {
                      const items: MembershipSubscriptionDTO[] = await lookupRes.json();
                      // CRITICAL: Filter out CANCELLED/EXPIRED subscriptions - backend filter may not work correctly
                      const activeSubscriptions = items.filter(sub =>
                        sub.subscriptionStatus === 'ACTIVE' || sub.subscriptionStatus === 'TRIAL'
                      );
                      if (activeSubscriptions.length > 0) {
                        finalLookup = activeSubscriptions[0]; // Get the most recent active one
                        console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ✅ Found existing ACTIVE subscription for user:', {
                          id: finalLookup.id,
                          status: finalLookup.subscriptionStatus,
                          planId: finalLookup.membershipPlanId,
                        });
                      } else {
                        console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] No active subscription found for user');
                      }
                    }
                  }
                } else {
                  console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] No userId in session metadata - cannot lookup by userProfileId');
                }
              } catch (userLookupError) {
                console.error('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] Error looking up subscription by userProfileId:', userLookupError);
              }
            }

            if (finalLookup) {
              console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ✅ Found existing subscription on final lookup:', {
                id: finalLookup.id,
                status: finalLookup.subscriptionStatus,
                planId: finalLookup.membershipPlanId,
                stripeSubscriptionId: finalLookup.stripeSubscriptionId,
              });

              // CRITICAL: Return the subscription even if it's not ACTIVE or TRIAL
              // The client can handle different statuses appropriately
              const details = await fetchMembershipSubscriptionDetailsServer(
                session_id || undefined,
                pi || undefined
              );

              return NextResponse.json({
                subscription: finalLookup,
                plan: details?.plan || null,
                amount: details?.amount || null,
                currency: details?.currency || 'USD',
              });
            }

            // If still not found, return 400 error with "error.activesubscriptionexists" so client can detect it and stop polling
            // This happens when subscription creation fails because an active subscription already exists
            return NextResponse.json({
              subscription: null,
              plan: null,
              message: 'error.activesubscriptionexists',
              error: 'An active subscription already exists for this user. Please check your membership page.',
            }, { status: 400 });
          }
        } catch (createErr: any) {
          console.error('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] Error creating subscription:', createErr);

          // CRITICAL: If the error is about active subscription existing, return 400 so client can detect it
          if (createErr?.message?.includes('activesubscriptionexists') || createErr?.message?.includes('active subscription')) {
            return NextResponse.json({
              subscription: null,
              plan: null,
              message: 'error.activesubscriptionexists',
              error: 'An active subscription already exists for this user. Please check your membership page.',
            }, { status: 400 });
          }

          // Return null subscription but don't fail - allow polling to continue for other errors
          return NextResponse.json({
            subscription: null,
            plan: null,
            message: 'Subscription not found yet. Webhook may still be processing.',
          });
        }
      }

      // Handle Payment Intent (pi_...) - Desktop Stripe Elements flow
      if (pi && pi.startsWith('pi_')) {
        console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] No active subscription found - attempting to create from Payment Intent:', pi);
        console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] Existing subscription was:', existingSubscription ? `${existingSubscription.id} (${existingSubscription.subscriptionStatus})` : 'null');
        try {
          // CRITICAL: This route is public (for polling), so we can't use auth()
          // Get userId from Payment Intent metadata (customerEmail) by looking up user profile
          // The processMembershipSubscriptionFromPaymentIntent function will handle this internally
          console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] Public route - will extract userId from Payment Intent metadata (customerEmail)');

          // First, verify Payment Intent status and metadata before attempting creation
          const { stripe } = await import('@/lib/stripe');
          const paymentIntent = await stripe().paymentIntents.retrieve(pi, {
            expand: ['payment_method'],
          });

          console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] Payment Intent status:', paymentIntent.status);
          console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] Payment Intent metadata:', paymentIntent.metadata);

          // Check if payment succeeded
          if (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'requires_capture') {
            console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ⚠️ Payment Intent not in succeeded state:', paymentIntent.status);
            return NextResponse.json({
              subscription: null,
              plan: null,
              message: `Payment not completed yet. Status: ${paymentIntent.status}`,
              error: `Payment Intent status: ${paymentIntent.status}`,
            });
          }

          // Check for required metadata
          if (!paymentIntent.metadata?.membershipPlanId) {
            console.error('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ❌ Missing membershipPlanId in Payment Intent metadata');
            return NextResponse.json({
              subscription: null,
              plan: null,
              message: 'Missing required payment information. Please contact support.',
              error: 'Missing membershipPlanId in Payment Intent metadata',
            });
          }

          // Pass undefined userId - function will extract from Payment Intent metadata (customerEmail)
          console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] Calling processMembershipSubscriptionFromPaymentIntent...', {
            paymentIntentId: pi,
            timestamp: new Date().toISOString(),
          });

          const result = await processMembershipSubscriptionFromPaymentIntent(pi, undefined);

          console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] processMembershipSubscriptionFromPaymentIntent returned:', {
            hasResult: !!result,
            hasSubscription: !!(result?.subscription),
            hasPlan: !!(result?.plan),
            hasUserProfile: !!(result?.userProfile),
            subscriptionId: result?.subscription?.id,
            subscriptionStatus: result?.subscription?.subscriptionStatus,
            timestamp: new Date().toISOString(),
          });

          if (result && result.subscription) {
            console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ✅ Successfully created/retrieved subscription from Payment Intent:', {
              subscriptionId: result.subscription.id,
              status: result.subscription.subscriptionStatus,
              paymentIntentId: pi,
            });

            return NextResponse.json({
              subscription: result.subscription,
              plan: result.plan || null,
              amount: result.plan?.price || null,
              currency: result.plan?.currency || 'USD',
            });
          } else {
            console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ⚠️ Failed to create subscription from Payment Intent - result:', result);
            console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ⚠️ Payment Intent details:', {
              status: paymentIntent.status,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              metadata: paymentIntent.metadata,
              customer: paymentIntent.customer,
            });

            // CRITICAL: If subscription creation failed with "already exists" error,
            // the function should have returned the existing subscription, but if it didn't,
            // try one more lookup by payment intent ID (which may have been updated)
            const retryLookup = await findSubscriptionByPaymentIntentId(pi);
            if (retryLookup && (retryLookup.subscriptionStatus === 'ACTIVE' || retryLookup.subscriptionStatus === 'TRIAL')) {
              console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ✅ Found existing subscription on retry lookup:', retryLookup.id);

              const details = await fetchMembershipSubscriptionDetailsServer(
                undefined,
                pi
              );

              return NextResponse.json({
                subscription: retryLookup,
                plan: details?.plan || null,
                amount: details?.amount || null,
                currency: details?.currency || 'USD',
              });
            }

            // CRITICAL: Before returning error, try one more lookup by payment intent ID
            // This handles the case where subscription exists but wasn't found in processMembershipSubscriptionFromPaymentIntent
            const finalLookup = await findSubscriptionByPaymentIntentId(pi);
            if (finalLookup && (finalLookup.subscriptionStatus === 'ACTIVE' || finalLookup.subscriptionStatus === 'TRIAL')) {
              console.log('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ✅ Found existing subscription on final lookup:', finalLookup.id);

              const details = await fetchMembershipSubscriptionDetailsServer(
                undefined,
                pi
              );

              return NextResponse.json({
                subscription: finalLookup,
                plan: details?.plan || null,
                amount: details?.amount || null,
                currency: details?.currency || 'USD',
              });
            }

            // If still not found, return 400 error with "error.activesubscriptionexists" so client can detect it and stop polling
            // This happens when subscription creation fails because an active subscription already exists
            return NextResponse.json({
              subscription: null,
              plan: null,
              message: 'error.activesubscriptionexists',
              error: 'An active subscription already exists for this user. Please check your membership page.',
              paymentIntentStatus: paymentIntent.status,
              hasMetadata: !!paymentIntent.metadata,
              membershipPlanId: paymentIntent.metadata?.membershipPlanId || 'missing',
            }, { status: 400 });
          }
        } catch (createErr: any) {
          console.error('[MEMBERSHIP-PROCESS GET] [DESKTOP FLOW] ❌ Error creating subscription from Payment Intent:', {
            error: createErr,
            message: createErr?.message,
            stack: createErr?.stack,
            paymentIntentId: pi,
            errorName: createErr?.name,
            errorCode: createErr?.code,
            errorType: createErr?.type,
            fullError: JSON.stringify(createErr, Object.getOwnPropertyNames(createErr)),
          });

          // CRITICAL: If the error is about active subscription existing, return 400 so client can detect it
          if (createErr?.message?.includes('activesubscriptionexists') || createErr?.message?.includes('active subscription')) {
            return NextResponse.json({
              subscription: null,
              plan: null,
              message: 'error.activesubscriptionexists',
              error: 'An active subscription already exists for this user. Please check your membership page.',
            }, { status: 400 });
          }

          // Return detailed error for debugging (but don't fail - allow polling to continue for other errors)
          return NextResponse.json({
            subscription: null,
            plan: null,
            message: 'Subscription not found yet. Webhook may still be processing.',
            error: createErr?.message || 'Unknown error during subscription creation',
            errorType: createErr?.name || 'Error',
            errorCode: createErr?.code,
            errorStack: createErr?.stack?.substring(0, 500), // First 500 chars of stack
          });
        }
      }
    }

    // Subscription not found yet (webhook may still be processing)
    // Desktop will poll, mobile will use POST endpoint
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

    // No existing subscription - try to create from Stripe session or Payment Intent
    if (!resolvedSessionId && pi) {
      // For Payment Intent flow, use processMembershipSubscriptionFromPaymentIntent
      console.log('[MEMBERSHIP-PROCESS POST] No session ID resolved, attempting to create from Payment Intent:', pi);
      try {
        // First verify Payment Intent status and metadata
        const { stripe } = await import('@/lib/stripe');
        const paymentIntent = await stripe().paymentIntents.retrieve(pi, {
          expand: ['payment_method'],
        });

        console.log('[MEMBERSHIP-PROCESS POST] Payment Intent status:', paymentIntent.status);
        console.log('[MEMBERSHIP-PROCESS POST] Payment Intent metadata:', paymentIntent.metadata);

        // Check if payment succeeded
        if (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'requires_capture') {
          console.log('[MEMBERSHIP-PROCESS POST] ⚠️ Payment Intent not in succeeded state:', paymentIntent.status);
          return NextResponse.json({
            subscription: null,
            plan: null,
            message: `Payment not completed yet. Status: ${paymentIntent.status}`,
            error: `Payment Intent status: ${paymentIntent.status}`,
          });
        }

        // Check for required metadata
        if (!paymentIntent.metadata?.membershipPlanId) {
          console.error('[MEMBERSHIP-PROCESS POST] ❌ Missing membershipPlanId in Payment Intent metadata');
          return NextResponse.json({
            subscription: null,
            plan: null,
            message: 'Missing required payment information. Please contact support.',
            error: 'Missing membershipPlanId in Payment Intent metadata',
          });
        }

        // Create subscription from Payment Intent
        const { processMembershipSubscriptionFromPaymentIntent } = await import('@/app/membership/success/ApiServerActions');
        const result = await processMembershipSubscriptionFromPaymentIntent(pi, undefined);

        if (result && result.subscription) {
          console.log('[MEMBERSHIP-PROCESS POST] ✅ Successfully created subscription from Payment Intent:', result.subscription.id);
          return NextResponse.json({
            subscription: result.subscription,
            plan: result.plan,
            userProfile: result.userProfile,
            amount: result.plan?.price || null,
            currency: result.plan?.currency || 'USD',
          });
        } else {
          console.error('[MEMBERSHIP-PROCESS POST] ❌ Failed to create subscription from Payment Intent:', {
            paymentIntentId: pi,
            result: result === null ? 'null' : 'no subscription',
          });
          return NextResponse.json({
            subscription: null,
            plan: null,
            message: 'Failed to create subscription. Please contact support.',
            error: result === null ? 'processMembershipSubscriptionFromPaymentIntent returned null' : 'Unknown error',
            paymentIntentStatus: paymentIntent.status,
            hasMetadata: !!paymentIntent.metadata,
            membershipPlanId: paymentIntent.metadata?.membershipPlanId || 'missing',
          });
        }
      } catch (createErr: any) {
        console.error('[MEMBERSHIP-PROCESS POST] ❌ Error creating subscription from Payment Intent:', {
          error: createErr,
          message: createErr?.message,
          stack: createErr?.stack,
          paymentIntentId: pi,
        });
        return NextResponse.json({
          subscription: null,
          plan: null,
          message: 'Failed to create subscription. Please contact support.',
          error: createErr?.message || 'Unknown error during subscription creation',
          errorType: createErr?.name || 'Error',
        }, { status: 500 });
      }
    }

    if (!resolvedSessionId) {
      console.log('[MEMBERSHIP-PROCESS POST] Could not resolve session ID from payment intent');
      return NextResponse.json({
        subscription: null,
        plan: null,
        message: 'Could not resolve session ID. Please wait for webhook processing.',
        error: 'Could not resolve session ID from payment intent',
      });
    }

    console.log('[MEMBERSHIP-PROCESS POST] No subscription found, creating from session:', resolvedSessionId);
    const result = await processMembershipSubscriptionSessionServer(resolvedSessionId);

    if (!result || !result.subscription) {
      console.error('[MEMBERSHIP-PROCESS POST] ❌ Failed to create subscription from session:', {
        sessionId: resolvedSessionId,
        result: result === null ? 'null' : 'no subscription',
      });
      return NextResponse.json({
        subscription: null,
        plan: null,
        message: 'Failed to create subscription. Please contact support.',
        error: result === null ? 'processMembershipSubscriptionSessionServer returned null' : 'Unknown error',
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

