'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { PlanSummaryCard } from '@/components/membership/PlanSummaryCard';
import { Button } from '@/components/ui/button';
import { MembershipPaymentRequestButton } from '@/components/membership/MembershipPaymentRequestButton';
import MembershipDesktopCheckout from '@/components/membership/MembershipDesktopCheckout';
import { createSubscriptionCheckoutSessionServer } from './ApiServerActions';
import type { MembershipPlanDTO, UserProfileDTO } from '@/types';

interface SubscriptionSignupClientProps {
  plan: MembershipPlanDTO | null;
  error: string | null;
  userProfile?: UserProfileDTO | null; // User profile if registered
}

export function SubscriptionSignupClient({ plan, error, userProfile }: SubscriptionSignupClientProps) {
  const router = useRouter();
  const { userId } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hasUserProfile, setHasUserProfile] = useState<boolean | null>(null);

  // Check if user profile exists (user is registered, not a visitor)
  useEffect(() => {
    if (userProfile && userProfile.id) {
      console.log('[MEMBERSHIP-SUBSCRIBE] User profile found - user is registered:', userProfile.id);
      setHasUserProfile(true);
    } else if (userId) {
      // Try to fetch user profile client-side as fallback
      async function fetchUserProfile() {
        try {
          const response = await fetch(`/api/proxy/user-profiles/by-user/${userId}`, {
            cache: 'no-store',
          });
          if (response.ok) {
            const profile = await response.json();
            if (profile && profile.id) {
              console.log('[MEMBERSHIP-SUBSCRIBE] User profile found via client fetch:', profile.id);
              setHasUserProfile(true);
              return;
            }
          }
          console.log('[MEMBERSHIP-SUBSCRIBE] No user profile found - user is a visitor');
          setHasUserProfile(false);
        } catch (err) {
          console.error('[MEMBERSHIP-SUBSCRIBE] Error fetching user profile:', err);
          setHasUserProfile(false);
        }
      }
      fetchUserProfile();
    } else {
      setHasUserProfile(false);
    }
  }, [userId, userProfile]);

  // Determine if payment buttons should be enabled
  // Enable automatically if user is registered (has user profile with email)
  // CRITICAL: Use Clerk user email if available, fallback to userProfile email
  const email = user?.emailAddresses?.[0]?.emailAddress || userProfile?.email || '';
  const customerName = user?.fullName || (userProfile ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() : '') || undefined;
  const customerPhone = user?.phoneNumbers?.[0]?.phoneNumber || userProfile?.phone || undefined;

  // CRITICAL FIX: Enable payment if userId exists (authenticated user)
  // Don't require hasUserProfile to be true - enable if userId exists (email will come from Clerk user)
  // Match event checkout pattern: enable if authenticated user (userId exists)
  // Email can be empty initially - it will be loaded from Clerk user object
  const canEnablePayment = !!userId; // Enable if authenticated - email will be available from Clerk user

  // Debug logging
  useEffect(() => {
    console.log('[MEMBERSHIP-SUBSCRIBE] Payment state:', {
      userId,
      email,
      hasUserProfile,
      canEnablePayment,
      isMobile,
      isUserLoaded,
    });
  }, [userId, email, hasUserProfile, canEnablePayment, isMobile, isUserLoaded]);

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
          {/* CRITICAL: Always show for authenticated users - email will load from Clerk */}
          {/* CRITICAL: Always render MembershipDesktopCheckout for authenticated users */}
          {/* The component handles mobile detection internally and hides ExpressCheckoutElement on mobile */}
          {userId && (
            <>
              <p className="font-body text-muted-foreground mb-4">
                {hasUserProfile
                  ? 'Complete your subscription using Apple Pay, Google Pay, Link, or card.'
                  : 'Complete your subscription. Payment options will be available once your email is loaded.'}
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
                enabled={!!userId} // CRITICAL: Enable immediately if authenticated - email will load from Clerk user object
                onInvalidClick={() => {
                  if (!userId) {
                    setCheckoutError('Please sign in to enable payment options');
                  }
                }}
                onLoadingChange={setIsLoading}
              />
            </>
          )}

          {/* Mobile Payment Request Button */}
          {isMobile && userId && (
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
                enabled={!!userId && !isLoading}
                showPlaceholder={!userId}
                onInvalidClick={() => {
                  if (!userId) {
                    router.push(`/sign-in?redirect_url=/membership/subscribe/${plan.id}`);
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

          {/* Fallback: Stripe Checkout Session redirect (for desktop without email, or mobile without userId) */}
          {((!isMobile && !canEnablePayment) || (isMobile && !userId)) && (
            <>
              <p className="font-body text-muted-foreground mb-6">
                {!email
                  ? 'Email required to enable payment options'
                  : 'You will be redirected to our secure payment processor to complete your subscription.'}
              </p>
              {!email && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center text-purple-700 text-sm">
                    <span className="mr-2">👁️</span>
                    <span>Email required to enable payment options</span>
                  </div>
                </div>
              )}
              <Button
                onClick={handleSubscribe}
                disabled={isLoading || !email}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                {isLoading ? 'Processing...' : 'Proceed to Checkout'}
              </Button>
            </>
          )}

          {/* Mobile: Show fallback button after PRB */}
          {isMobile && userId && (
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
              size="lg"
            >
              {isLoading ? 'Processing...' : 'Proceed to Checkout'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}



