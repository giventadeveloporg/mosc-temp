"use client";
import { useState } from 'react';
import Link from 'next/link';
import type { CalendarEvent } from '../types/calendar.types';
import { EventTooltip } from './EventTooltip';

export function DayView({ events, date }: { events: CalendarEvent[]; date: Date }) {
  const [hoveredEvent, setHoveredEvent] = useState<CalendarEvent | null>(null);
  const [tooltipAnchor, setTooltipAnchor] = useState<DOMRect | null>(null);

  const day = date.getDate();
  const todays = events.filter(e => Number(e.startDate.split('-')[2]) === day);

  const handleEventMouseEnter = (event: CalendarEvent, e: React.MouseEvent<HTMLDivElement>) => {
    setHoveredEvent(event);
    setTooltipAnchor(e.currentTarget.getBoundingClientRect());
  };

  const handleEventMouseLeave = () => {
    setHoveredEvent(null);
    setTooltipAnchor(null);
  };
  return (
    <div className="border rounded-lg bg-white p-4">
      <div className="text-sm font-semibold text-gray-700 mb-2">{date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      <div className="flex flex-col gap-2">
        {todays.length === 0 && <div className="text-sm text-gray-500">No events scheduled.</div>}
        {todays.map(event => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="block rounded border px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
            onMouseEnter={(e) => handleEventMouseEnter(event, e)}
            onMouseLeave={handleEventMouseLeave}
          >
            <div className="text-sm font-semibold text-gray-800">{event.title}</div>
            <div className="text-xs text-gray-500">{event.startTime} - {event.endTime} • {event.location ?? 'TBA'}</div>
          </Link>
        ))}
      </div>
      {hoveredEvent && (
        <EventTooltip
          event={hoveredEvent}
          anchorRect={tooltipAnchor}
          onClose={handleEventMouseLeave}
        />
      )}
    </div>
  );
}


