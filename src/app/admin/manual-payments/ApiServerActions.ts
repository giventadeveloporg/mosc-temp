"use server";

import { unstable_noStore } from 'next/cache';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import type { ManualPaymentRequestDTO, ManualPaymentSummaryReportDTO } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured');
}

export interface ManualPaymentListOptions {
  eventId?: string;
  status?: string;
  manualPaymentMethodType?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}

export interface ManualPaymentListResponse {
  payments: ManualPaymentRequestDTO[];
  totalCount: number;
}

/**
 * Fetch manual payment requests with pagination and filtering
 */
export async function fetchManualPaymentsServer(
  options: ManualPaymentListOptions = {}
): Promise<ManualPaymentListResponse> {
  unstable_noStore(); // Ensure fresh data on every call
  const params = new URLSearchParams();

  if (options.eventId) {
    params.append('eventId.equals', options.eventId);
  }

  if (options.status) {
    params.append('status.equals', options.status);
  }

  if (options.manualPaymentMethodType) {
    params.append('manualPaymentMethodType.equals', options.manualPaymentMethodType);
  }

  const page = options.page ?? 0;
  const pageSize = options.pageSize ?? 20;
  params.append('page', page.toString());
  params.append('size', pageSize.toString());

  if (options.sort) {
    params.append('sort', options.sort);
  } else {
    params.append('sort', 'createdAt,desc');
  }

  const url = `${API_BASE_URL}/api/manual-payments?${params.toString()}`;
  const response = await fetchWithJwtRetry(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to fetch manual payments: ${response.status} ${response.statusText}`);
  }

  let payments: any;
  try {
    payments = await response.json();
  } catch (jsonError) {
    console.error('[ApiServerActions] Error parsing JSON response:', jsonError);
    const text = await response.text();
    console.error('[ApiServerActions] Response text:', text.substring(0, 500));
    throw new Error(`Failed to parse response: ${jsonError}`);
  }

  const totalCountHeader = response.headers.get('x-total-count');
  const totalCount = parseInt(totalCountHeader || '0', 10);

  console.log('[ApiServerActions] fetchManualPaymentsServer response:', {
    isArray: Array.isArray(payments),
    paymentsLength: Array.isArray(payments) ? payments.length : 'not array',
    totalCountHeader,
    totalCount,
    firstPayment: Array.isArray(payments) && payments.length > 0 ? { id: payments[0].id, eventId: payments[0].eventId } : 'none',
    responseType: typeof payments,
    responseKeys: Array.isArray(payments) ? 'array' : Object.keys(payments || {})
  });

  const result = {
    payments: Array.isArray(payments) ? payments : [],
    totalCount,
  };

  console.log('[ApiServerActions] Returning result:', {
    paymentsCount: result.payments.length,
    totalCount: result.totalCount
  });

  return result;
}

/**
 * Create a new manual payment request
 */
export async function createManualPaymentRequestServer(
  paymentRequest: Omit<ManualPaymentRequestDTO, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ManualPaymentRequestDTO> {
  const url = `${API_BASE_URL}/api/manual-payments`;

  // Backend expects paymentMethodType (not manualPaymentMethodType) and tenantId
  // Map frontend DTO to backend DTO format
  const { manualPaymentMethodType, ...rest } = paymentRequest;
  const backendPayload: any = {
    ...rest,
    // Map manualPaymentMethodType to paymentMethodType for backend
    paymentMethodType: manualPaymentMethodType,
  };

  console.log('[createManualPaymentRequestServer] Sending payload to backend:', {
    ...backendPayload,
    paymentMethodType: backendPayload.paymentMethodType,
    tenantId: backendPayload.tenantId,
  });

  const response = await fetchWithJwtRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(backendPayload),
    cache: 'no-store',
  });

  if (!response.ok) {
    let errorData: any = {};
    try {
      const text = await response.text();
      errorData = text ? JSON.parse(text) : {};
    } catch (e) {
      // If JSON parsing fails, use empty object
      errorData = {};
    }

    console.error('[createManualPaymentRequestServer] Backend error:', {
      status: response.status,
      errorData,
      payload: backendPayload,
    });

    // Extract user-friendly error message from backend response
    let userMessage = 'Failed to create payment request. Please try again.';

    if (response.status === 400) {
      // Validation errors - extract field-specific messages
      if (errorData.message) {
        if (errorData.message.includes('paymentMethodType') || errorData.message.includes('payment_method_type')) {
          userMessage = 'Please select a payment method.';
        } else if (errorData.message.includes('tenantId') || errorData.message.includes('tenant_id')) {
          userMessage = 'An internal error occurred. Please refresh the page and try again.';
        } else if (errorData.message.includes('amount') || errorData.message.includes('amountDue')) {
          userMessage = 'Please select at least one ticket.';
        } else if (errorData.message.includes('validation') || errorData.message.includes('Validation')) {
          userMessage = 'Please check all required fields and try again.';
        } else {
          userMessage = errorData.message;
        }
      } else if (errorData.errors && Array.isArray(errorData.errors)) {
        // Spring Boot validation errors format
        const validationErrors = errorData.errors.map((err: any) => {
          if (err.field === 'paymentMethodType' || err.field === 'payment_method_type') {
            return 'Please select a payment method.';
          } else if (err.field === 'tenantId' || err.field === 'tenant_id') {
            return 'An internal error occurred. Please refresh the page and try again.';
          } else if (err.field === 'amount' || err.field === 'amountDue') {
            return 'Please select at least one ticket.';
          }
          return err.defaultMessage || err.message || 'Please check this field.';
        });
        userMessage = validationErrors.join(' ');
      }
    } else if (response.status === 500) {
      userMessage = 'A server error occurred. Please try again in a few moments. If the problem persists, please contact support.';
    } else if (response.status === 401 || response.status === 403) {
      userMessage = 'Authentication error. Please refresh the page and try again.';
    } else if (response.status >= 500) {
      userMessage = 'The server is temporarily unavailable. Please try again in a few moments.';
    } else if (errorData.message) {
      userMessage = errorData.message;
    }

    const error = new Error(userMessage);
    (error as any).status = response.status;
    (error as any).errorData = errorData;
    throw error;
  }

  const responseData = await response.json();
  // Map backend response back to frontend DTO format
  if (responseData.paymentMethodType && !responseData.manualPaymentMethodType) {
    responseData.manualPaymentMethodType = responseData.paymentMethodType;
  }
  return responseData;
}

/**
 * Fetch a single manual payment request by ID
 */
export async function fetchManualPaymentByIdServer(paymentId: number): Promise<ManualPaymentRequestDTO | null> {
  const url = `${API_BASE_URL}/api/manual-payments/${paymentId}`;
  const response = await fetchWithJwtRetry(url, { cache: 'no-store' });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch manual payment: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  // Map backend response to frontend DTO format
  if (data.paymentMethodType && !data.manualPaymentMethodType) {
    data.manualPaymentMethodType = data.paymentMethodType;
  }
  return data;
}

/**
 * Update manual payment request status
 */
export async function updateManualPaymentStatusServer(
  paymentId: number,
  status: 'REQUESTED' | 'RECEIVED' | 'VOIDED' | 'CANCELLED',
  receivedBy?: string,
  voidReason?: string
): Promise<ManualPaymentRequestDTO> {
  const url = `${API_BASE_URL}/api/manual-payments/${paymentId}`;

  const payload: any = {
    id: paymentId,
    status,
  };

  // Only set receivedAt for RECEIVED status
  if (status === 'RECEIVED') {
    payload.receivedAt = new Date().toISOString();
    if (receivedBy) {
      payload.receivedBy = receivedBy;
    }
  }

  // Set voidReason for VOIDED or CANCELLED status
  if ((status === 'VOIDED' || status === 'CANCELLED') && voidReason) {
    payload.voidReason = voidReason;
  }

  // Clear receivedAt and receivedBy when resetting to REQUESTED
  if (status === 'REQUESTED') {
    payload.receivedAt = null;
    payload.receivedBy = null;
  }

  const response = await fetchWithJwtRetry(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/merge-patch+json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to update manual payment status: ${response.status}`);
  }

  const data = await response.json();
  // Map backend response to frontend DTO format
  if (data.paymentMethodType && !data.manualPaymentMethodType) {
    data.manualPaymentMethodType = data.paymentMethodType;
  }
  return data;
}

