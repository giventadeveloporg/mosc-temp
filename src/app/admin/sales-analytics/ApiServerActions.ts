"use server";

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import type { EventTicketTransactionDTO } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured');
}

export interface SalesAnalyticsOptions {
  eventId?: string;
  startDate?: string;
  endDate?: string;
  status?: string; // e.g., 'COMPLETED', 'PENDING', 'FAILED', 'REFUNDED', 'CANCELLED' (per database schema)
  page?: number;
  pageSize?: number;
  sort?: string;
}

export interface SalesAnalyticsResponse {
  transactions: EventTicketTransactionDTO[];
  totalCount: number;
}

export interface SalesMetrics {
  eventId?: number;
  totalTransactions: number;
  totalRevenue: number;
  grossRevenue: number;
  netRevenue: number;
  totalDiscounts: number;
  totalRefunds: number;
  platformFees: number;
  taxAmount: number;
  averageTicketPrice: number;
  netRevenueBeforeTax: number; // NEW: Sum of (finalAmount - stripeFeeAmount) per transaction
  salesByTicketType: Array<{ ticketTypeName: string; count: number; revenue: number }>;
  salesByDay: Array<{ date: string; count: number; revenue: number }>;
  salesByHour: Array<{ hour: string; count: number; revenue: number }>;
  salesByWeek: Array<{ week: string; count: number; revenue: number }>;
  salesByMonth: Array<{ month: string; count: number; revenue: number }>;
  revenueByPaymentMethod: Array<{ method: string; count: number; revenue: number }>;
  discountCodeUsage: Array<{ code: string; usageCount: number; totalDiscount: number }>;
}

/**
 * Batch Job Request/Response Interfaces for Stripe Fees and Tax Update
 */
export interface StripeFeesTaxUpdateRequest {
  tenantId?: string;
  eventId?: number; // Optional: Filter by specific event ID
  startDate?: string; // ISO 8601 format: "2025-01-01T00:00:00.000Z"
  endDate?: string;   // ISO 8601 format: "2025-01-31T23:59:59.999Z"
  forceUpdate?: boolean; // Default: false
  useDefaultDateRange?: boolean; // Default: false - If true, automatically calculate date range for normal batch runs
}

export interface StripeFeesTaxUpdateResponse {
  jobId: string;
  status: 'STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  tenantId: string | null;
  eventId: number | null; // Optional: Event ID that was processed
  startDate: string | null;
  endDate: string | null;
  forceUpdate: boolean;
  estimatedRecords: number | null;
  estimatedCompletionTime: string | null;
  message: string;
}

/**
 * Fetch sales data with pagination and filtering
 */
