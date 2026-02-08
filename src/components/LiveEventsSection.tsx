'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatInTimeZone } from 'date-fns-tz';
import type { EventDetailsDTO, EventMediaDTO } from '@/types';
import { useFilteredEvents } from '@/hooks/useFilteredEvents';

interface LiveEventWithMedia {
  event: EventDetailsDTO;
  media: EventMediaDTO;
}

const LiveEventsSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { filteredEvents, isLoading, error } = useFilteredEvents('live');

  // Helper to generate Google Calendar URL
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
    return `${year}${month}${day}T${String(h).padStart(2, '0')}${minute || '00'}00`;
  }

  // Show section after hero section is loaded (2 second delay)
  useEffect(() => {
    if (!isLoading && filteredEvents.length > 0) {
      setTimeout(() => {
        setIsVisible(true);
      }, 2000);
    }
  }, [isLoading, filteredEvents.length]);

  // Don't render anything if loading or no events
  if (isLoading || !isVisible || filteredEvents.length === 0) {
    return null;
  }

  return (
    <section className="pt-0 md:pt-0 pb-0 md:pb-0.5 bg-gradient-to-r from-red-50 to-orange-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Live Events Strip */}
        <div className="space-y-4 md:space-y-6">
          {filteredEvents.map((liveEvent, index) => (
            <div
              key={liveEvent.event.id}
              className="bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden h-auto md:h-[200px]"
            >
              <div className="flex flex-col md:flex-row h-full">
                {/* Left Column - Event Image (70% width on desktop, full width on mobile) */}
                <div className="w-full md:w-[70%] h-48 md:h-full relative overflow-hidden rounded-t-2xl md:rounded-t-none md:rounded-l-2xl">
                  {liveEvent.media.fileUrl ? (
                    <Image
                      src={liveEvent.media.fileUrl}
                      alt={liveEvent.media.altText || liveEvent.event.title}
                      fill
                      className="object-cover"
                      style={{
                        backgroundColor: 'transparent'
                      }}
                      priority={index === 0}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">No image available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Event Details - Editorial refined design */}
                <div className="w-full md:w-[30%] p-5 md:p-6 flex flex-col justify-between bg-gradient-to-br from-slate-50 via-white to-amber-50/30 rounded-b-2xl md:rounded-b-none md:rounded-r-2xl relative overflow-hidden">
                  {/* Subtle decorative accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/40 to-transparent rounded-bl-full pointer-events-none" />

                  <div className="relative z-10 space-y-4">
                    {/* Event Title */}
                    <h3 className="text-lg md:text-xl font-bold text-slate-800 line-clamp-2 leading-snug tracking-tight">
                      {liveEvent.event.title}
                    </h3>

                    {/* Event Meta - Clean vertical stack */}
                    <div className="space-y-2.5">
                      {/* Date */}
                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                          <svg className="w-4.5 h-4.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium">
                          {liveEvent.event.timezone
                            ? formatInTimeZone(liveEvent.event.startDate, liveEvent.event.timezone, 'EEE, MMM d, yyyy')
                            : new Date(liveEvent.event.startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                          }
                        </span>
                      </div>

                      {/* Time */}
                      {liveEvent.event.startTime && (
                        <div className="flex items-center gap-3 text-slate-600">
                          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                            <svg className="w-4.5 h-4.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium">{liveEvent.event.startTime}</span>
                        </div>
                      )}

                      {/* Location */}
                      {liveEvent.event.location && (
                        <div className="flex items-center gap-3 text-slate-600">
                          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                            <svg className="w-4.5 h-4.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium truncate">{liveEvent.event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons - Bottom aligned */}
                  <div className="relative z-10 pt-4 flex flex-col sm:flex-row gap-2.5 mt-auto">
                    {/* Primary CTA */}
                    <Link
                      href={`/events/${liveEvent.event.id}`}
                      className="group flex-1 h-11 rounded-xl bg-slate-800 hover:bg-slate-900 flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
                      title="View Details"
                      aria-label="View Event Details"
                    >
                      <svg className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="font-semibold text-sm text-white">View Details</span>
                    </Link>

                    {/* Add to Calendar - Secondary */}
                    {(() => {
                      const currentDate = new Date();
                      currentDate.setHours(0, 0, 0, 0);
                      const eventDate = liveEvent.event.startDate ? new Date(liveEvent.event.startDate) : null;
                      if (eventDate) eventDate.setHours(0, 0, 0, 0);
                      const isUpcoming = eventDate && eventDate >= currentDate;

                      if (!isUpcoming || !liveEvent.event.startDate || !liveEvent.event.startTime) return null;

                      const start = toGoogleCalendarDate(liveEvent.event.startDate, liveEvent.event.startTime);
                      const end = toGoogleCalendarDate(liveEvent.event.endDate || liveEvent.event.startDate, liveEvent.event.endTime || liveEvent.event.startTime);
                      const text = encodeURIComponent(liveEvent.event.title);
                      const details = encodeURIComponent(liveEvent.event.description || '');
                      const location = encodeURIComponent(liveEvent.event.location || '');
                      const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;

                      return (
                        <a
                          href={calendarLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-11 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-sm font-medium border border-slate-200 hover:border-slate-300 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Calendar</span>
                        </a>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveEventsSection;
