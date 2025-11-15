'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type {
  PaymentSessionResponse,
  PaymentInitializeRequest,
  PaymentProviderType,
  PaymentUseCase,
  PaymentItem,
} from '@/types';
import { PaymentProviderType as ProviderType } from '@/types';
import StripeDesktopCheckout from './StripeDesktopCheckout';
import StripePaymentRequestButton from './StripePaymentRequestButton';
import ZelleManualPayment from './payments/ZelleManualPayment';
import {
  normalizePaymentError,
  logPaymentError,
  getUserFriendlyErrorMessage,
  retryWithBackoff,
  PaymentErrorType,
} from '@/lib/payments/errorHandling';
import { initializePayment as initializePaymentApi } from '@/lib/payments/paymentApi';

type CartItem = {
  ticketType: { id: number; name: string; price: number; description?: string };
  quantity: number;
};

type Props = {
  cart: CartItem[];
  eventId: number | string;
  email?: string;
  customerName?: string;
  customerPhone?: string;
  discountCodeId?: number | null;
  enabled: boolean;
  amountCents: number;
  paymentUseCase?: PaymentUseCase;
  returnUrl?: string;
  cancelUrl?: string;
  onInvalidClick?: () => void;
  onLoadingChange?: (loading: boolean) => void;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
};

/**
 * UniversalPaymentCheckout - Provider-agnostic payment component
 *
 * This component:
 * 1. Calls backend /api/proxy/payments/initialize to get payment session
 * 2. Renders provider-specific UI based on providerType returned
 * 3. Handles loading states, errors, and success flows
 */
