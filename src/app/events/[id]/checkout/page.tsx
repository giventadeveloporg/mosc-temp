import { getCheckoutData } from './CheckoutServerData';
import CheckoutClient from './CheckoutClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Server Component - Fetches data on server before rendering
 * No flickering because data is ready before page renders
 * Uses Next.js cache() for request-level caching
 */
export default async function CheckoutPage({ params }: PageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  console.log('[CheckoutPage SERVER] Fetching data for event:', eventId);

  // Fetch all data on server - NO loading state needed!
  const checkoutData = await getCheckoutData(eventId);

  console.log('[CheckoutPage SERVER] Data fetched, rendering client component');

  // Pass server-fetched data to client component
  return <CheckoutClient initialData={checkoutData} eventId={eventId} />;
}
