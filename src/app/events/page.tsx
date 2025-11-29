"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { EventWithMedia, EventDetailsDTO } from "@/types";
import { formatInTimeZone } from 'date-fns-tz';
import LocationDisplay from '@/components/LocationDisplay';
import { isRecurringEvent, getNextOccurrenceDate } from '@/lib/eventUtils';
// import { formatInTimeZone } from 'date-fns-tz';

const EVENTS_PAGE_SIZE = 20; // Minimum events to display per page
const BACKEND_FETCH_SIZE = 50; // Fetch more from backend to account for recurring event filtering

// Component for handling long descriptions with expand/collapse
function DescriptionDisplay({ description }: { description: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 200; // characters

  if (description.length <= maxLength) {
    return (
      <div className="text-lg font-semibold text-gray-700 leading-relaxed whitespace-pre-wrap">
        {description}
      </div>
    );
  }

  const truncatedText = description.substring(0, maxLength).trim();

  return (
    <div className="text-lg font-semibold text-gray-700 leading-relaxed">
      <div className="whitespace-pre-wrap">
        {isExpanded ? description : `${truncatedText}...`}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="mt-3 inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 font-medium text-sm"
      >
        {isExpanded ? (
          <>
            <span>Show Less</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </>
        ) : (
          <>
            <span>Read More</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventWithMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [displayedCount, setDisplayedCount] = useState(0); // Actual count after filtering recurring events
  const [heroImageUrl, setHeroImageUrl] = useState<string>("/images/default_placeholder_hero_image.jpeg");
  const [fetchError, setFetchError] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchDateFrom, setSearchDateFrom] = useState("");
  const [searchDateTo, setSearchDateTo] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Array of modern background colors inspired by the Dribbble design
  const cardBackgrounds = [
    'bg-gradient-to-br from-blue-50 to-blue-100',
    'bg-gradient-to-br from-green-50 to-green-100',
    'bg-gradient-to-br from-purple-50 to-purple-100',
    'bg-gradient-to-br from-pink-50 to-pink-100',
    'bg-gradient-to-br from-yellow-50 to-yellow-100',
    'bg-gradient-to-br from-indigo-50 to-indigo-100',
    'bg-gradient-to-br from-teal-50 to-teal-100',
    'bg-gradient-to-br from-orange-50 to-orange-100',
    'bg-gradient-to-br from-cyan-50 to-cyan-100',
    'bg-gradient-to-br from-rose-50 to-rose-100'
  ];

  // Function to get random background color for each event
  const getRandomBackground = (index: number) => {
    return cardBackgrounds[index % cardBackgrounds.length];
  };

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      setFetchError(false);
      try {
        // Build query parameters based on date filter
        // Fetch more events from backend to account for recurring event filtering
        // We fetch BACKEND_FETCH_SIZE events to ensure we have at least EVENTS_PAGE_SIZE after filtering
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const queryParams = new URLSearchParams({
          sort: showPastEvents ? 'startDate,desc' : 'startDate,asc',
          page: page.toString(),
          size: BACKEND_FETCH_SIZE.toString(), // Fetch more to account for filtering
          'isActive.equals': 'true' // Only show active events
        });

        // Add search filters
        if (searchTitle.trim()) {
          queryParams.append('title.contains', searchTitle.trim());
        }

        // Handle date filtering - prioritize search date range over toggle
        if (searchDateFrom || searchDateTo) {
          // If user has specified date range, use that instead of toggle logic
          if (searchDateFrom) {
            queryParams.append('startDate.greaterThanOrEqual', searchDateFrom);
          }
          if (searchDateTo) {
            queryParams.append('startDate.lessThanOrEqual', searchDateTo);
          }
        } else {
          // No search date range specified, use toggle logic
          if (showPastEvents) {
            // Show events that ended before today
            queryParams.append('endDate.lessThan', today);
          } else {
            // Show events that start today or later (future events including today)
            queryParams.append('startDate.greaterThanOrEqual', today);
          }
        }

        // Fetch paginated events with date filtering
        const eventsRes = await fetch(`/api/proxy/event-details?${queryParams.toString()}`);
        if (!eventsRes.ok) throw new Error('Failed to fetch events');

        // Get total count from response header (as per UI style guide)
        const totalCountHeader = eventsRes.headers.get('x-total-count');
        const totalCountValue = totalCountHeader ? parseInt(totalCountHeader, 10) : 0;
        setTotalCount(totalCountValue);

        // Calculate total pages based on backend fetch size (not displayed size)
        // This accounts for the fact that we fetch more than we display
        const calculatedTotalPages = Math.max(1, Math.ceil(totalCountValue / BACKEND_FETCH_SIZE));
        setTotalPages(calculatedTotalPages);

        const events: EventDetailsDTO[] = await eventsRes.json();
        let eventList = Array.isArray(events) ? events : [events];

        // Process recurring events to show only next occurrence (same logic as HeroSection)
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(todayDate.getFullYear() + 1);
        oneYearFromNow.setHours(23, 59, 59, 999);

        const processedEvents: EventDetailsDTO[] = [];
        const recurringSeriesMap = new Map<number, EventDetailsDTO>(); // Map seriesId -> event with earliest next occurrence

        // Process events and filter recurring events to show only next occurrence
        eventList.forEach((event) => {
          // Handle recurring events
          if (isRecurringEvent(event)) {
            const seriesId = event.recurrenceSeriesId || event.parentEventId || event.id;

            // Calculate next occurrence date
            const nextOccurrence = getNextOccurrenceDate(event, todayDate);

            if (!nextOccurrence) {
              console.log(`[EventsPage] Skipping recurring event ${event.id}: No next occurrence found`);
              return; // Skip if no next occurrence
            }

            // Check if next occurrence is within 1 year
            if (nextOccurrence > oneYearFromNow) {
              console.log(`[EventsPage] Skipping recurring event ${event.id}: Next occurrence ${nextOccurrence.toISOString()} is beyond 1 year`);
              return; // Skip if beyond 1 year
            }

            // Update event startDate to next occurrence for display
            const nextOccurrenceStr = nextOccurrence.toISOString().split('T')[0];
            const eventWithNextOccurrence = { ...event, startDate: nextOccurrenceStr };

            // Check if we already have an event from this series
            const existingSeriesEvent = recurringSeriesMap.get(seriesId);
            if (!existingSeriesEvent) {
              // First event from this series - add it
              recurringSeriesMap.set(seriesId, eventWithNextOccurrence);
              console.log(`[EventsPage] Added recurring event series ${seriesId}: ${event.title} (Next occurrence: ${nextOccurrenceStr})`);
            } else {
              // Compare dates - keep the one with earlier next occurrence
              const existingDate = new Date(existingSeriesEvent.startDate!);
              if (nextOccurrence < existingDate) {
                recurringSeriesMap.set(seriesId, eventWithNextOccurrence);
                console.log(`[EventsPage] Updated recurring event series ${seriesId}: ${event.title} (Earlier occurrence: ${nextOccurrenceStr})`);
              }
            }
          } else {
            // Check if this is a child event (has parentEventId or recurrenceSeriesId but isRecurring = false)
            const seriesId = event.recurrenceSeriesId || event.parentEventId;
            if (seriesId) {
              // This is a child event - skip it (we'll use the parent event instead)
              console.log(`[EventsPage] Skipping child event ${event.id} (series ${seriesId}) - will use parent event`);
              return;
            }
            // Non-recurring event - add directly
            processedEvents.push(event);
          }
        });

        // Add recurring events (only one per series - the next occurrence)
        recurringSeriesMap.forEach((event) => {
          processedEvents.push(event);
        });

        // Sort by startDate to show earliest events first
        processedEvents.sort((a, b) => {
          if (!a.startDate || !b.startDate) return 0;
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        });

        // Limit to EVENTS_PAGE_SIZE (20) events for display after filtering
        const limitedProcessedEvents = processedEvents.slice(0, EVENTS_PAGE_SIZE);

        console.log(`[EventsPage] Processed ${processedEvents.length} events (${recurringSeriesMap.size} recurring series, ${processedEvents.length - recurringSeriesMap.size} non-recurring) from ${eventList.length} fetched events, displaying ${limitedProcessedEvents.length} events`);

        // Track actual displayed count after filtering and limiting
        const actualDisplayedCount = limitedProcessedEvents.length;
        setDisplayedCount(actualDisplayedCount);

        // For each event, fetch its hero image (homepage hero or regular hero)
        const eventsWithMedia = await Promise.all(
          limitedProcessedEvents.map(async (event: EventDetailsDTO) => {
            try {
              // First try to find homepage hero image
              let mediaRes = await fetch(`/api/proxy/event-medias?eventId.equals=${event.id}&isHomePageHeroImage.equals=true`);
              let mediaData = await mediaRes.json();

              // If no homepage hero image found, try regular hero image
              if (!mediaData || mediaData.length === 0) {
                mediaRes = await fetch(`/api/proxy/event-medias?eventId.equals=${event.id}&isHeroImage.equals=true`);
                mediaData = await mediaRes.json();
              }

              if (mediaData && mediaData.length > 0) {
                return { ...event, thumbnailUrl: mediaData[0].fileUrl };
              }
              return { ...event, thumbnailUrl: undefined };
            } catch {
              return { ...event, thumbnailUrl: undefined };
            }
          })
        );
        setEvents(eventsWithMedia);

        // Hero image logic: earliest upcoming event within 3 months
        const currentDate = new Date();
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(currentDate.getMonth() + 3);
        const upcoming = eventsWithMedia
          .filter(e => e.startDate && new Date(e.startDate) >= currentDate && e.thumbnailUrl)
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        if (upcoming.length > 0) {
          const nextEvent = upcoming[0];
          const eventDate = nextEvent.startDate ? new Date(nextEvent.startDate) : null;
          if (eventDate && eventDate <= threeMonthsFromNow && nextEvent.thumbnailUrl) {
            setHeroImageUrl(nextEvent.thumbnailUrl);
            return;
          }
        }
        setHeroImageUrl("/images/default_placeholder_hero_image.jpeg");
      } catch (err) {
        setFetchError(true);
        setEvents([]);
        setHeroImageUrl("/images/default_placeholder_hero_image.jpeg");
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [page, showPastEvents, searchTitle, searchDateFrom, searchDateTo]);

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
    if (isNaN(h)) h = 0;
    if (ampm && ampm.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (ampm && ampm.toUpperCase() === 'AM' && h === 12) h = 0;
    const min = minute && !isNaN(parseInt(minute, 10)) ? minute : '00';
    return `${year}${month}${day}T${String(h).padStart(2, '0')}${min.padStart(2, '0')}00`;
  }

  // Helper to format time with AM/PM
  function formatTime(time: string): string {
    if (!time) return '';
    // Accepts 'HH:mm' or 'hh:mm AM/PM' and returns 'hh:mm AM/PM'
    if (time.match(/AM|PM/i)) return time;
    const [hourStr, minute] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
  }

  // Helper to format date
  function formatDate(dateString: string, timezone: string = 'America/New_York'): string {
    if (!dateString) return '';
    // Use formatInTimeZone to display the date in the event's timezone
    return formatInTimeZone(dateString, timezone, 'EEEE, MMMM d, yyyy');
  }

  // Search functionality
  const handleSearch = async () => {
    setIsSearching(true);
    setPage(0); // Reset to first page when searching
    // The useEffect will trigger automatically due to dependency changes
  };

  const clearSearch = () => {
    setSearchTitle("");
    setSearchDateFrom("");
    setSearchDateTo("");
    setPage(0);
    setIsSearching(false);
    // Reset to future events when clearing search
    setShowPastEvents(false);
  };

  return (
    <div className="w-full overflow-x-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Line clamp utilities */
          .line-clamp-1 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
          }
          .line-clamp-2 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }

          /* Mobile-specific hero adjustments */
          @media (max-width: 767px) {
            .hero-section {
              min-height: 180px !important;
              height: 180px !important;
              padding-top: 80px !important;
              background-color: #000 !important;
              margin: 0 !important;
              padding: 80px 0 0 0 !important;
            }
            /* Prevent horizontal overflow */
            body {
              overflow-x: hidden !important;
            }
            /* Prevent image cutoff */
            .event-image-container {
              overflow: hidden !important;
              max-width: 100% !important;
              padding: 0 10px !important;
            }
            .event-image-container img {
              max-width: 100% !important;
              height: auto !important;
              object-fit: contain !important;
            }
            /* Ensure content fits mobile viewport */
            .container {
              max-width: 100vw !important;
              padding-left: 15px !important;
              padding-right: 15px !important;
            }
            /* Ensure mobile text doesn't duplicate */
            .hero-title {
              display: none !important;
            }
            /* Ensure mobile text stays within hero bounds */
            .hero-section h1 {
              margin-bottom: 0 !important;
              padding-bottom: 0 !important;
            }
            /* Mobile feature box spacing - increased significantly */
            .feature-boxes-container {
              margin-top: 180px !important;
            }
            /* Ensure mobile hero has solid black background */
            .flex.md\\:hidden {
              background-color: #000 !important;
              padding: 0 !important;
              margin: 0 !important;
              border: none !important;
              outline: none !important;
            }
            /* Force all mobile hero elements to have black background */
            .flex.md\\:hidden * {
              background-color: #000 !important;
            }
            /* Ensure no white spaces in mobile hero */
            .flex.md\\:hidden img {
              margin: 0 !important;
              padding: 0 !important;
            }
            .flex.md\\:hidden div {
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
            }
            .flex.md\\:hidden h1 {
              margin: 0 !important;
              padding: 0 !important;
              background-color: #000 !important;
            }
          }
          /* Desktop-specific adjustments */
          @media (min-width: 768px) {
            .hero-section {
              min-height: 320px !important;
              height: 320px !important;
              padding-top: 100px !important;
            }
            .feature-boxes-container {
              margin-top: 120px !important;
            }
            /* Ensure desktop doesn't show mobile elements */
            .flex.md\\:hidden {
              display: none !important;
            }
          }
        `
      }} />
      <section className="hero-section events-hero-section" style={{
        height: '320px',
        minHeight: '320px',
        position: 'relative',
        overflow: 'visible',
        backgroundColor: '#000',
        marginBottom: 0,
        paddingBottom: 0,
        paddingTop: '100px',
        marginTop: 0
      }}>
        {/* Desktop Layout */}
        <div className="hidden md:flex hero-content" style={{
          position: 'relative',
          zIndex: 3,
          padding: '0 20px',
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          height: '100%',
          minHeight: 200,
          gap: '40px',
          paddingTop: '50px',
          paddingBottom: '70px'
        }}>
          <img src="/images/mcefee_logo_black_border_transparent.png" className="hero-mcafee-logo" alt="MCEFEE Logo" style={{ width: 240, height: 'auto', opacity: 0.6, marginLeft: -200 }} />
          <h1 className="hero-title" style={{
            fontSize: 26,
            lineHeight: 1.4,
            color: 'white',
            maxWidth: 450,
            fontFamily: 'Sora, sans-serif',
            marginLeft: -20,
            marginRight: 40,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <span>Connecting Cultures,</span>
            <span>Empowering Generations –</span>
            <span style={{ color: '#ffce59', fontSize: 26 }}>Celebrating Malayali Roots in the USA</span>
          </h1>
        </div>
        {/* Mobile Layout */}
        <div className="flex md:hidden" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 0px',
          minHeight: '160px',
          backgroundColor: '#000',
          position: 'relative',
          zIndex: 3,
          width: '100%',
          maxWidth: '100vw',
          height: '100%',
          margin: '0px',
          border: 'none',
          outline: 'none'
        }}>
          {/* Mobile Logo */}
          <img src="/images/mcefee_logo_black_border_transparent.png" alt="MCEFEE Logo" style={{
            width: '200px',
            height: 'auto',
            opacity: 0.9,
            display: 'block',
            margin: '20px auto 10px auto',
            padding: '0px'
          }} />

          {/* Mobile Main Text - Single instance only */}
          <div style={{
            backgroundColor: '#000',
            padding: '0px',
            margin: '0px',
            width: '100%',
            border: 'none',
            outline: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <h1 style={{
              fontSize: '18px',
              lineHeight: 1.3,
              color: 'white',
              maxWidth: '300px',
              fontFamily: 'Sora, sans-serif',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              textAlign: 'center',
              margin: '0px auto',
              padding: '0px',
              fontWeight: '500',
              backgroundColor: '#000',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <span>Connecting Cultures,</span>
              <span>Empowering Generations –</span>
              <span style={{ color: '#ffce59', fontSize: '18px', fontWeight: '600' }}>Celebrating Malayali Roots in the USA</span>
            </h1>
          </div>
        </div>
        {/* Desktop Background */}
        <div className="hidden md:block hero-background" style={{
          position: 'absolute',
          top: '25%',
          right: '10px',
          left: 'auto',
          width: '30%',
          height: '75%',
          backgroundImage: "url('/images/kathakali_with_back_light_hero_ai.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.8,
          filter: 'blur(0.5px)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 35%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.7) 65%, rgba(0,0,0,0.3) 85%, rgba(0,0,0,0) 100%)',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 35%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.7) 65%, rgba(0,0,0,0.3) 85%, rgba(0,0,0,0) 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}>
          {/* Top gradient overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '15%',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.1) 100%)',
            zIndex: 1,
            filter: 'blur(1px)'
          }}></div>
          {/* Bottom gradient overlay */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '15%',
            background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.1) 100%)',
            zIndex: 1,
            filter: 'blur(1px)'
          }}></div>
          {/* Left gradient overlay - enhanced for better fade */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '20%',
            height: '100%',
            background: 'linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.1) 80%, rgba(0,0,0,0) 100%)',
            zIndex: 1,
            filter: 'blur(1px)'
          }}></div>

          {/* Additional left fade gradient for smoother transition */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '35%',
            height: '100%',
            background: 'linear-gradient(90deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.05) 80%, rgba(0,0,0,0) 100%)',
            zIndex: 1,
            filter: 'blur(1.5px)'
          }}></div>
          {/* Right gradient overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '25%',
            height: '100%',
            background: 'linear-gradient(270deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.1) 100%)',
            zIndex: 1,
            filter: 'blur(1px)'
          }}></div>
          {/* Corner gradient overlays for smoother blending */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '20%',
            height: '20%',
            background: 'radial-gradient(ellipse at top left, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)',
            zIndex: 2
          }}></div>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '30%',
            height: '30%',
            background: 'radial-gradient(ellipse at top right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)',
            zIndex: 2
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '30%',
            height: '30%',
            background: 'radial-gradient(ellipse at bottom left, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)',
            zIndex: 2
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '30%',
            height: '30%',
            background: 'radial-gradient(ellipse at bottom right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)',
            zIndex: 2
          }}></div>
        </div>
        {/* Hero overlay removed to match events page brightness */}
      </section>

      {/* Mobile Spacer Div - Creates space between hero and events list on mobile only */}
      <div className="block md:hidden" style={{ height: '150px', width: '100%', backgroundColor: 'transparent' }}></div>

      {/* Event List */}
      <div className="max-w-6xl mx-auto px-8 py-12 md:px-16 lg:px-24" style={{ paddingTop: '60px' }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-6">All Events</h1>

          {/* Event Filter Toggle */}
          <div className="flex justify-center items-center gap-4 mb-6">
            <span className={`text-lg font-medium ${!showPastEvents ? 'text-blue-600' : 'text-gray-500'}`}>
              Future Events
            </span>
            <button
              onClick={() => {
                setShowPastEvents(!showPastEvents);
                setPage(0); // Reset to first page when switching
              }}
              className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{ backgroundColor: showPastEvents ? '#3b82f6' : '#d1d5db' }}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${showPastEvents ? 'translate-x-7' : 'translate-x-1'
                  }`}
              />
            </button>
            <span className={`text-lg font-medium ${showPastEvents ? 'text-blue-600' : 'text-gray-500'}`}>
              Past Events
            </span>
          </div>

          {/* Filter Description */}
          <p className="text-gray-600 text-sm">
            {showPastEvents
              ? 'Showing past events (events that have already ended)'
              : 'Showing future events (including events happening today)'
            }
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Search Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Title Search */}
              <div className="space-y-2">
                <label htmlFor="searchTitle" className="block text-sm font-medium text-gray-700">
                  Search by Title
                </label>
                <input
                  type="text"
                  id="searchTitle"
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  placeholder="Enter event title..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Date Range - Grouped Together */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="searchDateFrom" className="block text-xs text-gray-600 mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      id="searchDateFrom"
                      value={searchDateFrom}
                      onChange={(e) => setSearchDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="searchDateTo" className="block text-xs text-gray-600 mb-1">
                      To
                    </label>
                    <input
                      type="date"
                      id="searchDateTo"
                      value={searchDateTo}
                      onChange={(e) => setSearchDateTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Search Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSearch}
                  disabled={loading || isSearching}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl border-2 border-blue-400 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 w-fit"
                  aria-label="Search events"
                >
                  {loading || isSearching ? (
                    <>
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                      <span className="text-lg">Searching...</span>
                    </>
                  ) : (
                    <>
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <span className="text-lg">Search Events</span>
                    </>
                  )}
                </button>
                <button
                  onClick={clearSearch}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3 px-6 rounded-xl border-2 border-emerald-400 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-3 w-fit"
                  aria-label="Clear search filters"
                >
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <span className="text-lg">Clear Search</span>
                </button>
              </div>
            </div>

            {/* Search Results Info */}
            {(searchTitle || searchDateFrom || searchDateTo) && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Search Active:</span>
                  {searchTitle && ` Title contains "${searchTitle}"`}
                  {searchTitle && (searchDateFrom || searchDateTo) && ' and'}
                  {searchDateFrom && searchDateTo && ` Date between "${searchDateFrom}" and "${searchDateTo}"`}
                  {searchDateFrom && !searchDateTo && ` Date from "${searchDateFrom}" onwards`}
                  {!searchDateFrom && searchDateTo && ` Date until "${searchDateTo}"`}
                  {(searchDateFrom || searchDateTo) && (
                    <span className="block mt-1 text-xs text-blue-600">
                      (Date range search overrides Future/Past Events toggle)
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="relative">
              <Image
                src="/images/loading_events.jpg"
                alt="Loading events..."
                width={300}
                height={300}
                className="rounded-lg shadow-2xl animate-pulse"
                priority
              />
              <div className="absolute inset-0 rounded-lg overflow-hidden">
                <div className="wavy-animation"></div>
              </div>
            </div>
          </div>
        ) : fetchError ? (
          <div className="text-center text-red-600 font-bold py-8">
            Sorry, we couldn't load events at this time. Please try again later.
          </div>
        ) : events.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No events found.
          </div>
        ) : (
          <>
            <div className="space-y-8">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className={`${getRandomBackground(index)} rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden group`}
                  style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div className="flex flex-col h-full">
                    {/* Image Section - Top on all screen sizes */}
                    <div className="relative w-full h-auto rounded-t-2xl overflow-hidden">
                      {event.thumbnailUrl ? (
                        <Image
                          src={event.thumbnailUrl}
                          alt={event.title}
                          width={800}
                          height={600}
                          className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                          style={{
                            backgroundColor: 'transparent',
                            borderRadius: '1rem 1rem 0 0'
                          }}
                        />
                      ) : (
                        <div
                          className="w-full h-80 flex items-center justify-center"
                          style={{
                            backgroundColor: 'transparent',
                            borderRadius: '1rem 1rem 0 0'
                          }}
                        >
                          <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                      )}
                      {/* Past Event Badge */}
                      {showPastEvents && (
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 bg-gray-500 text-white text-xs font-medium rounded-full">
                            Past Event
                          </span>
                        </div>
                      )}
                      {/* Action Buttons - Register Here and Buy Tickets - Top Right Corner */}
                      {(() => {
                        if (!event.startDate) return null;

                        // Get today's date in YYYY-MM-DD format using local timezone
                        const today = new Date();
                        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

                        // Compare dates as strings to avoid timezone parsing issues
                        const eventDateStr = event.startDate ? event.startDate.split('T')[0] : null;

                        if (!eventDateStr) return null;

                        // Check if event date is today or in the future
                        const isToday = eventDateStr === todayStr;
                        const isFuture = eventDateStr > todayStr;
                        const isUpcomingLocal = isToday || isFuture;
                        const isPast = !isUpcomingLocal;

                        // Determine which buttons to show
                        const showRegisterButton = event.isRegistrationRequired === true && isUpcomingLocal;
                        // Only show Buy Tickets button for TICKETED events (case-insensitive check)
                        // Handles both 'TICKETED' and 'ticketed' from database/backend
                        const showBuyTicketsButton = event.admissionType?.toUpperCase() === 'TICKETED' && isUpcomingLocal;

                        // Don't render if no buttons should be shown
                        if (!showRegisterButton && !showBuyTicketsButton) return null;

                        return (
                          <div className={`absolute top-4 right-4 lg:top-6 lg:right-6 z-10 ${showRegisterButton && showBuyTicketsButton ? 'flex flex-col gap-2' : ''}`}>
                            {/* Register Here Button - Show if registration is required */}
                            {showRegisterButton && (
                            <Link
                                href={`/events/${event.id}/register`}
                                className="transition-transform hover:scale-105"
                                title="Register Here"
                            >
                              <img
                                  src="/images/register_here_button.jpg"
                                  alt="Register Here"
                                className="object-contain w-[150px] h-[52px] sm:w-[200px] sm:h-[70px]"
                              />
                            </Link>
                            )}

                            {/* Buy Tickets Button - Show only for non-FREE events */}
                            {showBuyTicketsButton && (
                            <Link
                                href={`/events/${event.id}/checkout`}
                              className={`transition-transform hover:scale-105 ${isPast ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                                title="Buy Tickets (New Payment Flow)"
                            >
                              <img
                                src="/images/buy_tickets_click_here_red.webp"
                                alt="Buy Tickets"
                                className="object-contain w-[150px] h-[52px] sm:w-[200px] sm:h-[70px]"
                              />
                            </Link>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Content Section - Bottom on all screen sizes */}
                    <div className="p-5 border-t border-white/20 relative">
                      {/* Title */}
                      <h2 className="text-xl font-bold text-gray-800 mb-2 sm:pr-48 lg:pr-56">
                        {event.title}
                      </h2>

                      {/* Caption */}
                      {event.caption && (
                        <p className="text-gray-600 text-base mb-3 sm:pr-48 lg:pr-56">
                          {event.caption}
                        </p>
                      )}

                      {/* Event Details - Matching sponsors page style with centered flexbox */}
                      <div className="px-4 pb-4 border-t border-white/20">
                        <div className="flex flex-wrap justify-center gap-3 mb-2 pt-3 lg:max-w-4xl lg:mx-auto">
                          {/* Date */}
                          <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[280px]">
                            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-lg font-semibold">
                              {formatDate(event.startDate, event.timezone)}
                            </span>
                          </div>

                          {/* Time */}
                          {event.startTime && (
                            <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[280px]">
                              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <span className="text-lg font-semibold">
                                {formatTime(event.startTime)} - {formatTime(event.endTime)} (EDT)
                              </span>
                            </div>
                          )}

                          {/* Location */}
                          {event.location && (
                            <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[280px]">
                              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold truncate">
                                  {event.location}
                                </span>
                                {/* Copy and Navigate Icons */}
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(event.location || '');
                                      alert('Address copied to clipboard!');
                                    }}
                                    className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors"
                                    title="Copy Address"
                                    aria-label="Copy address to clipboard"
                                  >
                                    <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                  </button>
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors"
                                    title="Open in Google Maps"
                                    aria-label="Open location in Google Maps"
                                  >
                                    <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description with modern button */}
                      {event.description && (
                        <div className="mb-4 px-4 lg:max-w-4xl lg:mx-auto">
                          <DescriptionDisplay description={event.description} />
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 px-4">

                        {/* Calendar Link - Only for future events */}
                        {(() => {
                          if (showPastEvents) return null;

                          // Check that startDate and startTime exist for calendar link generation
                          if (!event.startDate || !event.startTime) {
                            console.log(`Event ${event.id} missing startDate or startTime:`, {
                              startDate: event.startDate,
                              startTime: event.startTime
                            });
                            return null;
                          }

                          // Get today's date in YYYY-MM-DD format using local timezone
                          const today = new Date();
                          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

                          // Compare dates as strings to avoid timezone parsing issues
                          const eventDateStr = event.startDate.split('T')[0]; // Get just the date part (YYYY-MM-DD)

                          // Check if event date is today or in the future
                          const isToday = eventDateStr === todayStr;
                          const isFuture = eventDateStr > todayStr;
                          const isUpcoming = isToday || isFuture;

                          if (!isUpcoming) {
                            console.log(`Event ${event.id} is not upcoming (past event):`, {
                              eventDateStr,
                              todayStr,
                              isToday,
                              isFuture
                            });
                            return null;
                          }

                          // If event is today OR in the future, show the button
                          // This includes events happening later today

                          const start = toGoogleCalendarDate(event.startDate, event.startTime);
                          const end = toGoogleCalendarDate(event.endDate || event.startDate, event.endTime || event.startTime);

                          if (!start || !end) {
                            console.log(`Event ${event.id} failed to generate calendar dates:`, {
                              start,
                              end,
                              startDate: event.startDate,
                              startTime: event.startTime,
                              endDate: event.endDate,
                              endTime: event.endTime
                            });
                            return null;
                          }

                          const text = encodeURIComponent(event.title);
                          const details = encodeURIComponent(event.description || '');
                          const location = encodeURIComponent(event.location || '');
                          const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;

                          console.log(`Event ${event.id} calendar link generated:`, calendarLink);

                          return (
                            <a
                              href={calendarLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl border-2 border-blue-400 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-3"
                            >
                              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <span className="text-lg">Add to Calendar</span>
                            </a>
                          );
                        })()}

                        {/* See Event Details Button - Links to event details page */}
                        <Link
                          href={`/events/${event.id}`}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-xl border-2 border-emerald-400 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-3"
                        >
                          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                          <span className="text-lg">See Event Details</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination controls - Matching admin page style */}
            {!loading && displayedCount > 0 && (
              <div className="mt-8">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    aria-label="Previous page"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                  </button>
                  <div className="text-sm font-semibold text-gray-700">
                    Page {page + 1} of {totalPages}
                  </div>
                  <button
                    onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
                    disabled={page >= totalPages - 1}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    aria-label="Next page"
                  >
                    <span>Next</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div className="text-center text-sm text-gray-600 mt-2">
                  Showing <span className="font-medium">{displayedCount > 0 ? page * EVENTS_PAGE_SIZE + 1 : 0}</span> to <span className="font-medium">{displayedCount > 0 ? page * EVENTS_PAGE_SIZE + displayedCount : 0}</span> of{' '}
                  <span className="font-medium">{totalCount}</span> result{totalCount !== 1 ? 's' : ''}
                  {totalCount > displayedCount && (
                    <span className="text-gray-500 text-xs block mt-1">
                      ({displayedCount} events displayed after filtering recurring events - grouped by series)
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}