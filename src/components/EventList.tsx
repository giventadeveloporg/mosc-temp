"use client";

import React, { useState, useEffect } from 'react';
import type { EventDetailsDTO, EventTypeDetailsDTO, EventCalendarEntryDTO } from '@/types';
import { FaEdit, FaTrashAlt, FaUpload, FaCalendarDay, FaChevronLeft, FaChevronRight, FaPhotoVideo, FaTicketAlt, FaCopy, FaCheckCircle } from 'react-icons/fa';
import { Modal } from './Modal';
import { getTenantId } from '@/lib/env';
import { formatDateLocal } from '@/lib/date';
import Link from 'next/link';
import ReactDOM from 'react-dom';
import Image from 'next/image';

interface EventListProps {
  events: EventDetailsDTO[];
  eventTypes: EventTypeDetailsDTO[];
  calendarEvents?: EventCalendarEntryDTO[];
  onEdit: (event: EventDetailsDTO) => void;
  onCancel: (event: EventDetailsDTO) => void;
  onHardDelete?: (event: EventDetailsDTO) => void;
  onActivate?: (event: EventDetailsDTO) => void;
  loading?: boolean;
  showDetailsOnHover?: boolean;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  page?: number;
  totalCount?: number;
  pageSize?: number;
  boldEventIdLabel?: boolean;
}

