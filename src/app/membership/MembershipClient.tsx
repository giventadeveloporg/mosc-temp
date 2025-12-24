'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { PlanFeaturesList } from '@/components/membership/PlanFeaturesList';
import { MembershipPaymentRequestButton } from '@/components/membership/MembershipPaymentRequestButton';
import { createSubscriptionCheckoutSessionServer } from './subscribe/[planId]/ApiServerActions';
import { cancelSubscriptionServer } from './manage/ApiServerActions';
import type { MembershipPlanDTO, MembershipSubscriptionDTO } from '@/types';

interface MembershipClientProps {
  plans: MembershipPlanDTO[];
  error: string | null;
  userSubscription?: MembershipSubscriptionDTO | null;
}

export function MembershipClient({ plans, error, userSubscription }: MembershipClientProps) {
  const router = useRouter();
  const { userId } = useAuth();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [cancelingSubscriptionId, setCancelingSubscriptionId] = useState<number | null>(null);

  // Detect mobile device
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => {
      const userAgent = navigator.userAgent || '';
      const mobileRegexMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS|EdgiOS/i.test(userAgent);
      const narrowScreenMatch = window.innerWidth <= 768;
      setIsMobile(mobileRegexMatch || narrowScreenMatch);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getBillingIntervalLabel = (interval: string) => {
    switch (interval) {
      case 'MONTHLY':
        return 'per month';
      case 'QUARTERLY':
        return 'per quarter';
      case 'YEARLY':
        return 'per year';
      case 'ONE_TIME':
        return 'one-time';
      default:
        return '';
    }
  };

  const handleSubscribe = async (plan: MembershipPlanDTO) => {
    try {
      setIsLoading(plan.id!);
      setCheckoutError(null);

      // Check if user is authenticated
      if (!userId) {
        router.push(`/sign-in?redirect_url=/membership`);
        return;
      }

      const successUrl = `${window.location.origin}/membership/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/membership?canceled=true`;

      const { sessionUrl } = await createSubscriptionCheckoutSessionServer(
        plan.id!,
        successUrl,
        cancelUrl
      );
      window.location.href = sessionUrl;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Failed to create checkout session');
      setIsLoading(null);
    }
  };

  const toggleExpand = (planId: number) => {
    setExpandedPlanId(expandedPlanId === planId ? null : planId);
  };

  const handleCancelSubscription = async (subscriptionId: number) => {
    if (!confirm('Are you sure you want to cancel your subscription? It will remain active until the end of the current billing period.')) {
      return;
    }

    try {
      setCancelingSubscriptionId(subscriptionId);
      await cancelSubscriptionServer(subscriptionId, 'Cancelled by user from membership page');
      router.refresh();
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setCancelingSubscriptionId(null);
    }
  };

  // Check if user is subscribed to a specific plan
  const isSubscribedToPlan = (planId: number | null | undefined): boolean => {
    if (!planId || !userSubscription) return false;
    return userSubscription.membershipPlanId === planId &&
      userSubscription.subscriptionStatus === 'ACTIVE' &&
      !userSubscription.cancelAtPeriodEnd;
  };

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            Membership Plans
          </h1>
          <p className="text-lg font-body text-muted-foreground max-w-3xl mx-auto">
            Join our community and unlock exclusive benefits, access to events, and more.
          </p>
        </div>

        {/* Error Message */}
        {checkoutError && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive font-body">{checkoutError}</p>
          </div>
        )}

        {/* Membership Plans Grid */}
        {plans.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="font-body text-muted-foreground">No membership plans available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {plans.map((plan) => {
              // Parse features and filter out invalid entries (like curly braces, empty values, "0", etc.)
              let features: Array<{ key: string; value: string }> = [];
              if (plan.featuresJson) {
                try {
                  const featuresObj = typeof plan.featuresJson === 'string'
                    ? JSON.parse(plan.featuresJson)
                    : plan.featuresJson;

                  features = Object.entries(featuresObj)
                    .filter(([key, value]) => {
                      // Filter out invalid entries
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
                } catch (e) {
                  console.error('Error parsing featuresJson:', e);
                  features = [];
                }
              }

              const isEgyptPlan = plan.planCode?.toLowerCase().includes('egypt') ||
                plan.planName?.toLowerCase().includes('egypt');
              const isExpanded = expandedPlanId === plan.id;
              const isLoadingPlan = isLoading === plan.id;

              // Color scheme based on plan type or index
              const colorSchemes = [
                { bg: 'bg-gradient-to-br from-blue-50 to-blue-100', border: 'border-blue-200', accent: 'bg-blue-500', text: 'text-blue-700' },
                { bg: 'bg-gradient-to-br from-green-50 to-green-100', border: 'border-green-200', accent: 'bg-green-500', text: 'text-green-700' },
                { bg: 'bg-gradient-to-br from-purple-50 to-purple-100', border: 'border-purple-200', accent: 'bg-purple-500', text: 'text-purple-700' },
                { bg: 'bg-gradient-to-br from-orange-50 to-orange-100', border: 'border-orange-200', accent: 'bg-orange-500', text: 'text-orange-700' },
              ];
              const colorScheme = colorSchemes[(plan.id || 0) % colorSchemes.length];

              return (
                <Card
                  key={plan.id}
                  className={`flex flex-col h-full hover:shadow-xl transition-all duration-300 ${colorScheme.bg} ${colorScheme.border} border-2 rounded-xl shadow-md overflow-hidden`}
                >
                  <CardHeader className={`${colorScheme.accent} bg-opacity-10 pb-4`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className={`font-heading text-2xl ${colorScheme.text} mb-2`}>
                          {plan.planName}
                        </CardTitle>
                        {plan.description && (
                          <CardDescription className="font-body text-muted-foreground">
                            {plan.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 p-6">
                    {/* Price Section */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-bold ${colorScheme.text}`}>
                          {formatPrice(plan.price, plan.currency)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {getBillingIntervalLabel(plan.billingInterval)}
                        </span>
                      </div>
                      {/* Only show trial days if > 0 */}
                      {plan.trialDays != null && plan.trialDays > 0 ? (
                        <div className="mt-2">
                          <span className={`inline-block px-3 py-1 text-xs font-semibold ${colorScheme.accent} text-white rounded-full`}>
                            {plan.trialDays} day{plan.trialDays !== 1 ? 's' : ''} free trial
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* Features List */}
                    {features.length > 0 && (
                      <div className="mb-4">
                        <PlanFeaturesList features={features} />
                      </div>
                    )}

                    {/* Additional Details for Egypt Plan or Expanded Plans */}
                    {(isEgyptPlan || isExpanded) && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="font-body text-sm font-semibold text-foreground">Plan Type</p>
                              <p className="font-body text-sm text-muted-foreground">{plan.planType}</p>
                            </div>
                          </div>

                          {plan.maxEventsPerMonth && plan.maxEventsPerMonth > 0 && (
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="font-body text-sm font-semibold text-foreground">Max Events</p>
                                <p className="font-body text-sm text-muted-foreground">
                                  {plan.maxEventsPerMonth} per month
                                </p>
                              </div>
                            </div>
                          )}

                          {plan.maxAttendeesPerEvent && plan.maxAttendeesPerEvent > 0 && (
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="font-body text-sm font-semibold text-foreground">Max Attendees</p>
                                <p className="font-body text-sm text-muted-foreground">
                                  {plan.maxAttendeesPerEvent} per event
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
                                {getBillingIntervalLabel(plan.billingInterval)} • {plan.currency}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Show More/Less Button for Non-Egypt Plans */}
                    {!isEgyptPlan && (
                      <button
                        onClick={() => toggleExpand(plan.id!)}
                        className="mt-4 text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                            </svg>
                            Show Less
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                            Show More Details
                          </>
                        )}
                      </button>
                    )}
                  </CardContent>

                  <CardFooter className="pt-4 px-6 pb-6 space-y-3">
                    {/* Check if user is subscribed to this plan */}
                    {isSubscribedToPlan(plan.id) && userSubscription?.id ? (
                      <>
                        {/* Already Subscribed - Show Cancel Button */}
                        <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg mb-2">
                          <p className="text-sm font-body text-green-800 text-center">
                            ✓ You are currently subscribed to this plan
                          </p>
                        </div>
                        <Button
                          onClick={() => handleCancelSubscription(userSubscription.id!)}
                          disabled={cancelingSubscriptionId === userSubscription.id}
                          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                          size="lg"
                          variant="destructive"
                        >
                          {cancelingSubscriptionId === userSubscription.id ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Canceling...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancel Subscription
                            </span>
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        {/* Mobile Payment Request Button */}
                        {isMobile && userId && (
                          <MembershipPaymentRequestButton
                            membershipPlanId={plan.id!}
                            amountCents={Math.round(plan.price * 100)}
                            currency={plan.currency || 'USD'}
                            email={user?.emailAddresses?.[0]?.emailAddress}
                            customerName={user?.fullName || undefined}
                            enabled={!!userId && !isLoadingPlan}
                            showPlaceholder={!userId}
                            onInvalidClick={() => {
                              if (!userId) {
                                router.push(`/sign-in?redirect_url=/membership`);
                              }
                            }}
                          />
                        )}

                        {/* Desktop Subscribe Button - Navigate to subscribe page with Stripe Elements */}
                        <Button
                          onClick={() => {
                            // Check if user is authenticated
                            if (!userId) {
                              router.push(`/sign-in?redirect_url=/membership/subscribe/${plan.id}`);
                              return;
                            }
                            // Navigate to subscribe page where Stripe Elements are shown inline
                            router.push(`/membership/subscribe/${plan.id}`);
                          }}
                          disabled={isLoadingPlan}
                          className={`w-full ${colorScheme.accent} hover:opacity-90 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300`}
                          size="lg"
                        >
                          {isLoadingPlan ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              Subscribe Now
                            </span>
                          )}
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Membership Benefits Section */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-border">
          <h2 className="text-2xl font-heading font-semibold text-foreground mb-6">
            Membership Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4 group">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-1">
                  Exclusive Access
                </h3>
                <p className="text-sm font-body text-muted-foreground">
                  Get early access to events, workshops, and special programs
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 group">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-1">
                  Member Discounts
                </h3>
                <p className="text-sm font-body text-muted-foreground">
                  Enjoy special pricing on events, merchandise, and services
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 group">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-1">
                  Community Network
                </h3>
                <p className="text-sm font-body text-muted-foreground">
                  Connect with like-minded individuals and expand your network
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 group">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-1">
                  Priority Support
                </h3>
                <p className="text-sm font-body text-muted-foreground">
                  Receive priority customer support and assistance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