export async function fetchSalesDataServer(
  options: SalesAnalyticsOptions = {}
): Promise<SalesAnalyticsResponse> {
  const params = new URLSearchParams();

  if (options.eventId) {
    params.append('eventId.equals', options.eventId);
  }

  if (options.status) {
    params.append('status.equals', options.status);
  }

  // Filter by purchase date range
  if (options.startDate) {
    params.append('purchaseDate.greaterThanOrEqual', options.startDate);
  }

  if (options.endDate) {
    params.append('purchaseDate.lessThanOrEqual', options.endDate);
  }

  const page = options.page ?? 0;
  const pageSize = options.pageSize ?? 20;
  params.append('page', page.toString());
  params.append('size', pageSize.toString());

  if (options.sort) {
    params.append('sort', options.sort);
  } else {
    params.append('sort', 'purchaseDate,desc');
  }

  const url = `${API_BASE_URL}/api/event-ticket-transactions?${params.toString()}`;
  const response = await fetchWithJwtRetry(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to fetch sales data: ${response.status} ${response.statusText}`);
  }

  const transactions = await response.json();
  const totalCount = parseInt(response.headers.get('x-total-count') || '0', 10);

  return {
    transactions: Array.isArray(transactions) ? transactions : [],
    totalCount,
  };
}

/**
 * Calculate sales metrics from transactions
 */
export async function calculateSalesMetricsServer(
  eventId: string,
  startDate?: string,
  endDate?: string
): Promise<SalesMetrics> {
  // Fetch all transactions for the event (for analytics)
  const params = new URLSearchParams({
    'eventId.equals': eventId,
    'size': '1000', // Get all for analytics
  });

  if (startDate) {
    params.append('purchaseDate.greaterThanOrEqual', startDate);
  }
  if (endDate) {
    params.append('purchaseDate.lessThanOrEqual', endDate);
  }

  const url = `${API_BASE_URL}/api/event-ticket-transactions?${params.toString()}`;
  const response = await fetchWithJwtRetry(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to fetch sales metrics: ${response.status} ${response.statusText}`);
  }

  const transactions: EventTicketTransactionDTO[] = await response.json();
  const allTransactions = Array.isArray(transactions) ? transactions : [];

  // Filter only completed transactions (per database schema: transaction_status enum)
  const confirmedTransactions = allTransactions.filter(
    t => t.status === 'COMPLETED'
  );

  // Calculate metrics
  const totalTransactions = confirmedTransactions.length;
  // Gross Revenue = Sum of totalAmount (base ticket prices before discounts/fees/taxes)
  const grossRevenue = confirmedTransactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  const totalDiscounts = confirmedTransactions.reduce((sum, t) => sum + (t.discountAmount || 0), 0);
  const totalRefunds = confirmedTransactions.reduce((sum, t) => sum + (t.refundAmount || 0), 0);
  const platformFees = confirmedTransactions.reduce((sum, t) => sum + (t.platformFeeAmount || 0), 0);
  const taxAmount = confirmedTransactions.reduce((sum, t) => sum + (t.taxAmount || 0), 0);
  // Total Revenue = Sum of finalAmount (what customer paid, after discounts, may include taxes)
  const totalRevenue = confirmedTransactions.reduce((sum, t) => sum + (t.finalAmount || 0), 0);

  // Net Revenue = Sum of netPayoutAmount (what event organizer receives after Stripe fees and tax)
  // If netPayoutAmount is available from batch job, use it directly
  // Otherwise, calculate as: finalAmount - stripeFeeAmount - stripeAmountTax
  const netRevenue = confirmedTransactions.reduce((sum, t) => {
    if (t.netPayoutAmount !== undefined && t.netPayoutAmount !== null) {
      // Use stored netPayoutAmount from batch job (most accurate)
      return sum + t.netPayoutAmount;
    } else {
      // Fallback calculation if netPayoutAmount not available
      const finalAmount = t.finalAmount || 0;
      const stripeFee = t.stripeFeeAmount || 0;
      const stripeTax = t.stripeAmountTax || 0;
      // Net revenue = final_amount - stripe_fee_amount - stripe_amount_tax
      return sum + (finalAmount - stripeFee - stripeTax);
    }
  }, 0);

  // Net Revenue Before Tax = Sum of (finalAmount - stripeFeeAmount) per transaction
  // Formula: net_revenue_before_tax = final_amount - stripe_fee_amount
  // This represents what you'd receive if tax wasn't part of the transaction
  const netRevenueBeforeTax = confirmedTransactions.reduce((sum, t) => {
    const finalAmount = t.finalAmount || 0;
    const stripeFee = t.stripeFeeAmount || 0;
    // Net revenue before tax = final_amount - stripe_fee_amount
    return sum + (finalAmount - stripeFee);
  }, 0);
  const averageTicketPrice = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Group by day
  const salesByDayMap: Record<string, { count: number; revenue: number }> = {};
  confirmedTransactions.forEach(t => {
    if (t.purchaseDate) {
      const date = new Date(t.purchaseDate).toISOString().split('T')[0];
      if (!salesByDayMap[date]) {
        salesByDayMap[date] = { count: 0, revenue: 0 };
      }
      salesByDayMap[date].count += 1;
      salesByDayMap[date].revenue += t.finalAmount || 0;
    }
  });

  const salesByDay = Object.entries(salesByDayMap)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Group by hour
  const salesByHourMap: Record<string, { count: number; revenue: number }> = {};
  confirmedTransactions.forEach(t => {
    if (t.purchaseDate) {
      const date = new Date(t.purchaseDate);
      const hour = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      if (!salesByHourMap[hour]) {
        salesByHourMap[hour] = { count: 0, revenue: 0 };
      }
      salesByHourMap[hour].count += 1;
      salesByHourMap[hour].revenue += t.finalAmount || 0;
    }
  });

  const salesByHour = Object.entries(salesByHourMap)
    .map(([hour, data]) => ({ hour, ...data }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  // Group by discount code
  const discountCodeMap: Record<string, { usageCount: number; totalDiscount: number }> = {};
  confirmedTransactions.forEach(t => {
    if (t.discountCodeId && t.discountAmount) {
      const codeKey = `CODE_${t.discountCodeId}`;
      if (!discountCodeMap[codeKey]) {
        discountCodeMap[codeKey] = { usageCount: 0, totalDiscount: 0 };
      }
      discountCodeMap[codeKey].usageCount += 1;
      discountCodeMap[codeKey].totalDiscount += t.discountAmount;
    }
  });

  const discountCodeUsage = Object.entries(discountCodeMap).map(([code, data]) => ({
    code,
    ...data,
  }));

  // Sales by ticket type (would need transaction items - placeholder for now)
  const salesByTicketType: Array<{ ticketTypeName: string; count: number; revenue: number }> = [];

  // Revenue by payment method
  const revenueByPaymentMethod: Record<string, { count: number; revenue: number }> = {};
  confirmedTransactions.forEach(t => {
    const method = t.paymentMethod || 'Unknown';
    if (!revenueByPaymentMethod[method]) {
      revenueByPaymentMethod[method] = { count: 0, revenue: 0 };
    }
    revenueByPaymentMethod[method].count += 1;
    revenueByPaymentMethod[method].revenue += t.finalAmount || 0;
  });

  // Sales by week
  const salesByWeekMap: Record<string, { count: number; revenue: number }> = {};
  confirmedTransactions.forEach(t => {
    if (t.purchaseDate) {
      const date = new Date(t.purchaseDate);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];
      if (!salesByWeekMap[weekKey]) {
        salesByWeekMap[weekKey] = { count: 0, revenue: 0 };
      }
      salesByWeekMap[weekKey].count += 1;
      salesByWeekMap[weekKey].revenue += t.finalAmount || 0;
    }
  });

  const salesByWeek = Object.entries(salesByWeekMap)
    .map(([week, data]) => ({ week, ...data }))
    .sort((a, b) => a.week.localeCompare(b.week));

  // Sales by month
  const salesByMonthMap: Record<string, { count: number; revenue: number }> = {};
  confirmedTransactions.forEach(t => {
    if (t.purchaseDate) {
      const date = new Date(t.purchaseDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!salesByMonthMap[monthKey]) {
        salesByMonthMap[monthKey] = { count: 0, revenue: 0 };
      }
      salesByMonthMap[monthKey].count += 1;
      salesByMonthMap[monthKey].revenue += t.finalAmount || 0;
    }
  });

  const salesByMonth = Object.entries(salesByMonthMap)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    eventId: parseInt(eventId, 10),
    totalTransactions,
    totalRevenue,
    grossRevenue,
    netRevenue,
    totalDiscounts,
    totalRefunds,
    platformFees,
    taxAmount,
    averageTicketPrice,
    netRevenueBeforeTax,
    salesByTicketType,
    salesByDay,
    salesByHour,
    salesByWeek,
    salesByMonth,
    revenueByPaymentMethod: Object.entries(revenueByPaymentMethod).map(([method, data]) => ({
      method,
      ...data,
    })),
    discountCodeUsage,
  };
}

