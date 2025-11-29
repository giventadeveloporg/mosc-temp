'use client';

import { MembershipPlanCard } from '@/components/membership/MembershipPlanCard';
import type { MembershipPlanDTO } from '@/types';

interface MembershipPlansClientProps {
  plans: MembershipPlanDTO[];
  error: string | null;
}

export function MembershipPlansClient({ plans, error }: MembershipPlansClientProps) {
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
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">Membership Plans</h1>
        <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the membership plan that works best for you. All plans include access to our premium features.
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="font-body text-muted-foreground">No membership plans available at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <MembershipPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}



