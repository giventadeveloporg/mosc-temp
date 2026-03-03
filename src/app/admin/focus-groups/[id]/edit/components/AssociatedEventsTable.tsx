'use client';

import React, { useState, useEffect } from 'react';
import type { EventDetailsDTO } from '@/types';
import { fetchAssociatedEvents, unlinkEventFromFocusGroup } from '../ApiServerActions';
import { FaUnlink } from 'react-icons/fa';
import { formatDateLocal } from '@/lib/date';
import Link from 'next/link';

interface AssociatedEventsTableProps {
  focusGroupId: number;
  initialEvents?: EventDetailsDTO[];
  initialTotalCount?: number;
}

export default function AssociatedEventsTable({
  focusGroupId,
  initialEvents = [],
  initialTotalCount = 0,
}: AssociatedEventsTableProps) {
  const [events, setEvents] = useState<EventDetailsDTO[]>(initialEvents);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState<number | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize);
  const displayPage = currentPage + 1;
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalCount);

  const isPrevDisabled = currentPage === 0 || loading;
  const isNextDisabled = currentPage >= totalPages - 1 || loading;

  const loadEvents = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const sort = 'startDate,desc';
      const result = await fetchAssociatedEvents(focusGroupId, page, pageSize, sort, showPastEvents);
      setEvents(result.events);
      setTotalCount(result.totalCount);
    } catch (err: any) {
      console.error('Failed to load associated events:', err);
      setError('Failed to load events. Please try again.');
      setEvents([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusGroupId, currentPage, showPastEvents]);

  const handlePrevPage = () => {
    if (!isPrevDisabled) {
      setCurrentPage(prev => Math.max(0, prev - 1));
    }
  };

  const handleNextPage = () => {
    if (!isNextDisabled) {
      setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
    }
  };

  const handleUnlink = async (event: EventDetailsDTO) => {
    if (!event.id) return;

    if (!confirm(`Are you sure you want to unlink "${event.title}" from this focus group?`)) {
      return;
    }

    setUnlinkingId(event.id);
    try {
      await unlinkEventFromFocusGroup(event.id, focusGroupId);
      
      // Refresh the events list
      await loadEvents(currentPage);
      
      // If we're on the last page and it becomes empty, go to previous page
      if (events.length === 1 && currentPage > 0) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (err: any) {
      console.error('Failed to unlink event:', err);
      alert(`Failed to unlink event: ${err.message || 'Unknown error'}`);
    } finally {
      setUnlinkingId(null);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Associated Events</h2>
        
        {/* Filter Toggle - admin action button style */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setShowPastEvents(false);
              setCurrentPage(0);
            }}
            className={`flex-shrink-0 h-14 rounded-xl flex items-center justify-center gap-3 px-3 transition-all duration-300 hover:scale-105 ${
              !showPastEvents
                ? 'bg-blue-100 hover:bg-blue-200'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            title="Upcoming Events"
            aria-label="Upcoming Events"
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
              !showPastEvents ? 'bg-blue-200' : 'bg-gray-200'
            }`}>
              <svg className={`w-6 h-6 ${!showPastEvents ? 'text-blue-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className={`font-semibold ${!showPastEvents ? 'text-blue-700' : 'text-gray-700'}`}>
              Upcoming Events
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setShowPastEvents(true);
              setCurrentPage(0);
            }}
            className={`flex-shrink-0 h-14 rounded-xl flex items-center justify-center gap-3 px-3 transition-all duration-300 hover:scale-105 ${
              showPastEvents
                ? 'bg-blue-100 hover:bg-blue-200'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            title="Past Events"
            aria-label="Past Events"
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
              showPastEvents ? 'bg-blue-200' : 'bg-gray-200'
            }`}>
              <svg className={`w-6 h-6 ${showPastEvents ? 'text-blue-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className={`font-semibold ${showPastEvents ? 'text-blue-700' : 'text-gray-700'}`}>
              Past Events
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading && events.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">No events found</p>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-medium">
            [No events match your criteria]
          </span>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/events/${event.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {event.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.startDate ? formatDateLocal(event.startDate) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.endDate ? formatDateLocal(event.endDate) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          event.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {event.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        type="button"
                        onClick={() => handleUnlink(event)}
                        disabled={unlinkingId !== null}
                        className="flex-shrink-0 h-10 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 px-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        title="Unlink event from focus group"
                        aria-label="Unlink event from focus group"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-200 flex items-center justify-center">
                          <FaUnlink className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="font-semibold text-red-700 text-sm">Unlink</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls - matching admin pagination footer style */}
          <div className="mt-8">
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevPage}
                disabled={isPrevDisabled}
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
                  Page <span className="text-blue-600">{displayPage}</span> of <span className="text-blue-600">{totalPages || 1}</span>
                </span>
              </div>
              <button
                onClick={handleNextPage}
                disabled={isNextDisabled}
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
              {totalCount > 0 ? (
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                  <span className="text-sm text-gray-700">
                    Showing <span className="font-bold text-blue-600">{startItem}</span> to <span className="font-bold text-blue-600">{endItem}</span> of <span className="font-bold text-blue-600">{totalCount}</span> events
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-orange-700">No events found</span>
                  <span className="text-sm text-orange-600">[No events match your criteria]</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

