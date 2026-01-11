import { Suspense } from 'react';
import SalesAnalyticsClient from './SalesAnalyticsClient';
import { calculateSalesMetricsServer } from './ApiServerActions';

export default async function SalesAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string; startDate?: string; endDate?: string }>;
}) {
  const sp = await searchParams;
  const eventId = sp.eventId || '';
  const startDate = sp.startDate || '';
  const endDate = sp.endDate || '';

  // Fetch metrics if eventId is provided
  let metrics = null;
  let error = null;
  if (eventId) {
    try {
      metrics = await calculateSalesMetricsServer(eventId, startDate || undefined, endDate || undefined);
    } catch (err: any) {
      error = err.message || 'Failed to load sales metrics';
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '120px' }}>
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Sales Analytics</h1>
        <Suspense fallback={<div className="text-center py-8">Loading sales analytics...</div>}>
          <SalesAnalyticsClient
            initialEventId={eventId}
            initialStartDate={startDate}
            initialEndDate={endDate}
            initialMetrics={metrics}
            initialError={error}
          />
        </Suspense>
      </div>
    </div>
  );
}
