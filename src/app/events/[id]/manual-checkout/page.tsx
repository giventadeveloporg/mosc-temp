import { getCheckoutData } from '../checkout/CheckoutServerData';
import ManualCheckoutClient from './ManualCheckoutClient';
import { unstable_noStore } from 'next/cache';
import { redirect } from 'next/navigation';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId } from '@/lib/env';
import type { EventDetailsDTO } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Server Component - Fetches data on server before rendering
 * Checks payment_flow_mode and redirects if manual payment is not enabled
 */
export default async function ManualCheckoutPage({ params }: PageProps) {
  unstable_noStore();
  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  console.log('[ManualCheckoutPage SERVER] Fetching data for event:', eventId);

  try {
    // Fetch event details to check payment_flow_mode
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL not configured');
    }

    const tenantId = getTenantId();
    const eventRes = await fetchWithJwtRetry(
      `${API_BASE_URL}/api/event-details/${eventId}`,
      { cache: 'no-store' }
    );

    if (!eventRes.ok) {
      throw new Error(`Failed to fetch event: ${eventRes.status}`);
    }

    const event: EventDetailsDTO = await eventRes.json();

    // Check if manual payment is enabled for this event
    if (!event.manualPaymentEnabled || event.paymentFlowMode === 'STRIPE_ONLY') {
      // Redirect to regular checkout if manual payment is not enabled
      redirect(`/events/${eventId}/checkout`);
    }

    // Fetch checkout data (same as regular checkout)
    const checkoutData = await getCheckoutData(eventId);

    console.log('[ManualCheckoutPage SERVER] Data fetched, rendering client component');

    // Pass server-fetched data to client component
    return <ManualCheckoutClient initialData={checkoutData} eventId={eventId} event={event} />;
  } catch (error) {
    console.error('[ManualCheckoutPage SERVER] Error loading manual checkout page:', error);

    // Graceful error UI
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Unable to Load Manual Payment Checkout
          </h1>
          <p className="text-gray-600 mb-6">
            We're having trouble loading the manual payment checkout page. Please try again.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              Try Again
            </button>
            <a
              href={`/events/${eventId}`}
              className="block w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Return to Event
            </a>
          </div>
        </div>
      </div>
    );
  }
}
