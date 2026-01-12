"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DateRangeSelector, { type DateRange } from '@/components/admin/DateRangeSelector';
import EventSearchSelector from '@/components/admin/EventSearchSelector';
import { fetchSalesDataServer, calculateSalesMetricsServer, triggerStripeFeesTaxUpdateServer, type SalesMetrics, type StripeFeesTaxUpdateRequest, type StripeFeesTaxUpdateResponse } from './ApiServerActions';
import type { EventTicketTransactionDTO } from '@/types';
import { FaDollarSign, FaChartLine, FaSpinner, FaDownload, FaSearch, FaPercent, FaMoneyBillWave, FaSync, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

interface SalesAnalyticsClientProps {
  initialEventId?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialMetrics?: SalesMetrics | null;
  initialError?: string | null;
}

export default function SalesAnalyticsClient({
  initialEventId = '',
  initialStartDate = '',
  initialEndDate = '',
  initialMetrics = null,
  initialError = null,
}: SalesAnalyticsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [eventId, setEventId] = useState(initialEventId);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: initialStartDate || null,
    endDate: initialEndDate || null,
  });
  const [metrics, setMetrics] = useState<SalesMetrics | null>(initialMetrics);
  const [salesData, setSalesData] = useState<EventTicketTransactionDTO[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');

  // Batch Job State
  const [batchJobLoading, setBatchJobLoading] = useState(false);
  const [batchJobSuccess, setBatchJobSuccess] = useState(false);
  const [batchJobError, setBatchJobError] = useState<string | null>(null);
  const [batchJobResponse, setBatchJobResponse] = useState<StripeFeesTaxUpdateResponse | null>(null);
  const [showBatchJobSection, setShowBatchJobSection] = useState(false);
  const [batchJobTenantId, setBatchJobTenantId] = useState<string>('');
  const [batchJobForceUpdate, setBatchJobForceUpdate] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadMetrics();
      loadSalesData();
    }
  }, [eventId, dateRange, page]);

  const loadMetrics = async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await calculateSalesMetricsServer(
        eventId,
        dateRange.startDate || undefined,
        dateRange.endDate || undefined
      );
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load sales metrics');
    } finally {
      setLoading(false);
    }
  };

  const loadSalesData = async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSalesDataServer({
        eventId,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        status: 'COMPLETED', // Only show completed transactions (per database schema)
        page,
        pageSize,
        sort: 'purchaseDate,desc',
      });
      setSalesData(result.transactions);
      setTotalCount(result.totalCount);
    } catch (err: any) {
      setError(err.message || 'Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    setPage(0);
    const params = new URLSearchParams(searchParams.toString());
    if (range.startDate) {
      params.set('startDate', range.startDate);
    } else {
      params.delete('startDate');
    }
    if (range.endDate) {
      params.set('endDate', range.endDate);
    } else {
      params.delete('endDate');
    }
    router.push(`/admin/sales-analytics?${params.toString()}`);
  };

  const handleEventSelect = (selectedEventId: string) => {
    setEventId(selectedEventId);
    setPage(0);
    const params = new URLSearchParams(searchParams.toString());
    if (selectedEventId) {
      params.set('eventId', selectedEventId);
    } else {
      params.delete('eventId');
    }
    router.push(`/admin/sales-analytics?${params.toString()}`);
  };

  const handleExportCSV = () => {
    if (!salesData.length) return;

    const headers = [
      'Transaction ID',
      'Name',
      'Email',
      'Quantity',
      'Gross Amount',
      'Discount',
      'Tax',
      'Platform Fee',
      'Final Amount',
      'Purchase Date',
      'Payment Method',
      'Status',
    ];
    const rows = salesData.map(t => [
      t.id?.toString() || '',
      `${t.firstName || ''} ${t.lastName || ''}`.trim(),
      t.email || '',
      t.quantity?.toString() || '0',
      (t.totalAmount || 0).toFixed(2),
      (t.discountAmount || 0).toFixed(2),
      (t.taxAmount || 0).toFixed(2),
      (t.platformFeeAmount || 0).toFixed(2),
      (t.finalAmount || 0).toFixed(2),
      t.purchaseDate ? new Date(t.purchaseDate).toLocaleString() : '',
      t.paymentMethod || '',
      t.status || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${eventId || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    if (!salesData.length) return;

    // Use xlsx library (already installed)
    const XLSX = await import('xlsx');
    const headers = [
      'Transaction ID',
      'Name',
      'Email',
      'Quantity',
      'Gross Amount',
      'Discount',
      'Tax',
      'Platform Fee',
      'Final Amount',
      'Purchase Date',
      'Payment Method',
      'Status',
    ];
    const rows = salesData.map(t => [
      t.id?.toString() || '',
      `${t.firstName || ''} ${t.lastName || ''}`.trim(),
      t.email || '',
      t.quantity || 0,
      t.totalAmount || 0,
      t.discountAmount || 0,
      t.taxAmount || 0,
      t.platformFeeAmount || 0,
      t.finalAmount || 0,
      t.purchaseDate ? new Date(t.purchaseDate).toISOString() : '',
      t.paymentMethod || '',
      t.status || '',
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');
    XLSX.writeFile(workbook, `sales-report-${eventId || 'all'}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleTriggerBatchJob = async () => {
    setBatchJobLoading(true);
    setBatchJobError(null);
    setBatchJobSuccess(false);
    setBatchJobResponse(null);

    try {
      // Prepare request payload
      const request: StripeFeesTaxUpdateRequest = {};

      // Use tenant ID if provided, otherwise let backend process all tenants
      if (batchJobTenantId.trim()) {
        request.tenantId = batchJobTenantId.trim();
      } else {
        // If not provided, use current tenant from environment (optional - backend will process all if not provided)
        const currentTenantId = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_TENANT_ID : undefined;
        if (currentTenantId) {
          request.tenantId = currentTenantId;
        }
      }

      // Use date range from current filter if available
      if (dateRange.startDate) {
        // Convert to ISO 8601 format with milliseconds and timezone
        const startDate = new Date(dateRange.startDate);
        request.startDate = startDate.toISOString();
      }

      if (dateRange.endDate) {
        // Convert to ISO 8601 format, set to end of day
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59, 999);
        request.endDate = endDate.toISOString();
      }

      // Force update flag
      if (batchJobForceUpdate) {
        request.forceUpdate = true;
      }

      // Validate date range if both dates are provided
      if (request.startDate && request.endDate) {
        const start = new Date(request.startDate);
        const end = new Date(request.endDate);
        if (start > end) {
          setBatchJobError('Start date must be before or equal to end date');
          setBatchJobLoading(false);
          return;
        }
      }

      // Trigger batch job
      const response = await triggerStripeFeesTaxUpdateServer(request);

      setBatchJobResponse(response);
      setBatchJobSuccess(true);

      // Reload metrics after successful batch job trigger (optional - can be removed if not needed)
      // The batch job runs asynchronously, so metrics won't update immediately
      // setTimeout(() => {
      //   if (eventId) {
      //     loadMetrics();
      //   }
      // }, 5000); // Wait 5 seconds before reloading (optional)
    } catch (err: any) {
      console.error('[SalesAnalyticsClient] Batch job error:', err);
      setBatchJobError(err.message || 'Failed to trigger batch job. Please try again.');
    } finally {
      setBatchJobLoading(false);
    }
  };

  const filteredSalesData = searchQuery
    ? salesData.filter(t => {
        const searchLower = searchQuery.toLowerCase();
        return (
          t.email?.toLowerCase().includes(searchLower) ||
          t.firstName?.toLowerCase().includes(searchLower) ||
          t.lastName?.toLowerCase().includes(searchLower) ||
          t.id?.toString().includes(searchQuery)
        );
      })
    : salesData;

  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = totalCount > 0 ? page * pageSize + 1 : 0;
  const endItem = Math.min((page + 1) * pageSize, totalCount);

  return (
    <div className="space-y-6">
      {/* Event Search Selector */}
      <EventSearchSelector
        onEventSelect={handleEventSelect}
        selectedEventId={eventId}
      />

      {/* Date Range Selector */}
      {eventId && (
        <DateRangeSelector
          onRangeChange={handleDateRangeChange}
          defaultRange={dateRange}
        />
      )}

      {/* Batch Job Trigger Section */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Stripe Fees and Tax Update Batch Job</h3>
          <button
            onClick={() => setShowBatchJobSection(!showBatchJobSection)}
            className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition-colors flex items-center gap-2"
            type="button"
          >
            <FaSync className="w-4 h-4" />
            {showBatchJobSection ? 'Hide' : 'Show'} Batch Job Options
          </button>
        </div>

        {showBatchJobSection && (
          <div className="space-y-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                This batch job retrieves missing Stripe fee and tax data from Stripe's API and updates transaction records.
                The job runs asynchronously in the background and will return a job ID when started.
              </p>
            </div>

            {/* Tenant ID Input */}
            <div>
              <label htmlFor="batchJobTenantId" className="block text-sm font-medium text-gray-700 mb-2">
                Tenant ID (optional - leave empty to process all tenants)
              </label>
              <input
                type="text"
                id="batchJobTenantId"
                value={batchJobTenantId}
                onChange={(e) => setBatchJobTenantId(e.target.value)}
                placeholder={typeof window !== 'undefined' && process.env.NEXT_PUBLIC_TENANT_ID
                  ? `Current: ${process.env.NEXT_PUBLIC_TENANT_ID}`
                  : 'Leave empty to process all tenants'}
                className="w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
              />
              <p className="mt-1 text-xs text-gray-500">
                {dateRange.startDate && dateRange.endDate
                  ? `Date range from current filter will be applied: ${dateRange.startDate} to ${dateRange.endDate}`
                  : 'No date range filter will be applied (processes all dates)'}
              </p>
            </div>

            {/* Force Update Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="batchJobForceUpdate"
                checked={batchJobForceUpdate}
                onChange={(e) => setBatchJobForceUpdate(e.target.checked)}
                className="w-5 h-5 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="batchJobForceUpdate" className="text-sm font-medium text-gray-700">
                Force update (reprocess transactions that already have Stripe fee data)
              </label>
            </div>

            {/* Batch Job Status Messages */}
            {batchJobSuccess && batchJobResponse && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-green-800 font-semibold mb-2">Batch job started successfully!</p>
                    <div className="text-sm text-green-700 space-y-1">
                      <p><strong>Job ID:</strong> {batchJobResponse.jobId}</p>
                      <p><strong>Status:</strong> {batchJobResponse.status}</p>
                      {batchJobResponse.estimatedRecords !== null && (
                        <p><strong>Estimated Records:</strong> {batchJobResponse.estimatedRecords}</p>
                      )}
                      {batchJobResponse.estimatedCompletionTime && (
                        <p><strong>Estimated Completion:</strong> {new Date(batchJobResponse.estimatedCompletionTime).toLocaleString()}</p>
                      )}
                      <p className="mt-2 text-xs">{batchJobResponse.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {batchJobError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-800 font-semibold mb-1">Error</p>
                    <p className="text-sm text-red-700">{batchJobError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Trigger Button */}
            <button
              onClick={handleTriggerBatchJob}
              disabled={batchJobLoading}
              className="w-full flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 px-6"
              title="Trigger Stripe Fees and Tax Update Batch Job"
              aria-label="Trigger Stripe Fees and Tax Update Batch Job"
              type="button"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                {batchJobLoading ? (
                  <FaSpinner className="w-6 h-6 text-blue-600 animate-spin" />
                ) : (
                  <FaSync className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <span className="font-semibold text-blue-700">
                {batchJobLoading ? 'Starting Batch Job...' : 'Trigger Batch Job'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-600">Loading sales analytics...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-semibold">Error: {error}</p>
        </div>
      )}

      {/* Metrics Cards */}
      {metrics && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">
                    ${metrics.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <FaDollarSign className="w-10 h-10 text-green-500" />
              </div>
            </div>

            {/* Gross Revenue */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Gross Revenue</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">
                    ${metrics.grossRevenue.toFixed(2)}
                  </p>
                </div>
                <FaMoneyBillWave className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            {/* Net Revenue */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Net Revenue</p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">
                    ${metrics.netRevenue.toFixed(2)}
                  </p>
                </div>
                <FaChartLine className="w-10 h-10 text-purple-500" />
              </div>
            </div>

            {/* Average Ticket Price */}
            <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-600 text-sm font-medium">Avg Ticket Price</p>
                  <p className="text-3xl font-bold text-teal-900 mt-2">
                    ${metrics.averageTicketPrice.toFixed(2)}
                  </p>
                </div>
                <FaDollarSign className="w-10 h-10 text-teal-500" />
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
              <p className="text-orange-600 text-sm font-medium">Total Transactions</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{metrics.totalTransactions}</p>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-600 text-sm font-medium">Total Discounts</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">${metrics.totalDiscounts.toFixed(2)}</p>
            </div>
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm font-medium">Total Refunds</p>
              <p className="text-2xl font-bold text-red-900 mt-1">${metrics.totalRefunds.toFixed(2)}</p>
            </div>
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
              <p className="text-indigo-600 text-sm font-medium">Platform Fees</p>
              <p className="text-2xl font-bold text-indigo-900 mt-1">${metrics.platformFees.toFixed(2)}</p>
            </div>
          </div>

          {/* Revenue by Payment Method */}
          {metrics.revenueByPaymentMethod.length > 0 && (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Payment Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.revenueByPaymentMethod.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 font-medium mb-1">{item.method}</p>
                    <p className="text-2xl font-bold text-gray-900">${item.revenue.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.count} transactions</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sales Trends by Day */}
          {metrics.salesByDay.length > 0 && (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trends by Day</h3>
              <div className="space-y-2">
                {metrics.salesByDay.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-32 text-sm text-gray-600">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-green-500 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(item.revenue / Math.max(...metrics.salesByDay.map(i => i.revenue))) * 100}%` }}
                      >
                        <span className="text-xs font-semibold text-white">${item.revenue.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="w-20 text-sm text-gray-700 text-right">{item.count} sales</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sales Trends by Week */}
          {metrics.salesByWeek.length > 0 && (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trends by Week</h3>
              <div className="space-y-2">
                {metrics.salesByWeek.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-32 text-sm text-gray-600">
                      Week of {new Date(item.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(item.revenue / Math.max(...metrics.salesByWeek.map(i => i.revenue))) * 100}%` }}
                      >
                        <span className="text-xs font-semibold text-white">${item.revenue.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="w-20 text-sm text-gray-700 text-right">{item.count} sales</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sales Trends by Month */}
          {metrics.salesByMonth.length > 0 && (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trends by Month</h3>
              <div className="space-y-2">
                {metrics.salesByMonth.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-32 text-sm text-gray-600">
                      {new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(item.revenue / Math.max(...metrics.salesByMonth.map(i => i.revenue))) * 100}%` }}
                      >
                        <span className="text-xs font-semibold text-white">${item.revenue.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="w-20 text-sm text-gray-700 text-right">{item.count} sales</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sales by Hour */}
          {metrics.salesByHour.length > 0 && (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Hour</h3>
              <div className="space-y-2">
                {metrics.salesByHour.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-gray-600">{item.hour}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(item.count / Math.max(...metrics.salesByHour.map(i => i.count))) * 100}%` }}
                      >
                        <span className="text-xs font-semibold text-white">{item.count}</span>
                      </div>
                    </div>
                    <div className="w-24 text-sm text-gray-700 text-right">${item.revenue.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Sales Data Table */}
      {eventId && (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sales Transactions</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or ID..."
                  className="pl-10 pr-4 py-2 border border-gray-400 rounded-lg focus:border-blue-500 focus:ring-blue-500 w-full sm:w-64"
                />
              </div>
              {/* Export Buttons */}
              {salesData.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                    type="button"
                  >
                    <FaDownload className="w-4 h-4" />
                    CSV
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                    type="button"
                  >
                    <FaDownload className="w-4 h-4" />
                    Excel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sales Table */}
          {filteredSalesData.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Gross Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Discount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Final Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Purchase Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSalesData.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {`${transaction.firstName || ''} ${transaction.lastName || ''}`.trim() || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {transaction.email || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {transaction.quantity || 0}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          ${(transaction.totalAmount || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          ${(transaction.discountAmount || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ${(transaction.finalAmount || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {transaction.purchaseDate
                            ? new Date(transaction.purchaseDate).toLocaleString()
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {startItem} to {endItem} of {totalCount} transactions
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      type="button"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page >= totalPages - 1}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      type="button"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {loading ? 'Loading sales data...' : 'No sales data found for this event.'}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!eventId && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Getting Started</h3>
          <p className="text-blue-700 text-sm">
            Enter an Event ID above to view sales analytics and reports. You can filter by date range and export the data to CSV or Excel.
          </p>
        </div>
      )}
    </div>
  );
}
