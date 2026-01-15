import { Suspense } from 'react';
import ManualPaymentsClient from './ManualPaymentsClient';
import { fetchManualPaymentsServer, fetchManualPaymentSummaryServer } from './ApiServerActions';

export default async function ManualPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string; startDate?: string; endDate?: string }>;
}) {
  const sp = await searchParams;
  const eventId = sp.eventId || '';
  const startDate = sp.startDate || '';
  const endDate = sp.endDate || '';

  // Fetch payments and summary if eventId is provided
  let payments = null;
  let summary = null;
  let error = null;
  if (eventId) {
    try {
      const [paymentsResult, summaryResult] = await Promise.all([
        fetchManualPaymentsServer({ eventId, page: 0, pageSize: 20 }),
        fetchManualPaymentSummaryServer(eventId, startDate || undefined, endDate || undefined),
      ]);
      payments = paymentsResult;
      summary = summaryResult;
    } catch (err: any) {
      error = err.message || 'Failed to load manual payments';
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '120px' }}>
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Manual Payments</h1>
        <Suspense fallback={<div className="text-center py-8">Loading manual payments...</div>}>
          <ManualPaymentsClient
            initialEventId={eventId}
            initialStartDate={startDate}
            initialEndDate={endDate}
            initialPayments={payments}
            initialSummary={summary}
            initialError={error}
          />
        </Suspense>
      </div>
    </div>
  );
}
