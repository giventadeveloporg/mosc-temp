/**
 * Payment error handling and logging utilities
 */

export enum PaymentErrorType {
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  REFUND_FAILED = 'REFUND_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface PaymentError {
  type: PaymentErrorType;
  message: string;
  details?: any;
  transactionId?: string;
  providerType?: string;
  timestamp: string;
}

/**
 * Create a standardized payment error
 */
export function createPaymentError(
  type: PaymentErrorType,
  message: string,
  details?: any,
  transactionId?: string,
  providerType?: string
): PaymentError {
  return {
    type,
    message,
    details,
    transactionId,
    providerType,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Log payment error to console and optionally to monitoring service
 */
export function logPaymentError(error: PaymentError, context?: Record<string, any>) {
  const logData = {
    ...error,
    context,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };

  console.error('[PaymentError]', logData);

  // TODO: Send to monitoring service (e.g., Sentry, LogRocket)
  // if (process.env.NODE_ENV === 'production') {
  //   monitoringService.captureException(error, { extra: logData });
  // }
}

/**
 * Convert various error types to PaymentError
 */
export function normalizePaymentError(error: unknown, context?: Record<string, any>): PaymentError {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return createPaymentError(
        PaymentErrorType.NETWORK_ERROR,
        'Network error occurred. Please check your connection and try again.',
        { originalError: error.message },
        context?.transactionId,
        context?.providerType
      );
    }

    // Timeout errors
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      return createPaymentError(
        PaymentErrorType.TIMEOUT_ERROR,
        'Request timed out. Please try again.',
        { originalError: error.message },
        context?.transactionId,
        context?.providerType
      );
    }

    // Generic error
    return createPaymentError(
      PaymentErrorType.UNKNOWN_ERROR,
      error.message || 'An unexpected error occurred',
      { originalError: error.message, stack: error.stack },
      context?.transactionId,
      context?.providerType
    );
  }

  // String errors
  if (typeof error === 'string') {
    return createPaymentError(
      PaymentErrorType.UNKNOWN_ERROR,
      error,
      undefined,
      context?.transactionId,
      context?.providerType
    );
  }

  // Unknown error type
  return createPaymentError(
    PaymentErrorType.UNKNOWN_ERROR,
    'An unexpected error occurred',
    { error },
    context?.transactionId,
    context?.providerType
  );
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: PaymentError): string {
  switch (error.type) {
    case PaymentErrorType.NETWORK_ERROR:
      return 'Unable to connect to payment service. Please check your internet connection and try again.';
    case PaymentErrorType.TIMEOUT_ERROR:
      return 'The request took too long. Please try again.';
    case PaymentErrorType.VALIDATION_ERROR:
      return error.message || 'Please check your payment information and try again.';
    case PaymentErrorType.PAYMENT_FAILED:
      return error.message || 'Payment could not be processed. Please try a different payment method.';
    case PaymentErrorType.INITIALIZATION_FAILED:
      return 'Unable to initialize payment. Please refresh the page and try again.';
    case PaymentErrorType.REFUND_FAILED:
      return 'Refund could not be processed. Please contact support.';
    case PaymentErrorType.PROVIDER_ERROR:
      return error.message || 'Payment provider error. Please try again or use a different payment method.';
    default:
      return error.message || 'An unexpected error occurred. Please try again or contact support.';
  }
}

/**
 * Error boundary component props
 */
export interface PaymentErrorBoundaryState {
  hasError: boolean;
  error: PaymentError | null;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number; // ms
  retryableErrors?: PaymentErrorType[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableErrors: [
    PaymentErrorType.NETWORK_ERROR,
    PaymentErrorType.TIMEOUT_ERROR,
  ],
};

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: unknown;
  let delay = config.retryDelay;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Never retry stack overflow or recursion errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Maximum call stack') ||
          errorMessage.includes('stack size exceeded') ||
          errorMessage.includes('RangeError')) {
        throw error;
      }

      // Check if error is retryable (only retry explicitly listed error types)
      const paymentError = normalizePaymentError(error);
      const isRetryable = config.retryableErrors?.includes(paymentError.type) ?? false; // Default to false (don't retry)

      if (attempt === config.maxRetries || !isRetryable) {
        throw error;
      }

      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }

  throw lastError;
}



