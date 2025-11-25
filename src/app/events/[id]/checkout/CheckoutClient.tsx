'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaTags } from 'react-icons/fa';
import { formatInTimeZone } from 'date-fns-tz';
import LocationDisplay from '@/components/LocationDisplay';
import UniversalPaymentCheckout from '@/components/UniversalPaymentCheckout';
import { Modal } from '@/components/Modal';
import { PaymentUseCase } from '@/types';
import type { CheckoutData } from './CheckoutServerData';

// CRITICAL FIX: Move PaymentSection outside component to prevent recreation
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

interface CheckoutClientProps {
  initialData: CheckoutData;
  eventId: string;
}

export default function CheckoutClient({ initialData, eventId }: CheckoutClientProps) {
  const router = useRouter();

  // Initialize with server data - NO LOADING STATE NEEDED!
  const [event] = useState(initialData.event);
  const [ticketTypes] = useState(initialData.ticketTypes);
  const [availableDiscounts] = useState(initialData.discounts);
  const [heroImageUrl] = useState(initialData.heroImageUrl);

  // Form state
  const [selectedTickets, setSelectedTickets] = useState<{ [key: number]: number }>({});
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [discountError, setDiscountError] = useState('');
  const [discountSuccessMessage, setDiscountSuccessMessage] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [savedAmount, setSavedAmount] = useState(0);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showCancelledMessage, setShowCancelledMessage] = useState(false);
  const [cancelledPaymentInfo, setCancelledPaymentInfo] = useState<any>(null);
  const [expressCheckoutLoading, setExpressCheckoutLoading] = useState(true);

  useEffect(() => { setMounted(true); }, []);

  // Check for cancelled payment parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const cancelled = urlParams.get('payment_cancelled');
      const pi = urlParams.get('pi');
      const status = urlParams.get('status');

      if (cancelled === 'true' && pi) {
        console.log('[CheckoutClient] Payment cancelled detected:', { pi, status });
        setCancelledPaymentInfo({ pi, status });
        setShowCancelledMessage(true);

        // Clear URL parameters
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('payment_cancelled');
        newUrl.searchParams.delete('pi');
        newUrl.searchParams.delete('status');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, []);

  // Reactive calculation for total and discount changes
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

  // Helper function to calculate remaining quantity
  const calculateRemainingQuantity = (ticket: any): number => {
    if (!ticket) return 0;

    if (ticket.remainingQuantity != null && ticket.remainingQuantity !== undefined) {
      return Math.max(0, ticket.remainingQuantity);
    }

    const availableQty = ticket.availableQuantity ?? 0;
    const soldQty = ticket.soldQuantity ?? 0;

    if (availableQty === null || availableQty === undefined || availableQty === 0) {
      return 999999; // Treat as unlimited
    }

    const calculatedRemaining = availableQty - soldQty;
    return Math.max(0, calculatedRemaining);
  };

  const handleTicketChange = (ticketId: number, quantity: number) => {
    const ticketType = ticketTypes.find(t => t.id === ticketId);
    if (!ticketType) return;

    const remaining = calculateRemainingQuantity(ticketType);
    const isSoldOut = remaining <= 0;

    if (isSoldOut) {
      console.log(`[CheckoutClient] Cannot select tickets for ${ticketType.name} - sold out`);
      return;
    }

    const maxOrderQuantity = ticketType.maxQuantityPerOrder ?? 10;
    const maxSelectable = Math.min(remaining, maxOrderQuantity);
    const newQuantity = Math.max(0, Math.min(quantity, maxSelectable));

    if (newQuantity >= 0) {
      setSelectedTickets(prev => {
        const updated = { ...prev, [ticketId]: newQuantity };
        return updated;
      });
      setEmail('');
      if (newQuantity > 0) {
        setEmailError(true);
      } else {
        setEmailError(false);
      }
    }
  };

  const emailIsValid = useMemo(() => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, [email]);

  const hasTicketsSelected = Object.values(selectedTickets).some(q => q > 0);
  const hasUnavailableTickets = Object.entries(selectedTickets).some(([ticketId, quantity]) => {
    if (quantity === 0) return false;
    const ticket = ticketTypes.find(t => t.id === parseInt(ticketId));
    if (!ticket) return false;

    const hasRemainingQuantity = ticket.remainingQuantity != null && ticket.remainingQuantity !== undefined;
    const isSoldOut = hasRemainingQuantity
      ? ticket.remainingQuantity <= 0
      : (() => {
        const availableQty = ticket.availableQuantity ?? 0;
        const soldQty = ticket.soldQuantity ?? 0;
        return availableQty > 0 && soldQty >= availableQty;
      })();

    return isSoldOut;
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
      setAppliedDiscount(null);
      return null;
    }

    const codeToApply = availableDiscounts.find(d => d.code.toLowerCase() === codeToValidate);

    if (codeToApply) {
      if (codeToApply.usesCount >= (codeToApply.maxUses || Infinity)) {
        setDiscountError('This discount code has reached its maximum usage limit.');
        setAppliedDiscount(null);
        return null;
      } else {
        setAppliedDiscount(codeToApply);
        return codeToApply;
      }
    } else {
      setDiscountError('Invalid code. Please clear the field or enter a valid code to proceed.');
      setAppliedDiscount(null);
      return null;
    }
  };

  const handleApplyDiscount = () => {
    if (Object.values(selectedTickets).every(q => q === 0)) {
      setDiscountError('Please select at least one ticket before applying a discount.');
      return;
    }
    if (!discountCode.trim()) {
      setDiscountError('Please enter the discount code.');
      return;
    }
    setDiscountError('');
    validateAndApplyDiscount(discountCode);
  };

  const handlePaymentSuccess = useCallback((transactionId: string) => {
    console.log('[CheckoutClient] Payment successful, transactionId:', transactionId);
    router.push(`/event/success?transactionId=${transactionId}&eventId=${eventId}`);
  }, [router, eventId]);

  const handlePaymentError = useCallback((error: string) => {
    console.error('[CheckoutClient] Payment error:', error);
    alert(`Payment failed: ${error}. Please try again.`);
  }, []);

  const paymentCart = useMemo(() => {
    return Object.entries(selectedTickets)
      .filter(([, quantity]) => quantity > 0)
      .map(([ticketId, quantity]) => {
        const ticketType = ticketTypes.find(t => t.id === parseInt(ticketId));
        return { ticketType, quantity };
      });
  }, [selectedTickets, ticketTypes]);

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

  const handleInvalidClick = useCallback(() => {
    if (!emailIsValid) setEmailError(true);
    if (!hasTicketsSelected) alert('Please select at least one ticket.');
    if (hasUnavailableTickets) alert('Some selected tickets are sold out. Please adjust your selection.');
  }, [emailIsValid, hasTicketsSelected, hasUnavailableTickets]);

  const handleLoadingChange = useCallback((loading: boolean) => {
    setExpressCheckoutLoading(loading);
  }, []);

  const renderOrderSummary = useCallback(() => {
    if (!mounted || !eventId) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading payment options...</p>
        </div>
      );
    }

    return (
      <>
        {/* Discount Code Section */}
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

        {/* Payment Section */}
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
  }, [mounted, eventId, availableDiscounts, discountCode, appliedDiscount, totalAmount, hasTicketsSelected, hasUnavailableTickets, email, emailIsValid, emailError, firstName, lastName, phone, paymentCart, paymentProps, handleInvalidClick, handlePaymentSuccess, handlePaymentError, handleLoadingChange, discountError, discountSuccessMessage, handleApplyDiscount]);

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
              const remainingQuantity = calculateRemainingQuantity(ticket);
              const hasRemainingQuantity = ticket.remainingQuantity != null && ticket.remainingQuantity !== undefined;
              const isSoldOut = hasRemainingQuantity
                ? ticket.remainingQuantity <= 0
                : (() => {
                  const availableQty = ticket.availableQuantity ?? 0;
                  const soldQty = ticket.soldQuantity ?? 0;
                  return availableQty > 0 && soldQty >= availableQty;
                })();
              const maxOrderQuantity = ticket.maxQuantityPerOrder ?? 10;

              return (
                <div key={ticket.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border border-gray-200 rounded-lg bg-white shadow-sm relative">
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

        {/* Order Summary Section */}
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
  if (time.match(/AM|PM/i)) return time;
  const [hourStr, minute] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
}
