"use client";
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { CalendarEventDTO } from './ApiServerActions';
import { fetchEventsForMonthServer } from './ApiServerActions';
import { toCalendarEvents } from './utils/eventFormatters';
import { ViewSwitcher } from './components/ViewSwitcher';
import { CalendarPagination } from './components/CalendarPagination';
import { MonthView } from './components/MonthView';
import { WeekView } from './components/WeekView';
import { DayView } from './components/DayView';
import { useCalendarNav } from './hooks/useCalendarNav';

export default function CalendarClient({
  initialEvents,
  initialYear,
  initialMonth,
  focusGroup,
  initialView = 'month',
  initialDate = new Date()
}: {
  initialEvents: CalendarEventDTO[];
  initialYear: number;
  initialMonth: number;
  focusGroup?: string;
  initialView?: 'month' | 'week' | 'day';
  initialDate?: Date;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [events, setEvents] = useState(toCalendarEvents(initialEvents));
  const [loading, setLoading] = useState(false);

  // Read view and date from URL params
  const urlView = (searchParams.get('view') as 'month' | 'week' | 'day' | null) || initialView;
  const urlDateStr = searchParams.get('date');

  // Parse date string (YYYY-MM-DD) properly to avoid timezone issues
  let currentDate = initialDate;
  if (urlDateStr) {
    try {
      // Parse YYYY-MM-DD format directly to avoid timezone conversion
      const [year, month, day] = urlDateStr.split('-').map(Number);
      if (year && month && day) {
        currentDate = new Date(year, month - 1, day);
      }
    } catch (e) {
      // Invalid date, use initialDate
    }
  }

  // Ensure date is valid
  if (isNaN(currentDate.getTime())) {
    currentDate = initialDate;
  }

  // Determine year/month from current date or URL params
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const nav = useCalendarNav(initialYear, initialMonth);

  // Update view when URL params change
  useEffect(() => {
    if (urlView && urlView !== nav.view) {
      nav.setView(urlView);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlView, searchParams]);

  // Update year/month when date changes (for day view)
  useEffect(() => {
    if (urlView === 'day') {
      if (currentYear !== nav.year || currentMonth !== nav.month) {
        nav.setYear(currentYear);
        nav.setMonth(currentMonth);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear, currentMonth, urlView, urlDateStr]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchEventsForMonthServer(nav.year, nav.month, focusGroup);
        setEvents(toCalendarEvents(data));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [nav.year, nav.month, focusGroup]);

  // Handle view change with URL update
  const handleViewChange = (newView: 'month' | 'week' | 'day') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', newView);
    if (newView === 'day' && !params.has('date')) {
      const today = new Date();
      params.set('date', `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
    }
    router.push(`/calendar?${params.toString()}`);
  };

  // Handle navigation with URL update
  const handlePrev = () => {
    if (nav.view === 'day') {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      const dateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
      router.push(`/calendar?view=day&date=${dateStr}`);
    } else {
      nav.prev();
    }
  };

  const handleNext = () => {
    if (nav.view === 'day') {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
      const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
      router.push(`/calendar?view=day&date=${dateStr}`);
    } else {
      nav.next();
    }
  };

  const handleToday = () => {
    const today = new Date();
    if (nav.view === 'day') {
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      router.push(`/calendar?view=day&date=${dateStr}`);
    } else {
      nav.today();
    }
  };

  // Use urlView for rendering to ensure it updates immediately when URL changes
  const displayView = urlView || nav.view;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-xl font-semibold text-gray-900">
          {displayView === 'day'
            ? currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
            : new Date(nav.year, nav.month - 1, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })
          }
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrev} className="px-3 py-2 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">Previous</button>
          <button onClick={handleToday} className="px-3 py-2 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">Today</button>
          <button onClick={handleNext} className="px-3 py-2 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">Next</button>
        </div>
      </div>
      <ViewSwitcher view={displayView} onChange={handleViewChange} />
      {loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : (
        <>
          {displayView === 'month' && <MonthView events={events} year={nav.year} month={nav.month} />}
          {displayView === 'week' && (
            <WeekView events={events} anchorDate={new Date(nav.year, nav.month - 1, 1)} />
          )}
          {displayView === 'day' && (
            <DayView events={events} date={currentDate} />
          )}
        </>
      )}
      <CalendarPagination
        totalCount={events.length}
        onPrevMonth={handlePrev}
        onNextMonth={handleNext}
        view={displayView}
      />
    </div>
  );
}


