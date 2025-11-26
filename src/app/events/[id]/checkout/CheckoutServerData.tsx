import { cache } from 'react';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId } from '@/lib/env';

/**
 * Server-side data fetching for checkout page
 * Uses Next.js cache() to prevent re-fetching on navigation
 * Follows cursor rules: nextjs_api_routes.mdc - uses fetchWithJwtRetry for backend calls
 */

interface EventData {
  id: number;
  title: string;
  caption?: string;
  description: string;
  startDate: string;
  startTime: string;
  endTime?: string;
  timezone?: string;
  location?: string;
  venueName?: string;
}

interface TicketType {
  id: number;
  name: string;
  description: string;
  price: number;
  availableQuantity?: number;
  soldQuantity?: number;
  remainingQuantity?: number;
  maxQuantityPerOrder?: number;
  isActive: boolean;
}

interface DiscountCode {
  id: number;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  isActive: boolean;
  usesCount: number;
  maxUses?: number;
}

interface EventMedia {
  id: number;
  fileUrl: string;
  eventFlyer?: boolean;
  isFeaturedImage?: boolean;
}

export interface CheckoutData {
  event: EventData;
  ticketTypes: TicketType[];
  discounts: DiscountCode[];
  heroImageUrl: string;
}

const DEFAULT_HERO_IMAGE = '/images/default_placeholder_hero_image.jpeg';

/**
 * Cached server-side data fetcher
 * Next.js will automatically cache this per-request
 * Uses fetchWithJwtRetry for backend API calls (cursor rules pattern)
 */
export const getCheckoutData = cache(async (eventId: string): Promise<CheckoutData> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL not configured');
  }

  const tenantId = getTenantId();

  try {
    console.log('[CheckoutServerData] Fetching event data server-side for eventId:', eventId);

    // Fetch event details - using fetchWithJwtRetry per cursor rules
    let eventRes;
    try {
      eventRes = await fetchWithJwtRetry(
        `${API_BASE_URL}/api/event-details/${eventId}`,
        {
          cache: 'no-store', // Don't cache at fetch level, Next.js cache() handles it
        }
      );
    } catch (fetchError) {
      console.error('[CheckoutServerData] Network error fetching event:', fetchError);
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
    }

    if (!eventRes.ok) {
      throw new Error(`Failed to fetch event: ${eventRes.status}`);
    }

    const event: EventData = await eventRes.json();

    // Fetch ticket types (only active ones)
    // Use JHipster criteria syntax: field.operation=value
    let ticketRes;
    try {
      ticketRes = await fetchWithJwtRetry(
        `${API_BASE_URL}/api/event-ticket-types?eventId.equals=${eventId}&isActive.equals=true&tenantId.equals=${tenantId}`,
        {
          cache: 'no-store',
        }
      );
    } catch (fetchError) {
      console.error('[CheckoutServerData] Network error fetching tickets:', fetchError);
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
    }

    if (!ticketRes.ok) {
      throw new Error(`Failed to fetch tickets: ${ticketRes.status}`);
    }

    const ticketData = await ticketRes.json();
    const ticketTypes: TicketType[] = Array.isArray(ticketData) ? ticketData : [];

    // Fetch discount codes
    let discounts: DiscountCode[] = [];
    try {
      const discountRes = await fetchWithJwtRetry(
        `${API_BASE_URL}/api/discount-codes?eventId.equals=${eventId}&isActive.equals=true&tenantId.equals=${tenantId}`,
        {
          cache: 'no-store',
        }
      );

      if (discountRes.ok) {
        const discountData = await discountRes.json();
        discounts = Array.isArray(discountData) ? discountData : [];
      }
    } catch (error) {
      console.error('[CheckoutServerData] Error fetching discounts:', error);
      // Continue without discounts
    }

    // Fetch hero image
    let heroImageUrl = DEFAULT_HERO_IMAGE;

    try {
      // 1. Try flyer first
      const flyerRes = await fetchWithJwtRetry(
        `${API_BASE_URL}/api/event-medias?eventId.equals=${eventId}&eventFlyer.equals=true&tenantId.equals=${tenantId}`,
        {
          cache: 'no-store',
        }
      );

      if (flyerRes.ok) {
        const flyerData = await flyerRes.json();
        const flyerArray: EventMedia[] = Array.isArray(flyerData) ? flyerData : (flyerData ? [flyerData] : []);
        if (flyerArray.length > 0 && flyerArray[0].fileUrl) {
          heroImageUrl = flyerArray[0].fileUrl;
        }
      }

      // 2. If no flyer, try featured image
      if (heroImageUrl === DEFAULT_HERO_IMAGE) {
        const featuredRes = await fetchWithJwtRetry(
          `${API_BASE_URL}/api/event-medias?eventId.equals=${eventId}&isFeaturedImage.equals=true&tenantId.equals=${tenantId}`,
          {
            cache: 'no-store',
          }
        );

        if (featuredRes.ok) {
          const featuredData = await featuredRes.json();
          if (Array.isArray(featuredData) && featuredData.length > 0) {
            heroImageUrl = featuredData[0].fileUrl;
          }
        }
      }
    } catch (error) {
      console.error('[CheckoutServerData] Error fetching hero image:', error);
      // Use default image
    }

    console.log('[CheckoutServerData] ✅ Server-side fetch complete:', {
      eventId,
      hasEvent: !!event,
      ticketCount: ticketTypes.length,
      discountCount: discounts.length,
      heroImageUrl,
    });

    return {
      event,
      ticketTypes,
      discounts,
      heroImageUrl,
    };
  } catch (error) {
    console.error('[CheckoutServerData] Error fetching checkout data:', error);
    console.error('[CheckoutServerData] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[CheckoutServerData] Error message:', error instanceof Error ? error.message : String(error));

    // Re-throw with user-friendly message if not already wrapped
    if (error instanceof Error) {
      // If it's already a user-friendly message, keep it
      if (error.message.includes('Unable to connect') || error.message.includes('check your internet')) {
        throw error;
      }
      // Otherwise, wrap it
      throw new Error('Unable to load checkout data. Please check your connection and try again.');
    }

    throw new Error('Unable to load checkout data. Please try again later.');
  }
});
