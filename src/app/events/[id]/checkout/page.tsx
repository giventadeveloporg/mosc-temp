'use client';

import Image from 'next/image';
import React, { useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaTags, FaCreditCard, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaMapPin, FaTicketAlt, FaUser, FaEnvelope, FaMoneyBillWave, FaReceipt } from 'react-icons/fa';
import { Modal } from '@/components/Modal';
import UniversalPaymentCheckout from '@/components/UniversalPaymentCheckout';
import { PaymentUseCase } from '@/types';
import { formatInTimeZone } from 'date-fns-tz';
import LocationDisplay from '@/components/LocationDisplay';

// CRITICAL FIX: Move PaymentSection outside component to prevent recreation on every render
// This prevents UniversalPaymentCheckout from unmounting/remounting and losing refs
const PaymentSection = React.memo(({
  cart,
  eventId,
  email,
  customerName,
  customerPhone,
  discountCodeId,
  enabled,
  amountCents,
  paymentUseCase,
  returnUrl,
  cancelUrl,
  onInvalidClick,
  onSuccess,
  onError,
  onLoadingChange,
}: {
  cart: Array<{ ticketType: any; quantity: number }>;
  eventId: string;
  email: string;
  customerName?: string;
  customerPhone?: string;
  discountCodeId: number | null;
  enabled: boolean;
  amountCents: number;
  paymentUseCase: PaymentUseCase;
  returnUrl: string;
  cancelUrl: string;
  onInvalidClick: () => void;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
  onLoadingChange: (loading: boolean) => void;
}) => {
  return (
    <UniversalPaymentCheckout
      cart={cart}
      eventId={eventId}
      email={email}
      customerName={customerName}
      customerPhone={customerPhone}
      discountCodeId={discountCodeId}
      enabled={enabled}
      amountCents={amountCents}
      paymentUseCase={paymentUseCase}
      returnUrl={returnUrl}
      cancelUrl={cancelUrl}
      onInvalidClick={onInvalidClick}
      onSuccess={onSuccess}
      onError={onError}
      onLoadingChange={onLoadingChange}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if payment-relevant props change
  const cartEqual = JSON.stringify(prevProps.cart) === JSON.stringify(nextProps.cart);
  return (
    cartEqual &&
    prevProps.eventId === nextProps.eventId &&
    prevProps.email === nextProps.email &&
    prevProps.customerName === nextProps.customerName &&
    prevProps.customerPhone === nextProps.customerPhone &&
    prevProps.discountCodeId === nextProps.discountCodeId &&
    prevProps.enabled === nextProps.enabled &&
    prevProps.amountCents === nextProps.amountCents &&
    prevProps.paymentUseCase === nextProps.paymentUseCase &&
    prevProps.returnUrl === nextProps.returnUrl &&
    prevProps.cancelUrl === nextProps.cancelUrl
  );
});

PaymentSection.displayName = 'PaymentSection';

// TEMPORARY DEBUG: Import debug log viewer for mobile debugging
import DebugLogViewer from '@/components/DebugLogViewer';

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();

  // TEMPORARY DEBUG: Track re-renders to identify flickering cause
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());
  const prevStateRef = useRef<any>({});
  renderCountRef.current += 1;
  const timeSinceLastRender = Date.now() - lastRenderTimeRef.current;

  useEffect(() => {
    const currentState = {
      event: !!event,
      ticketTypesCount: ticketTypes.length,
      loading,
      expressCheckoutLoading,
      hasEvent: !!event,
      hasTicketTypes: ticketTypes.length > 0,
    };

    const changedKeys = Object.keys(currentState).filter(
      (key) => {
        const typedKey = key as keyof typeof currentState;
        return prevStateRef.current[typedKey] !== currentState[typedKey];
      }
    );

    console.log('[CheckoutPage] 🔄 COMPONENT RE-RENDER', {
      renderCount: renderCountRef.current,
      timeSinceLastRender,
      changedState: changedKeys.length > 0 ? changedKeys : 'none',
      currentState,
      prevState: prevStateRef.current,
      timestamp: new Date().toISOString(),
    });

    prevStateRef.current = currentState;
    lastRenderTimeRef.current = Date.now();
  });

  // CRITICAL MOBILE FIX: Memoize eventId to prevent infinite re-renders
  // useParams() returns a proxy that appears "new" on each render on mobile browsers
  // This causes useEffect to trigger repeatedly, causing infinite fetch loops
  const eventId = useMemo(() => {
    const id = params?.id;
    // Convert to string to ensure stable reference across app switches
    return typeof id === 'string' ? id : Array.isArray(id) ? id[0] : id;
  }, [params?.id]);

  // CRITICAL: Initialize state as null/empty to prevent hydration mismatch
  // Server doesn't have sessionStorage, so must match client initial state
  const [event, setEvent] = useState<any>(null);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<{ [key: number]: number }>({});
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [discountError, setDiscountError] = useState('');
  const [discountSuccessMessage, setDiscountSuccessMessage] = useState('');
  const [availableDiscounts, setAvailableDiscounts] = useState<any[]>([]);
  const [emailError, setEmailError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // CRITICAL: Always start with loading=true to prevent hydration mismatch
  // Server doesn't have sessionStorage, so must match client initial state
  const [loading, setLoading] = useState(true);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [savedAmount, setSavedAmount] = useState(0);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showCancelledMessage, setShowCancelledMessage] = useState(false);
  const [cancelledPaymentInfo, setCancelledPaymentInfo] = useState<any>(null);
  const [expressCheckoutLoading, setExpressCheckoutLoading] = useState(true);

  // MOBILE FIX: Track page visibility to prevent unnecessary re-renders on app switch
  const [isPageVisible, setIsPageVisible] = useState(true);
  const isFetchingRef = useRef(false);
  const fetchedEventIdRef = useRef<string | string[] | null>(null);
  // CRITICAL MOBILE FIX: Track if data was restored from sessionStorage to prevent fetch flicker
  const dataRestoredRef = useRef(false);
  // CRITICAL MOBILE FIX: Track if initialization check is complete (restoration check done)
  const initializationCompleteRef = useRef(false);
  const lastFetchAttemptRef = useRef(0);
  // CRITICAL ANTI-FLICKER: Track if data is confirmed ready (prevents any loading state changes)
  const dataReadyRef = useRef(false);
  // Stabilization delay: Wait 150ms after restoration check before allowing fetch
  // This ensures React state updates complete and prevents race conditions
  const STABILIZATION_DELAY_MS = 150;

  // SIMPLE APPROACH: Remove guard function - use setLoading directly like legacy code
  // The guard was causing issues - legacy code doesn't need it

  // CRITICAL MOBILE FIX: Use sessionStorage to persist fetch state AND data across remounts
  // Mobile browsers can remount components, resetting refs and state, so we need persistent storage
  const getFetchedEventIdFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      return sessionStorage.getItem('checkout_fetched_event_id');
    } catch {
      return null;
    }
  }, []);

  const setFetchedEventIdInStorage = useCallback((id: string | string[] | null) => {
    if (typeof window === 'undefined') return;
    try {
      if (id) {
        const idStr = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : String(id);
        sessionStorage.setItem('checkout_fetched_event_id', idStr);
      } else {
        sessionStorage.removeItem('checkout_fetched_event_id');
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // CRITICAL MOBILE FIX: Store fetched data in sessionStorage
  const storeFetchedDataInStorage = useCallback((data: {
    event: any;
    ticketTypes: any[];
    availableDiscounts: any[];
    heroImageUrl: string | null;
  }) => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem('checkout_event_data', JSON.stringify(data.event));
      sessionStorage.setItem('checkout_ticket_types', JSON.stringify(data.ticketTypes));
      sessionStorage.setItem('checkout_available_discounts', JSON.stringify(data.availableDiscounts));
      if (data.heroImageUrl) {
        sessionStorage.setItem('checkout_hero_image_url', data.heroImageUrl);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // CRITICAL MOBILE FIX: Restore fetched data from sessionStorage
  const restoreFetchedDataFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      const eventData = sessionStorage.getItem('checkout_event_data');
      const ticketTypesData = sessionStorage.getItem('checkout_ticket_types');
      const discountsData = sessionStorage.getItem('checkout_available_discounts');
      const heroImageUrlData = sessionStorage.getItem('checkout_hero_image_url');

      if (eventData && ticketTypesData) {
        return {
          event: JSON.parse(eventData),
          ticketTypes: JSON.parse(ticketTypesData),
          availableDiscounts: discountsData ? JSON.parse(discountsData) : [],
          heroImageUrl: heroImageUrlData || null,
        };
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  // CRITICAL MOBILE FIX: Clear stored data when navigating to different event
  const clearStoredData = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem('checkout_fetched_event_id');
      sessionStorage.removeItem('checkout_event_data');
      sessionStorage.removeItem('checkout_ticket_types');
      sessionStorage.removeItem('checkout_available_discounts');
      sessionStorage.removeItem('checkout_hero_image_url');
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => { setMounted(true); }, []);

  // CRITICAL FIX: Check sessionStorage synchronously on mount to prevent flickering
  // This runs BEFORE the first render completes, so we can restore data early
  // if data exists in sessionStorage
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if we have stored data for the current eventId
    const storedFetchedId = getFetchedEventIdFromStorage();
    const currentEventIdStr = typeof eventId === 'string' ? eventId : Array.isArray(eventId) ? eventId[0] : String(eventId || '');

    if (storedFetchedId === currentEventIdStr && storedFetchedId) {
      const storedData = restoreFetchedDataFromStorage();
      if (storedData && storedData.event) {
        // CRITICAL: Set refs FIRST to prevent loading screen flash
        dataReadyRef.current = true;
        fetchedEventIdRef.current = currentEventIdStr ? currentEventIdStr : null;
        isFetchingRef.current = false;
        // CRITICAL: Also restore state synchronously to prevent "Event not found"
        setLoading(false);
        setExpressCheckoutLoading(false);
        setEvent(storedData.event);
        setTicketTypes(storedData.ticketTypes);
        setAvailableDiscounts(storedData.availableDiscounts);
        if (storedData.heroImageUrl) {
          setHeroImageUrl(storedData.heroImageUrl);
        }
      }
    }
  }, [eventId, getFetchedEventIdFromStorage, restoreFetchedDataFromStorage]);

  // REMOVED: Complex restoration useEffect - it was causing flickering
  // Legacy code doesn't have this - restoration is handled inside fetch useEffect

  // MOBILE FIX: Handle page visibility changes (app switching on mobile)
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible';
      console.log('[CheckoutPage] Page visibility changed:', {
        visible,
        timestamp: new Date().toISOString(),
        eventId,
      });
      setIsPageVisible(visible);

      // Don't trigger re-fetch when page becomes visible again
      // Data is already cached in state
      if (visible) {
        console.log('[CheckoutPage] Page became visible - NOT re-fetching (using cached data)');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [eventId]);

  // MOBILE FIX: Clean up Clerk sync parameter from URL (prevents re-renders)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('__clerk_synced')) {
      // Remove Clerk sync parameter for cleaner URL and to prevent re-renders
      urlParams.delete('__clerk_synced');
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      // Use replace to avoid adding to history
      window.history.replaceState({}, '', newUrl);
      console.log('[CheckoutPage] Cleaned up Clerk sync parameter from URL');
    }
  }, []);

  // Check for cancelled payment parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const cancelled = urlParams.get('payment_cancelled');
      const pi = urlParams.get('pi');
      const status = urlParams.get('status');

      if (cancelled === 'true' && pi) {
        console.log('[TICKETS] Payment cancelled detected:', { pi, status });
        setCancelledPaymentInfo({ pi, status });
        setShowCancelledMessage(true);

        // Clear the URL parameters to prevent showing the message again on refresh
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('payment_cancelled');
        newUrl.searchParams.delete('pi');
        newUrl.searchParams.delete('status');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, []);

  const defaultHeroImageUrl = '/images/default_placeholder_hero_image.jpeg';

  // SIMPLE APPROACH: Match legacy code exactly - single useEffect with simple fetch
  // Legacy code works because it's simple - no complex guards or restoration logic
  useEffect(() => {
    // CRITICAL FIX: Use STRING comparison instead of reference comparison
    // On mobile browsers, params?.id might be a new reference each render
    // This causes useMemo to recalculate eventId even if value is same
    // By comparing STRING values, we prevent infinite loops regardless of reference changes
    const currentEventIdStr = typeof eventId === 'string' ? eventId : Array.isArray(eventId) ? eventId[0] : String(eventId);
    const fetchedEventIdStr = typeof fetchedEventIdRef.current === 'string'
      ? fetchedEventIdRef.current
      : Array.isArray(fetchedEventIdRef.current)
        ? fetchedEventIdRef.current[0]
        : String(fetchedEventIdRef.current || '');

    if (fetchedEventIdStr && fetchedEventIdStr === currentEventIdStr) {
      console.log('[CheckoutPage] ✅ SKIP - Already processed this eventId (string comparison prevents infinite loop)', {
        fetchedId: fetchedEventIdStr,
        currentId: currentEventIdStr,
      });
      return; // Already fetched/restored - don't run again
    }

    // DIAGNOSTIC: Log every useEffect run to identify infinite loop
    console.log('[CheckoutPage] 🔍 useEffect RUN', {
      eventId,
      eventIdType: typeof eventId,
      isFetching: isFetchingRef.current,
      fetchedEventId: fetchedEventIdRef.current,
      hasEvent: !!event,
      ticketTypesCount: ticketTypes.length,
      loading,
      timestamp: new Date().toISOString(),
      paramsId: params?.id,
      paramsIdType: typeof params?.id,
    });

    async function fetchData() {
      // DIAGNOSTIC: Log fetch attempt
      console.log('[CheckoutPage] 🔍 fetchData CALLED', {
        eventId,
        isFetching: isFetchingRef.current,
        fetchedEventId: fetchedEventIdRef.current,
      });

      // SIMPLE: Check sessionStorage FIRST (like legacy but with restoration)
      const storedFetchedId = getFetchedEventIdFromStorage();
      const currentEventIdStr = typeof eventId === 'string' ? eventId : Array.isArray(eventId) ? (eventId[0] || String(eventId)) : String(eventId || '');

      // If we have stored data for this eventId, restore it immediately
      if (storedFetchedId === currentEventIdStr && storedFetchedId) {
        const storedData = restoreFetchedDataFromStorage();
        if (storedData && storedData.event) {
          console.log('[CheckoutPage] ✅ RESTORING from sessionStorage - skipping fetch', {
            storedId: storedFetchedId,
            currentId: currentEventIdStr,
          });
          // CRITICAL: Set refs and loading FIRST to prevent flickering
          // Use string value to ensure stable comparison
          fetchedEventIdRef.current = currentEventIdStr ? currentEventIdStr : null;
          isFetchingRef.current = false; // Mark as not fetching
          // CRITICAL: Mark data as ready BEFORE setting loading to false
          dataReadyRef.current = true;
          // CRITICAL: Set ALL loading states to false FIRST (before state updates) to prevent flicker
          // This ensures loading screen doesn't flash during state updates
          setLoading(false);
          setExpressCheckoutLoading(false); // CRITICAL: Also reset express checkout loading
          // Then restore state (these updates are batched by React)
          setEvent(storedData.event);
          setTicketTypes(storedData.ticketTypes);
          setAvailableDiscounts(storedData.availableDiscounts);
          if (storedData.heroImageUrl) {
            setHeroImageUrl(storedData.heroImageUrl);
          }
          return; // Skip fetch - data restored
        }
      }

      // SIMPLE: Prevent duplicate fetches
      if (isFetchingRef.current) {
        console.log('[CheckoutPage] ⚠️ SKIP - Already fetching');
        return;
      }

      // SIMPLE: Prevent re-fetching same eventId (use string comparison)
      const fetchedIdStr = typeof fetchedEventIdRef.current === 'string'
        ? fetchedEventIdRef.current
        : Array.isArray(fetchedEventIdRef.current)
          ? fetchedEventIdRef.current[0]
          : String(fetchedEventIdRef.current || '');
      if (fetchedIdStr && fetchedIdStr === currentEventIdStr) {
        console.log('[CheckoutPage] ⚠️ SKIP - Already fetched this eventId', {
          fetchedId: fetchedIdStr,
          currentId: currentEventIdStr,
        });
        return;
      }

      // SIMPLE: Set loading and fetch flag (like legacy code)
      isFetchingRef.current = true;
      setLoading(true);

      console.log('[CheckoutPage] ⚡ FETCHING EVENT DATA', {
        eventId: currentEventIdStr,
        timestamp: new Date().toISOString()
      });

      try {
        // Fetch event details
        const eventRes = await fetch(`/api/proxy/event-details/${eventId}`);
        const eventData = await eventRes.json();
        setEvent(eventData);

        // Store event details early for loading page
        if (eventData) {
          sessionStorage.setItem('eventTitle', eventData.title || '');
          sessionStorage.setItem('eventLocation', eventData.location || '');
        }

        // Fetch ticket types for this event (only active ones)
        const ticketRes = await fetch(`/api/proxy/event-ticket-types?eventId.equals=${eventId}&isActive.equals=true`);
        const ticketData = await ticketRes.json();
        const ticketTypesArray = Array.isArray(ticketData) ? ticketData : [];
        setTicketTypes(ticketTypesArray);

        // Fetch discount codes for this event
        const discountRes = await fetch(`/api/proxy/discount-codes?eventId.equals=${eventId}&isActive.equals=true`);
        let discountsArray: any[] = [];
        if (discountRes.ok) {
          const discountData = await discountRes.json();
          discountsArray = Array.isArray(discountData) ? discountData : [];
        }
        setAvailableDiscounts(discountsArray);

        // --- Hero image selection logic (match home page) ---
        let imageUrl = null;
        // 1. Try flyer
        const flyerRes = await fetch(`/api/proxy/event-medias?eventId.equals=${eventId}&eventFlyer.equals=true`);
        if (flyerRes.ok) {
          const flyerData = await flyerRes.json();
          const flyerArray = Array.isArray(flyerData) ? flyerData : (flyerData ? [flyerData] : []);
          if (flyerArray.length > 0 && flyerArray[0].fileUrl) {
            imageUrl = flyerArray[0].fileUrl;
          }
        }
        // 2. If no flyer, try featured
        if (!imageUrl) {
          // Try to get featured image
          let featuredImageUrl;
          try {
            const featuredRes = await fetch(`/api/proxy/event-medias?eventId.equals=${eventId}&isFeaturedImage.equals=true`);
            if (featuredRes.ok) {
              const featuredData = await featuredRes.json();
              if (Array.isArray(featuredData) && featuredData.length > 0) {
                featuredImageUrl = featuredData[0].fileUrl;
              }
            }
          } catch (error) {
            console.error('Error fetching featured image:', error);
          }
        }
        // 3. Fallback to default
        if (!imageUrl) {
          imageUrl = defaultHeroImageUrl;
        }
        setHeroImageUrl(imageUrl);

        // CRITICAL MOBILE FIX: Store all fetched data in sessionStorage for restoration after remounts
        storeFetchedDataInStorage({
          event: eventData,
          ticketTypes: ticketTypesArray,
          availableDiscounts: discountsArray,
          heroImageUrl: imageUrl,
        });

        console.log('[CheckoutPage] ✅ DATA STORED in sessionStorage', {
          eventId: currentEventIdStr,
          hasEvent: !!eventData,
          ticketTypesCount: ticketTypesArray.length,
          discountsCount: discountsArray.length,
          hasHeroImage: !!imageUrl
        });
      } catch (e) {
        setEvent(null);
        setTicketTypes([]);
        setHeroImageUrl(defaultHeroImageUrl);
      } finally {
        // SIMPLE: Just set loading to false like legacy code
        setLoading(false);
        isFetchingRef.current = false;
        if (eventId) {
          // Use string value to ensure stable comparison
          const eventIdStr = typeof eventId === 'string' ? eventId : Array.isArray(eventId) ? eventId[0] : String(eventId);
          fetchedEventIdRef.current = eventIdStr ? eventIdStr : null;
          setFetchedEventIdInStorage(eventIdStr || '');
        }
      }
    }

    // SIMPLE: Just check if we have eventId - match legacy code exactly
    if (eventId) {
      fetchData();
    } else {
      console.log('[CheckoutPage] ⚠️ SKIP - No eventId');
    }
    // eslint-disable-next-line
  }, [eventId]);

  // Reactive calculation for total and discount changes.  These are the new changes

  useEffect(() => {
    const subtotal = Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = ticketTypes.find(t => t.id === parseInt(ticketId));
      return total + (ticket?.price || 0) * quantity;
    }, 0);

    let finalAmount = subtotal;
    let amountSaved = 0;

    if (appliedDiscount) {
      if (appliedDiscount.discountType === 'PERCENTAGE') {
        amountSaved = subtotal * (appliedDiscount.discountValue / 100);
      } else if (appliedDiscount.discountType === 'FIXED_AMOUNT') {
        amountSaved = Math.min(subtotal, appliedDiscount.discountValue);
      }
      finalAmount = Math.max(0, subtotal - amountSaved);

      if (amountSaved > 0) {
        setDiscountSuccessMessage(`Discount '${appliedDiscount.code}' applied! You saved $${amountSaved.toFixed(2)}.`);
      }
    } else {
      setDiscountSuccessMessage('');
    }

    setTotalAmount(finalAmount);
    setSavedAmount(amountSaved);
  }, [selectedTickets, appliedDiscount, ticketTypes]);

  // Helper function to calculate remaining quantity (matches rendering logic)
  // CRITICAL: Handles NULL/zero values properly - zero or null is OK as long as sold doesn't exceed available
  // Only mark as sold out if soldQuantity >= availableQuantity (both must be valid numbers)
  const calculateRemainingQuantity = (ticket: any): number => {
    if (!ticket) return 0;

    // Use backend remainingQuantity if explicitly provided (not NULL/undefined)
    if (ticket.remainingQuantity != null && ticket.remainingQuantity !== undefined) {
      return Math.max(0, ticket.remainingQuantity); // Ensure non-negative
    }

    // Calculate from availableQuantity and soldQuantity
    // Handle NULL/undefined values: treat as 0 for calculation
    const availableQty = ticket.availableQuantity ?? 0;
    const soldQty = ticket.soldQuantity ?? 0;

    // CRITICAL: If availableQuantity is null/undefined/0, allow tickets (treat as unlimited)
    // Only restrict if we have valid availableQuantity AND soldQuantity exceeds it
    if (availableQty === null || availableQty === undefined || availableQty === 0) {
      // No restriction - allow ticket selection (treat as unlimited or not yet set)
      return 999999; // Large number to allow selection
    }

    // Calculate remaining: available - sold
    const calculatedRemaining = availableQty - soldQty;

    // Return calculated value (can be negative if sold exceeds available, but we'll handle that in isSoldOut check)
    return Math.max(0, calculatedRemaining);
  };

  const handleTicketChange = (ticketId: number, quantity: number) => {
    console.log('[handleTicketChange] Called:', { ticketId, quantity, selectedTickets });

    const ticketType = ticketTypes.find(t => t.id === ticketId);
    if (!ticketType) {
      console.log('[handleTicketChange] Ticket type not found:', ticketId);
      return;
    }

    // Use the same calculation logic as rendering
    const remaining = calculateRemainingQuantity(ticketType);

    const isSoldOut = remaining <= 0;

    console.log('[handleTicketChange] Ticket availability:', {
      ticketName: ticketType.name,
      availableQuantity: ticketType.availableQuantity,
      soldQuantity: ticketType.soldQuantity,
      remainingQuantity: ticketType.remainingQuantity,
      calculatedRemaining: remaining,
      remaining,
      isSoldOut,
      currentSelected: selectedTickets[ticketId] || 0
    });

    if (isSoldOut) {
      console.log(`[handleTicketChange] Cannot select tickets for ${ticketType.name} - sold out`);
      return;
    }

    // Calculate the maximum quantity that can be selected
    const maxOrderQuantity = ticketType.maxQuantityPerOrder ?? 10;
    const maxSelectable = Math.min(remaining, maxOrderQuantity);
    const newQuantity = Math.max(0, Math.min(quantity, maxSelectable));

    console.log('[handleTicketChange] Quantity calculation:', {
      quantity,
      maxOrderQuantity,
      maxSelectable,
      newQuantity
    });

    if (newQuantity >= 0) {
      console.log('[handleTicketChange] Updating selectedTickets:', { ticketId, newQuantity });
      setSelectedTickets(prev => {
        const updated = { ...prev, [ticketId]: newQuantity };
        console.log('[handleTicketChange] New selectedTickets state:', updated);
        return updated;
      });
      // Clear email to force re-validation and PRB recalculation with new total
      setEmail('');
      // Trigger immediate email validation to show user they need to enter email
      if (newQuantity > 0) {
        setEmailError(true); // Show email error immediately when tickets are selected
      } else {
        setEmailError(false); // Hide email error when no tickets are selected
      }
    }
  };

  const calculateSubtotal = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = ticketTypes.find(t => t.id === parseInt(ticketId));
      return total + (ticket?.price || 0) * quantity;
    }, 0);
  };

  const isTicketTypeAvailable = (ticketType: any, quantity: number) => {
    if (!ticketType) return false;

    // CRITICAL: Prioritize remainingQuantity from backend if provided (source of truth)
    // If remainingQuantity is provided and > 0, tickets are available
    // Only use soldQty >= availableQty check if remainingQuantity is not provided
    const hasRemainingQuantity = ticketType.remainingQuantity != null && ticketType.remainingQuantity !== undefined;
    const isSoldOut = hasRemainingQuantity
      ? ticketType.remainingQuantity <= 0  // Use backend remainingQuantity as source of truth
      : (() => {
        // Fallback: check if sold >= available (only if remainingQuantity not provided)
        const availableQty = ticketType.availableQuantity ?? 0;
        const soldQty = ticketType.soldQuantity ?? 0;
        return availableQty > 0 && soldQty >= availableQty;
      })();

    if (isSoldOut) return false;

    const remaining = calculateRemainingQuantity(ticketType);
    const maxOrderQuantity = ticketType.maxQuantityPerOrder ?? 10;
    return remaining > 0 && remaining >= Math.min(quantity, maxOrderQuantity);
  };

  const emailIsValid = useMemo(() => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, [email]);

  // Derived flags used for validations and enabling/disabling actions
  const hasTicketsSelected = Object.values(selectedTickets).some(q => q > 0);
  const hasUnavailableTickets = Object.entries(selectedTickets).some(([ticketId, quantity]) => {
    if (quantity === 0) return false;
    const ticket = ticketTypes.find(t => t.id === parseInt(ticketId));
    if (!ticket) return false;

    // CRITICAL: Prioritize remainingQuantity from backend if provided
    // If remainingQuantity is provided and > 0, tickets are available
    const hasRemainingQuantity = ticket.remainingQuantity != null && ticket.remainingQuantity !== undefined;
    const isSoldOut = hasRemainingQuantity
      ? ticket.remainingQuantity <= 0  // Use backend remainingQuantity as source of truth
      : (() => {
        // Fallback: check if sold >= available (only if remainingQuantity not provided)
        const availableQty = ticket.availableQuantity ?? 0;
        const soldQty = ticket.soldQuantity ?? 0;
        return availableQty > 0 && soldQty >= availableQty;
      })();

    // Use the same calculation logic as rendering
    const remaining = calculateRemainingQuantity(ticket);
    console.log('[hasUnavailableTickets] Checking ticket:', {
      ticketId,
      ticketName: ticket.name,
      quantity,
      availableQuantity: ticket.availableQuantity,
      soldQuantity: ticket.soldQuantity,
      remainingQuantity: ticket.remainingQuantity,
      calculatedRemaining: remaining,
      isSoldOut,
      hasRemainingQuantity
    });

    return isSoldOut; // Only consider completely sold out tickets
  });
  const canCheckout = hasTicketsSelected && emailIsValid && !hasUnavailableTickets;

  const validateAndApplyDiscount = (code: string) => {
    if (Object.values(selectedTickets).every(q => q === 0)) {
      setDiscountError('Please select tickets before applying a discount.');
      return null;
    }

    setDiscountError('');
    const codeToValidate = code.trim().toLowerCase();

    if (!codeToValidate) {
      setAppliedDiscount(null); // Clear discount if input is empty
      return null;
    }

    const codeToApply = availableDiscounts.find(d => d.code.toLowerCase() === codeToValidate);

    if (codeToApply) {
      if (codeToApply.usesCount >= (codeToApply.maxUses || Infinity)) {
        setDiscountError('This discount code has reached its maximum usage limit.');
        setAppliedDiscount(null);
        return null;
      } else {
        setAppliedDiscount(codeToApply); // Success! Set the discount object.
        return codeToApply;
      }
    } else {
      setDiscountError('Invalid code. Please clear the field or enter a valid code to proceed.');
      setAppliedDiscount(null);
      return null;
    }
  };

  const handleApplyDiscount = () => {
    // Validation 1: No tickets selected
    if (Object.values(selectedTickets).every(q => q === 0)) {
      setDiscountError('Please select at least one ticket before applying a discount.');
      return;
    }
    // Validation 2: Discount code is empty
    if (!discountCode.trim()) {
      setDiscountError('Please enter the discount code.');
      return;
    }
    setDiscountError('');
    validateAndApplyDiscount(discountCode);
  };

  // Handle payment success - redirect to success page
  const handlePaymentSuccess = useCallback((transactionId: string) => {
    console.log('[CheckoutPage] Payment successful, transactionId:', transactionId);
    router.push(`/event/success?transactionId=${transactionId}&eventId=${eventId}`);
  }, [router, eventId]);

  // Handle payment error - show alert
  const handlePaymentError = useCallback((error: string) => {
    console.error('[CheckoutPage] Payment error:', error);
    alert(`Payment failed: ${error}. Please try again.`);
  }, []);

  // MOBILE FIX: Memoize payment cart to prevent unnecessary re-renders
  const paymentCart = useMemo(() => {
    return Object.entries(selectedTickets)
      .filter(([, quantity]) => quantity > 0)
      .map(([ticketId, quantity]) => {
        const ticketType = ticketTypes.find(t => t.id === parseInt(ticketId));
        return { ticketType, quantity };
      });
  }, [selectedTickets, ticketTypes]);

  // MOBILE FIX: Memoize payment props to prevent re-renders from form state changes
  const paymentProps = useMemo(() => ({
    cart: paymentCart,
    eventId: String(eventId),
    email,
    customerName: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || undefined,
    customerPhone: phone || undefined,
    discountCodeId: appliedDiscount?.id ?? null,
    enabled: canCheckout,
    amountCents: Math.round(totalAmount * 100),
    paymentUseCase: PaymentUseCase.TICKET_SALE,
    returnUrl: typeof window !== 'undefined' ? `${window.location.origin}/event/success` : '/event/success',
    cancelUrl: typeof window !== 'undefined' ? window.location.origin : '/',
  }), [
    paymentCart,
    eventId,
    email,
    firstName,
    lastName,
    phone,
    appliedDiscount?.id,
    canCheckout,
    totalAmount,
  ]);

  // MOBILE FIX: Memoize callbacks to prevent re-renders
  const handleInvalidClick = useCallback(() => {
    if (!emailIsValid) setEmailError(true);
    if (!hasTicketsSelected) alert('Please select at least one ticket.');
    if (hasUnavailableTickets) alert('Some selected tickets are sold out. Please adjust your selection.');
  }, [emailIsValid, hasTicketsSelected, hasUnavailableTickets]);

  // CRITICAL FIX: Match legacy code - use setExpressCheckoutLoading directly
  // Legacy code uses: onLoadingChange={setExpressCheckoutLoading}
  // Using useCallback with empty deps ensures stable reference (prevents re-renders)
  // This matches the legacy pattern exactly
  const handleLoadingChange = useCallback((loading: boolean) => {
    setExpressCheckoutLoading(loading);
  }, []);

  // PaymentSection is now defined outside the component to prevent recreation on every render

  // CRITICAL FIX: Memoize renderOrderSummary to prevent infinite re-renders
  // The function was being recreated on every render, causing infinite loops
  const renderOrderSummary = useCallback(() => {
    // REMOVED: Debug logging - was causing noise and performance issues
    // The function is now memoized, so it won't be recreated on every render

    // Safety check - only render if component is ready
    // CRITICAL ANTI-FLICKER: Use effectiveLoading instead of loading
    const effectiveLoading = loading && !dataReadyRef.current;
    if (!mounted || effectiveLoading || !eventId) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading payment options...</p>
        </div>
      );
    }

    return (
      <>
        {/* Discount Code Section - Always visible */}
        <div className="mb-6">
          <label htmlFor="discountCode" className="block text-sm font-medium text-gray-700 mb-2">
            Discount Code {availableDiscounts.length > 0 && <span className="text-gray-500 text-sm">(Optional)</span>}
          </label>
          <div className="space-y-3">
            <input
              type="text"
              id="discountCode"
              value={discountCode}
              onChange={(e) => {
                setDiscountCode(e.target.value);
                // Clear errors when user types
                if (discountError) setDiscountError('');
                if (discountSuccessMessage) setDiscountSuccessMessage('');
              }}
              placeholder="Enter discount code"
              className="w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            />
            <button
              type="button"
              onClick={handleApplyDiscount}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:bg-blue-300 font-semibold flex items-center justify-center gap-2"
              disabled={!discountCode.trim()}
            >
              <FaTags />
              Apply
            </button>
          </div>
          {discountError && <p className="text-red-500 text-sm mt-2">{discountError}</p>}
          {discountSuccessMessage && <p className="text-green-600 text-sm mt-2">{discountSuccessMessage}</p>}
          {appliedDiscount && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                <strong>{appliedDiscount.code}</strong> applied: {appliedDiscount.discountType === 'PERCENTAGE'
                  ? `${appliedDiscount.discountValue}% off`
                  : `$${appliedDiscount.discountValue} off`}
              </p>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium text-gray-600">Total:</span>
            <span className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</span>
          </div>

          {/* Warning for sold out tickets */}
          {hasUnavailableTickets && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-700 text-sm">
                <span className="mr-2">⚠️</span>
                <span>Some selected tickets are sold out</span>
              </div>
            </div>
          )}
        </div>

        {/* Email and Checkout */}
        <div>
          {/* Show requirement indicator when tickets are selected */}
          {hasTicketsSelected && (
            <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center text-blue-700 text-sm">
                <span className="mr-2">📧</span>
                <span>Email required to enable payment options</span>
              </div>
            </div>
          )}

          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email for ticket confirmation
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(false);
            }}
            className={`mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base ${emailError ? 'border-red-500' : 'border-gray-400'}`}
            required
            placeholder="you@example.com"
          />
          {emailError && (
            <p className="text-red-500 text-xs mt-1">
              {email ? 'Please enter a valid email address.' : 'Please enter your email address to proceed with payment.'}
            </p>
          )}
        </div>

        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            placeholder="John"
          />
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            placeholder="Doe"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number (optional)
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        {/* Universal Payment Checkout - Backend-integrated */}
        {/* MOBILE FIX: Isolated payment section prevents form state changes from causing flickering */}
        <div className="mt-4">
          <PaymentSection
            {...paymentProps}
            onInvalidClick={handleInvalidClick}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onLoadingChange={handleLoadingChange}
          />
        </div>
      </>
    );
  }, [mounted, loading, eventId, event, ticketTypes, selectedTickets, email, emailIsValid, hasTicketsSelected, hasUnavailableTickets, availableDiscounts, discountCode, appliedDiscount, totalAmount, canCheckout, paymentCart, paymentProps, handleInvalidClick, handlePaymentSuccess, handlePaymentError, handleLoadingChange, discountError, discountSuccessMessage, emailError, firstName, lastName, phone, handleApplyDiscount]);

  // SIMPLE APPROACH: Match legacy code - just check loading state
  // CRITICAL FIX: Also check if data is ready (restored from sessionStorage OR already loaded)
  // This prevents flickering when data is restored but loading state hasn't updated yet
  // React state updates are async, so we need to check refs AND actual data
  // If we have event data, don't show loading screen even if loading state is true
  if (loading && !dataReadyRef.current && !event) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col" style={{ overflowX: 'hidden' }}>
        {/* TEMPORARY DEBUG: Debug log viewer for mobile browser debugging */}
        <DebugLogViewer />
        {/* HERO SECTION - Full width bleeding to header */}
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
            src={heroImageUrl || defaultHeroImageUrl}
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

        {/* Loading content - flex-grow to push footer down */}
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
  // CRITICAL FIX: Don't show "Event not found" if data is being restored from sessionStorage
  // React state updates are async, so event might be null even if dataReadyRef indicates data exists
  if (!event && !dataReadyRef.current && !loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-red-600">Event not found.</div>;
  }

  // If loading or data is being restored, show loading screen instead of "Event not found"
  if (!event && (loading || dataReadyRef.current)) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col" style={{ overflowX: 'hidden' }}>
        <DebugLogViewer />
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
            src={heroImageUrl || defaultHeroImageUrl}
            alt="Event Hero"
            width={1200}
            height={400}
            className="hero-image object-cover"
            style={{
              margin: '0 auto',
              padding: '0',
              display: 'block',
              width: '100%',
              height: '400px',
              objectFit: 'cover'
            }}
          />
        </section>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading event...</p>
          </div>
        </div>
      </div>
    );
  }

  // --- HERO SECTION (prompt-compliant) ---
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col" style={{ overflowX: 'hidden' }}>
      {/* TEMPORARY DEBUG: Debug log viewer for mobile browser debugging */}
      <DebugLogViewer />
      {/* HERO SECTION - Full width bleeding to header */}
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
        <img
          src={heroImageUrl || defaultHeroImageUrl}
          alt="Event Hero"
          className="hero-image"
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

      {/* Cancelled Payment Message */}
      {showCancelledMessage && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Payment Cancelled
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Your payment was cancelled. You can try again with a different payment method.</p>
                  {cancelledPaymentInfo && (
                    <p className="mt-1 text-xs text-yellow-600">
                      Payment ID: {cancelledPaymentInfo.pi} (Status: {cancelledPaymentInfo.status})
                    </p>
                  )}
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowCancelledMessage(false)}
                    className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Details Card */}
        <div className="bg-teal-50 rounded-xl shadow-lg p-6 md:p-8 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {event.title}
          </h2>
          {event.caption && (
            <div className="text-lg text-teal-700 font-semibold mb-2">{event.caption}</div>
          )}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-xl">📅</span>
              <span className="font-semibold">
                {formatInTimeZone(event.startDate, event.timezone || 'America/New_York', 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-xl">🕐</span>
              <span className="font-semibold">
                {formatTime(event.startTime)}{event.endTime ? ` - ${formatTime(event.endTime)}` : ''} ({formatInTimeZone(event.startDate, event.timezone || 'America/New_York', 'zzz')})
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-gray-700">
                <LocationDisplay location={event.location} />
              </div>
            )}
            {event.venueName && (
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-xl">🏢</span>
                <span className="font-semibold">{event.venueName}</span>
              </div>
            )}
          </div>
          <p className="text-gray-700 text-base">{event.description}</p>
        </div>

        {/* Ticket Selection Section */}
        <div className="bg-slate-50 rounded-xl shadow-lg p-6 md:p-8 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Select Your Tickets</h2>
          <div className="space-y-6">
            {ticketTypes.length === 0 && (
              <div className="text-center text-gray-500 py-8">No ticket types available for this event.</div>
            )}
            {ticketTypes.map(ticket => {
              // REMOVED: Debug log - was causing noise in logs
              // The re-renders are the real issue, not ticket data

              // Calculate remaining quantity using the same helper function
              const remainingQuantity = calculateRemainingQuantity(ticket);

              // Check if tickets are sold out
              // CRITICAL: Prioritize remainingQuantity from backend if provided
              // If remainingQuantity is provided and > 0, tickets are available
              // Only use soldQty >= availableQty check if remainingQuantity is not provided
              const hasRemainingQuantity = ticket.remainingQuantity != null && ticket.remainingQuantity !== undefined;
              const isSoldOut = hasRemainingQuantity
                ? ticket.remainingQuantity <= 0  // Use backend remainingQuantity as source of truth
                : (() => {
                  // Fallback: check if sold >= available (only if remainingQuantity not provided)
                  const availableQty = ticket.availableQuantity ?? 0;
                  const soldQty = ticket.soldQuantity ?? 0;
                  return availableQty > 0 && soldQty >= availableQty;
                })();
              const maxOrderQuantity = ticket.maxQuantityPerOrder ?? 10;

              return (
                <div key={ticket.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border border-gray-200 rounded-lg bg-white shadow-sm relative">
                  {/* Sold Out Image Only */}
                  {isSoldOut && (
                    <div className="absolute top-4 right-4 z-10">
                      <Image
                        src="/images/tickets_sold_out.jpg"
                        alt="Tickets Sold Out"
                        width={60}
                        height={60}
                        className="rounded shadow-sm"
                      />
                    </div>
                  )}

                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-xl font-semibold text-gray-900">{ticket.name}</h3>
                    <p className="text-lg font-bold text-blue-600 mt-1">${ticket.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-600 mt-2">{ticket.description}</p>

                    {/* Low stock warning only */}
                    {!isSoldOut && remainingQuantity <= 5 && remainingQuantity > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-orange-600 font-medium">
                          ⚠️ Low stock - only {remainingQuantity} left!
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const currentQty = selectedTickets[ticket.id] || 0;
                        handleTicketChange(ticket.id, currentQty - 1);
                      }}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded-l-md hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={isSoldOut || (selectedTickets[ticket.id] || 0) <= 0}
                    >
                      -
                    </button>
                    <span className="px-4 py-1 bg-white border-t border-b border-gray-200 min-w-[3rem] text-center">
                      {selectedTickets[ticket.id] || 0}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const currentQty = selectedTickets[ticket.id] || 0;
                        handleTicketChange(ticket.id, currentQty + 1);
                      }}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded-r-md hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={isSoldOut || (selectedTickets[ticket.id] || 0) >= Math.min(remainingQuantity, maxOrderQuantity)}
                    >
                      +
                    </button>
                  </div>

                  {/* Quantity validation warning */}
                  {selectedTickets[ticket.id] > 0 && selectedTickets[ticket.id] > remainingQuantity && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                      ⚠️ Only {remainingQuantity} tickets available for this selection
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary Section - Full width below tickets */}
        <div className="bg-slate-50 rounded-xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Order Summary</h2>
          {renderOrderSummary()}
        </div>
      </div>
      <Modal open={showDiscountModal} onClose={() => setShowDiscountModal(false)} title="Discount Code Error">
        <div className="text-center">
          <p className="text-lg">
            Please enter valid discount code or clear the field before proceeding.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => setShowDiscountModal(false)}
              className="bg-teal-100 hover:bg-teal-200 text-teal-800 px-4 py-2 rounded-md flex items-center gap-2"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function formatTime(time: string): string {
  if (!time) return '';
  // Accepts 'HH:mm' or 'hh:mm AM/PM' and returns 'hh:mm AM/PM'
  if (time.match(/AM|PM/i)) return time;
  const [hourStr, minute] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
}