/**
 * Trigger Stripe Fees and Tax Update Batch Job
 * This server action calls the backend batch job API to retrieve missing Stripe fee and tax data
 * and update transaction records asynchronously.
 *
 * @param request - Batch job request parameters (all optional)
 * @returns Response with job ID and status (HTTP 202 Accepted)
 */
export async function triggerStripeFeesTaxUpdateServer(
  request: StripeFeesTaxUpdateRequest = {}
): Promise<StripeFeesTaxUpdateResponse> {
  try {
    // Validate date range if both dates are provided
    if (request.startDate && request.endDate) {
      const start = new Date(request.startDate);
      const end = new Date(request.endDate);
      if (start > end) {
        throw new Error('Start date must be before or equal to end date');
      }
    }

    // Prepare request payload (only include defined fields)
    const payload: StripeFeesTaxUpdateRequest = {};
    if (request.tenantId) {
      payload.tenantId = request.tenantId;
    }
    if (request.eventId !== undefined && request.eventId !== null) {
      payload.eventId = request.eventId;
    }
    if (request.startDate) {
      payload.startDate = request.startDate;
    }
    if (request.endDate) {
      payload.endDate = request.endDate;
    }
    if (request.forceUpdate !== undefined) {
      payload.forceUpdate = request.forceUpdate;
    }
    if (request.useDefaultDateRange !== undefined) {
      payload.useDefaultDateRange = request.useDefaultDateRange;
    }

    // Call backend batch job API endpoint (NOT a proxy endpoint - direct backend call)
    const url = `${API_BASE_URL}/api/cron/stripe-fees-tax-update`;
    const response = await fetchWithJwtRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    // Handle error responses
    if (!response.ok) {
      let errorMessage = 'Failed to trigger batch job. Please try again.';

      try {
        const errorData = await response.json();

        // Extract user-friendly error message from response
        if (errorData.message && typeof errorData.message === 'string') {
          // Check if it's a user-friendly message or a technical error code
          if (errorData.message.includes('error.') || errorData.message.includes('Error:') ||
              errorData.message.toLowerCase().includes('batchjob') ||
              errorData.message.toLowerCase().includes('batch')) {
            // Map technical error codes to user-friendly messages
            const messageLower = errorData.message.toLowerCase();
            if (messageLower.includes('batchjobhttperror') || messageLower.includes('batchjobunavailable')) {
              errorMessage = 'Unable to start the batch job. The batch job service may be unavailable. Please try again later or contact support.';
            } else if (messageLower.includes('batchjobsubmissionfailed')) {
              errorMessage = 'Failed to submit the batch job. The batch job service may be experiencing issues. Please try again in a few moments or contact support if the problem persists.';
            } else if (messageLower.includes('batchjob')) {
              errorMessage = 'An error occurred while starting the batch job. Please try again later or contact support.';
            } else if (errorData.message.includes('Invalid request')) {
              errorMessage = 'Invalid request parameters. Please check your input and try again.';
            } else if (errorData.message.includes('startDate') || errorData.message.includes('endDate')) {
              errorMessage = 'Invalid date range. Please ensure the start date is before or equal to the end date.';
            } else {
              // Try to extract a more user-friendly message
              errorMessage = errorData.message.replace(/error\./g, '').replace(/Error:/g, '').trim();
              if (!errorMessage || errorMessage.length < 10) {
                errorMessage = 'An error occurred while starting the batch job. Please try again.';
              }
            }
          } else {
            // Use the message as-is if it looks user-friendly
            errorMessage = errorData.message;
          }
        } else if (errorData.error && typeof errorData.error === 'string') {
          // Handle error field
          const errorLower = errorData.error.toLowerCase();
          if (errorData.error.includes('error.') || errorData.error.includes('Error:') ||
              errorLower.includes('batchjob') || errorLower.includes('batch')) {
            if (errorLower.includes('batchjobhttperror') || errorLower.includes('batchjobunavailable')) {
              errorMessage = 'Unable to start the batch job. The batch job service may be unavailable. Please try again later or contact support.';
            } else if (errorLower.includes('batchjobsubmissionfailed')) {
              errorMessage = 'Failed to submit the batch job. The batch job service may be experiencing issues. Please try again in a few moments or contact support if the problem persists.';
            } else if (errorLower.includes('batchjob')) {
              errorMessage = 'An error occurred while starting the batch job. Please try again later or contact support.';
            } else {
              errorMessage = errorData.error.replace(/error\./g, '').replace(/Error:/g, '').trim();
              if (!errorMessage || errorMessage.length < 10) {
                errorMessage = 'An error occurred while starting the batch job. Please try again.';
              }
            }
          } else {
            errorMessage = errorData.error;
          }
        } else if (response.status === 400) {
          errorMessage = 'Invalid request. Please check your parameters and try again.';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please refresh the page and try again.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to trigger this batch job.';
        } else if (response.status === 404) {
          errorMessage = 'Batch job service not found. Please contact support.';
        } else if (response.status === 500) {
          errorMessage = 'Server error occurred. Please try again later or contact support.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error occurred. Please try again later or contact support.';
        }
      } catch (parseError) {
        // If JSON parsing fails, use status-based error messages
        if (response.status === 400) {
          errorMessage = 'Invalid request. Please check your parameters and try again.';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please refresh the page and try again.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to trigger this batch job.';
        } else if (response.status === 404) {
          errorMessage = 'Batch job service not found. Please contact support.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error occurred. Please try again later or contact support.';
        } else {
          errorMessage = `Failed to trigger batch job (${response.status}). Please try again.`;
        }
      }

      throw new Error(errorMessage);
    }

    // Parse and return response (should be 202 Accepted)
    const data: StripeFeesTaxUpdateResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('[triggerStripeFeesTaxUpdateServer] Error:', error);
    throw error;
  }
}
