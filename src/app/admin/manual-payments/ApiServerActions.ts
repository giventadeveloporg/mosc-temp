"use server";

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

  const payments = await response.json();
  const totalCount = parseInt(response.headers.get('x-total-count') || '0', 10);

  return {
    payments: Array.isArray(payments) ? payments : [],
    totalCount,
  };
}

/**
 * Create a new manual payment request
 */
export async function createManualPaymentRequestServer(
  paymentRequest: Omit<ManualPaymentRequestDTO, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ManualPaymentRequestDTO> {
  const url = `${API_BASE_URL}/api/manual-payments`;
  const response = await fetchWithJwtRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentRequest),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to create manual payment request: ${response.status}`);
  }

  return await response.json();
}

/**
 * Update manual payment request status
 */
export async function updateManualPaymentStatusServer(
  paymentId: number,
  status: 'RECEIVED' | 'VOIDED' | 'CANCELLED',
  receivedBy?: string,
  voidReason?: string
): Promise<ManualPaymentRequestDTO> {
  const url = `${API_BASE_URL}/api/manual-payments/${paymentId}`;
  const response = await fetchWithJwtRetry(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/merge-patch+json',
    },
    body: JSON.stringify({
      id: paymentId,
      status,
      receivedBy,
      voidReason,
      receivedAt: status === 'RECEIVED' ? new Date().toISOString() : undefined,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to update manual payment status: ${response.status}`);
  }

  return await response.json();
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
