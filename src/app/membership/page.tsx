import { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { fetchMembershipPlansServer } from './plans/ApiServerActions';
import { fetchUserSubscriptionServer } from './manage/ApiServerActions';
import { fetchUserProfileServer } from '@/app/profile/ApiServerActions';
import { MembershipClient } from './MembershipClient';
import type { MembershipPlanDTO, MembershipSubscriptionDTO } from '@/types';

export const metadata: Metadata = {
  title: 'Membership',
  description: 'Join our membership program and enjoy exclusive benefits',
};

export default async function MembershipPage() {
  let plans: MembershipPlanDTO[] = [];
  let error: string | null = null;
  let userSubscription: MembershipSubscriptionDTO | null = null;

  try {
    plans = await fetchMembershipPlansServer({ isActive: true, sort: 'price,asc' });

    // Fetch user subscription if authenticated
    try {
      const { userId } = await auth();
      if (userId) {
        const userProfile = await fetchUserProfileServer(userId);
        if (userProfile?.id) {
          userSubscription = await fetchUserSubscriptionServer(userProfile.id);
        }
      }
    } catch (subErr) {
      // Non-fatal - subscription fetch failure shouldn't break the page
      console.error('Failed to fetch user subscription:', subErr);
    }
  } catch (err) {
    console.error('Failed to fetch membership plans:', err);
    error = err instanceof Error ? err.message : 'Failed to load membership plans';
  }

  return <MembershipClient plans={plans} error={error} userSubscription={userSubscription} />;
}