export function EventList({
  events,
  eventTypes: eventTypesProp,
  calendarEvents: calendarEventsProp = [],
  onEdit,
  onCancel,
  onHardDelete,
  onActivate,
  loading,
  showDetailsOnHover = false,
  onPrevPage,
  onNextPage,
  page = 1,
  totalCount = 0,
  pageSize = 10,
  boldEventIdLabel = false
}: EventListProps) {
  const [hoveredEventId, setHoveredEventId] = useState<number | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<EventCalendarEntryDTO[]>(calendarEventsProp);
  const [eventTypes, setEventTypes] = useState<EventTypeDetailsDTO[]>(eventTypesProp || []);
  const [showTicketTypeModal, setShowTicketTypeModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [tooltipEvent, setTooltipEvent] = useState<EventDetailsDTO | null>(null);
  const [tooltipAnchor, setTooltipAnchor] = useState<DOMRect | null>(null);
  const [isZoomingOut, setIsZoomingOut] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Use provided calendar events or fetch if not provided
    if (calendarEventsProp.length > 0) {
      setCalendarEvents(calendarEventsProp);
    } else {
      // Fallback: fetch calendar events if not provided
      const tenantId = getTenantId();
      fetch(`/api/proxy/event-calendar-entries?size=1000&tenantId.equals=${tenantId}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setCalendarEvents(Array.isArray(data) ? data : []));
    }
  }, [calendarEventsProp]);

  useEffect(() => {
    // Use provided event types or fetch if not provided
    if (eventTypesProp && eventTypesProp.length > 0) {
      setEventTypes(eventTypesProp);
    } else {
      // Fallback: fetch event types if not provided
      const tenantId = getTenantId();
      fetch(`/api/proxy/event-type-details?tenantId.equals=${tenantId}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setEventTypes(Array.isArray(data) ? data : []));
    }
  }, [eventTypesProp]);

  // Handle zoom-out effect when loading changes from true to false
  useEffect(() => {
    if (!loading && events.length > 0) {
      // Start zoom-out effect
      setIsZoomingOut(true);

      // After zoom-out animation completes, show content
      const timer = setTimeout(() => {
        setShowContent(true);
        setIsZoomingOut(false);
      }, 500); // Match the zoom-out animation duration

      return () => clearTimeout(timer);
    } else if (loading) {
      // Reset states when loading starts
      setShowContent(false);
      setIsZoomingOut(false);
    }
  }, [loading, events.length]);

  function getEventTypeName(event: EventDetailsDTO) {
    if (event?.eventType?.name) return event.eventType.name;
    if (event?.eventType?.id != null) {
      const found = eventTypes.find(et => et.id === event.eventType?.id);
      if (found) return found.name;
    }
    return '';
  }

  function getCalendarEventForEvent(eventId?: number) {
    if (!eventId) return undefined;
    return calendarEvents.find(ce => ce.event && ce.event.id === eventId);
  }

  function toGoogleCalendarDate(date: string, time: string) {
    if (!date || !time) return '';
    const [year, month, day] = date.split('-');
    let [hour, minute] = time.split(':');
    let ampm = '';
    if (minute && minute.includes(' ')) {
      [minute, ampm] = minute.split(' ');
    }
    let h = parseInt(hour, 10);
    if (ampm && ampm.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (ampm && ampm.toUpperCase() === 'AM' && h === 12) h = 0;
    return `${year}${month}${day}T${String(h).padStart(2, '0')}${minute}00`;
  }

  function EventDetailsTooltip({ event, anchorRect, onClose }: { event: EventDetailsDTO, anchorRect: DOMRect | null, onClose: () => void }) {
    if (!anchorRect) return null;
    if (typeof window === 'undefined' || !document.body) return null;
    const tooltipWidth = 420;
    const spacing = 12;
    let top = anchorRect.top;
    let left = anchorRect.right + spacing;
    const estimatedHeight = 300;
    if (top + estimatedHeight > window.innerHeight) {
      top = window.innerHeight - estimatedHeight - spacing;
    }
    if (top < spacing) {
      top = spacing;
    }
    if (left + tooltipWidth > window.innerWidth) {
      left = window.innerWidth - tooltipWidth - spacing;
    }
    const style: React.CSSProperties = {
      position: 'fixed',
      top,
      left,
      zIndex: 9999,
      background: 'white',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: '#cbd5e1',
      borderRadius: 12,
      boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      padding: 16,
      width: tooltipWidth,
      fontSize: 14,
      maxHeight: 400,
      overflowY: 'auto',
      transition: 'opacity 0.1s ease-in-out',
    };
    return ReactDOM.createPortal(
      <div style={style} tabIndex={-1} className="admin-tooltip">
        <div className="sticky top-0 right-0 z-10 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="w-10 h-10 text-2xl bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
            aria-label="Close tooltip"
          >
            &times;
          </button>
        </div>
        <table className="w-full text-sm border border-gray-300">
          <tbody>
            {Object.entries(event).map(([key, value]) => {
              let displayValue: string | number = '';
              if ((key === 'createdBy' || key === 'eventType') && value && typeof value === 'object' && 'id' in value) {
                displayValue = value.id;
              } else if (typeof value === 'object' && value !== null) {
                displayValue = JSON.stringify(value);
              } else {
                displayValue = String(value);
              }
              return (
                <tr key={key} className="border-b border-gray-200">
                  <td className="font-bold pr-4 border-r border-gray-200 align-top">{key}:</td>
                  <td className="align-top break-all">{displayValue}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>,
      document.body
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[600px] w-full">
        <div className="relative w-full max-w-6xl">
          <Image
            src="/images/loading_events.jpg"
            alt="Loading events..."
            width={800}
            height={600}
            className="w-full h-auto rounded-lg shadow-2xl animate-pulse zoom-loading"
            priority
          />
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <div className="wavy-animation"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isZoomingOut) {
    return (
      <div className="flex justify-center items-center min-h-[600px] w-full">
        <div className="relative w-full max-w-6xl">
          <Image
            src="/images/loading_events.jpg"
            alt="Loading events..."
            width={800}
            height={600}
            className="w-full h-auto rounded-lg shadow-2xl zoom-out"
            priority
          />
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <div className="wavy-animation"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!showContent) {
    return null; // Don't show anything during transition
  }

  // EventList uses 1-based page indexing by default, but manage-events uses 0-based
  // Convert to 0-based for calculations if page is 0 (indicating 0-based indexing)
  const isZeroBased = page === 0;
  const currentPageZeroBased = isZeroBased ? page : page - 1;
  const displayPage = isZeroBased ? page + 1 : page; // Display as 1-based

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const isPrevDisabled = currentPageZeroBased === 0 || loading;
  const isNextDisabled = currentPageZeroBased >= totalPages - 1 || loading;

  const startItem = totalCount > 0 ? currentPageZeroBased * pageSize + 1 : 0;
  const endItem = totalCount > 0 ? currentPageZeroBased * pageSize + Math.min(pageSize, totalCount - currentPageZeroBased * pageSize) : 0;

  const handleTooltipClose = () => setTooltipEvent(null);

  return (
    <>
      {events.length > 0 && (
        <div className="mb-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded px-4 py-2">
          Mouse over the first 3 columns to see the full details about the event. Use the × button to close the tooltip once you have viewed the details.
        </div>
      )}
      {events.length > 0 ? (
        <table
        className="w-full border text-sm relative bg-white rounded shadow-md"
      >
        <thead>
          <tr className="bg-blue-100 font-bold border-b-2 border-blue-300">
            <th className="p-2 border" rowSpan={2}>Event Info</th>
            <th className="p-2 border" rowSpan={2}>Type</th>
            <th className="p-2 border" rowSpan={2}>Dates</th>
            <th className="p-2 border" rowSpan={2}>Active</th>
            <th className="p-2 border" rowSpan={2}>Edit/View</th>
            <th className="p-2 border" colSpan={2}>Delete Actions</th>
            <th className="p-2 border" rowSpan={2}>Media</th>
            <th className="p-2 border" rowSpan={2}>Upload</th>
            <th className="p-2 border" rowSpan={2}>Calendar</th>
            <th className="p-2 border" rowSpan={2}>Tickets</th>
          </tr>
          <tr className="bg-blue-50 font-bold border-b border-blue-200">
            <th className="p-2 border text-xs font-bold text-center">Deactivate</th>
            <th className="p-2 border text-xs font-bold text-center">Hard Delete</th>
          </tr>
        </thead>
        <tbody>
          {events.map(event => {
            const isActive = !!event.isActive;
            const rowBg = isActive ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100';
            const calendarEvent = getCalendarEventForEvent(event.id);
            return (
              <tr
                key={event.id}
                className={`${rowBg} transition-colors duration-150 border-b border-gray-300`}
                style={{ position: 'relative' }}
              >
                <td
                  className="p-2 border font-medium align-middle"
                  onMouseEnter={e => {
                    if (showDetailsOnHover) {
                      setTooltipEvent(event);
                      setTooltipAnchor((e.currentTarget as HTMLElement).getBoundingClientRect());
                    }
                  }}
                >
                  <div className="text-xs text-gray-500" style={boldEventIdLabel ? { fontWeight: 700 } : {}}>
                    {boldEventIdLabel ? <b>Event ID:</b> : 'Event ID:'} {event.id}
                  </div>
                  {/* Parent/Child Event Indicator */}
                  {event.parentEventId == null ? (
                    <div className="mt-1 mb-1">
                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded border border-purple-300">
                        📅 Parent Event
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1 mb-1">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded border border-blue-300">
                        🔗 Child Event
                      </span>
                      <div className="text-xs text-gray-600 mt-1">
                        Parent ID: {event.parentEventId}
                      </div>
                    </div>
                  )}
                  <div><span className="font-bold">Title:</span> {event.title}</div>
                  <div className="mt-2">
                    <Link
                      href={`/admin/events/new?copyFrom=${event.id}`}
                      className="inline-flex items-center gap-1 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded shadow-sm transition-colors"
                      title="Copy this event to create a new one"
                    >
                      <FaCopy className="w-3 h-3" />
                      Copy event
                    </Link>
                  </div>
                </td>
                <td
                  className="p-2 border align-middle"
                  onMouseEnter={e => {
                    if (showDetailsOnHover) {
                      setTooltipEvent(event);
                      setTooltipAnchor((e.currentTarget as HTMLElement).getBoundingClientRect());
                    }
                  }}
                >
                  {getEventTypeName(event) || <span className="text-gray-400 italic">Unknown</span>}
                </td>
                <td
                  className="p-2 border align-middle w-32"
                  onMouseEnter={e => {
                    if (showDetailsOnHover) {
                      setTooltipEvent(event);
                      setTooltipAnchor((e.currentTarget as HTMLElement).getBoundingClientRect());
                    }
                  }}
                >
                  {(() => {
                    // Format date to show first 3 letters of month (e.g., "Nov 20, 2025")
                    // Parse date string directly to avoid timezone conversion issues
                    const formatShortDate = (dateStr: string) => {
                      if (!dateStr) return '';
                      // Parse YYYY-MM-DD format directly without timezone conversion
                      const [year, month, day] = dateStr.split('-').map(Number);
                      if (!year || !month || !day) return dateStr;
                      // Create date in local timezone to avoid UTC conversion
                      const date = new Date(year, month - 1, day);
                      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      const monthName = months[date.getMonth()];
                      const dayNum = date.getDate();
                      const yearNum = date.getFullYear();
                      return `${monthName} ${dayNum}, ${yearNum}`;
                    };
                    return (
                      <>
                        <div className="text-xs">
                          <span className="font-semibold">{formatShortDate(event.startDate)}</span>
                          <div className="text-gray-600">{event.startTime}</div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">to</div>
                        <div className="text-xs">
                          <span className="font-semibold">{formatShortDate(event.endDate)}</span>
                          <div className="text-gray-600">{event.endTime}</div>
                        </div>
                      </>
                    );
                  })()}
                </td>
                <td className="p-2 border text-center align-middle">
                  <div className="flex flex-col gap-2 items-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                      {isActive ? 'Yes' : 'No'}
                    </span>
                    {!isActive && onActivate && (
                      <button
                        className="relative inline-flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded border-2 border-green-800 shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        style={{
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.3)',
                          borderStyle: 'outset',
                        }}
                        onClick={() => onActivate(event)}
                        disabled={isActive}
                        title={isActive ? "Event is already active" : "Activate event"}
                      >
                        <div className="flex items-center gap-1.5">
                          <FaCheckCircle className="w-4 h-4" />
                          <span>Activate</span>
                        </div>
                      </button>
                    )}
                  </div>
                </td>
                <td className="p-2 border text-center align-middle">
                  <a
                    href={`/admin/events/${event.id}/edit`}
                    className="flex flex-col items-center text-blue-600 hover:text-blue-800 focus:outline-none inline-block w-full h-full"
                    onClick={(e) => {
                      // Allow default behavior (navigation) but also call onEdit for backward compatibility
                      onEdit(event);
                    }}
                  >
                    <FaEdit className="w-7 h-7" />
                    <span className="text-[10px] text-gray-600 mt-1 block font-bold">Edit/View,<br />Event Details</span>
                  </a>
                </td>
                {/* Deactivate Button Cell */}
                <td className="p-2 border text-center align-middle">
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="border-2 border-orange-400 rounded p-1.5 bg-amber-100" style={{
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.2)',
                      borderStyle: 'inset',
                    }}>
                      <button
                        className="flex flex-col items-center text-orange-700 hover:text-orange-900 focus:outline-none w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400"
                        onClick={() => onCancel(event)}
                        disabled={!isActive}
                        title={isActive ? "Deactivate event (soft delete)" : "Event is already inactive"}
                      >
                        <FaTrashAlt className="w-5 h-5" />
                        <span className="text-[9px] text-gray-700 mt-1 block font-bold">Deactivate</span>
                      </button>
                    </div>
                  </div>
                </td>
                {/* Hard Delete Button Cell */}
                <td className="p-2 border text-center align-middle">
                  <div className="flex flex-col items-center justify-center h-full">
                    {onHardDelete ? (
                      <div className="border-2 border-red-500 rounded p-1.5 bg-rose-200" style={{
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.2)',
                        borderStyle: 'inset',
                      }}>
                        <button
                          className="flex flex-col items-center text-red-700 hover:text-red-900 focus:outline-none w-full"
                          onClick={() => onHardDelete(event)}
                          title="Permanently delete event (hard delete)"
                        >
                          <FaTrashAlt className="w-5 h-5" />
                          <span className="text-[9px] text-gray-700 mt-1 block font-bold">Hard Delete</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </div>
                </td>
                <td className="p-2 border text-center align-middle">
                  <span className="relative group flex flex-col items-center">
                    <a href={`/admin/events/${event.id}/media/list`} className="inline-block w-full h-full">
                      <FaPhotoVideo className="text-green-600 hover:text-green-800 mx-auto w-7 h-7" />
                      <span className="text-[10px] text-gray-600 mt-1 block font-bold">List Media files</span>
                    </a>
                  </span>
                </td>
                <td className="p-2 border text-center align-middle">
                  <a href={`/admin/events/${event.id}/media`} className="inline-block w-full h-full">
                    <FaUpload className="text-blue-600 hover:text-blue-800 mx-auto w-7 h-7" />
                    <span className="text-[10px] text-gray-600 mt-1 block font-bold">Upload<br />Media Files</span>
                  </a>
                </td>
                <td className="p-2 border text-center align-middle">
                  <span className="relative group flex flex-col items-center">
                    {(() => {
                      let calendarLink = '';
                      if (calendarEvent && calendarEvent.calendarLink) {
                        calendarLink = calendarEvent.calendarLink;
                      } else {
                        // Generate Google Calendar URL on the fly
                        const start = toGoogleCalendarDate(event.startDate, event.startTime);
                        const end = toGoogleCalendarDate(event.endDate, event.endTime);
                        const text = encodeURIComponent(event.title);
                        const details = encodeURIComponent(event.description || '');
                        const location = encodeURIComponent(event.location || '');
                        calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
                      }
                      return (
                        <a href={calendarLink} target="_blank" rel="noopener noreferrer" className="inline-block w-full h-full">
                          <img src="/images/icons8-calendar.gif" alt="Calendar" className="w-7 h-7 rounded shadow mx-auto" />
                          <span className="text-[10px] text-gray-600 mt-1 block">View Calendar</span>
                        </a>
                      );
                    })()}
                  </span>
                </td>
                <td className="p-2 border text-center align-middle">
                  {event.admissionType === 'ticketed' ? (
                    <Link href={`/admin/events/${event.id}/ticket-types/list`} className="inline-block w-full h-full">
                      <FaTicketAlt className="text-blue-600 hover:text-blue-800 mx-auto w-7 h-7" />
                      <span className="text-[10px] text-gray-600 mt-1 block font-bold">Manage<br />Ticket Types</span>
                    </Link>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>

                {showDetailsOnHover && hoveredEventId === event.id && (
                  <td
                    colSpan={8}
                    style={{ position: 'absolute', left: 10, top: '50%', zIndex: 10, width: '100%' }}
                  >
                    <div className="bg-white border rounded shadow-lg p-6 text-xs w-max max-w-2xl mx-auto mt-2 relative max-h-96 overflow-auto">
                      <button
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg font-bold focus:outline-none"
                        onClick={() => setHoveredEventId(null)}
                        aria-label="Close tooltip"
                      >
                        &times;
                      </button>
                      <table className="w-full text-sm border border-gray-300">
                        <tbody>
                          {Object.entries(event).map(([key, value]) => {
                            let displayValue: string | number = '';
                            if ((key === 'createdBy' || key === 'eventType') && value && typeof value === 'object' && 'id' in value) {
                              displayValue = value.id;
                            } else if (typeof value === 'object' && value !== null) {
                              displayValue = JSON.stringify(value);
                            } else {
                              displayValue = String(value);
                            }
                            return (
                              <tr key={key} className="border-b border-gray-200">
                                <td className="font-bold pr-4 border-r border-gray-200 align-top">{key}:</td>
                                <td className="align-top break-all">{displayValue}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg font-medium mb-2">No events found</p>
          <p className="text-sm">No events match your current search criteria.</p>
        </div>
      )}

      {/* Pagination Controls - Always visible, matching admin page style */}
      <div className="mt-8">
        <div className="flex justify-between items-center">
          <button
            onClick={onPrevPage}
            disabled={isPrevDisabled}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <FaChevronLeft className="h-5 w-5" />
            Previous
          </button>
          <div className="text-sm font-semibold text-gray-700">
            Page {displayPage} of {totalPages}
          </div>
          <button
            onClick={onNextPage}
            disabled={isNextDisabled}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            Next
            <FaChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="text-center text-sm text-gray-600 mt-2">
          {totalCount > 0 ? (
            <>Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of <span className="font-medium">{totalCount}</span> events</>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>No events found</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-medium">
                [No events match your criteria]
              </span>
            </div>
          )}
        </div>
      </div>

      {tooltipEvent && (
        <EventDetailsTooltip event={tooltipEvent} anchorRect={tooltipAnchor} onClose={handleTooltipClose} />
      )}
    </>
  );
}