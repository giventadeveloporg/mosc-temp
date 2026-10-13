import type { Metadata } from 'next';
import HomePageClient from './HomePageClient';
import { BRAND_NAME } from '@/lib/brand';
import { fetchFeaturedEventsForHomepageServer } from '@/lib/homepage/fetchFeaturedEventsServer';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Upcoming events, tickets, membership, and community updates.',
  keywords: ['home', 'events', 'tickets', 'membership', BRAND_NAME],
};

export default async function HomePage() {
  const initialFeaturedEvents = await fetchFeaturedEventsForHomepageServer();
  return <HomePageClient initialFeaturedEvents={initialFeaturedEvents} />;
}
