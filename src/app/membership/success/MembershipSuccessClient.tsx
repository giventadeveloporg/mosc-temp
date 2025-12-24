"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchMembershipSubscriptionDetailsServer } from './ApiServerActions';
import { PlanFeaturesList } from '@/components/membership/PlanFeaturesList';
import type { MembershipPlanDTO } from '@/types';

interface MembershipSuccessClientProps {
  session_id?: string;
  payment_intent?: string;
}

export function MembershipSuccessClient({ session_id, payment_intent }: MembershipSuccessClientProps) {
  const [isMobileDevice, setIsMobileDevice] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState<{
    plan: MembershipPlanDTO | null;
    amount: number | null;
    currency: string | null;
    subscription: any | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const cancelledRef = useRef(false);
  const isPostingRef = useRef(false); // CRITICAL: Prevent duplicate POST requests

  // Default hero image URL - same as event success page
  const defaultHeroImageUrl = '/images/default_placeholder_hero_image.jpeg';

  // Combined mobile detection and data fetching in a single useEffect
  useEffect(() => {
    // Reset cancelled flag at the start of each effect run
    cancelledRef.current = false;
    // Reset posting flag at the start (but will be set during POST)
    isPostingRef.current = false;

    if (typeof window === 'undefined') return;

    console.log('[MEMBERSHIP-SUCCESS] Component mounted:', { session_id, payment_intent });

    // Enhanced mobile detection (synchronous)
    const userAgent = navigator.userAgent || '';
    const mobileRegexMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS|EdgiOS/i.test(userAgent);
    const narrowScreenMatch = window.innerWidth <= 768;
    const isMobile = mobileRegexMatch || narrowScreenMatch;

    console.log('[MEMBERSHIP-SUCCESS] Mobile detection:', {
      isMobile,
      userAgent: userAgent.substring(0, 50),
      windowWidth: window.innerWidth,
    });

    setIsMobileDevice(isMobile);

    // Handle mobile redirect
    if (isMobile) {
      console.log('[MEMBERSHIP-SUCCESS] ✅ MOBILE BROWSER DETECTED - Will redirect to /membership/qr');

      // Determine which identifier to use
      let identifier: string | null = session_id || payment_intent || null;
      if (!identifier) {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          identifier = urlParams.get('session_id') || urlParams.get('pi') || null;
        } catch { }
      }
      if (!identifier) {
        try {
          identifier = sessionStorage.getItem('membership_session_id') || sessionStorage.getItem('membership_payment_intent') || null;
        } catch { }
      }

      if (!identifier) {
        console.log('[MEMBERSHIP-SUCCESS] ERROR: Missing both session_id and payment_intent');
        setLoading(false);
        return;
      }

      // Store in sessionStorage as fallback
      if (session_id) {
        sessionStorage.setItem('membership_session_id', session_id);
      } else if (payment_intent) {
        sessionStorage.setItem('membership_payment_intent', payment_intent);
      }

      // Show brief success message then redirect after 2 seconds
      const resolvedPi: string | undefined = payment_intent || (identifier.startsWith('pi_') ? identifier : undefined);
      const resolvedSessionId: string | undefined = session_id || (identifier.startsWith('cs_') ? identifier : undefined);

      setTimeout(() => {
        if (resolvedPi) {
          router.replace(`/membership/qr?pi=${encodeURIComponent(resolvedPi)}`);
        } else if (resolvedSessionId) {
          router.replace(`/membership/qr?session_id=${encodeURIComponent(resolvedSessionId)}`);
        } else {
          router.replace('/membership/qr');
        }
      }, 2000);
      return; // Exit early for mobile
    }

    // Desktop: Fetch subscription data
    console.log('[MEMBERSHIP-SUCCESS] ❌ DESKTOP DETECTED - Fetching subscription data');
    console.log('[DESKTOP FLOW] ============================================');
    console.log('[DESKTOP FLOW] Desktop browser detected - using GET-only flow');
    console.log('[DESKTOP FLOW] Desktop will NOT call POST endpoint (mobile-only)');
    console.log('[DESKTOP FLOW] Desktop will poll GET endpoint if subscription not found');
    console.log('[DESKTOP FLOW] GET endpoint will create subscription if payment succeeded (webhook fallback)');
    console.log('[DESKTOP FLOW] ============================================');

    // Ensure we have at least one identifier
    if (!session_id && !payment_intent) {
      console.log('[MEMBERSHIP-SUCCESS] No session_id or payment_intent, skipping data fetch');
      setLoading(false);
      return;
    }

    async function fetchSubscriptionData() {
      if (cancelledRef.current) return;
      console.log('[MEMBERSHIP-SUCCESS] Starting data fetch...', { session_id, payment_intent });
      setLoading(true);
      setError(null);

      try {
        // Build GET query parameters
        const params = new URLSearchParams();
        if (payment_intent) {
          params.append('pi', payment_intent);
        } else if (session_id) {
          params.append('session_id', session_id);
        }
        const getQuery = params.toString();
        const getUrl = `/api/membership/success/process?${getQuery}&_t=${Date.now()}`;

        console.log('[DESKTOP FLOW] GET request URL:', getUrl);
        console.log('[DESKTOP FLOW] Desktop flow uses GET-only (no POST fallback)');

        const getRes = await fetch(getUrl, {
          cache: 'no-store',
        });

        console.log('[DESKTOP FLOW] GET response status:', getRes.status);

        if (getRes.ok) {
          const data = await getRes.json();
          console.log('[DESKTOP FLOW] GET response data:', {
            hasSubscription: !!data.subscription,
            subscriptionId: data.subscription?.id,
            error: data.error,
            message: data.message,
            responseKeys: Object.keys(data),
            timestamp: new Date().toISOString()
          });

          if (data.subscription) {
            console.log('[DESKTOP FLOW] ✅ Subscription found in GET response:', data.subscription.id);
            console.log('[DESKTOP FLOW] ✅ Desktop flow successful - subscription loaded via GET');
            if (!cancelledRef.current) {
              setSubscriptionDetails({
                plan: data.plan,
                amount: data.amount || data.plan?.price || null,
                currency: data.currency || data.plan?.currency || 'USD',
                subscription: data.subscription,
              });
            }
            setLoading(false);
            return;
          } else {
            // Log why subscription wasn't found
            console.log('[DESKTOP FLOW] Initial GET: Subscription not found', {
              error: data.error,
              message: data.message,
              note: 'Will start polling - GET endpoint will create subscription if payment succeeded'
            });
            console.log('[DESKTOP FLOW] ⚠️ No subscription found - webhook may still be processing or GET will create it');

            // CRITICAL: Desktop flow polls GET endpoint (which creates subscription if payment succeeded)
            // Poll GET endpoint to wait for webhook or GET endpoint to create subscription
            let pollAttempt = 0;
            const MAX_POLL_ATTEMPTS = 10;
            const POLL_INTERVAL = 3000; // 3 seconds

            console.log(`[DESKTOP FLOW] Starting polling loop - waiting for subscription...`);
            console.log(`[DESKTOP FLOW] Will poll up to ${MAX_POLL_ATTEMPTS} times with ${POLL_INTERVAL}ms intervals`);

            while (pollAttempt < MAX_POLL_ATTEMPTS && !cancelledRef.current) {
              pollAttempt++;
              console.log(`[DESKTOP FLOW] Polling attempt ${pollAttempt}/${MAX_POLL_ATTEMPTS}...`);

              // Wait before polling (except first attempt which already waited)
              if (pollAttempt > 1) {
                await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
              }

              // Update URL timestamp to prevent caching
              const pollUrl = `/api/membership/success/process?${getQuery}&_t=${Date.now()}&_poll=${pollAttempt}`;
              console.log(`[DESKTOP FLOW] Polling URL: ${pollUrl}`);

              try {
                const pollRes = await fetch(pollUrl, { cache: 'no-store' });
                console.log(`[DESKTOP FLOW] Poll response status (attempt ${pollAttempt}):`, pollRes.status);

                if (pollRes.ok) {
                  const pollData = await pollRes.json();
                  console.log(`[DESKTOP FLOW] Poll response data (attempt ${pollAttempt}):`, {
                    hasSubscription: !!pollData.subscription,
                    subscriptionId: pollData.subscription?.id,
                    error: pollData.error,
                    message: pollData.message,
                    responseKeys: Object.keys(pollData),
                    timestamp: new Date().toISOString()
                  });

                  if (pollData.subscription) {
                    console.log('[DESKTOP FLOW] ✅ Subscription found after polling:', pollData.subscription.id);
                    console.log('[DESKTOP FLOW] ✅ Desktop flow successful - subscription loaded via GET polling');
                    if (!cancelledRef.current) {
                      setSubscriptionDetails({
                        plan: pollData.plan,
                        amount: pollData.amount || pollData.plan?.price || null,
                        currency: pollData.currency || pollData.plan?.currency || 'USD',
                        subscription: pollData.subscription,
                      });
                    }
                    setLoading(false);
                    return;
                  } else {
                    // Log why subscription wasn't found
                    console.log(`[DESKTOP FLOW] Poll attempt ${pollAttempt}: Subscription not found yet`, {
                      error: pollData.error,
                      message: pollData.message,
                      note: 'Webhook may still be processing or GET endpoint will create it'
                    });
                  }
                } else {
                  const errorText = await pollRes.text();
                  console.warn(`[DESKTOP FLOW] Poll request failed (attempt ${pollAttempt}):`, {
                    status: pollRes.status,
                    statusText: pollRes.statusText,
                    errorText,
                    timestamp: new Date().toISOString()
                  });
                }
              } catch (pollErr: any) {
                console.warn(`[DESKTOP FLOW] Poll request error (attempt ${pollAttempt}):`, pollErr?.message);
                // Continue polling even if one request fails
              }
            }

            // If still not found after polling, show helpful error message
            console.error('[DESKTOP FLOW] ⚠️⚠️⚠️ Subscription not found after polling:', {
              pollAttempts: MAX_POLL_ATTEMPTS,
              pollInterval: POLL_INTERVAL,
              totalWaitTime: `${(MAX_POLL_ATTEMPTS * POLL_INTERVAL) / 1000} seconds`,
              sessionId: session_id || payment_intent,
              note: 'Webhook may be delayed or failed. Desktop flow did NOT call POST endpoint (correct behavior).',
              timestamp: new Date().toISOString()
            });
            if (!cancelledRef.current) {
              setError(
                `Your payment was successful, but we're still processing your subscription. ` +
                `We checked ${MAX_POLL_ATTEMPTS} times over ${(MAX_POLL_ATTEMPTS * POLL_INTERVAL) / 1000} seconds, ` +
                `but the subscription hasn't been created yet. ` +
                `This usually means the webhook is delayed. ` +
                `Please wait a moment and refresh this page, or check your email for confirmation. ` +
                `Session ID: ${session_id || payment_intent || 'N/A'}`
              );
            }
          }
        } else {
          const errorText = await getRes.text();
          console.error('[DESKTOP FLOW] ❌ GET request failed:', getRes.status, errorText);
          if (!cancelledRef.current) {
            setError(`Failed to load subscription details: ${errorText || 'Unknown error'}`);
          }
        }
      } catch (err: any) {
        if (!cancelledRef.current) {
          console.error('[MEMBERSHIP-SUCCESS] Error fetching subscription data:', err);
          setError(err.message || 'Failed to load subscription details');
        }
      } finally {
        if (!cancelledRef.current) {
          setLoading(false);
        }
      }
    }

    fetchSubscriptionData();

    // Cleanup function: set cancelled flag when component unmounts
    return () => {
      console.log('[MEMBERSHIP-SUCCESS] Cleanup: Setting cancelled flag');
      cancelledRef.current = true;
    };
  }, [session_id, payment_intent, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Hero Image Section - Same as event success page */}
        <section className="hero-section" style={{
          position: 'relative',
          marginTop: '0',
          backgroundColor: 'transparent',
          minHeight: '400px',
          overflow: 'hidden',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 0 0 0',
          opacity: 0.7
        }}>
          <img
            src={defaultHeroImageUrl}
            alt="Membership Hero"
            className="hero-image"
            style={{
              margin: '0 auto',
              padding: '0',
              display: 'block',
              width: '100%',
              maxWidth: '100%',
              height: 'auto',
              objectFit: 'cover',
              borderRadius: '0'
            }}
          />
        </section>

        {/* Loading Message Overlay */}
        <div className="flex-grow flex flex-col items-center justify-center min-h-[400px] p-6" style={{
          marginTop: '-300px',
          position: 'relative',
          zIndex: 10
        }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Processing...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100" style={{ overflowX: 'hidden' }}>
      {/* HERO SECTION - Full width bleeding to header - Same as event success page */}
      <section className="hero-section" style={{
        position: 'relative',
        marginTop: '0',
        backgroundColor: 'transparent',
        minHeight: '400px',
        overflow: 'hidden',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 0 0 0'
      }}>
        <img
          src={defaultHeroImageUrl}
          alt="Membership Hero"
          className="hero-image"
          style={{
            margin: '0 auto',
            padding: '0',
            display: 'block',
            width: '100%',
            maxWidth: '100%',
            height: 'auto',
            objectFit: 'cover',
            borderRadius: '0'
          }}
        />
        <div className="hero-overlay" style={{ opacity: 0.1, height: '5px', padding: '20' }}></div>
      </section>

      {/* Responsive Hero Image CSS - Same as event success page */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .hero-image {
            width: 100%;
            max-width: 100%;
            height: auto;
            object-fit: cover;
            object-position: center;
            display: block;
            margin: 0 auto;
          }
          @media (max-width: 768px) {
            .hero-section {
              min-height: 300px;
              padding-top: 60px !important;
            }
            .hero-image {
              min-height: 300px;
            }
          }
        `
      }} />

      {/* Main content container */}
      <div className="max-w-5xl mx-auto px-8 py-8" style={{ marginTop: '80px' }}>
        {/* Success Message */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-heading font-semibold text-foreground mb-2">
              Subscription Successful!
            </h1>
            <p className="text-lg font-body text-muted-foreground">
              {isMobileDevice
                ? 'Redirecting to your membership details...'
                : 'Your membership subscription has been activated successfully.'}
            </p>
          </div>
        </div>

        {/* Subscription Plan Summary */}
        {subscriptionDetails?.plan && !isMobileDevice && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 border border-border">
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-6 text-center">
                Your Subscription Plan
              </h2>

              {/* Plan Name */}
              <div className="mb-6 pb-6 border-b border-border">
                <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                  {subscriptionDetails.plan.planName}
                </h3>
                {subscriptionDetails.plan.description && (
                  <p className="font-body text-muted-foreground">
                    {subscriptionDetails.plan.description}
                  </p>
                )}
              </div>

              {/* Price and Billing */}
              <div className="mb-6 pb-6 border-b border-border">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-primary">
                    {(() => {
                      // Use amount from subscription if available, otherwise use plan price
                      // For subscriptions, amount_total might be 0 if it's a free trial or first payment deferred
                      const displayAmount = subscriptionDetails.amount !== null && subscriptionDetails.amount > 0
                        ? subscriptionDetails.amount
                        : subscriptionDetails.plan.price || 0;
                      return new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: subscriptionDetails.currency || subscriptionDetails.plan.currency || 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      }).format(displayAmount);
                    })()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {subscriptionDetails.plan.billingInterval === 'MONTHLY' && 'per month'}
                    {subscriptionDetails.plan.billingInterval === 'QUARTERLY' && 'per quarter'}
                    {subscriptionDetails.plan.billingInterval === 'YEARLY' && 'per year'}
                    {subscriptionDetails.plan.billingInterval === 'ONE_TIME' && 'one-time'}
                  </span>
                </div>
                {subscriptionDetails.plan.trialDays != null && subscriptionDetails.plan.trialDays > 0 && (
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                      {subscriptionDetails.plan.trialDays} day{subscriptionDetails.plan.trialDays !== 1 ? 's' : ''} free trial
                    </span>
                  </div>
                )}
              </div>

              {/* Plan Features */}
              {subscriptionDetails.plan.featuresJson && (() => {
                try {
                  const featuresObj = typeof subscriptionDetails.plan.featuresJson === 'string'
                    ? JSON.parse(subscriptionDetails.plan.featuresJson)
                    : subscriptionDetails.plan.featuresJson;

                  const features = Object.entries(featuresObj)
                    .filter(([key, value]) => {
                      const valueStr = String(value).trim();
                      return (
                        valueStr !== '' &&
                        valueStr !== '0' &&
                        valueStr !== '{' &&
                        valueStr !== '}' &&
                        valueStr !== '[]' &&
                        valueStr !== '{}' &&
                        valueStr !== 'null' &&
                        valueStr !== 'undefined' &&
                        !key.startsWith('_') &&
                        value !== null &&
                        value !== undefined &&
                        value !== 0
                      );
                    })
                    .map(([key, value]) => ({
                      key,
                      value: String(value),
                    }));

                  if (features.length > 0) {
                    return (
                      <div className="mb-6">
                        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
                          Plan Features
                        </h3>
                        <PlanFeaturesList features={features} />
                      </div>
                    );
                  }
                } catch (e) {
                  console.error('Error parsing featuresJson:', e);
                }
                return null;
              })()}

              {/* Additional Plan Details */}
              <div className="space-y-4 pt-6 border-t border-border">
                {subscriptionDetails.plan.maxEventsPerMonth && subscriptionDetails.plan.maxEventsPerMonth > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-sm font-semibold text-foreground">Max Events</p>
                      <p className="font-body text-sm text-muted-foreground">
                        {subscriptionDetails.plan.maxEventsPerMonth} per month
                      </p>
                    </div>
                  </div>
                )}

                {subscriptionDetails.plan.maxAttendeesPerEvent && subscriptionDetails.plan.maxAttendeesPerEvent > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-sm font-semibold text-foreground">Max Attendees</p>
                      <p className="font-body text-sm text-muted-foreground">
                        {subscriptionDetails.plan.maxAttendeesPerEvent} per event
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-body text-sm font-semibold text-foreground">Billing</p>
                    <p className="font-body text-sm text-muted-foreground">
                      {subscriptionDetails.plan.billingInterval === 'MONTHLY' && 'Monthly'}
                      {subscriptionDetails.plan.billingInterval === 'QUARTERLY' && 'Quarterly'}
                      {subscriptionDetails.plan.billingInterval === 'YEARLY' && 'Yearly'}
                      {subscriptionDetails.plan.billingInterval === 'ONE_TIME' && 'One-time'} • {subscriptionDetails.plan.currency}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

