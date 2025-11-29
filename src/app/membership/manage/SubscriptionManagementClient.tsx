'use client';

import Link from 'next/link';
import { CurrentSubscriptionCard } from '@/components/membership/CurrentSubscriptionCard';
import { SubscriptionActions } from '@/components/membership/SubscriptionActions';
import { BillingHistory } from '@/components/membership/BillingHistory';
import { Button } from '@/components/ui/button';
import type { MembershipSubscriptionDTO } from '@/types';

interface SubscriptionManagementClientProps {
  subscription: MembershipSubscriptionDTO | null;
  error: string | null;
}

export function SubscriptionManagementClient({ subscription, error }: SubscriptionManagementClientProps) {
  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="font-heading font-semibold text-2xl text-foreground mb-4">No Active Subscription</h1>
          <p className="font-body text-muted-foreground mb-6">
            You don't have an active subscription. Browse our plans to get started.
          </p>
          <Link href="/membership/plans">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Browse Plans
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="font-heading font-semibold text-3xl text-foreground mb-4">Manage Your Subscription</h1>
      </div>

      <div className="space-y-8">
        <CurrentSubscriptionCard subscription={subscription} />
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="font-heading font-semibold text-xl text-foreground mb-4">Actions</h2>
          <SubscriptionActions subscription={subscription} />
        </div>
        <BillingHistory events={[]} />
      </div>
    </div>
  );
}



