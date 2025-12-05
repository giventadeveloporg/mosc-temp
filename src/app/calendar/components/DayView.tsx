"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { CalendarEvent } from '../types/calendar.types';
import { EventTooltip } from './EventTooltip';

export function DayView({ events, date }: { events: CalendarEvent[]; date: Date }) {
  const [hoveredEvent, setHoveredEvent] = useState<CalendarEvent | null>(null);
  const [tooltipAnchor, setTooltipAnchor] = useState<DOMRect | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Format date as YYYY-MM-DD for comparison
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const todays = events.filter(e => e.startDate === dateStr);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const handleEventMouseEnter = (event: CalendarEvent, e: React.MouseEvent<HTMLElement>) => {
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setHoveredEvent(event);
    setTooltipAnchor(e.currentTarget.getBoundingClientRect());
  };

  const handleEventMouseLeave = () => {
    // Add a small delay before hiding to prevent flickering when moving to tooltip
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredEvent(null);
      setTooltipAnchor(null);
    }, 100);
  };

  const handleTooltipMouseEnter = () => {
    // Clear hide timeout when mouse enters tooltip
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleTooltipMouseLeave = () => {
    setHoveredEvent(null);
    setTooltipAnchor(null);
  };
  return (
    <div className="border rounded-lg bg-white p-4">
      <div className="text-sm font-semibold text-gray-700 mb-2">{date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      <div className="flex flex-col gap-2">
        {todays.length === 0 && <div className="text-sm text-gray-500">No events scheduled.</div>}
        {todays.map(event => (
          <div
            key={event.id}
            className="block rounded border px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
            onMouseEnter={(e) => handleEventMouseEnter(event, e)}
            onMouseLeave={handleEventMouseLeave}
          >
            <Link
              href={`/events/${event.id}`}
              className="block"
            >
              <div className="text-sm font-semibold text-gray-800">{event.title}</div>
              <div className="text-xs text-gray-500">{event.startTime} - {event.endTime} • {event.location ?? 'TBA'}</div>
            </Link>
          </div>
        ))}
      </div>
      {hoveredEvent && (
        <EventTooltip
          event={hoveredEvent}
          anchorRect={tooltipAnchor}
          onClose={handleTooltipMouseLeave}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        />
      )}
    </div>
  );
}


