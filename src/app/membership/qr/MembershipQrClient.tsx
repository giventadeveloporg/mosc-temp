"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { MembershipSubscriptionDTO, MembershipPlanDTO } from '@/types';

interface MembershipQrClientProps {
  session_id?: string;
  payment_intent?: string;
}

const MAX_POLL_ATTEMPTS = 15;
const POLL_INTERVAL_MS = 2000;

export function MembershipQrClient({ session_id, payment_intent }: MembershipQrClientProps) {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<MembershipSubscriptionDTO | null>(null);
  const [plan, setPlan] = useState<MembershipPlanDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pollAttemptRef = useRef(0);
  const cancelledRef = useRef(false);
  const fetchedIdentifierRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Get identifier from URL or sessionStorage
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
      console.error('[MEMBERSHIP-QR] No identifier found');
      setError('Missing payment information');
      setLoading(false);
      return;
    }

    // Prevent duplicate fetches
    if (fetchedIdentifierRef.current === identifier) {
      console.log('[MEMBERSHIP-QR] Already fetched for this identifier, skipping');
      return;
    }

    fetchedIdentifierRef.current = identifier;

    // Poll for subscription data
    const pollForSubscription = async () => {
      if (cancelledRef.current) return;

      // CRITICAL: Ensure loading state is true during polling
      setLoading(true);

      pollAttemptRef.current += 1;
      const attempt = pollAttemptRef.current;

      console.log(`[MEMBERSHIP-QR] ✅ Poll attempt ${attempt}/${MAX_POLL_ATTEMPTS}`);

      try {
        // Build query params
        const params = new URLSearchParams();
        if (payment_intent || identifier?.startsWith('pi_')) {
          params.append('pi', payment_intent || identifier || '');
        } else if (session_id || identifier?.startsWith('cs_')) {
          params.append('session_id', session_id || identifier || '');
        }

        // Poll GET endpoint for existing subscription
        const response = await fetch(`/api/membership/success/process?${params.toString()}&_t=${Date.now()}&_poll=${attempt}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.subscription) {
            console.log('[MEMBERSHIP-QR] ✅✅✅ SUCCESS! Subscription found:', data.subscription.id);
            setSubscription(data.subscription);
            setPlan(data.plan || null);
            setLoading(false);
            return; // Success - exit polling
          } else {
            // Log why subscription wasn't found with detailed error information
            console.log(`[MEMBERSHIP-QR] Poll attempt ${attempt}: Subscription not found yet`, {
              error: data.error,
              errorType: data.errorType,
              message: data.message,
              paymentIntentStatus: data.paymentIntentStatus,
              hasMetadata: data.hasMetadata,
              membershipPlanId: data.membershipPlanId,
              note: 'Webhook may still be processing or GET endpoint will create it'
            });

            // If we have a specific error (not just "webhook processing"), log it for debugging
            if (data.error && data.error !== 'processMembershipSubscriptionFromPaymentIntent returned null') {
              console.error(`[MEMBERSHIP-QR] ⚠️ Subscription creation error detected (attempt ${attempt}):`, data.error);
            }
          }
        } else {
          // CRITICAL: Handle 400 error with "error.activesubscriptionexists" message
          // This happens when an active subscription already exists for the user
          // BUT: Only redirect if we truly don't have a subscription (after checking response)
          if (response.status === 400) {
            const errorData = await response.json().catch(() => ({}));

            // CRITICAL: Check if errorData actually contains a subscription (GET endpoint might return it)
            if (errorData.subscription) {
              console.log('[MEMBERSHIP-QR] ✅✅✅ SUCCESS! Subscription found in error response:', errorData.subscription.id);
              setSubscription(errorData.subscription);
              setPlan(errorData.plan || null);
              setLoading(false);
              return; // Success - exit polling
            }

            // Only redirect if we truly don't have a subscription and the error is "activesubscriptionexists"
            if (errorData.message === 'error.activesubscriptionexists') {
              console.log('[MEMBERSHIP-QR] Active subscription already exists but not returned - redirecting to membership page');
              // Stop polling and redirect after a short delay
              setLoading(false);
              setTimeout(() => {
                router.push('/membership');
              }, 2000);
              return; // Exit polling
            }
          }

          const errorText = await response.text();
          console.error(`[MEMBERSHIP-QR] GET request failed (attempt ${attempt}):`, {
            status: response.status,
            error: errorText,
          });
        }

        // CRITICAL: Try POST fallback after 3 attempts OR on final attempt
        // This ensures we attempt subscription creation even if webhook failed
        const shouldTryPost = (pollAttemptRef.current >= 3 && pollAttemptRef.current < MAX_POLL_ATTEMPTS) || pollAttemptRef.current === MAX_POLL_ATTEMPTS;

        if (shouldTryPost && !cancelledRef.current) {
          console.log(`[MEMBERSHIP-QR] Transaction not found after ${attempt} polling attempts, attempting POST to create subscription`);

          const postBody = session_id ? { session_id, skip_qr: true } : { pi: payment_intent || identifier, skip_qr: true };
          const postRes = await fetch('/api/membership/success/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postBody),
            cache: 'no-store',
          });

          if (postRes.ok) {
            const postData = await postRes.json();
            if (postData.subscription) {
              console.log('[MEMBERSHIP-QR] ✅✅✅ POST FALLBACK SUCCESS! Subscription created:', postData.subscription.id);
              setSubscription(postData.subscription);
              setPlan(postData.plan || null);
              setLoading(false);
              return; // Success - exit polling
            } else {
              console.error('[MEMBERSHIP-QR] POST fallback returned OK but no subscription:', {
                error: postData.error,
                message: postData.message,
                responseKeys: Object.keys(postData),
              });
            }
          } else {
            // CRITICAL: Handle 400 error with "error.activesubscriptionexists" message
            // This happens when an active subscription already exists for the user
            // BUT: Only redirect if we truly don't have a subscription (after checking response)
            if (postRes.status === 400) {
              const errorData = await postRes.json().catch(() => ({}));

              // CRITICAL: Check if errorData actually contains a subscription (POST endpoint might return it)
              if (errorData.subscription) {
                console.log('[MEMBERSHIP-QR] ✅✅✅ POST FALLBACK SUCCESS! Subscription found in error response:', errorData.subscription.id);
                setSubscription(errorData.subscription);
                setPlan(errorData.plan || null);
                setLoading(false);
                return; // Success - exit polling
              }

              // Only redirect if we truly don't have a subscription and the error is "activesubscriptionexists"
              if (errorData.message === 'error.activesubscriptionexists') {
                console.log('[MEMBERSHIP-QR] Active subscription already exists (POST) but not returned - redirecting to membership page');
                // Stop polling and redirect after a short delay
                setLoading(false);
                setTimeout(() => {
                  router.push('/membership');
                }, 2000);
                return; // Exit polling
              }
            }

            const errorText = await postRes.text();
            let errorData: any = null;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              // Not JSON, use as string
            }
            console.error('[MEMBERSHIP-QR] POST fallback failed:', {
              status: postRes.status,
              statusText: postRes.statusText,
              error: errorText,
              errorData,
            });
          }
        }

        // If not found and we haven't reached max attempts, continue polling
        // CRITICAL: Keep loading state true during polling
        if (attempt < MAX_POLL_ATTEMPTS) {
          // Ensure loading state remains true for next poll
          setLoading(true);
          setTimeout(pollForSubscription, POLL_INTERVAL_MS);
        } else {
          // Get last error details before showing error
          let lastError: string | null = null;
          try {
            const lastParams = new URLSearchParams();
            if (payment_intent || identifier?.startsWith('pi_')) {
              lastParams.append('pi', payment_intent || identifier || '');
            } else if (session_id || identifier?.startsWith('cs_')) {
              lastParams.append('session_id', session_id || identifier || '');
            }
            const lastResponse = await fetch(`/api/membership/success/process?${lastParams.toString()}&_t=${Date.now()}&_poll=${MAX_POLL_ATTEMPTS}`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              cache: 'no-store',
            });
            if (lastResponse.ok) {
              const lastData = await lastResponse.json();
              if (lastData.error) {
                lastError = lastData.error;
              }
            }
          } catch (err) {
            // Ignore errors in final check
          }

          console.error('[MEMBERSHIP-QR] ❌ Subscription not found after maximum polling attempts:', {
            attempts: MAX_POLL_ATTEMPTS,
            interval: POLL_INTERVAL_MS,
            totalWaitTime: `${(MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS) / 1000} seconds`,
            lastError,
            identifier,
          });

          // Show detailed error message if available
          const errorMessage = lastError
            ? `Subscription processing encountered an issue: ${lastError}. Your payment was successful. Please check your membership page or contact support.`
            : 'Subscription not found. Please contact support if payment was successful.';
          setError(errorMessage);
          setLoading(false);
        }
      } catch (err) {
        console.error('[MEMBERSHIP-QR] Poll error:', err);
        if (attempt < MAX_POLL_ATTEMPTS) {
          // CRITICAL: Keep loading state true during polling even after error
          setLoading(true);
          setTimeout(pollForSubscription, POLL_INTERVAL_MS);
        } else {
          setError('Failed to load subscription. Please try again later.');
          setLoading(false);
        }
      }
    };

    // Start polling
    pollForSubscription();
  }, [session_id, payment_intent]);

  // Default hero image URL - same as desktop success page
  const defaultHeroImageUrl = '/images/default_placeholder_hero_image.jpeg';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col" style={{ overflowX: 'hidden' }}>
        {/* Hero Image Section - Same as desktop success page */}
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
        </section>

        {/* Loading Animation in Body - Below Hero Section */}
        <div className="flex justify-center items-center min-h-[600px] w-full py-12 px-4" style={{ position: 'relative' }}>
          <div className="relative w-full max-w-6xl">
            <Image
              src="/images/loading_events.jpg"
              alt="Loading membership subscription..."
              width={800}
              height={600}
              className="w-full h-auto rounded-lg shadow-2xl animate-pulse zoom-loading"
              priority
            />
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              <div className="wavy-animation"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-heading font-semibold text-foreground mb-2">Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.push('/membership')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Membership
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-heading font-semibold text-foreground mb-2">
            Membership Activated!
          </h1>
          <p className="text-muted-foreground mb-6">
            Your subscription has been successfully activated.
          </p>
          {subscription && plan && (
            <div className="mt-6 space-y-3 text-left bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-semibold text-foreground">{plan.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={`font-semibold ${subscription.subscriptionStatus === 'ACTIVE' || subscription.subscriptionStatus === 'TRIAL'
                    ? 'text-green-600'
                    : 'text-gray-600'
                  }`}>
                  {subscription.subscriptionStatus}
                </span>
              </div>
              {subscription.currentPeriodEnd && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Renews:</span>
                  <span className="font-semibold text-foreground">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => router.push('/membership/manage')}
            className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity w-full"
          >
            Manage Membership
          </button>
        </div>
      </div>
    </div>
  );
}
