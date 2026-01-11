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
  salesByTicketType: Array<{ ticketTypeName: string; count: number; revenue: number }>;
  salesByDay: Array<{ date: string; count: number; revenue: number }>;
  salesByHour: Array<{ hour: string; count: number; revenue: number }>;
  salesByWeek: Array<{ week: string; count: number; revenue: number }>;
  salesByMonth: Array<{ month: string; count: number; revenue: number }>;
  revenueByPaymentMethod: Array<{ method: string; count: number; revenue: number }>;
  discountCodeUsage: Array<{ code: string; usageCount: number; totalDiscount: number }>;
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
  // Net Revenue = Gross Revenue - Discounts - Refunds - Platform Fees (what event organizer receives after platform fees)
  const netRevenue = grossRevenue - totalDiscounts - totalRefunds - platformFees;
  // Total Revenue = Sum of finalAmount (what customer paid, after discounts, may include taxes)
  const totalRevenue = confirmedTransactions.reduce((sum, t) => sum + (t.finalAmount || 0), 0);
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
