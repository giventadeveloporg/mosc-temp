'use client';

import React, { useState, useEffect } from 'react';
import type { PromotionEmailSentLogDTO, EventDetailsDTO } from '@/types';
import { fetchPromotionEmailSentLogsServer } from '../ApiServerActions';

interface PromotionEmailHistoryProps {
  eventId?: number;
  templateId?: number;
  events: EventDetailsDTO[];
}

export default function PromotionEmailHistory({
  eventId,
  templateId,
  events,
}: PromotionEmailHistoryProps) {
  const [logs, setLogs] = useState<PromotionEmailSentLogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState({
    eventId: eventId,
    templateId: templateId,
    startDate: '',
    endDate: '',
    status: '' as '' | 'SENT' | 'FAILED' | 'BOUNCED',
  });

  useEffect(() => {
    loadLogs();
  }, [page, filters]);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page,
        size: pageSize,
        sort: 'sentAt,desc',
      };

      if (filters.eventId) {
        params.eventId = filters.eventId;
      }
      if (filters.templateId) {
        params.templateId = filters.templateId;
      }
      if (filters.startDate) {
        params.sentAtGreaterThanOrEqual = filters.startDate;
      }
      if (filters.endDate) {
        params.sentAtLessThanOrEqual = filters.endDate;
      }
      if (filters.status) {
        params.emailStatus = filters.status;
      }

      const result = await fetchPromotionEmailSentLogsServer(params);
      setLogs(result.logs);
      setTotalCount(result.totalCount);
    } catch (err: any) {
      setError(err.message || 'Failed to load email history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      SENT: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      BOUNCED: 'bg-orange-100 text-orange-800',
    };
    return statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800';
  };

  const getEventName = (eventId: number) => {
    const event = events.find(e => e.id === eventId);
    return event?.title || `Event ${eventId}`;
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasPrevPage = page > 0;
  const hasNextPage = page < totalPages - 1;
  const startItem = totalCount > 0 ? page * pageSize + 1 : 0;
  const endItem = Math.min((page + 1) * pageSize, totalCount);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Email History</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event
          </label>
          <select
            value={filters.eventId || ''}
            onChange={(e) => setFilters({ ...filters, eventId: e.target.value ? Number(e.target.value) : undefined })}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-base"
          >
            <option value="">All Events</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-base"
          >
            <option value="">All Statuses</option>
            <option value="SENT">Sent</option>
            <option value="FAILED">Failed</option>
            <option value="BOUNCED">Bounced</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-base"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-500">Loading email history...</div>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No email history found.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Email
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {log.recipientEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getEventName(log.eventId)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {log.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(log.emailStatus)}`}
                      >
                        {log.emailStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.sentAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.isTestEmail ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {log.isTestEmail ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <button
                  disabled={!hasPrevPage}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  className={`px-4 py-2 rounded-md ${
                    hasPrevPage
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Previous
                </button>
                <div className="text-sm font-semibold">
                  Page {page + 1} of {totalPages}
                </div>
                <button
                  disabled={!hasNextPage}
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  className={`px-4 py-2 rounded-md ${
                    hasNextPage
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="text-center text-sm text-gray-600 mt-2">
                Showing {startItem} to {endItem} of {totalCount} items
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}







