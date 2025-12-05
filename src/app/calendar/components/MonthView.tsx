"use client";
import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { CalendarEvent } from '../types/calendar.types';
import { EventTooltip } from './EventTooltip';

function getDays(year: number, month: number) {
  const first = new Date(year, month - 1, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = [] as { day: number | null }[];
  for (let i = 0; i < startDay; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });
  while (cells.length % 7 !== 0) cells.push({ day: null });
  return cells;
}

export function MonthView({ events, year, month }: { events: CalendarEvent[]; year: number; month: number }) {
  const [hoveredEvent, setHoveredEvent] = useState<CalendarEvent | null>(null);
  const [tooltipAnchor, setTooltipAnchor] = useState<DOMRect | null>(null);

  const cells = useMemo(() => getDays(year, month), [year, month]);
  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    for (const ev of events) {
      const day = Number(ev.startDate.split('-')[2]);
      if (!Number.isFinite(day)) continue;
      const arr = map.get(day) || [];
      arr.push(ev);
      map.set(day, arr);
    }
    return map;
  }, [events]);

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
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(h => (
        <div key={h} className="text-xs font-semibold text-gray-500 text-center py-2">{h}</div>
      ))}
      {cells.map((c, idx) => {
        const evs = c.day ? (eventsByDay.get(c.day) || []) : [];
        // Build date string for day view link (YYYY-MM-DD format)
        const dateStr = c.day ? `${year}-${String(month).padStart(2, '0')}-${String(c.day).padStart(2, '0')}` : null;
        return (
          <div key={idx} className="min-h-[100px] border rounded-lg p-2 bg-white">
            <div className="text-xs font-semibold text-gray-700">{c.day ?? ''}</div>
            <div className="mt-1 flex flex-col gap-1">
              {evs.slice(0, 3).map(event => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="text-xs truncate px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                  onMouseEnter={(e) => handleEventMouseEnter(event, e)}
                  onMouseLeave={handleEventMouseLeave}
                >
                  {event.title}
                </Link>
              ))}
              {evs.length > 3 && dateStr && (
                <Link
                  href={`/calendar?view=day&date=${dateStr}`}
                  className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
                >
                  + {evs.length - 3} more
                </Link>
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


