"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentRequestButtonElement, useStripe } from '@stripe/react-stripe-js';
import type { PaymentRequest as StripePaymentRequest, StripeElementsOptions } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';

type Props = {
  membershipPlanId: number;
  amountCents: number;
  currency: string;
  email?: string;
  customerName?: string;
  customerPhone?: string;
  enabled: boolean;
  showPlaceholder?: boolean;
  publishableKey?: string;
  onInvalidClick?: () => void;
};

// Default Stripe promise (fallback for backward compatibility)
const defaultStripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

function InnerMembershipPRB({
  membershipPlanId,
  amountCents,
  currency,
  email,
  customerName,
  customerPhone,
  enabled,
  showPlaceholder,
  onInvalidClick
}: Props) {
  const stripe = useStripe();
  const router = useRouter();
  const [paymentRequest, setPaymentRequest] = useState<StripePaymentRequest | null>(null);
  const [ready, setReady] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [cachedAmount, setCachedAmount] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  // When validations become invalid, tear down the live PaymentRequest
  useEffect(() => {
    if (!enabled) {
      console.log('[MEMBERSHIP-PRB] Disabling PRB due to invalid form. Tearing down PaymentRequest.');
      setReady(false);
      setEligible(false);
      setPaymentRequest(null);
      setClientSecret(null);
      setCachedAmount(null);
      setProcessing(false);
    }
  }, [enabled]);

  useEffect(() => {
    console.log('[MEMBERSHIP-PRB] INIT useEffect triggered:', { hasStripe: !!stripe, enabled, membershipPlanId, email });
    if (!stripe || !enabled) {
      console.log('[MEMBERSHIP-PRB] INIT blocked:', { hasStripe: !!stripe, enabled });
      return;
    }

    // Create PR only once per enable window
    const prConfig = {
      country: 'US',
      currency: currency.toLowerCase() || 'usd',
      total: { label: 'Membership Subscription', amount: typeof amountCents === 'number' ? amountCents : 0 },
      requestPayerEmail: true,
    };

    console.log('[MEMBERSHIP-PRB] Creating PaymentRequest with config:', prConfig);
    const pr = stripe.paymentRequest(prConfig);

    pr.canMakePayment().then((result) => {
      console.log('[MEMBERSHIP-PRB] canMakePayment() result:', result);
      if (result) {
        setEligible(true);
        setReady(true);
        setPaymentRequest(pr);
      } else {
        setEligible(false);
        setReady(false);
      }
    });

    // Handle payment method event
    pr.on('paymentmethod', async (ev) => {
      console.log('[MEMBERSHIP-PRB] Payment method event triggered');
      setProcessing(true);

      try {
        // Create fresh Payment Intent on each payment attempt
        const piResponse = await fetch('/api/stripe/membership-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            membershipPlanId,
            email: ev.payerEmail || email,
            customerName: customerName || ev.payerName || undefined,
            customerPhone: customerPhone || ev.payerPhone || undefined,
          }),
        });

        if (!piResponse.ok) {
          const errorData = await piResponse.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to create payment intent');
        }

        const data = await piResponse.json();
        const newClientSecret = data.clientSecret;
        const newAmount = data.amount;

        console.log('[MEMBERSHIP-PRB] Payment Intent created:', {
          paymentIntentId: data.paymentIntentId,
          amount: newAmount,
        });

        // CRITICAL: Update Payment Request total to match PI amount
        if (typeof newAmount === 'number' && pr) {
          try {
            pr.update({ total: { label: 'Membership Subscription', amount: newAmount } });
            console.log('[MEMBERSHIP-PRB] Updated Payment Request total to match PI');
          } catch (updateErr) {
            console.warn('[MEMBERSHIP-PRB] Failed to update Payment Request total:', updateErr);
          }
        }

        setClientSecret(newClientSecret);
        setCachedAmount(newAmount);

        // Confirm payment
        const { error, paymentIntent } = await stripe.confirmCardPayment(newClientSecret, {
          payment_method: ev.paymentMethod.id,
          receipt_email: ev.payerEmail || email,
        });

        if (error) {
          console.error('[MEMBERSHIP-PRB] Payment confirmation error:', error);
          ev.complete('fail');
          setProcessing(false);
          alert(error.message || 'Payment failed. Please try again.');
          return;
        }

        console.log('[MEMBERSHIP-PRB] Payment confirmed:', {
          paymentIntentId: paymentIntent?.id,
          status: paymentIntent?.status,
        });

        // Complete payment request
        ev.complete('success');

        // Redirect to success page with Payment Intent ID
        const piId = paymentIntent?.id;
        if (piId) {
          // Store in sessionStorage as fallback
          sessionStorage.setItem('membership_payment_intent', piId);

          // Redirect to membership success page
          router.push(`/membership/success?pi=${encodeURIComponent(piId)}`);
        } else {
          router.push('/membership/success');
        }
      } catch (err) {
        console.error('[MEMBERSHIP-PRB] Error processing payment:', err);
        ev.complete('fail');
        setProcessing(false);
        alert(err instanceof Error ? err.message : 'Payment failed. Please try again.');
      }
    });

    return () => {
      // Cleanup
      setPaymentRequest(null);
      setReady(false);
      setEligible(false);
    };
  }, [stripe, enabled, membershipPlanId, amountCents, currency, email, customerName, customerPhone, router]);

  // Show placeholder if not eligible or not ready
  if (!eligible || !ready || showPlaceholder) {
    return (
      <div
        onClick={onInvalidClick}
        className="w-full border rounded-lg p-3 text-sm text-gray-600 bg-gray-50 opacity-60 cursor-pointer hover:opacity-80 transition-opacity"
      >
        {enabled
          ? 'Mobile wallet payment not available. Please use the Subscribe button below.'
          : 'Please fill in all required fields to enable mobile wallet payment.'}
      </div>
    );
  }

  if (!paymentRequest) {
    return null;
  }

  return (
    <div className="w-full">
      <PaymentRequestButtonElement
        options={{
          paymentRequest,
          style: {
            paymentRequestButton: {
              theme: 'dark',
              height: '48px',
            },
          },
        }}
      />
    </div>
  );
}

export function MembershipPaymentRequestButton(props: Props) {
  // Use backend-provided publishable key or fallback to env var
  const publishableKey = props.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const stripePromise = useMemo(() => {
    if (!publishableKey) {
      console.warn('[MembershipPaymentRequestButton] No publishable key provided');
      return defaultStripePromise;
    }
    return loadStripe(publishableKey);
  }, [publishableKey]);

  const elementsOptions = useMemo<StripeElementsOptions>(() => ({ appearance: { theme: 'stripe' } }), []);

  if (!stripePromise) {
    return (
      <div className="w-full border rounded-lg p-3 text-sm text-gray-600 bg-white opacity-60">
        Stripe wallet buttons are not available. Please provide a publishable key.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      {/* @ts-ignore - stripe types at runtime */}
      <InnerMembershipPRB {...props} />
    </Elements>
  );
}

// Default export for backward compatibility
export default MembershipPaymentRequestButton;






