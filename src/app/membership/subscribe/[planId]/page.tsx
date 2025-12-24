import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { fetchMembershipPlanServer } from './ApiServerActions';
import { SubscriptionSignupClient } from './SubscriptionSignupClient';
import { getAppUrl } from '@/lib/env';
import type { UserProfileDTO } from '@/types';

export const metadata: Metadata = {
  title: 'Subscribe to Membership',
  description: 'Complete your membership subscription',
};

export default async function SubscriptionSignupPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  // CRITICAL: Next.js 15+ requires headers() to be awaited before auth()
  // Import headers() function and await it to ensure proper async context
  const { headers } = await import('next/headers');
  const headersList = await headers(); // CRITICAL: Fully await headers() before calling auth()

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
  let userProfile: UserProfileDTO | null = null;

  try {
    plan = await fetchMembershipPlanServer(planIdNum);
    if (!plan) {
      redirect('/membership/plans');
    }
  } catch (err) {
    console.error('Failed to fetch membership plan:', err);
    error = err instanceof Error ? err.message : 'Failed to load membership plan';
  }

  // Fetch user profile to check if user is registered (not a visitor)
  // This enables payment buttons automatically if user profile exists
  if (userId && !error) {
    try {
      const baseUrl = getAppUrl();
      const response = await fetch(`${baseUrl}/api/proxy/user-profiles/by-user/${userId}`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const profile = await response.json();
        userProfile = Array.isArray(profile) ? profile[0] : profile;
        if (userProfile && userProfile.id) {
          console.log('[MEMBERSHIP-SUBSCRIBE] User profile found - user is registered:', userProfile.id);
        }
      }
    } catch (err) {
      console.error('[MEMBERSHIP-SUBSCRIBE] Error fetching user profile:', err);
      // Continue without user profile - client component will handle fallback
    }
  }

  return <SubscriptionSignupClient plan={plan} error={error} userProfile={userProfile} />;
}