export default function UniversalPaymentCheckout(props: Props) {
  const {
    cart,
    eventId,
    email,
    customerName,
    customerPhone,
    discountCodeId,
    enabled,
    amountCents,
    paymentUseCase = PaymentUseCase.TICKET_SALE,
    returnUrl,
    cancelUrl,
    onInvalidClick,
    onLoadingChange,
    onSuccess,
    onError,
  } = props;

  const [paymentSession, setPaymentSession] = useState<PaymentSessionResponse | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [providerType, setProviderType] = useState<PaymentProviderType | null>(null);
  const [isOpeningAcp, setIsOpeningAcp] = useState(false);

  // Memoize cart items string for stable dependency checking
  const cartKey = useMemo(() => {
    return cart.map(item => `${item.ticketType.id}:${item.quantity}`).join(',');
  }, [cart]);

  // Track the cart key for the current session to avoid unnecessary re-initialization
  const sessionCartKeyRef = useRef<string | null>(null);

  // Initialize payment session when enabled and cart is ready
  useEffect(() => {
    if (!enabled || cart.length === 0 || !email) {
      // Clear session if form is incomplete
      setPaymentSession(null);
      setProviderType(null);
      sessionCartKeyRef.current = null;
      return;
    }

    // Don't re-initialize if we already have a valid session for the same cart
    if (paymentSession && providerType && sessionCartKeyRef.current === cartKey) {
      console.log('[UniversalPaymentCheckout] Skipping re-initialization, session already exists for cart:', cartKey);
      return;
    }

    let cancelled = false;

    const initializePaymentSession = async () => {
      setIsInitializing(true);
      setInitializationError(null);
      onLoadingChange?.(true);

      try {
        // Build payment items from cart
        const items: PaymentItem[] = cart.map(item => ({
          itemType: 'TICKET',
          itemId: item.ticketType.id,
          description: item.ticketType.name,
          quantity: item.quantity,
          unitPrice: item.ticketType.price,
        }));

        // Build initialization request
        const request: PaymentInitializeRequest = {
          paymentUseCase,
          amount: amountCents / 100, // Convert cents to dollars
          currency: 'USD', // TODO: Get from tenant settings
          items,
          customerEmail: email,
          customerName,
          customerPhone,
          returnUrl: returnUrl || `${window.location.origin}/event/success`,
          cancelUrl: cancelUrl || window.location.origin,
          eventId: typeof eventId === 'string' ? parseInt(eventId) : eventId,
          discountCode: discountCodeId ? String(discountCodeId) : undefined,
        };

        // Retry initialization with exponential backoff for network errors
        // Use the imported initializePaymentApi function (not the local one)
        const session = await retryWithBackoff(
          () => initializePaymentApi(request),
          {
            maxRetries: 2,
            retryDelay: 1000,
            retryableErrors: [PaymentErrorType.NETWORK_ERROR, PaymentErrorType.TIMEOUT_ERROR],
          }
        );

        // Debug logging
        console.log('[UniversalPaymentCheckout] Payment session received:', {
          transactionId: session?.transactionId,
          provider: session?.provider,
          providerType: session?.providerType,
          hasClientSecret: !!session?.clientSecret,
          hasPublishableKey: !!session?.publishableKey,
          hasPublicKey: !!(session as any)?.publicKey, // Backend might use 'publicKey' instead
          hasSessionUrl: !!session?.sessionUrl,
          status: session?.status,
          fullSession: session,
        });

        // Normalize response: handle backend field differences
        // 1. Map 'provider' (enum/string) to 'providerType' (enum)
        const providerValue = session.provider || session.providerType;
        let normalizedProviderType: PaymentProviderType | null = null;

        if (providerValue) {
          // Handle both string and enum values
          let providerStr: string;
          if (typeof providerValue === 'string') {
            providerStr = providerValue.toUpperCase().trim();
          } else if (typeof providerValue === 'object' && providerValue !== null) {
            // Handle enum object (e.g., { name: 'STRIPE' } or enum.toString())
            providerStr = String(providerValue).toUpperCase().trim();
            // Try to extract name property if it exists
            if ('name' in providerValue && typeof (providerValue as any).name === 'string') {
              providerStr = (providerValue as any).name.toUpperCase().trim();
            }
          } else {
            providerStr = String(providerValue).toUpperCase().trim();
          }

          // Map to PaymentProviderType enum (exact match first, then contains)
          if (providerStr === 'STRIPE') {
            normalizedProviderType = ProviderType.STRIPE;
          } else if (providerStr === 'PAYPAL') {
            normalizedProviderType = ProviderType.PAYPAL;
          } else if (providerStr === 'REVOLUT') {
            normalizedProviderType = ProviderType.REVOLUT;
          } else if (providerStr === 'ZEFFY') {
            normalizedProviderType = ProviderType.ZEFFY;
          } else if (providerStr === 'ZELLE') {
            normalizedProviderType = ProviderType.ZELLE;
          } else if (providerStr === 'CEFI') {
            normalizedProviderType = ProviderType.CEFI;
          } else {
            // Fallback: try contains match
            if (providerStr.includes('STRIPE')) {
              normalizedProviderType = ProviderType.STRIPE;
            } else if (providerStr.includes('PAYPAL')) {
              normalizedProviderType = ProviderType.PAYPAL;
            } else if (providerStr.includes('REVOLUT')) {
              normalizedProviderType = ProviderType.REVOLUT;
            } else if (providerStr.includes('ZEFFY')) {
              normalizedProviderType = ProviderType.ZEFFY;
            } else if (providerStr.includes('ZELLE')) {
              normalizedProviderType = ProviderType.ZELLE;
            } else if (providerStr.includes('CEFI')) {
              normalizedProviderType = ProviderType.CEFI;
            } else {
              console.warn('[UniversalPaymentCheckout] Unknown provider value:', providerValue, providerStr);
            }
          }
        }

        // 2. Normalize publishableKey (handle publicKey vs publishableKey)
        const normalizedPublishableKey = session.publishableKey || (session as any).publicKey || undefined;

        // 3. Build normalized session
        const normalizedSession: PaymentSessionResponse = {
          ...session,
          providerType: normalizedProviderType || session.providerType,
          publishableKey: normalizedPublishableKey,
        };

        if (!cancelled) {
          setPaymentSession(normalizedSession);
          setProviderType(normalizedProviderType || normalizedSession.providerType || null);
          sessionCartKeyRef.current = cartKey; // Track which cart this session is for
          onLoadingChange?.(false);
        }
      } catch (error) {
        if (cancelled) return;

        const paymentError = normalizePaymentError(error, {
          eventId: typeof eventId === 'string' ? parseInt(eventId) : eventId,
        });

        // Log error for monitoring
        logPaymentError(paymentError, {
          cart: JSON.stringify(cart),
          email,
          amountCents,
          paymentUseCase,
        });

        // Get user-friendly error message
        const errorMessage = getUserFriendlyErrorMessage(paymentError);
        setInitializationError(errorMessage);
        onError?.(errorMessage);
        onLoadingChange?.(false);
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    };

    initializePaymentSession();

    // Cleanup function to prevent state updates if component unmounts or dependencies change
    return () => {
      cancelled = true;
    };
  }, [enabled, cartKey, email, amountCents, paymentUseCase, eventId, discountCodeId, customerName, customerPhone, returnUrl, cancelUrl]);

  // Render loading state
  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Initializing payment...</p>
      </div>
    );
  }

  // Render error state
  if (initializationError) {
    return (
      <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
        <p className="text-destructive font-semibold mb-2">Payment Initialization Failed</p>
        <p className="text-sm text-muted-foreground">{initializationError}</p>
        <button
          onClick={() => {
            setInitializationError(null);
            setIsInitializing(true);
          }}
          className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  // Render provider-specific UI
  if (!paymentSession || !providerType) {
    // Debug logging
    console.log('[UniversalPaymentCheckout] No payment session or provider type:', {
      hasPaymentSession: !!paymentSession,
      hasProviderType: !!providerType,
      paymentSession,
      providerType,
      enabled,
      cartLength: cart.length,
      hasEmail: !!email,
    });

    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>Please complete the form above to proceed with payment.</p>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-xs mt-2 text-gray-500">
            Debug: enabled={String(enabled)}, cart={cart.length}, email={email ? 'yes' : 'no'}
          </p>
        )}
      </div>
    );
  }

  // Render Stripe Elements (default)
  // Use publishableKey from session or fallback to env var (for backward compatibility)
  const stripePublishableKey = paymentSession.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (providerType === ProviderType.STRIPE && paymentSession.clientSecret && stripePublishableKey) {
    console.log('[UniversalPaymentCheckout] Rendering Stripe Elements UI');
    return (
      <div className="space-y-4">
        {/* Apple Pay / Google Pay Button */}
        <StripePaymentRequestButton
          cart={cart}
          eventId={eventId}
          email={email}
          discountCodeId={discountCodeId}
          enabled={enabled}
          amountCents={amountCents}
          publishableKey={stripePublishableKey}
          onInvalidClick={onInvalidClick}
        />

        {/* Stripe Elements Card Form */}
        <StripeDesktopCheckout
          cart={cart}
          eventId={eventId}
          email={email}
          discountCodeId={discountCodeId}
          enabled={enabled && !isInitializing}
          amountCents={amountCents}
          publishableKey={stripePublishableKey}
          clientSecret={paymentSession.clientSecret}
          transactionId={paymentSession.transactionId}
          onInvalidClick={onInvalidClick}
          onLoadingChange={onLoadingChange}
        />
      </div>
    );
  }

  // Debug: Log why Stripe Elements aren't rendering
  if (providerType === ProviderType.STRIPE) {
    console.warn('[UniversalPaymentCheckout] Stripe provider but missing required fields:', {
      hasClientSecret: !!paymentSession.clientSecret,
      hasPublishableKey: !!paymentSession.publishableKey,
      hasEnvPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasSessionUrl: !!paymentSession.sessionUrl,
      paymentSession,
    });

    // Show helpful error message if we have clientSecret but missing publishableKey
    if (paymentSession.clientSecret && !stripePublishableKey) {
      return (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <p className="text-destructive font-semibold mb-2">Payment Configuration Error</p>
          <p className="text-sm text-muted-foreground">
            Payment session initialized but Stripe publishable key is missing. Please contact support.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs mt-2 text-gray-500">
              Debug: transactionId={paymentSession.transactionId}, providerType={providerType}
            </p>
          )}
        </div>
      );
    }
  }

  // Handle Stripe Instant Checkout (ACP)
  const handleInstantCheckout = useCallback(() => {
    if (!paymentSession?.sessionUrl) return;

    setIsOpeningAcp(true);
    onLoadingChange?.(true);

    // Open in new window/tab for better UX
    const checkoutWindow = window.open(
      paymentSession.sessionUrl,
      'stripe-checkout',
      'width=500,height=600,scrollbars=yes'
    );

    // Poll for window closure or success
    const pollInterval = setInterval(() => {
      if (checkoutWindow?.closed) {
        clearInterval(pollInterval);
        setIsOpeningAcp(false);
        onLoadingChange?.(false);

        // Check payment status
        if (paymentSession.transactionId) {
          // TODO: Poll payment status and call onSuccess if succeeded
          // This will be implemented when backend status endpoint is ready
        }
      }
    }, 500);

    // Cleanup after 30 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setIsOpeningAcp(false);
      onLoadingChange?.(false);
    }, 30 * 60 * 1000);
  }, [paymentSession, onLoadingChange]);

  // Render Stripe Instant Checkout (ACP) button
  if (providerType === ProviderType.STRIPE && paymentSession.sessionUrl) {
    return (
      <div className="space-y-4">
        <button
          onClick={handleInstantCheckout}
          disabled={isOpeningAcp}
          className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isOpeningAcp ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Opening checkout...</span>
            </>
          ) : (
            <>
              <span>⚡</span>
              <span>Instant Checkout (Beta)</span>
            </>
          )}
        </button>
        <p className="text-xs text-muted-foreground text-center">
          Powered by Stripe Instant Checkout • One-tap wallet payments
        </p>
        {paymentSession.metadata?.acpEnabled && (
          <p className="text-xs text-primary text-center font-medium">
            ✨ AI agent-compatible checkout
          </p>
        )}
      </div>
    );
  }

  // Render PayPal button (will be implemented in Task 5)
  if (providerType === ProviderType.PAYPAL) {
    return (
      <div className="space-y-4">
        <div id="paypal-button-container" className="w-full"></div>
        <p className="text-xs text-muted-foreground text-center">
          PayPal checkout will be available here
        </p>
      </div>
    );
  }

  // Render Revolut redirect button (will be implemented in Task 6)
  if (providerType === ProviderType.REVOLUT && paymentSession.sessionUrl) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => {
            if (paymentSession.sessionUrl) {
              window.location.href = paymentSession.sessionUrl;
            }
          }}
          className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 font-semibold"
        >
          Pay with Revolut
        </button>
        <p className="text-xs text-muted-foreground text-center">
          You will be redirected to Revolut to complete your payment
        </p>
      </div>
    );
  }

  // Render Zeffy embed (will be implemented in Task 7)
  if (providerType === ProviderType.ZEFFY) {
    return (
      <div className="space-y-4">
        <div id="zeffy-embed-container" className="w-full"></div>
        <p className="text-xs text-muted-foreground text-center">
          Zeffy donation widget will be available here
        </p>
      </div>
    );
  }

  // Render Zelle manual instructions
  if (providerType === ProviderType.ZELLE && paymentSession) {
    const handleZelleConfirm = async () => {
      // Call backend to create pending transaction
      try {
        const response = await fetch('/api/proxy/payments/zelle/manual', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionId: paymentSession.transactionId,
            amount: amountCents / 100,
            currency: 'USD', // TODO: Get from tenant settings
            customerEmail: email,
            customerName,
            customerPhone,
            eventId: typeof eventId === 'string' ? parseInt(eventId) : eventId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create Zelle payment transaction');
        }

        onSuccess?.(paymentSession.transactionId);
      } catch (error) {
        const paymentError = normalizePaymentError(error);
        logPaymentError(paymentError);
        throw error;
      }
    };

    return (
      <ZelleManualPayment
        paymentSession={paymentSession}
        amount={amountCents / 100}
        currency="USD" // TODO: Get from tenant settings
        onConfirm={handleZelleConfirm}
        onCancel={onInvalidClick}
      />
    );
  }

  // Fallback for unknown provider
  return (
    <div className="bg-warning/10 border border-warning rounded-lg p-4">
      <p className="text-warning font-semibold">Unsupported Payment Provider</p>
      <p className="text-sm text-muted-foreground mt-2">
        Provider type: {providerType}
      </p>
    </div>
  );
}

