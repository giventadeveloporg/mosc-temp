"use client";
import { useState } from 'react';
import Link from 'next/link';
import type { CalendarEvent } from '../types/calendar.types';
import { EventTooltip } from './EventTooltip';

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day; // Sunday start
  return new Date(date.getFullYear(), date.getMonth(), diff);
}

export function WeekView({ events, anchorDate }: { events: CalendarEvent[]; anchorDate: Date }) {
  const [hoveredEvent, setHoveredEvent] = useState<CalendarEvent | null>(null);
  const [tooltipAnchor, setTooltipAnchor] = useState<DOMRect | null>(null);

  const start = startOfWeek(anchorDate);
  const days = Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  const eventsByDay = new Map<number, CalendarEvent[]>();
  for (const ev of events) {
    const dayNum = Number(ev.startDate.split('-')[2]);
    const arr = eventsByDay.get(dayNum) || [];
    arr.push(ev);
    eventsByDay.set(dayNum, arr);
  }

  const handleEventMouseEnter = (event: CalendarEvent, e: React.MouseEvent<HTMLDivElement>) => {
    setHoveredEvent(event);
    setTooltipAnchor(e.currentTarget.getBoundingClientRect());
  };

  const handleEventMouseLeave = () => {
    setHoveredEvent(null);
    setTooltipAnchor(null);
  };
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((d, idx) => {
        const day = d.getDate();
        const evs = eventsByDay.get(day) || [];
        return (
          <div key={idx} className="min-h-[140px] border rounded-lg p-2 bg-white">
            <div className="text-xs font-semibold text-gray-700">{d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
            <div className="mt-1 flex flex-col gap-1">
              {evs.slice(0, 5).map(event => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="text-xs truncate px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors cursor-pointer"
                  onMouseEnter={(e) => handleEventMouseEnter(event, e)}
                  onMouseLeave={handleEventMouseLeave}
                >
                  {event.title}
                </Link>
              ))}
              {evs.length > 5 && (
                <div className="text-[10px] text-gray-500">+ {evs.length - 5} more</div>
              )}
            </div>
          </div>
        );
      })}
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


