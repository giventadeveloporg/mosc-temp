import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { fetchAllMembershipPlansServer } from './ApiServerActions';
import { AdminMembershipPlansClient } from './AdminMembershipPlansClient';

export const metadata: Metadata = {
  title: 'Admin - Membership Plans',
  description: 'Manage membership plans',
};

export default async function AdminMembershipPlansPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in?redirect_url=/admin/membership/plans');
  }

  let plans = [];
  let error = null;

  try {
    plans = await fetchAllMembershipPlansServer();
  } catch (err) {
    console.error('Failed to fetch membership plans:', err);
    error = err instanceof Error ? err.message : 'Failed to load membership plans';
  }

  return <AdminMembershipPlansClient plans={plans} error={error} />;
}

