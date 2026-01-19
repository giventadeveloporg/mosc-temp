"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DateRangeSelector, { type DateRange } from '@/components/admin/DateRangeSelector';
import EventSearchSelector from '@/components/admin/EventSearchSelector';
import {
  fetchManualPaymentsServer,
  fetchManualPaymentSummaryServer,
  updateManualPaymentStatusServer,
  type ManualPaymentListResponse,
} from './ApiServerActions';
import type { ManualPaymentRequestDTO, ManualPaymentSummaryReportDTO } from '@/types';
import { FaDollarSign, FaSpinner, FaSearch, FaCheckCircle, FaTimesCircle, FaBan, FaDownload, FaEye } from 'react-icons/fa';
import Link from 'next/link';

interface ManualPaymentsClientProps {
  initialEventId?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialPayments?: ManualPaymentListResponse | null;
  initialSummary?: ManualPaymentSummaryReportDTO[] | null;
  initialError?: string | null;
}

export default function ManualPaymentsClient({
  initialEventId = '',
  initialStartDate = '',
  initialEndDate = '',
  initialPayments = null,
  initialSummary = null,
  initialError = null,
}: ManualPaymentsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [eventId, setEventId] = useState(initialEventId);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: initialStartDate || null,
    endDate: initialEndDate || null,
  });
  const [payments, setPayments] = useState<ManualPaymentListResponse | null>(initialPayments);
  const [summary, setSummary] = useState<ManualPaymentSummaryReportDTO[] | null>(initialSummary);
  // Don't show loading if we have initial data
  const [loading, setLoading] = useState(!initialPayments && !initialSummary);
  const [error, setError] = useState<string | null>(initialError);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const isFetchingRef = useRef(false);
  const hasMountedRef = useRef(false);
  const prevFiltersRef = useRef<string>('');
  const currentlyLoadingFilterKeyRef = useRef<string>('');

  // Store latest values in refs to avoid dependency issues
  const eventIdRef = useRef(eventId);
  const statusFilterRef = useRef(statusFilter);
  const methodFilterRef = useRef(methodFilter);
  const pageRef = useRef(page);
  const dateRangeRef = useRef(dateRange);
  const startDateRef = useRef(dateRange.startDate);
  const endDateRef = useRef(dateRange.endDate);

  // Update refs when values change (use stringified date values to avoid object reference issues)
  useEffect(() => {
    eventIdRef.current = eventId;
    statusFilterRef.current = statusFilter;
    methodFilterRef.current = methodFilter;
    pageRef.current = page;
    dateRangeRef.current = dateRange;
    startDateRef.current = dateRange.startDate;
    endDateRef.current = dateRange.endDate;
  }, [eventId, statusFilter, methodFilter, page, dateRange.startDate, dateRange.endDate]);

  const loadPayments = useCallback(async (filterKey?: string) => {
    const currentEventId = eventIdRef.current;
    const currentStatusFilter = statusFilterRef.current;
    const currentMethodFilter = methodFilterRef.current;
    const currentPage = pageRef.current;

    if (!currentEventId) {
      setPayments(null);
      setLoading(false);
      isFetchingRef.current = false;
      currentlyLoadingFilterKeyRef.current = '';
      return;
    }

    // Create filter key if not provided
    const currentFilterKey = filterKey || `${currentEventId}-${currentStatusFilter}-${currentMethodFilter}-${currentPage}`;

    // Prevent loading the same filter key twice
    if (currentlyLoadingFilterKeyRef.current === currentFilterKey) {
      console.log('[ManualPayments] Already loading this filter key, skipping...', currentFilterKey);
      return;
    }

    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log('[ManualPayments] Already fetching, skipping...');
      return;
    }

    console.log('[ManualPayments] Loading payments for filterKey:', currentFilterKey);
    isFetchingRef.current = true;
    currentlyLoadingFilterKeyRef.current = currentFilterKey;
    setLoading(true);
    setError(null);

    // Track if response was received
    const responseReceivedRef = { current: false };

    // Safety timeout to ensure loading is cleared even if fetch hangs
    const timeoutId = setTimeout(() => {
      if (!responseReceivedRef.current) {
        console.warn('[ManualPayments] Load timeout - clearing loading state (response not received)');
        setLoading(false);
        isFetchingRef.current = false;
        if (currentlyLoadingFilterKeyRef.current === currentFilterKey) {
          currentlyLoadingFilterKeyRef.current = '';
        }
      } else {
        console.log('[ManualPayments] Timeout fired but response already received, ignoring');
      }
    }, 30000); // 30 second timeout

    try {
      console.log('[ManualPayments] Calling fetchManualPaymentsServer...');
      const data = await fetchManualPaymentsServer({
        eventId: currentEventId,
        status: currentStatusFilter || undefined,
        manualPaymentMethodType: currentMethodFilter || undefined,
        page: currentPage,
        pageSize,
        sort: 'createdAt,desc',
      });
      responseReceivedRef.current = true;
      console.log('[ManualPayments] Payments loaded:', {
        paymentsCount: data?.payments?.length || 0,
        totalCount: data?.totalCount || 0,
        dataStructure: data ? Object.keys(data) : 'null',
        firstPayment: data?.payments?.[0] ? { id: data.payments[0].id, eventId: data.payments[0].eventId, status: data.payments[0].status } : 'none'
      });

      // Only update state if we got valid data
      if (data && (data.payments || data.totalCount !== undefined)) {
        setPayments(data);
        console.log('[ManualPayments] State updated with payments:', data?.payments?.length || 0);
      } else {
        console.warn('[ManualPayments] Invalid data structure received:', data);
        setError('Invalid data structure received from server');
      }
    } catch (err: any) {
      responseReceivedRef.current = true;
      console.error('[ManualPayments] Error loading payments:', err);
      setError(err.message || 'Failed to load manual payments');
    } finally {
      // Clear timeout
      clearTimeout(timeoutId);
      // Always clear loading state and fetch flag
      setLoading(false);
      isFetchingRef.current = false;
      // Clear the filter key when done
      if (currentlyLoadingFilterKeyRef.current === currentFilterKey) {
        currentlyLoadingFilterKeyRef.current = '';
      }
    }
  }, [pageSize]);

  const loadSummary = useCallback(async () => {
    const currentEventId = eventIdRef.current;
    const currentDateRange = dateRangeRef.current;

    if (!currentEventId) return;
    try {
      const data = await fetchManualPaymentSummaryServer(
        currentEventId,
        currentDateRange.startDate || undefined,
        currentDateRange.endDate || undefined
      );
      setSummary(data);
    } catch (err: any) {
      console.error('Failed to load summary:', err);
    }
  }, []);

  // Create stable date string values to avoid object reference issues
  const startDateStr = useMemo(() => dateRange.startDate || '', [dateRange.startDate]);
  const endDateStr = useMemo(() => dateRange.endDate || '', [dateRange.endDate]);

  // Track if we should skip the initial load (because we have server-side data)
  const skipInitialLoadRef = useRef(!!(initialPayments || initialSummary));

  useEffect(() => {
    // Prevent running if already fetching
    if (isFetchingRef.current) {
      console.log('[ManualPayments] useEffect: Already fetching, skipping...');
      return;
    }

    if (!eventId) {
      // Only clear if we don't have initial data to preserve
      if (!initialPayments) {
        setPayments(null);
        setSummary(null);
      }
      setLoading(false);
      skipInitialLoadRef.current = false;
      prevFiltersRef.current = '';
      isFetchingRef.current = false;
      return;
    }

    // Create a filter key to detect actual changes (use stable date strings)
    const filterKey = `${eventId}-${statusFilter}-${methodFilter}-${page}-${startDateStr}-${endDateStr}`;

    // On first mount: use initial data if available, otherwise load
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      prevFiltersRef.current = filterKey;

      // Check if we have initial data (either payments or summary)
      const hasInitialData = (initialPayments && initialPayments.payments && initialPayments.payments.length > 0) ||
                            (initialSummary && initialSummary.length > 0);

      if (hasInitialData) {
        // We have initial data from server, don't reload
        console.log('[ManualPayments] Using initial data from server', {
          paymentsCount: initialPayments?.payments?.length || 0,
          summaryCount: initialSummary?.length || 0,
          totalCount: initialPayments?.totalCount || 0
        });
        // Ensure loading is false since we have initial data
        setLoading(false);
        isFetchingRef.current = false;
        return;
      } else {
        // No initial data, load it
        console.log('[ManualPayments] No initial data, loading...', {
          hasInitialPayments: !!initialPayments,
          hasInitialSummary: !!initialSummary
        });
        loadPayments(filterKey);
        loadSummary();
        return;
      }
    }

    // After mount: only reload if filters actually changed
    if (prevFiltersRef.current !== filterKey) {
      console.log('[ManualPayments] Filters changed, reloading...', { old: prevFiltersRef.current, new: filterKey });
      prevFiltersRef.current = filterKey;
      // Only load if not already loading this filter key
      if (currentlyLoadingFilterKeyRef.current !== filterKey && !isFetchingRef.current) {
        loadPayments(filterKey);
        loadSummary();
      } else {
        console.log('[ManualPayments] Already loading this filter key, skipping...', filterKey);
      }
    } else {
      console.log('[ManualPayments] Filters unchanged, skipping reload. Current filterKey:', filterKey, 'Has payments:', !!payments, 'Payments count:', payments?.payments?.length || 0);
      // If filters unchanged but we don't have data, load it
      if (!payments && !isFetchingRef.current && currentlyLoadingFilterKeyRef.current !== filterKey) {
        console.log('[ManualPayments] Filters unchanged but no data, loading...');
        loadPayments(filterKey);
        loadSummary();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, statusFilter, methodFilter, page, startDateStr, endDateStr]);

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
    router.push(`/admin/manual-payments?${params.toString()}`);
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
    router.push(`/admin/manual-payments?${params.toString()}`);
  };

  const handleStatusUpdate = async (paymentId: number, newStatus: 'RECEIVED' | 'VOIDED' | 'CANCELLED', voidReason?: string) => {
    if (!confirm(`Are you sure you want to mark this payment as ${newStatus}?`)) {
      return;
    }

    setUpdatingStatus(paymentId);
    try {
      await updateManualPaymentStatusServer(paymentId, newStatus, undefined, voidReason);
      // Reload payments after status update
      await loadPayments();
      await loadSummary();
    } catch (err: any) {
      alert(`Failed to update payment status: ${err.message}`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'VOIDED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'REQUESTED':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getMethodDisplayName = (method: string) => {
    const methodMap: Record<string, string> = {
      ZELLE_MANUAL: 'Zelle',
      VENMO_MANUAL: 'Venmo',
      CASH_APP_MANUAL: 'Cash App',
      CASH: 'Cash',
      CHECK: 'Check',
      OTHER_MANUAL: 'Other',
    };
    return methodMap[method] || method;
  };

  const filteredPayments = searchQuery && payments
    ? payments.payments.filter(p => {
        const searchLower = searchQuery.toLowerCase();
        return (
          p.id?.toString().includes(searchQuery) ||
          p.paymentHandle?.toLowerCase().includes(searchLower) ||
          p.paymentInstructions?.toLowerCase().includes(searchLower)
        );
      })
    : payments?.payments || [];

  // Debug logging for render
  useEffect(() => {
    console.log('[ManualPayments] Render state:', {
      hasPayments: !!payments,
      paymentsCount: payments?.payments?.length || 0,
      totalCount: payments?.totalCount || 0,
      filteredCount: filteredPayments.length,
      loading,
      eventId,
      searchQuery
    });
  }, [payments, filteredPayments.length, loading, eventId, searchQuery]);

  const totalPages = payments ? Math.ceil(payments.totalCount / pageSize) : 0;
  const startItem = payments && payments.totalCount > 0 ? page * pageSize + 1 : 0;
  const endItem = payments ? Math.min((page + 1) * pageSize, payments.totalCount) : 0;

  // Calculate summary totals
  const summaryTotals = summary
    ? summary.reduce(
        (acc, item) => {
          if (item.status === 'RECEIVED') {
            acc.received += item.totalAmount;
            acc.receivedCount += item.requestCount;
          } else if (item.status === 'REQUESTED') {
            acc.requested += item.totalAmount;
            acc.requestedCount += item.requestCount;
          } else {
            acc.voided += item.totalAmount;
            acc.voidedCount += item.requestCount;
          }
          return acc;
        },
        { received: 0, requested: 0, voided: 0, receivedCount: 0, requestedCount: 0, voidedCount: 0 }
      )
    : { received: 0, requested: 0, voided: 0, receivedCount: 0, requestedCount: 0, voidedCount: 0 };

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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-600">Loading manual payments...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-semibold">Error: {error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {summary && summary.length > 0 && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Received */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Received</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">
                    ${summaryTotals.received.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-700 mt-1">{summaryTotals.receivedCount} payments</p>
                </div>
                <FaCheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>

            {/* Requested */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-2">
                    ${summaryTotals.requested.toFixed(2)}
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">{summaryTotals.requestedCount} payments</p>
                </div>
                <FaSpinner className="w-10 h-10 text-yellow-500 animate-spin" />
              </div>
            </div>

            {/* Voided/Cancelled */}
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Voided/Cancelled</p>
                  <p className="text-3xl font-bold text-red-900 mt-2">
                    ${summaryTotals.voided.toFixed(2)}
                  </p>
                  <p className="text-sm text-red-700 mt-1">{summaryTotals.voidedCount} payments</p>
                </div>
                <FaBan className="w-10 h-10 text-red-500" />
              </div>
            </div>
          </div>

          {/* Summary by Method */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary by Payment Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.map((item, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 font-medium mb-1">{getMethodDisplayName(item.manualPaymentMethodType)}</p>
                  <p className="text-lg font-bold text-gray-900">${item.totalAmount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.requestCount} requests - {item.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Payments Table */}
      {eventId && (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Manual Payment Requests</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID, handle, or instructions..."
                  className="pl-10 pr-4 py-2 border border-gray-400 rounded-lg focus:border-blue-500 focus:ring-blue-500 w-full sm:w-64"
                />
              </div>
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                className="border border-gray-400 rounded-lg focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
              >
                <option value="">All Statuses</option>
                <option value="REQUESTED">Requested</option>
                <option value="RECEIVED">Received</option>
                <option value="VOIDED">Voided</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              {/* Method Filter */}
              <select
                value={methodFilter}
                onChange={(e) => {
                  setMethodFilter(e.target.value);
                  setPage(0);
                }}
                className="border border-gray-400 rounded-lg focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
              >
                <option value="">All Methods</option>
                <option value="ZELLE_MANUAL">Zelle</option>
                <option value="VENMO_MANUAL">Venmo</option>
                <option value="CASH_APP_MANUAL">Cash App</option>
                <option value="CASH">Cash</option>
                <option value="CHECK">Check</option>
                <option value="OTHER_MANUAL">Other</option>
              </select>
            </div>
          </div>

          {/* Debug Info - Remove after fixing */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-4 bg-gray-100 rounded-lg text-xs">
              <p>Debug: payments={payments ? 'exists' : 'null'}, payments.payments={payments?.payments?.length || 0}, totalCount={payments?.totalCount || 0}, filteredCount={filteredPayments.length}, loading={loading ? 'true' : 'false'}</p>
            </div>
          )}

          {/* Payments Table */}
          {filteredPayments.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Handle
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {getMethodDisplayName(payment.manualPaymentMethodType)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          ${(payment.amountDue || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {payment.paymentHandle || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeColor(
                              payment.status
                            )}`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {payment.createdAt
                            ? new Date(payment.createdAt).toLocaleString()
                            : '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-wrap gap-2">
                            {/* View Details Link */}
                            <Link
                              href={`/admin/manual-payments/${payment.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FaEye className="w-4 h-4" />
                              View
                            </Link>

                            {/* Status Update Buttons */}
                            {payment.status === 'REQUESTED' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(payment.id!, 'RECEIVED')}
                                  disabled={updatingStatus === payment.id}
                                  className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Mark as Received"
                                  type="button"
                                >
                                  {updatingStatus === payment.id ? (
                                    <FaSpinner className="w-4 h-4 animate-spin" />
                                  ) : (
                                    'Mark Received'
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('Enter cancellation reason (optional):');
                                    handleStatusUpdate(payment.id!, 'CANCELLED', reason || undefined);
                                  }}
                                  disabled={updatingStatus === payment.id}
                                  className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Cancel Payment"
                                  type="button"
                                >
                                  {updatingStatus === payment.id ? (
                                    <FaSpinner className="w-4 h-4 animate-spin" />
                                  ) : (
                                    'Cancel'
                                  )}
                                </button>
                              </>
                            )}

                            {/* Proof of Payment Link */}
                            {payment.proofOfPaymentFileUrl && (
                              <a
                                href={payment.proofOfPaymentFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition-colors"
                                title="View Proof of Payment"
                              >
                                <FaDownload className="w-4 h-4" />
                                Proof
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="mt-8">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0 || loading}
                    className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
                    title="Previous Page"
                    aria-label="Previous Page"
                    type="button"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                  </button>

                  <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                    <span className="text-sm font-bold text-blue-700">
                      Page <span className="text-blue-600">{page + 1}</span> of <span className="text-blue-600">{Math.max(1, totalPages)}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1 || loading}
                    className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
                    title="Next Page"
                    aria-label="Next Page"
                    type="button"
                  >
                    <span>Next</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="text-center mt-3">
                  {payments && payments.totalCount > 0 ? (
                    <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                      <span className="text-sm text-gray-700">
                        Showing <span className="font-bold text-blue-600">{startItem}</span> to <span className="font-bold text-blue-600">{endItem}</span> of <span className="font-bold text-blue-600">{payments.totalCount}</span> payments
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-orange-700">No payments found</span>
                      <span className="text-sm text-orange-600">[No payments match your criteria]</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {loading ? 'Loading payments...' : 'No manual payments found for this event.'}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!eventId && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Getting Started</h3>
          <p className="text-blue-700 text-sm">
            Enter an Event ID above to view manual payment requests and summaries. You can filter by date range, status, and payment method.
          </p>
        </div>
      )}
    </div>
  );
}
