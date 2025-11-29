'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlanSummaryCard } from '@/components/membership/PlanSummaryCard';
import { Button } from '@/components/ui/button';
import { createSubscriptionCheckoutSessionServer } from './ApiServerActions';
import type { MembershipPlanDTO } from '@/types';

interface SubscriptionSignupClientProps {
  plan: MembershipPlanDTO | null;
  error: string | null;
}

export function SubscriptionSignupClient({ plan, error }: SubscriptionSignupClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
        </div>
      </div>
    </div>
  );
}