/**
 * Update manual payment request (full update with all editable fields)
 */
export async function updateManualPaymentServer(
  paymentId: number,
  updates: Partial<ManualPaymentRequestDTO>
): Promise<ManualPaymentRequestDTO> {
  const url = `${API_BASE_URL}/api/manual-payments/${paymentId}`;

  // Map frontend DTO to backend DTO format
  const { manualPaymentMethodType, ...rest } = updates;
  const backendPayload: any = {
    id: paymentId,
    ...rest,
  };

  // Map manualPaymentMethodType to paymentMethodType for backend
  if (manualPaymentMethodType) {
    backendPayload.paymentMethodType = manualPaymentMethodType;
  }

  const response = await fetchWithJwtRetry(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/merge-patch+json',
    },
    body: JSON.stringify(backendPayload),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to update manual payment: ${response.status}`);
  }

  const data = await response.json();
  // Map backend response to frontend DTO format
  if (data.paymentMethodType && !data.manualPaymentMethodType) {
    data.manualPaymentMethodType = data.paymentMethodType;
  }
  return data;
}

/**
 * Fetch manual payment summary report
 */
export async function fetchManualPaymentSummaryServer(
  eventId?: string,
  startDate?: string,
  endDate?: string
): Promise<ManualPaymentSummaryReportDTO[]> {
  const params = new URLSearchParams();

  if (eventId) {
    params.append('eventId.equals', eventId);
  }

  if (startDate) {
    params.append('snapshotDate.greaterThanOrEqual', startDate);
  }

  if (endDate) {
    params.append('snapshotDate.lessThanOrEqual', endDate);
  }

  const url = `${API_BASE_URL}/api/manual-payment-summary?${params.toString()}`;
  const response = await fetchWithJwtRetry(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to fetch manual payment summary: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Fetch available manual payment methods for tenant
 */
export async function fetchManualPaymentMethodsServer(): Promise<Array<{ providerName: string; enabled: boolean; config?: any }>> {
  const url = `${API_BASE_URL}/api/manual-payment-methods`;
  const response = await fetchWithJwtRetry(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to fetch manual payment methods: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}
