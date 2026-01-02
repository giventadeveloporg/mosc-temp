'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { PlanSummaryCard } from '@/components/membership/PlanSummaryCard';
import { Button } from '@/components/ui/button';
import { MembershipPaymentRequestButton } from '@/components/membership/MembershipPaymentRequestButton';
import MembershipDesktopCheckout from '@/components/membership/MembershipDesktopCheckout';
import { createSubscriptionCheckoutSessionServer, createUserProfileFromClerkUser } from './ApiServerActions';
import type { MembershipPlanDTO, UserProfileDTO } from '@/types';

interface SubscriptionSignupClientProps {
  plan: MembershipPlanDTO | null;
  error: string | null;
  userProfile?: UserProfileDTO | null; // User profile if registered
}

export function SubscriptionSignupClient({ plan, error, userProfile: initialUserProfile }: SubscriptionSignupClientProps) {
  const router = useRouter();
  const { userId } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfileDTO | null>(initialUserProfile || null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [canEnablePayment, setCanEnablePayment] = useState(false);

  // Ensure user profile exists before enabling payment (RECOMMENDED SOLUTION)
  useEffect(() => {
    async function ensureUserProfile() {
      if (!userId || !isUserLoaded) {
        setCanEnablePayment(false);
        return;
      }

      // Check if profile already exists
      if (userProfile?.id) {
        console.log('[MEMBERSHIP-SUBSCRIBE] User profile confirmed:', userProfile.id);
        setCanEnablePayment(true);
        return;
      }

      // Try to fetch profile
      try {
        const response = await fetch(`/api/proxy/user-profiles/by-user/${userId}`, {
          cache: 'no-store',
        });

        if (response.ok) {
          const profile = await response.json();
          if (profile?.id) {
            console.log('[MEMBERSHIP-SUBSCRIBE] User profile found via fetch:', profile.id);
            setUserProfile(profile);
            setCanEnablePayment(true);
            return;
          }
        }
      } catch (err) {
        console.error('[MEMBERSHIP-SUBSCRIBE] Error fetching profile:', err);
      }

      // Profile doesn't exist - check if we have email
      const email = user?.emailAddresses?.[0]?.emailAddress ||
                    user?.primaryEmailAddress?.emailAddress || '';

      if (!email) {
        console.log('[MEMBERSHIP-SUBSCRIBE] Email missing - cannot create profile');
        setProfileError('Email address is required to complete your subscription. Please update your account settings.');
        setCanEnablePayment(false);
        return;
      }

      // Create profile (with retry logic)
      if (retryCount < 3) {
        setIsCreatingProfile(true);
        setProfileError(null);

        try {
          const newProfile = await createUserProfileFromClerkUser({
            userId,
            email,
            firstName: user?.firstName || 'User',
            lastName: user?.lastName || '',
            phone: user?.phoneNumbers?.[0]?.phoneNumber || '',
            imageUrl: user?.imageUrl || '',
          });

          if (newProfile?.id) {
            console.log('[MEMBERSHIP-SUBSCRIBE] User profile created successfully:', newProfile.id);
            setUserProfile(newProfile);
            setCanEnablePayment(true);
            setIsCreatingProfile(false);
            setRetryCount(0);
          } else {
            throw new Error('Profile creation returned no ID');
          }
        } catch (err) {
          setIsCreatingProfile(false);
          const errorMessage = err instanceof Error ? err.message : 'Failed to create profile';
          console.error('[MEMBERSHIP-SUBSCRIBE] Profile creation failed:', errorMessage);
          setProfileError(`Unable to set up your account: ${errorMessage}`);

          if (retryCount < 2) {
            // Auto-retry after 2 seconds
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 2000);
          } else {
            setProfileError('Unable to set up your account after multiple attempts. Please contact support or try again later.');
          }
        }
      } else {
        setProfileError('Unable to set up your account after multiple attempts. Please contact support.');
        setCanEnablePayment(false);
      }
    }

    ensureUserProfile();
  }, [userId, isUserLoaded, userProfile, retryCount, user]);

  // Extract user data for payment
  const email = user?.emailAddresses?.[0]?.emailAddress ||
                user?.primaryEmailAddress?.emailAddress ||
                userProfile?.email || '';
  const customerName = user?.fullName ||
                       (userProfile ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() : '') ||
                       undefined;
  const customerPhone = user?.phoneNumbers?.[0]?.phoneNumber || userProfile?.phone || undefined;

  // Debug logging
  useEffect(() => {
    console.log('[MEMBERSHIP-SUBSCRIBE] Payment state:', {
      userId,
      email,
      hasUserProfile: !!userProfile?.id,
      canEnablePayment,
      isMobile,
      isUserLoaded,
      isCreatingProfile,
      retryCount,
    });
  }, [userId, email, userProfile, canEnablePayment, isMobile, isUserLoaded, isCreatingProfile, retryCount]);

  // Detect mobile device
  // CRITICAL: Only detect mobile by user agent, not window width
  // Desktop browsers with narrow windows should still show Stripe Elements
  // The MembershipDesktopCheckout component handles hiding ExpressCheckoutElement internally
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => {
      const userAgent = navigator.userAgent || '';
      const platform = navigator.platform || '';
      // CRITICAL: Only detect mobile by user agent, not window width
      // This matches the event checkout pattern where StripeDesktopCheckout always renders
      // and handles mobile detection internally
      const mobileRegexMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS|EdgiOS/i.test(userAgent);
      const platformMatch = /iPhone|iPad|iPod|Android|BlackBerry|Windows Phone/i.test(platform);
      setIsMobile(mobileRegexMatch || platformMatch);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (error || !plan) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          {error || 'Plan not found'}
        </div>
      </div>
    );
  }

  // Show loading state while creating profile
  if (isCreatingProfile) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="font-heading font-semibold text-xl text-foreground mb-2">Setting up your account...</h2>
          <p className="font-body text-muted-foreground">Please wait while we prepare your subscription</p>
        </div>
      </div>
    );
  }

  // Show error state if profile creation failed
  if (profileError && !canEnablePayment) {
    const hasEmail = !!(user?.emailAddresses?.[0]?.emailAddress ||
                        user?.primaryEmailAddress?.emailAddress);

    return (
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-md">
          <h3 className="font-semibold text-lg mb-2">Account Setup Required</h3>
          <p className="mb-4">{profileError}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            {!hasEmail ? (
              <Button
                onClick={() => router.push(`/profile?redirect_url=/membership/subscribe/${plan.id}`)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Update Account Settings
              </Button>
            ) : (
              <>
                {retryCount < 3 && (
                  <Button
                    onClick={() => setRetryCount(0)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Try Again
                  </Button>
                )}
                <a
                  href="mailto:support@example.com"
                  className="px-4 py-2 text-blue-500 underline hover:text-blue-700"
                >
                  Contact Support
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      setCheckoutError(null);

      const successUrl = `${window.location.origin}/membership/manage?success=true`;
      const cancelUrl = `${window.location.origin}/membership/plans?canceled=true`;

      const { sessionUrl } = await createSubscriptionCheckoutSessionServer(plan.id!, successUrl, cancelUrl);
      window.location.href = sessionUrl;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Failed to create checkout session');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="font-heading font-semibold text-3xl text-foreground mb-4">Complete Your Subscription</h1>
        <p className="font-body text-lg text-muted-foreground">
          Review your plan details and proceed to checkout
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <div>
          <PlanSummaryCard plan={plan} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="font-heading font-semibold text-xl text-foreground mb-4">Payment</h2>
          {checkoutError && (
            <div className="mb-4 p-3 text-sm text-red-800 bg-red-100 rounded-md">
              {checkoutError}
            </div>
          )}
          {/* Desktop: Show Stripe Elements inline (like event checkout) */}
          {/* CRITICAL: Only enable payment after profile is confirmed */}
          {userId && canEnablePayment && (
            <>
              <p className="font-body text-muted-foreground mb-4">
                Complete your subscription using Apple Pay, Google Pay, Link, or card.
              </p>
              {/* Payment instructions - only show on desktop */}
              <div className="hidden md:block mt-3 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center text-blue-700 text-sm">
                  <span className="mr-2">💳</span>
                  <span>Please select a payment method or click any of the payment buttons below</span>
                </div>
              </div>
              <MembershipDesktopCheckout
                membershipPlanId={plan.id!}
                amountCents={Math.round(plan.price * 100)}
                currency={plan.currency || 'USD'}
                email={email}
                customerName={customerName}
                customerPhone={customerPhone}
                enabled={canEnablePayment} // Only enable after profile is confirmed
                onInvalidClick={() => {
                  if (!userId) {
                    setCheckoutError('Please sign in to enable payment options');
                  } else if (!canEnablePayment) {
                    setCheckoutError('Account setup required. Please wait or contact support.');
                  }
                }}
                onLoadingChange={setIsLoading}
              />
            </>
          )}

          {/* Mobile Payment Request Button */}
          {isMobile && userId && canEnablePayment && (
            <div className="mb-4">
              <p className="font-body text-muted-foreground mb-4">
                Use Apple Pay or Google Pay for quick checkout, or proceed to full checkout page.
              </p>
              <MembershipPaymentRequestButton
                membershipPlanId={plan.id!}
                amountCents={Math.round(plan.price * 100)}
                currency={plan.currency || 'USD'}
                email={email}
                customerName={customerName}
                enabled={canEnablePayment && !isLoading}
                showPlaceholder={!canEnablePayment}
                onInvalidClick={() => {
                  if (!userId) {
                    router.push(`/sign-in?redirect_url=/membership/subscribe/${plan.id}`);
                  } else if (!canEnablePayment) {
                    setCheckoutError('Account setup required. Please wait or contact support.');
                  }
                }}
              />
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-muted-foreground">or</span>
                </div>
              </div>
            </div>
          )}

          {/* Fallback: Stripe Checkout Session redirect (only if payment enabled) */}
          {canEnablePayment && (
            <>
              <p className="font-body text-muted-foreground mb-6">
                You will be redirected to our secure payment processor to complete your subscription.
              </p>
              <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                {isLoading ? 'Processing...' : 'Proceed to Checkout'}
              </Button>
            </>
          )}

          {/* Show message if payment not enabled */}
          {!canEnablePayment && userId && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Please wait while we set up your account, or contact support if this message persists.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



