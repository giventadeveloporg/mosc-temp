import { Metadata } from 'next';
import { fetchMembershipPlansServer } from './ApiServerActions';
import { MembershipPlansClient } from './MembershipPlansClient';

export const metadata: Metadata = {
  title: 'Membership Plans',
  description: 'Choose the membership plan that works best for you',
};

export default async function MembershipPlansPage() {
  let plans = [];
  let error = null;

  try {
    plans = await fetchMembershipPlansServer({ isActive: true, sort: 'price,asc' });
  } catch (err) {
    console.error('Failed to fetch membership plans:', err);
    error = err instanceof Error ? err.message : 'Failed to load membership plans';
  }

  return <MembershipPlansClient plans={plans} error={error} />;
}



