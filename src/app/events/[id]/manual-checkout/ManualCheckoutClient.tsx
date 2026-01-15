'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { FaCheckCircle, FaClock } from 'react-icons/fa';
import type { CheckoutData } from '../checkout/CheckoutServerData';
import type { EventDetailsDTO, ManualPaymentRequestDTO, ManualPaymentMethodType } from '@/types';
import { createManualPaymentRequestServer, fetchManualPaymentMethodsServer } from '@/app/admin/manual-payments/ApiServerActions';

interface ManualCheckoutClientProps {
  initialData: CheckoutData;
  eventId: string;
  event: EventDetailsDTO;
}

const MANUAL_PAYMENT_METHODS: Array<{
  value: ManualPaymentMethodType;
  label: string;
  description: string;
  logo: string; // SVG path or emoji
  color: string; // Color for the payment method
}> = [
  {
    value: 'ZELLE_MANUAL',
    label: 'Zelle',
    description: 'Send money directly to the organizer via Zelle',
    logo: '💸',
    color: 'blue'
  },
  {
    value: 'VENMO_MANUAL',
    label: 'Venmo',
    description: 'Send money directly to the organizer via Venmo',
    logo: '💳',
    color: 'indigo'
  },
  {
    value: 'CASH_APP_MANUAL',
    label: 'Cash App',
    description: 'Send money directly to the organizer via Cash App',
    logo: '💵',
    color: 'green'
  },
  {
    value: 'CASH',
    label: 'Cash',
    description: 'Pay with cash at the event',
    logo: '💵',
    color: 'yellow'
  },
  {
    value: 'CHECK',
    label: 'Check',
    description: 'Pay with a check',
    logo: '📝',
    color: 'purple'
  },
  {
    value: 'OTHER_MANUAL',
    label: 'Other',
    description: 'Other manual payment method',
    logo: '💼',
    color: 'gray'
  },
];

