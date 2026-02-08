'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatInTimeZone } from 'date-fns-tz';
import type { EventDetailsDTO, EventMediaDTO } from '@/types';
import { useFilteredEvents } from '@/hooks/useFilteredEvents';
import { getOverlayInfo } from '@/lib/heroOverlay';

interface FeaturedEventWithMedia {
  event: EventDetailsDTO;
  media: EventMediaDTO;
}

const MAX_FEATURED_EVENTS = 3;

const FeaturedEventsSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { filteredEvents, isLoading, error } = useFilteredEvents('featured');
  const displayedEvents = filteredEvents.slice(0, MAX_FEATURED_EVENTS);

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

  // Show section after hero section is loaded (same timing as HeroSection)
  useEffect(() => {
    if (!isLoading && filteredEvents.length > 0) {
      setTimeout(() => {
        setIsVisible(true);
      }, 2000);
    }
  }, [isLoading, filteredEvents.length]);

  // Don't render anything if loading or no featured events
  if (isLoading || filteredEvents.length === 0) {
    return null;
  }

  // Don't render if not visible yet
  if (!isVisible) {
    return null;
  }

  return (
    <section className="py-0 md:py-0.5 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Featured Events
          </h2>
        </div>

        {/* Featured Events Strip - max 3 */}
        <div className="space-y-4 md:space-y-6">
          {displayedEvents.map((featuredEvent, index) => (
            <div
              key={featuredEvent.event.id}
              className="bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden h-auto md:min-h-[180px] md:max-h-[220px]"
            >
              <div className="flex flex-col md:flex-row md:h-full">
                {/* Left Column - Featured Event Image (55% width on desktop) */}
                <div className="w-full md:w-[55%] h-48 md:h-full md:min-h-[180px] relative overflow-hidden rounded-t-2xl md:rounded-t-none md:rounded-l-2xl">
                  {featuredEvent.media.fileUrl ? (
                    <Image
                      src={featuredEvent.media.fileUrl}
                      alt={featuredEvent.media.altText || featuredEvent.event.title}
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">No image available</p>
                      </div>
                    </div>
                  )}

                  {/* Featured Event Badge Overlay */}
                  <div className="absolute top-2 left-2 md:top-3 md:left-3">
                    <div className="flex items-center space-x-1.5 bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wide">
                        Featured Event
                      </span>
                    </div>
                  </div>

                  {/* Buy Ticket / Fundraiser overlay - bottom right (same logic as hero) */}
                  {(() => {
                    const overlay = getOverlayInfo(featuredEvent.event);
                    if (!overlay) return null;
                    return (
                      <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 z-10 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                        <Link
                          href={overlay.href}
                          className="block cursor-pointer hover:scale-105 transition-transform duration-300"
                          onClick={(e) => e.stopPropagation()}
                          title={overlay.alt}
                          aria-label={overlay.alt}
                        >
                          <img
                            src={overlay.image}
                            alt={overlay.alt}
                            className="object-contain w-[100px] h-[34px] sm:w-[120px] sm:h-[42px] md:w-[130px] md:h-[44px]"
                          />
                        </Link>
                      </div>
                    );
                  })()}
                </div>

                {/* Right Column - Event Details - Editorial refined design */}
                <div className="w-full md:w-[45%] min-w-0 p-4 md:p-5 flex flex-col justify-between bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 rounded-b-2xl md:rounded-b-none md:rounded-r-2xl relative overflow-hidden">
                  {/* Subtle decorative accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-100/40 to-transparent rounded-bl-full pointer-events-none" />

                  <div className="relative z-10 space-y-3">
                    {/* Event Title */}
                    <h3 className="text-base md:text-lg font-bold text-slate-800 line-clamp-2 leading-snug tracking-tight">
                      {featuredEvent.event.title}
                    </h3>

                    {/* Event Meta - Clean compact layout */}
                    <div className="space-y-2">
                      {/* Date */}
                      <div className="flex items-center gap-2.5 text-slate-600">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-xs md:text-sm font-medium truncate">
                          {featuredEvent.event.timezone
                            ? formatInTimeZone(featuredEvent.event.startDate, featuredEvent.event.timezone, 'EEE, MMM d, yyyy')
                            : new Date(featuredEvent.event.startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                          }
                        </span>
                      </div>

                      {/* Time */}
                      {featuredEvent.event.startTime && (
                        <div className="flex items-center gap-2.5 text-slate-600">
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-xs md:text-sm font-medium">{featuredEvent.event.startTime}</span>
                        </div>
                      )}

                      {/* Location */}
                      {featuredEvent.event.location && (
                        <div className="flex items-center gap-2.5 text-slate-600">
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <span className="text-xs md:text-sm font-medium truncate">{featuredEvent.event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="relative z-10 pt-3 flex flex-wrap gap-2 mt-auto">
                    {/* Primary CTA */}
                    <Link
                      href={`/events/${featuredEvent.event.id}`}
                      className="group flex-1 min-w-[120px] h-9 rounded-lg bg-slate-800 hover:bg-slate-900 flex items-center justify-center gap-1.5 transition-all duration-300 shadow-sm hover:shadow-md"
                      title="View Details"
                      aria-label="View Event Details"
                    >
                      <svg className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="font-semibold text-xs text-white">View Details</span>
                    </Link>

                    {/* Add to Calendar - Secondary */}
                    {(() => {
                      const currentDate = new Date();
                      currentDate.setHours(0, 0, 0, 0);
                      const eventDate = featuredEvent.event.startDate ? new Date(featuredEvent.event.startDate) : null;
                      if (eventDate) eventDate.setHours(0, 0, 0, 0);
                      const isUpcoming = eventDate && eventDate >= currentDate;

                      if (!isUpcoming || !featuredEvent.event.startDate || !featuredEvent.event.startTime) return null;

                      const start = toGoogleCalendarDate(featuredEvent.event.startDate, featuredEvent.event.startTime);
                      const end = toGoogleCalendarDate(featuredEvent.event.endDate || featuredEvent.event.startDate, featuredEvent.event.endTime || featuredEvent.event.startTime);
                      const text = encodeURIComponent(featuredEvent.event.title);
                      const details = encodeURIComponent(featuredEvent.event.description || '');
                      const location = encodeURIComponent(featuredEvent.event.location || '');
                      const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;

                      return (
                        <a
                          href={calendarLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-medium border border-slate-200 hover:border-slate-300 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default FeaturedEventsSection;
