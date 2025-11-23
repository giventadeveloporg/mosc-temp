'use client';

import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaTags, FaCreditCard, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaMapPin, FaTicketAlt, FaUser, FaEnvelope, FaMoneyBillWave, FaReceipt } from 'react-icons/fa';
import { Modal } from '@/components/Modal';
import UniversalPaymentCheckout from '@/components/UniversalPaymentCheckout';
import { formatInTimeZone } from 'date-fns-tz';
import LocationDisplay from '@/components/LocationDisplay';
import { PaymentUseCase } from '@/types';
import { createComponentLogger } from '@/lib/clientLogger';

// Create component-specific logger for CloudWatch visibility
const logger = createComponentLogger('CheckoutPage');

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id;
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
  const [loading, setLoading] = useState(true);
  const defaultHeroImageUrl = '/images/default_placeholder_hero_image.jpeg';
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(defaultHeroImageUrl);
  const [totalAmount, setTotalAmount] = useState(0);
  const [savedAmount, setSavedAmount] = useState(0);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [paymentEnabled, setPaymentEnabled] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Clean up Clerk sync parameter from URL on mount (for cleaner URLs)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('__clerk_synced')) {
      // Remove Clerk sync parameter for cleaner URL
      urlParams.delete('__clerk_synced');
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      // Use replace to avoid adding to history
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Detect mobile browser for better error logging
      const isMobile = typeof window !== 'undefined' && (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768
      );

      // Log environment info for debugging
      if (isMobile) {
        console.log('[CheckoutPage] Mobile browser detected:', {
          userAgent: navigator.userAgent,
          url: window.location.href,
          hasClerkSync: window.location.search.includes('__clerk_synced'),
        });
      }

      try {
        // First, fetch event details to show hero image during loading
        const eventUrl = `/api/proxy/event-details/${eventId}`;
        console.log('[CheckoutPage] Fetching event details:', eventUrl);

        const eventRes = await fetch(eventUrl, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('[CheckoutPage] Event response status:', eventRes.status, eventRes.statusText);

        if (!eventRes.ok) {
          const errorText = await eventRes.text();
          console.error('[CheckoutPage] Event fetch failed:', {
            status: eventRes.status,
            statusText: eventRes.statusText,
            error: errorText,
            url: eventUrl,
            isMobile,
          });
          throw new Error(`Failed to load event: ${eventRes.status} ${eventRes.statusText}`);
        }

        const eventData = await eventRes.json();
        console.log('[CheckoutPage] Event data loaded:', eventData?.id || 'no id');
        setEvent(eventData);

        // Fetch hero image immediately (prioritize homepage hero, then regular hero, then flyer, then featured)
        try {
          // Try homepage hero image first
          let mediaRes = await fetch(`/api/proxy/event-medias?eventId.equals=${eventId}&isHomePageHeroImage.equals=true`, {
            cache: 'no-store',
          });
          if (mediaRes.ok) {
            const mediaData = await mediaRes.json();
            const mediaArray = Array.isArray(mediaData) ? mediaData : (mediaData ? [mediaData] : []);
            if (mediaArray.length > 0 && mediaArray[0].fileUrl) {
              setHeroImageUrl(mediaArray[0].fileUrl);
            } else {
              // Try regular hero image
              mediaRes = await fetch(`/api/proxy/event-medias?eventId.equals=${eventId}&isHeroImage.equals=true`, {
                cache: 'no-store',
              });
              if (mediaRes.ok) {
                const heroMediaData = await mediaRes.json();
                const heroMediaArray = Array.isArray(heroMediaData) ? heroMediaData : (heroMediaData ? [heroMediaData] : []);
                if (heroMediaArray.length > 0 && heroMediaArray[0].fileUrl) {
                  setHeroImageUrl(heroMediaArray[0].fileUrl);
                } else {
                  // Try flyer image
                  const flyerRes = await fetch(`/api/proxy/event-medias?eventId.equals=${eventId}&eventFlyer.equals=true`, {
                    cache: 'no-store',
                  });
                  if (flyerRes.ok) {
                    const flyerData = await flyerRes.json();
                    const flyerArray = Array.isArray(flyerData) ? flyerData : (flyerData ? [flyerData] : []);
                    if (flyerArray.length > 0 && flyerArray[0].fileUrl) {
                      setHeroImageUrl(flyerArray[0].fileUrl);
                    } else {
                      // Try featured image
                      const featuredRes = await fetch(`/api/proxy/event-medias?eventId.equals=${eventId}&isFeaturedImage.equals=true`, {
                        cache: 'no-store',
                      });
                      if (featuredRes.ok) {
                        const featuredData = await featuredRes.json();
                        if (Array.isArray(featuredData) && featuredData.length > 0 && featuredData[0].fileUrl) {
                          setHeroImageUrl(featuredData[0].fileUrl);
                        } else {
                          setHeroImageUrl(defaultHeroImageUrl);
                        }
                      } else {
                        setHeroImageUrl(defaultHeroImageUrl);
                      }
                    }
                  } else {
                    setHeroImageUrl(defaultHeroImageUrl);
                  }
                }
              } else {
                setHeroImageUrl(defaultHeroImageUrl);
              }
            }
          } else {
            setHeroImageUrl(defaultHeroImageUrl);
          }
        } catch (mediaErr) {
          console.error('[CheckoutPage] Error fetching hero image:', mediaErr);
          setHeroImageUrl(defaultHeroImageUrl);
        }

        // Fetch ticket types for this event (only active ones)
        const ticketUrl = `/api/proxy/event-ticket-types?eventId.equals=${eventId}&isActive.equals=true`;
        console.log('[CheckoutPage] Fetching ticket types:', ticketUrl);

        const ticketRes = await fetch(ticketUrl, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('[CheckoutPage] Ticket types response status:', ticketRes.status);

        if (!ticketRes.ok) {
          const errorText = await ticketRes.text();
          console.error('[CheckoutPage] Ticket types fetch failed:', {
            status: ticketRes.status,
            statusText: ticketRes.statusText,
            error: errorText,
            url: ticketUrl,
            isMobile,
          });
          // Don't throw - allow page to load with empty ticket types
          setTicketTypes([]);
        } else {
          const ticketData = await ticketRes.json();
          console.log('[CheckoutPage] Ticket types loaded:', Array.isArray(ticketData) ? ticketData.length : 'not array');
          setTicketTypes(Array.isArray(ticketData) ? ticketData : []);
        }

        // Fetch discount codes for this event
        const discountUrl = `/api/proxy/discount-codes?eventId.equals=${eventId}&isActive.equals=true`;
        console.log('[CheckoutPage] Fetching discount codes:', discountUrl);

        const discountRes = await fetch(discountUrl, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('[CheckoutPage] Discount codes response status:', discountRes.status);

        if (discountRes.ok) {
          const discountData = await discountRes.json();
          console.log('[CheckoutPage] Discount codes loaded:', Array.isArray(discountData) ? discountData.length : 'not array');
          setAvailableDiscounts(Array.isArray(discountData) ? discountData : []);
        } else {
          console.warn('[CheckoutPage] Discount codes fetch failed:', discountRes.status);
          setAvailableDiscounts([]);
        }
      } catch (e: any) {
        // Enhanced error logging for mobile debugging
        const errorDetails = {
          message: e?.message || String(e),
          stack: e?.stack,
          name: e?.name,
          isMobile,
          url: typeof window !== 'undefined' ? window.location.href : 'unknown',
          eventId,
        };

        console.error('[CheckoutPage] CRITICAL ERROR loading checkout page:', errorDetails);

        // Log to console.error for mobile browser debugging
        if (isMobile) {
          console.error('[CheckoutPage] MOBILE ERROR DETAILS:', JSON.stringify(errorDetails, null, 2));
        }

        // Forward critical errors to CloudWatch via client logger
        logger.critical('Failed to load checkout page', {
          error: errorDetails.message,
          eventId,
          isMobile,
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
          url: errorDetails.url,
        });

        setEvent(null);
        setTicketTypes([]);
        setHeroImageUrl(defaultHeroImageUrl);
        setAvailableDiscounts([]);
      } finally {
        setLoading(false);
      }
    }
    if (eventId) fetchData();
  }, [eventId]);

  // Reactive calculation for total and discount
  useEffect(() => {
    const subtotal = Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = ticketTypes.find(t => t.id === parseInt(ticketId));
      return total + (ticket?.price || 0) * quantity;
    }, 0);

    let finalAmount = subtotal;
    let amountSaved = 0;

    if (appliedDiscount) {
      if (appliedDiscount.discountType === 'PERCENTAGE') {
        const discountValue = (subtotal * appliedDiscount.discountValue) / 100;
        amountSaved = discountValue;
        finalAmount = subtotal - discountValue;
      } else if (appliedDiscount.discountType === 'FIXED') {
        amountSaved = appliedDiscount.discountValue;
        finalAmount = Math.max(0, subtotal - appliedDiscount.discountValue);
      }
    }

    setTotalAmount(finalAmount);
    setSavedAmount(amountSaved);
  }, [selectedTickets, ticketTypes, appliedDiscount]);

  // Validate discount code
  const validateAndApplyDiscount = (code: string) => {
    if (!code.trim()) {
      setAppliedDiscount(null);
      setDiscountError('');
      setDiscountSuccessMessage('');
      return null;
    }

    const discount = availableDiscounts.find(
      d => d.code.toLowerCase() === code.toLowerCase() && d.isActive
    );

    if (!discount) {
      setDiscountError('Invalid discount code');
      setDiscountSuccessMessage('');
      setAppliedDiscount(null);
      return null;
    }

    // Check if discount is expired
    if (discount.expiryDate) {
      const expiryDate = new Date(discount.expiryDate);
      if (expiryDate < new Date()) {
        setDiscountError('Discount code has expired');
        setDiscountSuccessMessage('');
        setAppliedDiscount(null);
        return null;
      }
    }

    setAppliedDiscount(discount);
    setDiscountError('');
    setDiscountSuccessMessage(`Discount "${discount.code}" applied successfully!`);
    return discount;
  };

  const handleDiscountApply = () => {
    setDiscountError('');
    validateAndApplyDiscount(discountCode);
  };

  // Build cart for UniversalPaymentCheckout
  const cart = useMemo(() => {
    return Object.entries(selectedTickets)
      .filter(([, quantity]) => quantity > 0)
      .map(([ticketId, quantity]) => {
        const ticketType = ticketTypes.find(t => t.id === parseInt(ticketId));
        return { ticketType, quantity };
      })
      .filter(item => item.ticketType);
  }, [selectedTickets, ticketTypes]);

  const amountCents = Math.round(totalAmount * 100);

  // Enable payment when form is valid
  // Only enable after user has interacted with the form (prevents auto-fill from triggering payment)
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = email && emailRegex.test(email) && cart.length > 0 && amountCents > 0;
    // Only enable if user has actually selected tickets (not just auto-filled)
    const hasUserSelectedTickets = Object.values(selectedTickets).some(qty => qty > 0);
    setPaymentEnabled(isValid && hasUserSelectedTickets);
  }, [email, cart, amountCents, selectedTickets]);

  // Handle payment success
  const handlePaymentSuccess = (transactionId: string) => {
    console.log('[CheckoutPage] Payment successful, transactionId:', transactionId);
    // Redirect to success page with transaction ID
    router.push(`/event/success?transactionId=${transactionId}&eventId=${eventId}`);
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    console.error('[CheckoutPage] Payment error:', error);
    alert(`Payment error: ${error}`);
  };

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Hero Image Section */}
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
          padding: '80px 0 0 0',
          opacity: 0.7
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
        </section>

        {/* Loading Message Overlay */}
        <div className="flex-grow flex flex-col items-center justify-center min-h-[400px] p-6" style={{
          marginTop: '-300px',
          position: 'relative',
          zIndex: 10
        }}>
          <Image
            src="/images/selling-tickets-vector-loading-image.jpg"
            alt="Ticket Loading"
            width={180}
            height={180}
            className="mb-4 rounded shadow-lg bg-white p-4"
            priority
          />
          <div className="text-xl font-bold text-teal-700 mb-2 bg-white px-4 py-2 rounded shadow">Please wait while your tickets are being loaded...</div>
          <div className="text-gray-600 text-base text-center bg-white px-4 py-2 rounded shadow">This may take a few moments.<br />Please do not close or refresh this page.</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-red-600">Event not found.</div>;
  }

  const hasTicketsSelected = Object.values(selectedTickets).some(qty => qty > 0);
  const emailIsValid = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canCheckout = hasTicketsSelected && emailIsValid && amountCents > 0;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col" style={{ overflowX: 'hidden' }}>
      {/* Hero Section */}
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
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Event Details & Form Section */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>

              <div className="space-y-4 mb-6">
                {event.startDate && (
                  <div className="flex items-start gap-3">
                    <FaCalendarAlt className="text-teal-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-800">Date</p>
                      <p className="text-gray-600">
                        {formatInTimeZone(event.startDate, event.timezone || 'America/New_York', 'EEEE, MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                )}

                {event.startTime && event.endTime && (
                  <div className="flex items-start gap-3">
                    <FaClock className="text-teal-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-800">Time</p>
                      <p className="text-gray-600">{event.startTime} - {event.endTime}</p>
                    </div>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-teal-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-800">Location</p>
                      <LocationDisplay location={event.location} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ticket Selection */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Tickets</h2>

              {ticketTypes.length === 0 ? (
                <p className="text-gray-600">No tickets available for this event.</p>
              ) : (
                <div className="space-y-4">
                  {ticketTypes.map((ticket) => (
                    <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{ticket.name}</h3>
                          {ticket.description && (
                            <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                          )}
                          <p className="text-xl font-bold text-teal-600 mt-2">
                            ${ticket.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              const currentQty = selectedTickets[ticket.id] || 0;
                              if (currentQty > 0) {
                                setSelectedTickets({ ...selectedTickets, [ticket.id]: currentQty - 1 });
                              }
                            }}
                            className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-teal-500 disabled:opacity-50"
                            disabled={(selectedTickets[ticket.id] || 0) === 0}
                          >
                            -
                          </button>
                          <span className="text-lg font-semibold w-8 text-center">
                            {selectedTickets[ticket.id] || 0}
                          </span>
                          <button
                            onClick={() => {
                              const currentQty = selectedTickets[ticket.id] || 0;
                              setSelectedTickets({ ...selectedTickets, [ticket.id]: currentQty + 1 });
                            }}
                            className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-teal-500"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(false);
                    }}
                    className={`w-full px-4 py-2 border rounded-md ${emailError ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="your@email.com"
                    required
                  />
                  {emailError && <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      placeholder="First Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      placeholder="Last Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Discount Code */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Discount Code</h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value);
                    setDiscountError('');
                    setDiscountSuccessMessage('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter discount code"
                />
                <button
                  onClick={handleDiscountApply}
                  className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                >
                  Apply
                </button>
              </div>

              {discountError && (
                <p className="text-red-500 text-sm mt-2">{discountError}</p>
              )}
              {discountSuccessMessage && (
                <p className="text-green-600 text-sm mt-2">{discountSuccessMessage}</p>
              )}
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

            {/* Order Summary & Payment - Full Width at Bottom */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                {cart.length === 0 ? (
                  <p className="text-gray-600 text-sm">No tickets selected.</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.ticketType.id} className="flex justify-between text-sm">
                      <span>{item.ticketType.name} x {item.quantity}</span>
                      <span>${(item.ticketType.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>

              {appliedDiscount && (
                <div className="border-t border-gray-200 pt-2 mb-2">
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({appliedDiscount.code})</span>
                    <span>-${savedAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Options Section */}
              {canCheckout && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Options</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose your preferred payment method. We accept Apple Pay, Google Pay, and all major credit cards.
                  </p>
                  <UniversalPaymentCheckout
                    cart={cart}
                    eventId={eventId as string}
                    email={email}
                    customerName={firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || undefined}
                    customerPhone={phone || undefined}
                    discountCodeId={appliedDiscount?.id || null}
                    enabled={paymentEnabled}
                    amountCents={amountCents}
                    paymentUseCase={PaymentUseCase.TICKET_SALE}
                    returnUrl={`${window.location.origin}/event/success`}
                    cancelUrl={window.location.origin}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    onLoadingChange={setIsProcessing}
                  />
                </div>
              )}

              {!canCheckout && (
                <div className="mt-6 p-4 bg-gray-50 rounded-md text-center text-gray-600">
                  {!hasTicketsSelected && <p>Please select at least one ticket</p>}
                  {hasTicketsSelected && !emailIsValid && <p>Please enter a valid email address</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

