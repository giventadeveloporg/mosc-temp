import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getCheckoutData } from './CheckoutServerData';
import CheckoutClient from './CheckoutClient';
import Image from 'next/image';

/**
 * Server Component for Checkout Page
 *
 * This implementation solves the mobile browser flickering issue by:
 * 1. Fetching data on the server (no client-side loading state)
 * 2. Using Next.js cache() to prevent re-fetching on navigation
 * 3. Passing data as props to client component (no async state updates)
 * 4. Client component only handles UI interactions (no data fetching)
 *
 * Benefits:
 * - No flickering on mobile browsers (no loading state)
 * - Better SEO (server-rendered content)
 * - Faster initial load (data fetched before client JS loads)
 * - No hydration mismatches (server and client render same initial state)
 * - No sessionStorage complexity (data comes from server cache)
 */

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CheckoutPage({ params }: PageProps) {
  // Await params in Next.js 15+
  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  if (!eventId) {
    notFound();
  }

  // Fetch data on server - this is cached automatically by Next.js
  let checkoutData;
  try {
    checkoutData = await getCheckoutData(eventId);
  } catch (error) {
    console.error('[CheckoutPage] Error fetching checkout data:', error);
    notFound();
  }

  // Pass server-fetched data to client component
  // NO LOADING STATE - data is ready before page renders
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutClient initialData={checkoutData} eventId={eventId} />
    </Suspense>
  );
}

/**
 * Loading fallback for Suspense boundary
 * This is only shown during navigation, not on initial load
 */
function LoadingFallback() {
  const defaultHeroImageUrl = '/images/default_placeholder_hero_image.jpeg';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col" style={{ overflowX: 'hidden' }}>
      {/* HERO SECTION */}
      <section className="hero-section" style={{
        position: 'relative',
        marginTop: '0',
        backgroundColor: 'transparent',
        minHeight: '400px',
        overflow: 'hidden',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 0 0 0'
      }}>
        <Image
          src={defaultHeroImageUrl}
          alt="Event Hero"
          width={1200}
          height={400}
          className="hero-image object-cover"
          style={{
            margin: '0 auto',
            padding: '0',
            display: 'block',
            width: '100%',
            maxWidth: '100%',
            height: 'auto',
            objectFit: 'cover',
            borderRadius: '0'
          }}
          priority
        />
        <div className="hero-overlay" style={{ opacity: 0.1, height: '5px', padding: '20' }}></div>
      </section>

      {/* Responsive Hero Image CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .hero-image {
            width: 100%;
            max-width: 100%;
            height: auto;
            object-fit: cover;
            object-position: center;
            display: block;
            margin: 0 auto;
            padding: 0;
            border-radius: 0;
          }

          .hero-section {
            min-height: 15vh;
            background-color: transparent !important;
            padding: 80px 0 0 0 !important;
            width: 100% !important;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          @media (max-width: 768px) {
            .hero-image {
              width: 100%;
              max-width: 100%;
              height: auto;
              padding: 0;
              border-radius: 0;
            }

            .hero-section {
              padding: 95px 0 15px 0 !important;
              min-height: 12vh !important;
            }
          }

          @media (max-width: 480px) {
            .hero-image {
              width: 100%;
              padding: 0;
              border-radius: 0;
            }

            .hero-section {
              padding: 90px 0 10px 0 !important;
              min-height: 10vh !important;
            }
          }
        `
      }} />

      {/* Loading content */}
      <div className="flex-grow flex flex-col items-center justify-center min-h-[200px] p-6 animate-pulse" style={{ marginTop: '150px', paddingTop: '60px' }}>
        <Image
          src="/images/selling-tickets-vector-loading-image.jpg"
          alt="Ticket Loading"
          width={180}
          height={180}
          className="mb-4 rounded shadow-lg"
          priority
        />
        <div className="text-xl font-bold text-teal-700 mb-2">Please wait while your tickets are being loaded...</div>
        <div className="text-gray-600 text-base text-center">This may take a few moments.<br />Please do not close or refresh this page.</div>
      </div>
    </div>
  );
}

/**
 * Generate static params for common events (optional optimization)
 * This pre-renders checkout pages at build time for better performance
 */
// export async function generateStaticParams() {
//   // Optionally pre-render checkout pages for specific events
//   // return [{ id: '1' }, { id: '2' }];
//   return [];
// }