export default function ManualCheckoutClient({ initialData, eventId, event }: ManualCheckoutClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize with server data
  const [eventData] = useState(initialData.event);
  const [ticketTypes] = useState(initialData.ticketTypes);
  const [availableDiscounts] = useState(initialData.discounts);
  const [heroImageUrl] = useState(initialData.heroImageUrl);

  // Parse cart from URL params
  const cartFromParams = useMemo(() => {
    const cartParam = searchParams.get('cart');
    if (!cartParam) return [];
    try {
      return JSON.parse(cartParam);
    } catch {
      return [];
    }
  }, [searchParams]);

  // Form state
  const [selectedTickets, setSelectedTickets] = useState<{ [key: number]: number }>(() => {
    const tickets: { [key: number]: number } = {};
    cartFromParams.forEach((item: { ticketTypeId: number; quantity: number }) => {
      tickets[item.ticketTypeId] = item.quantity;
    });
    return tickets;
  });
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<ManualPaymentMethodType | ''>('');
  const [proofOfPaymentFile, setProofOfPaymentFile] = useState<File | null>(null);
  const [proofOfPaymentUrl, setProofOfPaymentUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedPayment, setSubmittedPayment] = useState<ManualPaymentRequestDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableMethods, setAvailableMethods] = useState<Array<{ providerName: string; enabled: boolean }>>([]);
  const [paymentMethodError, setPaymentMethodError] = useState(false);

  // Fetch available manual payment methods
  useEffect(() => {
    async function fetchMethods() {
      try {
        const methods = await fetchManualPaymentMethodsServer();
        setAvailableMethods(methods);
      } catch (err) {
        console.error('Error fetching manual payment methods:', err);
      }
    }
    fetchMethods();
  }, []);

  // Helper function to calculate remaining quantity (same as checkout page)
  const calculateRemainingQuantity = (ticket: any): number => {
    if (!ticket) return 0;

    // Priority 1: Use remainingQuantity from backend if available
    if (ticket.remainingQuantity != null && ticket.remainingQuantity !== undefined) {
      const remaining = Math.max(0, ticket.remainingQuantity);
      return remaining;
    }

    // Priority 2: Calculate from availableQuantity - soldQuantity
    const availableQty = ticket.availableQuantity ?? 0;
    const soldQty = ticket.soldQuantity ?? 0;

    // If availableQuantity is null/undefined/0, treat as unlimited (Infinity)
    if (availableQty === null || availableQty === undefined || availableQty === 0) {
      return Infinity; // Treat as unlimited
    }

    const calculatedRemaining = availableQty - soldQty;
    return Math.max(0, calculatedRemaining);
  };

  // Handle ticket quantity changes (same as checkout page)
  const handleTicketChange = (ticketId: number, quantity: number) => {
    const ticketType = ticketTypes.find(t => t.id === ticketId);
    if (!ticketType) return;

    const remaining = calculateRemainingQuantity(ticketType);
    // Mark as sold out if remaining quantity is less than or equal to 20 to avoid race conditions
    const isSoldOut = remaining <= 20;

    // CRITICAL: Allow decrementing even if sold out (user may want to deselect tickets they already selected)
    // Only prevent INCREASING quantity when sold out, allow DECREASING (including to 0)
    const currentQty = selectedTickets[ticketId] || 0;
    if (isSoldOut && quantity > currentQty) {
      // Only block if trying to increase quantity when sold out
      return;
    }

    // Use actual DTO values - if maxQuantityPerOrder is null/undefined, treat as unlimited (Infinity)
    const maxOrderQuantity = ticketType.maxQuantityPerOrder ?? Infinity;
    const minOrderQuantity = ticketType.minQuantityPerOrder ?? 1; // Default to 1 per database schema

    // Calculate max selectable: minimum of remaining quantity and max per order (if set)
    const maxSelectable = maxOrderQuantity === Infinity
      ? remaining
      : Math.min(remaining, maxOrderQuantity);

    // Validate quantity against constraints
    let newQuantity = quantity;
    const isDecreasing = quantity < currentQty;

    // CRITICAL: Always allow setting to 0 (user can deselect tickets)
    // Also allow decreasing below minimum (user may want to deselect)
    // Only enforce minimum when INCREASING or when setting a new quantity
    if (quantity === 0) {
      newQuantity = 0;
    } else if (isDecreasing) {
      // User is decreasing - allow it even if below minimum (they're deselecting)
      // But still enforce maximum and remaining quantity limits
      if (quantity > maxSelectable) {
        newQuantity = maxSelectable;
      }
      if (quantity > remaining) {
        newQuantity = remaining;
      }
    } else {
      // User is increasing or setting a new quantity - enforce all constraints
      // If quantity is below minimum, clamp to minimum
      if (quantity > 0 && quantity < minOrderQuantity) {
        newQuantity = minOrderQuantity;
      }
      // If quantity exceeds maximum, clamp to maximum
      if (quantity > maxSelectable) {
        newQuantity = maxSelectable;
      }
      // Ensure quantity doesn't exceed remaining
      if (quantity > remaining) {
        newQuantity = remaining;
      }
    }

    // Always allow setting quantity (including 0)
    if (newQuantity >= 0) {
      setSelectedTickets(prev => {
        const updated = { ...prev, [ticketId]: newQuantity };
        // Remove ticket from state if quantity is 0 (cleanup)
        if (newQuantity === 0) {
          const { [ticketId]: _, ...rest } = updated;
          return rest;
        }
        return updated;
      });
    }
  };

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = ticketTypes.find(t => t.id === parseInt(ticketId));
      return total + (ticket?.price || 0) * quantity;
    }, 0);
  }, [selectedTickets, ticketTypes]);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofOfPaymentFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setProofOfPaymentUrl(url);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      setPaymentMethodError(true);
      return;
    }
    setPaymentMethodError(false);

    if (Object.keys(selectedTickets).length === 0) {
      setError('Please select at least one ticket');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Upload proof of payment file to S3 if provided
      // For now, we'll create the payment request without the file URL
      // The file upload will be handled separately via the admin API

      // Create manual payment request
      const paymentRequest = await createManualPaymentRequestServer({
        eventId: parseInt(eventId),
        ticketTransactionId: null, // Will be created after payment is received
        manualPaymentMethodType: selectedPaymentMethod,
        amount: totalAmount,
        status: 'REQUESTED',
        requesterEmail: email,
        requesterName: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || undefined,
        requesterPhone: phone || undefined,
        proofOfPaymentUrl: proofOfPaymentUrl || undefined,
        notes: '',
      });

      setSubmittedPayment(paymentRequest);
    } catch (err: any) {
      console.error('Error creating manual payment request:', err);
      setError(err.message || 'Failed to create payment request. Please try again.');
      setIsSubmitting(false);
    }
  };

  // If payment is submitted, show success/status page
  if (submittedPayment) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              {submittedPayment.status === 'REQUESTED' && (
                <>
                  <FaClock className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Request Submitted</h1>
                  <p className="text-gray-600">
                    Your payment request has been submitted. Please complete the payment using the method you selected.
                  </p>
                </>
              )}
              {submittedPayment.status === 'RECEIVED' && (
                <>
                  <FaCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Received</h1>
                  <p className="text-gray-600">Your payment has been confirmed. Your tickets are ready!</p>
                </>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">
                    {MANUAL_PAYMENT_METHODS.find(m => m.value === submittedPayment.manualPaymentMethodType)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    submittedPayment.status === 'RECEIVED' ? 'text-green-600' :
                    submittedPayment.status === 'VOIDED' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {submittedPayment.status}
                  </span>
                </div>
              </div>
            </div>

            {submittedPayment.status === 'RECEIVED' && submittedPayment.qrCodeUrl && (
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-4">Your Ticket QR Code</h3>
                <Image
                  src={submittedPayment.qrCodeUrl}
                  alt="Ticket QR Code"
                  width={200}
                  height={200}
                  className="mx-auto"
                />
              </div>
            )}

            <div className="text-center">
              <button
                onClick={() => router.push(`/events/${eventId}`)}
                className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                Return to Event
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main checkout form
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      {heroImageUrl && (
        <div className="relative w-full h-64 md:h-96">
          <Image
            src={heroImageUrl}
            alt={eventData.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <h1 className="text-white text-4xl md:text-5xl font-bold text-center px-4">
              {eventData.title}
            </h1>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Manual Payment Checkout</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ticket Selection Section - Same as checkout page */}
            <div className="bg-slate-50 rounded-xl shadow-lg p-6 md:p-8 mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Select Your Tickets</h2>
              <div className="space-y-6">
                {ticketTypes.filter(ticket => ticket.isActive !== false).length === 0 && (
                  <div className="text-center text-gray-500 py-8">No active ticket types available for this event.</div>
                )}
                {ticketTypes
                  .filter(ticket => ticket.isActive !== false) // Only show active tickets
                  .map(ticket => {
                  const remainingQuantity = calculateRemainingQuantity(ticket);
                  // Mark as sold out if remainingQuantity is less than or equal to 20 to avoid race conditions and overselling
                  // CRITICAL: Only mark as sold out if remainingQuantity is a finite number (not Infinity)
                  // Also check that it's a valid number (not null/undefined/NaN)
                  const isSoldOut = typeof remainingQuantity === 'number' &&
                                    !isNaN(remainingQuantity) &&
                                    remainingQuantity !== Infinity &&
                                    remainingQuantity <= 20;
                  // Use actual DTO values - if maxQuantityPerOrder is null/undefined, treat as unlimited (Infinity)
                  const maxOrderQuantity = ticket.maxQuantityPerOrder ?? Infinity;
                  const minOrderQuantity = ticket.minQuantityPerOrder ?? 1; // Default to 1 per database schema

                  return (
                    <div key={ticket.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border rounded-lg shadow-sm relative ${
                      isSoldOut
                        ? 'border-red-300 bg-red-50/20'
                        : 'border-gray-200 bg-white'
                    }`}>
                      {isSoldOut && (
                        <div className="absolute top-4 right-4 z-20">
                          <Image
                            src="/images/tickets_sold_out.jpg"
                            alt="Tickets Sold Out"
                            width={60}
                            height={60}
                            className="rounded shadow-sm"
                          />
                        </div>
                      )}

                      <div className="mb-4 sm:mb-0 flex-1 min-w-0 pr-4">
                        <h3 className="text-xl font-semibold text-gray-900">{ticket.name}</h3>
                        <p className="text-lg font-bold text-blue-600 mt-1">${ticket.price.toFixed(2)}</p>
                        {ticket.description && (
                          <p className="text-sm text-gray-600 mt-2 mb-2">{ticket.description}</p>
                        )}

                        {/* Show min/max quantity per order limits - desktop only */}
                        {minOrderQuantity > 1 && (
                          <p className="hidden sm:block text-xs text-gray-500 mt-1">
                            Min {minOrderQuantity} per order
                          </p>
                        )}
                        {maxOrderQuantity !== Infinity && maxOrderQuantity < Number.MAX_SAFE_INTEGER && (
                          <p className="hidden sm:block text-xs text-gray-500 mt-1">
                            Max {maxOrderQuantity} per order
                          </p>
                        )}

                        {!isSoldOut && remainingQuantity <= 30 && remainingQuantity > 20 && (
                          <div className="mt-3">
                            <p className="text-sm text-orange-600 font-medium">
                              ⚠️ Low stock - only {remainingQuantity} left!
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Controls and messages container - responsive layout */}
                      <div className="w-full sm:w-auto flex flex-col gap-3 mt-4 sm:mt-0">
                        {/* Min/Max limit messages - shown above controls on mobile only */}
                        {minOrderQuantity > 1 && (
                          <p className="sm:hidden text-xs text-gray-500 text-center sm:text-left mb-1">
                            Min {minOrderQuantity} per order
                          </p>
                        )}
                        {maxOrderQuantity !== Infinity && maxOrderQuantity < Number.MAX_SAFE_INTEGER && (
                          <p className="sm:hidden text-xs text-gray-500 text-center sm:text-left mb-1">
                            Max {maxOrderQuantity} per order
                          </p>
                        )}

                        {/* Ticket selection controls */}
                        <div className={`flex items-center justify-center sm:justify-start gap-3 ${isSoldOut ? 'opacity-50 pointer-events-none' : ''}`}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const currentQty = selectedTickets[ticket.id] || 0;
                              handleTicketChange(ticket.id, currentQty - 1);
                            }}
                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-l-md hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                            disabled={isSoldOut || (() => {
                              const currentQty = selectedTickets[ticket.id] || 0;
                              // Disable if already at 0, OR if sold out and no tickets selected
                              // Allow deselecting if user already has tickets selected (even if sold out)
                              return currentQty <= 0 || (isSoldOut && currentQty === 0);
                            })()}
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
                            disabled={isSoldOut || (() => {
                              const currentQty = selectedTickets[ticket.id] || 0;
                              const maxAllowed = maxOrderQuantity === Infinity
                                ? remainingQuantity
                                : Math.min(remainingQuantity, maxOrderQuantity);
                              return currentQty >= maxAllowed;
                            })()}
                          >
                            +
                          </button>
                        </div>

                        {/* Validation messages - shown below controls with proper spacing */}
                        {(() => {
                          const currentQty = selectedTickets[ticket.id] || 0;
                          const hasValidationIssues =
                            currentQty > 0 && (
                              currentQty < minOrderQuantity ||
                              currentQty > remainingQuantity ||
                              (maxOrderQuantity !== Infinity && currentQty > maxOrderQuantity)
                            );

                          if (!hasValidationIssues && currentQty === 0) return null;

                          return (
                            <div className="w-full space-y-1.5 mt-2">
                              {/* Error: Below minimum quantity - CRITICAL */}
                              {currentQty > 0 && currentQty < minOrderQuantity && (
                                <div className="p-2 bg-red-50 border border-red-300 rounded text-xs text-red-800 break-words leading-tight">
                                  <span className="font-semibold">Min {minOrderQuantity} required.</span> Select {minOrderQuantity} or set to 0 to cancel.
                                </div>
                              )}
                              {/* Error: Selected more than available */}
                              {currentQty > remainingQuantity && (
                                <div className="p-2 bg-red-50 border border-red-300 rounded text-xs text-red-800 break-words leading-tight">
                                  <span className="font-semibold">Only {remainingQuantity} available.</span> Please reduce selection.
                                </div>
                              )}
                              {/* Error: Exceeds maximum per order limit */}
                              {maxOrderQuantity !== Infinity &&
                               currentQty > maxOrderQuantity &&
                               currentQty <= remainingQuantity && (
                                <div className="p-2 bg-red-50 border border-red-300 rounded text-xs text-red-800 break-words leading-tight">
                                  <span className="font-semibold">Max {maxOrderQuantity} per order.</span> Please reduce selection.
                                </div>
                              )}
                              {/* Info: Reached max per order limit (but not exceeded) */}
                              {maxOrderQuantity !== Infinity &&
                               currentQty === maxOrderQuantity &&
                               remainingQuantity > maxOrderQuantity &&
                               currentQty >= minOrderQuantity &&
                               currentQty <= remainingQuantity && (
                                <div className="p-1.5 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 break-words leading-tight">
                                  ℹ️ Max {maxOrderQuantity} per order
                                </div>
                              )}
                              {/* Info: At minimum quantity */}
                              {currentQty === minOrderQuantity &&
                               minOrderQuantity > 1 &&
                               currentQty <= remainingQuantity &&
                               (maxOrderQuantity === Infinity || currentQty <= maxOrderQuantity) && (
                                <div className="p-1.5 bg-green-50 border border-green-200 rounded text-xs text-green-800 break-words leading-tight">
                                  ✓ Min requirement met ({minOrderQuantity} {minOrderQuantity === 1 ? 'ticket' : 'tickets'})
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary Section */}
            <div className="bg-slate-50 rounded-xl shadow-lg p-6 md:p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Order Summary</h2>
              {/* Selected Tickets Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Selected Tickets</h3>
                <div className="space-y-2">
                  {Object.entries(selectedTickets).map(([ticketId, quantity]) => {
                    const ticket = ticketTypes.find(t => t.id === parseInt(ticketId));
                    if (!ticket || quantity === 0) return null;
                    return (
                      <div key={ticketId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span>{ticket.name} × {quantity}</span>
                        <span className="font-medium">${(ticket.price * quantity).toFixed(2)}</span>
                      </div>
                    );
                  })}
                  {Object.entries(selectedTickets).filter(([, qty]) => qty > 0).length === 0 && (
                    <p className="text-gray-500 text-sm py-4">No tickets selected. Please select tickets above.</p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className={`rounded-xl p-6 transition-all duration-300 ${
              paymentMethodError
                ? 'bg-red-50 border-2 border-red-500 shadow-md'
                : 'bg-white border-2 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                paymentMethodError ? 'text-red-700' : 'text-gray-800'
              }`}>
                Select Payment Method <span className="text-red-500">*</span>
                {paymentMethodError && (
                  <span className="text-sm font-normal text-red-600">(Required)</span>
                )}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MANUAL_PAYMENT_METHODS.map((method) => {
                  const isEnabled = availableMethods.length === 0 ||
                    availableMethods.some(m => m.providerName === method.value && m.enabled);
                  if (!isEnabled) return null;

                  const isSelected = selectedPaymentMethod === method.value;
                  const colorClasses = {
                    blue: isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300',
                    indigo: isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300',
                    green: isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300',
                    yellow: isSelected ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300',
                    purple: isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300',
                    gray: isSelected ? 'border-gray-500 bg-gray-50' : 'border-gray-200 hover:border-gray-300',
                  };

                  return (
                    <label
                      key={method.value}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        colorClasses[method.color as keyof typeof colorClasses]
                      } ${paymentMethodError && !isSelected ? 'ring-2 ring-red-300' : ''}`}
                      onClick={() => {
                        setSelectedPaymentMethod(method.value);
                        setPaymentMethodError(false);
                        setError(null);
                      }}
                    >
                      {/* Radio Button - Visible */}
                      <div className="flex-shrink-0 mr-4">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={isSelected}
                          onChange={(e) => {
                            setSelectedPaymentMethod(e.target.value as ManualPaymentMethodType);
                            setPaymentMethodError(false);
                            setError(null);
                          }}
                          className="w-5 h-5 text-teal-600 border-gray-300 focus:ring-2 focus:ring-teal-500 cursor-pointer"
                        />
                      </div>
                      {/* Logo/Icon */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white border-2 border-gray-300 flex items-center justify-center text-2xl mr-4">
                        {method.logo}
                      </div>
                      {/* Label and Description */}
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-base ${
                          isSelected ? 'text-gray-900' : 'text-gray-800'
                        }`}>
                          {method.label}
                        </div>
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {method.description}
                        </div>
                      </div>
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="flex-shrink-0 ml-2">
                          <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
              {paymentMethodError && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">
                    ⚠️ Please select a payment method to continue
                  </p>
                </div>
              )}
            </div>

            {/* Proof of Payment Upload */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Proof of Payment (Optional)</h3>
              <p className="text-sm text-gray-600 mb-2">
                Upload a screenshot or photo of your payment confirmation if available.
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              {proofOfPaymentUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  {proofOfPaymentFile?.type.startsWith('image/') ? (
                    <Image
                      src={proofOfPaymentUrl}
                      alt="Proof of payment preview"
                      width={200}
                      height={200}
                      className="rounded-lg"
                    />
                  ) : (
                    <p className="text-sm text-gray-600">File: {proofOfPaymentFile?.name}</p>
                  )}
                </div>
              )}
            </div>

            {/* Acknowledgment */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  required
                  className="mt-1 mr-3"
                />
                <span className="text-sm text-gray-700">
                  I understand that tickets will be issued after the organizer confirms receipt of my payment.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Payment Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
