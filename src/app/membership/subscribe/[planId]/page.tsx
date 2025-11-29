import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { fetchMembershipPlanServer } from './ApiServerActions';
import { SubscriptionSignupClient } from './SubscriptionSignupClient';

export const metadata: Metadata = {
  title: 'Subscribe to Membership',
  description: 'Complete your membership subscription',
};

export default async function SubscriptionSignupPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in?redirect_url=/membership/subscribe');
  }

  const { planId } = await params;
  const planIdNum = parseInt(planId, 10);

  if (isNaN(planIdNum)) {
    redirect('/membership/plans');
  }

  let plan = null;
  let error = null;

  try {
    plan = await fetchMembershipPlanServer(planIdNum);
    if (!plan) {
      redirect('/membership/plans');
    }
  } catch (err) {
    console.error('Failed to fetch membership plan:', err);
    error = err instanceof Error ? err.message : 'Failed to load membership plan';
  }

  return <SubscriptionSignupClient plan={plan} error={error} />;
}


