"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { EventWithMedia, EventMediaDTO, EventDetailsDTO, EventFeaturedPerformersDTO, EventContactsDTO, EventProgramDirectorsDTO, EventSponsorsJoinDTO } from "@/types";
import { formatInTimeZone } from 'date-fns-tz';
import LocationDisplay from '@/components/LocationDisplay';
import { EventMediaSlideshow } from '@/app/gallery/components/EventMediaSlideshow';
import { Camera, Video, Eye } from 'lucide-react';
import styles from './GalleryThumbnails.module.css';
import cardGridStyles from './CenteredCardGrid.module.css';

// Helper function to get initials from a name
function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Color palette for cards and placeholders (light versions of design system colors)
const cardColors = [
  { bg: 'bg-blue-50', border: 'border-blue-200', hover: 'hover:bg-blue-100' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', hover: 'hover:bg-emerald-100' },
  { bg: 'bg-purple-50', border: 'border-purple-200', hover: 'hover:bg-purple-100' },
  { bg: 'bg-amber-50', border: 'border-amber-200', hover: 'hover:bg-amber-100' },
  { bg: 'bg-pink-50', border: 'border-pink-200', hover: 'hover:bg-pink-100' },
  { bg: 'bg-teal-50', border: 'border-teal-200', hover: 'hover:bg-teal-100' },
  { bg: 'bg-indigo-50', border: 'border-indigo-200', hover: 'hover:bg-indigo-100' },
  { bg: 'bg-rose-50', border: 'border-rose-200', hover: 'hover:bg-rose-100' },
];

// Array of modern background colors for sponsor cards (matching homepage)
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

// Function to get random background color for each sponsor
const getSponsorBackground = (index: number) => {
  return cardBackgrounds[index % cardBackgrounds.length];
};

// Avatar gradient colors (matching design system with variations)
const avatarGradients = [
  { from: 'from-blue-500', to: 'to-blue-600' },
  { from: 'from-emerald-500', to: 'to-emerald-600' },
  { from: 'from-purple-500', to: 'to-purple-600' },
  { from: 'from-amber-500', to: 'to-amber-600' },
  { from: 'from-pink-500', to: 'to-pink-600' },
  { from: 'from-teal-500', to: 'to-teal-600' },
  { from: 'from-indigo-500', to: 'to-indigo-600' },
  { from: 'from-rose-500', to: 'to-rose-600' },
  { from: 'from-primary', to: 'to-secondary' },
  { from: 'from-accent', to: 'to-primary' },
];

// Button color variants
const buttonColors = [
  { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'text-white', border: 'border-blue-400' },
  { bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600', text: 'text-white', border: 'border-emerald-400' },
  { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', text: 'text-white', border: 'border-purple-400' },
  { bg: 'bg-amber-500', hover: 'hover:bg-amber-600', text: 'text-white', border: 'border-amber-400' },
  { bg: 'bg-pink-500', hover: 'hover:bg-pink-600', text: 'text-white', border: 'border-pink-400' },
  { bg: 'bg-teal-500', hover: 'hover:bg-teal-600', text: 'text-white', border: 'border-teal-400' },
];

// Helper to get consistent color based on index or name hash
function getColorIndex(str: string | number, max: number): number {
  if (typeof str === 'number') return str % max;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % max;
}

// Helper function to create a data URL for placeholder avatar with initials
function createPlaceholderAvatar(name: string, size: number = 64): string {
  const initials = getInitials(name);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#8B7D6B');
  gradient.addColorStop(1, '#A0926B');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${size * 0.4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, size / 2, size / 2);

  return canvas.toDataURL();
}

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params?.id;
  const [event, setEvent] = useState<EventDetailsDTO | null>(null);
  const [media, setMedia] = useState<EventMediaDTO[]>([]);
  const [featuredPerformers, setFeaturedPerformers] = useState<EventFeaturedPerformersDTO[]>([]);
  const [contacts, setContacts] = useState<EventContactsDTO[]>([]);
  const [programDirectors, setProgramDirectors] = useState<EventProgramDirectorsDTO[]>([]);
  const [sponsors, setSponsors] = useState<EventSponsorsJoinDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [slideshowInitialIndex, setSlideshowInitialIndex] = useState(0);
  // Track failed images for placeholder fallback
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchEventDetails() {
      if (!eventId) return;
      setLoading(true);
      try {
        // Fetch event details
        const eventRes = await fetch(`/api/proxy/event-details/${eventId}`);
        const eventData: EventDetailsDTO = await eventRes.json();
        setEvent(eventData);

        // Fetch media
        const mediaRes = await fetch(`/api/proxy/event-medias?eventId.equals=${eventId}&isEventManagementOfficialDocument.equals=false&sort=updatedAt,desc`);
        const mediaData = await mediaRes.json();
        setMedia(Array.isArray(mediaData) ? mediaData : [mediaData]);

        // Fetch featured performers
        try {
          const performersParams = new URLSearchParams({
            'eventId.equals': eventId.toString(),
            'isActive.equals': 'true'
            // Removed sort parameter to avoid backend parsing errors
          });
          const performersRes = await fetch(`/api/proxy/event-featured-performers?${performersParams.toString()}`);

          if (!performersRes.ok) {
            console.warn('Featured performers fetch failed:', performersRes.status, performersRes.statusText);
            setFeaturedPerformers([]);
          } else {
            const contentType = performersRes.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const performersData = await performersRes.json();
              setFeaturedPerformers(Array.isArray(performersData) ? performersData : [performersData]);
            } else {
              console.warn('Featured performers response is not JSON:', contentType);
              setFeaturedPerformers([]);
            }
          }
        } catch (err) {
          console.error('Error fetching featured performers:', err);
          setFeaturedPerformers([]);
        }

        // Fetch contacts
        try {
          const contactsParams = new URLSearchParams({
            'eventId.equals': eventId.toString()
          });
          const contactsRes = await fetch(`/api/proxy/event-contacts?${contactsParams.toString()}`);

          if (!contactsRes.ok) {
            console.warn('Contacts fetch failed:', contactsRes.status, contactsRes.statusText);
            setContacts([]);
          } else {
            const contentType = contactsRes.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const contactsData = await contactsRes.json();
              setContacts(Array.isArray(contactsData) ? contactsData : [contactsData]);
            } else {
              console.warn('Contacts response is not JSON:', contentType);
              setContacts([]);
            }
          }
        } catch (err) {
          console.error('Error fetching contacts:', err);
          setContacts([]);
        }

        // Fetch program directors
        try {
          const directorsParams = new URLSearchParams({
            'eventId.equals': eventId.toString()
          });
          const directorsRes = await fetch(`/api/proxy/event-program-directors?${directorsParams.toString()}`);

          if (!directorsRes.ok) {
            console.warn('Program directors fetch failed:', directorsRes.status, directorsRes.statusText);
            setProgramDirectors([]);
          } else {
            const contentType = directorsRes.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const directorsData = await directorsRes.json();
              setProgramDirectors(Array.isArray(directorsData) ? directorsData : [directorsData]);
            } else {
              console.warn('Program directors response is not JSON:', contentType);
              setProgramDirectors([]);
            }
          }
        } catch (err) {
          console.error('Error fetching program directors:', err);
          setProgramDirectors([]);
        }

        // Fetch sponsors from event-sponsors-join table
        try {
          const sponsorsRes = await fetch(`/api/proxy/event-sponsors-join/event/${eventId}`);

          if (!sponsorsRes.ok) {
            console.warn('Sponsors fetch failed:', sponsorsRes.status, sponsorsRes.statusText);
            setSponsors([]);
          } else {
            const contentType = sponsorsRes.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const sponsorsData = await sponsorsRes.json();
              let sponsorsArray = Array.isArray(sponsorsData) ? sponsorsData : [sponsorsData];

              // Populate sponsor details if they're missing (sponsor object might only have ID)
              console.log('🔄 Checking and populating sponsor details...');
              const populatedSponsors = await Promise.all(
                sponsorsArray.map(async (joinRecord: EventSponsorsJoinDTO) => {
                  // Skip if no sponsor reference
                  if (!joinRecord.sponsor) {
                    console.warn('⚠️ Join record missing sponsor reference:', joinRecord.id);
                    return joinRecord;
                  }

                  // Check if sponsor has ID but missing details (like name)
                  if (joinRecord.sponsor.id && !joinRecord.sponsor.name) {
                    console.log('🔍 Fetching sponsor details for ID:', joinRecord.sponsor.id);
                    try {
                      const sponsorDetailsRes = await fetch(`/api/proxy/event-sponsors/${joinRecord.sponsor.id}`, {
                        cache: 'no-store',
                      });

                      if (sponsorDetailsRes.ok) {
                        const sponsorDetails = await sponsorDetailsRes.json();
                        console.log('✅ Fetched sponsor details:', sponsorDetails);
                        return {
                          ...joinRecord,
                          sponsor: sponsorDetails
                        };
                      } else {
                        console.warn('⚠️ Failed to fetch sponsor details for ID:', joinRecord.sponsor.id, sponsorDetailsRes.status);
                        // Return original record even if fetch failed
                        return joinRecord;
                      }
                    } catch (error) {
                      console.warn('⚠️ Error fetching sponsor details:', error);
                      // Return original record even if fetch failed
                      return joinRecord;
                    }
                  } else if (joinRecord.sponsor.name) {
                    // Sponsor details already populated
                    console.log('✅ Sponsor details already populated for:', joinRecord.sponsor.name);
                  }
                  return joinRecord;
                })
              );

              console.log('✅ Populated sponsors:', populatedSponsors);
              setSponsors(populatedSponsors);
            } else {
              console.warn('Sponsors response is not JSON:', contentType);
              setSponsors([]);
            }
          }
        } catch (err) {
          console.error('Error fetching sponsors:', err);
          setSponsors([]);
        }
      } catch (err) {
        setEvent(null);
        setMedia([]);
        setFeaturedPerformers([]);
        setContacts([]);
        setProgramDirectors([]);
        setSponsors([]);
      } finally {
        setLoading(false);
      }
    }
    fetchEventDetails();
  }, [eventId]);

  if (loading) return <div className="p-8 text-center">Loading event details...</div>;
  if (!event) return <div className="p-8 text-center text-red-500">Event not found.</div>;

  // Find hero image - Prioritize isHomePageHeroImage, then fallback to eventFlyer
  const heroImage = media.find((m) => m.isHomePageHeroImage && m.fileUrl) ||
                    media.find((m) => m.eventFlyer && m.fileUrl) ||
                    media.find((m) => m.fileUrl);
  const gallery = media.filter((m) => m.fileUrl && (!heroImage || m.id !== heroImage.id));

  // Get preview images (first 12 media items for grid display)
  const previewMedia = gallery.slice(0, 12);
  const remainingCount = Math.max(0, gallery.length - 12);

  // Helper functions for media type display
  const getMediaTypeIcon = (mediaType: string) => {
    if (mediaType.startsWith('video/')) {
      return <Video className="w-4 h-4" />;
    }
    return <Camera className="w-4 h-4" />;
  };

  const getMediaTypeColor = (mediaType: string) => {
    if (mediaType.startsWith('video/')) {
      return 'text-red-600 bg-red-100';
    }
    return 'text-blue-600 bg-blue-100';
  };

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

  // Helper to format time with AM/PM
  function formatTime(time: string): string {
    if (!time) return '';
    // Accepts 'HH:mm' or 'hh:mm AM/PM' and returns 'hh:mm AM/PM'
    if (time.match(/AM|PM/i)) return time;
    const [hourStr, minute] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute || '00'} ${ampm}`;
  }

  // Helper to format date
  function formatDate(dateString: string, timezone: string = 'America/New_York'): string {
    if (!dateString) return '';
    // Use formatInTimeZone to display the date in the event's timezone
    return formatInTimeZone(dateString, timezone, 'EEEE, MMMM d, yyyy');
  }

  const isUpcoming = (() => {
    const today = new Date();
    const eventDate = event.startDate ? new Date(event.startDate) : null;
    return eventDate && eventDate >= today;
  })();

  const calendarLink = (() => {
    if (!isUpcoming) return '';
    const start = toGoogleCalendarDate(event.startDate, event.startTime);
    const end = toGoogleCalendarDate(event.endDate, event.endTime);
    const text = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description || '');
    const location = encodeURIComponent(event.location || '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
  })();

  // Get background color for event card (matching events page)
  const getRandomBackground = (eventId: number) => {
    const colors = [
      'bg-gradient-to-br from-blue-50 to-blue-100',
      'bg-gradient-to-br from-green-50 to-green-100',
      'bg-gradient-to-br from-purple-50 to-purple-100',
      'bg-gradient-to-br from-pink-50 to-pink-100',
      'bg-gradient-to-br from-yellow-50 to-yellow-100',
      'bg-gradient-to-br from-indigo-50 to-indigo-100',
      'bg-gradient-to-br from-red-50 to-red-100',
      'bg-gradient-to-br from-teal-50 to-teal-100',
      'bg-gradient-to-br from-cyan-50 to-cyan-100',
      'bg-gradient-to-br from-rose-50 to-rose-100'
    ];
    return colors[eventId % colors.length];
  };

  return (
    <div>
      {/* Hero Section - Full width, no side image */}
      <section className="relative w-full bg-transparent" style={{ marginTop: '100px', paddingTop: '20px', paddingBottom: '20px' }}>
        <div className="w-full relative">
          {/* Main hero image container - Full image display with max height constraint */}
          {heroImage && heroImage.fileUrl ? (
            <div className="relative w-full flex items-center justify-center" style={{ maxWidth: '100%', minHeight: '200px' }}>
              {/* Blurred background image for width fill - positioned behind main image */}
              <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                <Image
                  src={heroImage.fileUrl}
                  alt="Hero blurred background"
                  fill
                  className="object-cover w-full h-full blur-lg scale-105"
                  style={{
                    filter: 'blur(24px) brightness(1.1)',
                    objectPosition: 'center',
                  }}
                  aria-hidden="true"
                  priority
                />
              </div>

              {/* Main hero image - Full image display with max height constraint */}
              <div className="relative w-full flex items-center justify-center" style={{ zIndex: 1, maxWidth: '100%' }}>
                <Image
                  src={heroImage.fileUrl}
                  alt="Event Hero"
                  width={1920}
                  height={1900}
                  className="w-full h-auto"
                  style={{
                    maxHeight: '1900px',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    objectPosition: 'center',
                    display: 'block',
                  }}
                  priority
                />
              </div>

              {/* Fade overlays for top and bottom borders */}
              <div className="pointer-events-none absolute left-0 top-0 w-full h-16" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)', zIndex: 20 }} />
              <div className="pointer-events-none absolute left-0 bottom-0 w-full h-16" style={{ background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)', zIndex: 20 }} />
            </div>
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200" />
          )}
        </div>
      </section>

      {/* Event Details - Styled like events page */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className={`${getRandomBackground(event.id!)} rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden`}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="flex flex-col h-full">
            {/* Content Section - Styled like events page */}
            <div className="p-6 border-t border-white/20 relative">
              {/* Buy Tickets Image - Top Right Corner */}
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

                return (
                  <div className="absolute top-4 right-4 lg:top-6 lg:right-6 z-10">
                    <Link
                      href={`/events/${event.id}/tickets`}
                      className={`transition-transform hover:scale-105 ${isPast ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                    >
                      <img
                        src="/images/buy_tickets_click_here_red.webp"
                        alt="Buy Tickets"
                        className="object-contain w-[150px] h-[52px] sm:w-[200px] sm:h-[70px]"
                      />
                    </Link>
                  </div>
                );
              })()}

              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-800 mb-3 sm:pr-48 lg:pr-56">
                {event.title}
              </h1>

              {/* Caption */}
              {event.caption && (
                <p className="text-gray-600 text-lg mb-4 sm:pr-48 lg:pr-56">
                  {event.caption}
                </p>
              )}

              {/* Event Details - Centered flexbox layout */}
              <div className="flex flex-wrap justify-center gap-3 mb-6 lg:max-w-4xl lg:mx-auto">
                <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[280px]">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-lg font-semibold">
                    {formatDate(event.startDate || '', event.timezone || 'America/New_York')}
                  </span>
                </div>
                {event.startTime && event.endTime && (
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
                {event.location && (
                  <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[280px]">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold">
                      {event.location}
                    </span>
                    {/* Copy and Navigate Icons */}
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(event.location || '');
                          alert('Address copied to clipboard!');
                        }}
                        className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors group-hover:scale-110 transition-transform duration-300"
                        title="Copy Address"
                      >
                        <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors group-hover:scale-110 transition-transform duration-300"
                        title="Open in Google Maps"
                      >
                        <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-muted/50 via-background to-muted/30 border-2 border-primary/30 shadow-lg relative overflow-hidden lg:max-w-4xl lg:mx-auto">
                  {/* Beveled border effect - Inner highlight */}
                  <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.05) 100%)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -1px 2px rgba(0,0,0,0.1)',
                  }}></div>
                  {/* Content */}
                  <div className="relative text-lg font-medium text-gray-800 whitespace-pre-wrap leading-relaxed z-10" style={{
                    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                    letterSpacing: '0.01em',
                    lineHeight: '1.75'
                  }}>
                    {event.description}
                  </div>
                </div>
              )}

              {/* Featured Performers Section */}
              {featuredPerformers.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3 justify-center lg:justify-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    Featured Guests
                  </h2>
                  <div className={cardGridStyles.centeredCardGrid}>
                    {featuredPerformers.map((performer, index) => {
                      const cardColor = cardColors[getColorIndex(performer.id || performer.name || index, cardColors.length)];
                      const avatarGradient = avatarGradients[getColorIndex(performer.id || performer.name || index, avatarGradients.length)];
                      return (
                      <div
                        key={performer.id}
                        className={`${cardGridStyles.cardItem} ${cardColor.bg} ${cardColor.border} rounded-lg shadow-md border-2 p-4 ${cardColor.hover} transition-all duration-200`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`relative w-16 h-16 flex-shrink-0 rounded-full overflow-hidden border-2 ${cardColor.border} bg-gradient-to-br ${avatarGradient.from} ${avatarGradient.to}`}>
                            {performer.portraitImageUrl && !failedImages.has(`performer-${performer.id}`) ? (
                              <Image
                                src={performer.portraitImageUrl}
                                alt={performer.name}
                                fill
                                className="object-cover"
                                onError={() => {
                                  // Mark this image as failed
                                  setFailedImages(prev => new Set(prev).add(`performer-${performer.id}`));
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                                {getInitials(performer.name || 'Guest')}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 text-lg mb-1">
                              {performer.name}
                              {performer.isHeadliner && (
                                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Headliner</span>
                              )}
                            </h3>
                            {performer.stageName && (
                              <p className="text-sm text-gray-600 mb-1">Stage Name: {performer.stageName}</p>
                            )}
                            {performer.role && (
                              <p className="text-sm text-gray-600 mb-1">Role: {performer.role}</p>
                            )}
                            {performer.bio && (
                              <p className="text-sm text-gray-700 mt-2" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>{performer.bio}</p>
                            )}
                            {/* Social Links */}
                            {(performer.websiteUrl || performer.facebookUrl || performer.instagramUrl || performer.youtubeUrl) && (
                              <div className="flex gap-2 mt-2">
                                {performer.websiteUrl && (
                                  <a
                                    href={performer.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 w-8 h-8 rounded-lg bg-teal-100 hover:bg-teal-200 flex items-center justify-center transition-colors group-hover:scale-110 transition-transform duration-300"
                                    title="Website"
                                  >
                                    <svg className="w-5 h-5 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9a9 9 0 00-9-9m0 18a9 9 0 009-9M12 3a9 9 0 00-9 9" />
                                    </svg>
                                  </a>
                                )}
                                {performer.facebookUrl && (
                                  <a
                                    href={performer.facebookUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors group-hover:scale-110 transition-transform duration-300"
                                    title="Facebook"
                                  >
                                    <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                  </a>
                                )}
                                {performer.instagramUrl && (
                                  <a
                                    href={performer.instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 w-8 h-8 rounded-lg bg-pink-100 hover:bg-pink-200 flex items-center justify-center transition-colors group-hover:scale-110 transition-transform duration-300"
                                    title="Instagram"
                                  >
                                    <svg className="w-5 h-5 text-pink-700" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                  </a>
                                )}
                                {performer.youtubeUrl && (
                                  <a
                                    href={performer.youtubeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors group-hover:scale-110 transition-transform duration-300"
                                    title="YouTube"
                                  >
                                    <svg className="w-5 h-5 text-red-700" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                    </svg>
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Contact Information Section */}
              {contacts.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    Contact Information
                  </h2>
                  <div className={cardGridStyles.centeredCardGrid}>
                    {contacts.map((contact, index) => {
                      const cardColor = cardColors[getColorIndex(contact.id || contact.name || index, cardColors.length)];
                      return (
                      <div
                        key={contact.id}
                        className={`${cardGridStyles.cardItem} ${cardColor.bg} ${cardColor.border} rounded-lg shadow-md border-2 p-4 ${cardColor.hover} transition-all duration-200`}
                      >
                        <h3 className="font-semibold text-gray-800 text-lg mb-3">{contact.name}</h3>
                        <div className="flex flex-wrap justify-center gap-3">
                          {contact.phone && (
                            <div className="flex items-center gap-3 text-gray-700">
                              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                              </div>
                              <a
                                href={`tel:${contact.phone}`}
                                className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {contact.phone}
                              </a>
                            </div>
                          )}
                          {contact.email && (
                            <div className="flex items-center gap-3 text-gray-700">
                              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <a
                                href={`mailto:${contact.email}`}
                                className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {contact.email}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Program Directors Section */}
              {programDirectors.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    Program Directors
                  </h2>
                  <div className={cardGridStyles.centeredCardGrid}>
                    {programDirectors.map((director, index) => {
                      const cardColor = cardColors[getColorIndex(director.id || director.name || index, cardColors.length)];
                      const avatarGradient = avatarGradients[getColorIndex(director.id || director.name || index, avatarGradients.length)];
                      return (
                      <div
                        key={director.id}
                        className={`${cardGridStyles.cardItem} ${cardColor.bg} ${cardColor.border} rounded-lg shadow-md border-2 p-4 ${cardColor.hover} transition-all duration-200`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`relative w-16 h-16 flex-shrink-0 rounded-full overflow-hidden border-2 ${cardColor.border} bg-gradient-to-br ${avatarGradient.from} ${avatarGradient.to}`}>
                            {director.photoUrl && !failedImages.has(`director-${director.id}`) ? (
                              <Image
                                src={director.photoUrl}
                                alt={director.name}
                                fill
                                className="object-cover"
                                onError={() => {
                                  // Mark this image as failed
                                  setFailedImages(prev => new Set(prev).add(`director-${director.id}`));
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                                {getInitials(director.name || 'Director')}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 text-lg mb-1">
                              {director.name}
                            </h3>
                            {director.bio && (
                              <p className="text-sm text-gray-700 mt-2" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>{director.bio}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Calendar Link - Only for upcoming events */}
                {isUpcoming && calendarLink && (
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
                )}

                {/* See Event Details Button - Links back to this page (for consistency) */}
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

        {/* Sponsors Section - Matching homepage style */}
        {sponsors.length > 0 && (() => {
          // Limit to maximum 12 sponsors
          const displayedSponsors = sponsors.slice(0, 12);
          const hasMoreSponsors = sponsors.length > 12;

          return (
            <div className="mb-8 mt-8">
              <div className={`${getRandomBackground(event.id!)} rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden`}>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    Our Sponsors
                  </h2>

                  {/* Sponsors List - Single column layout matching homepage */}
                  <div className="space-y-8 mb-8">
                    {displayedSponsors.map((sponsorJoin, index) => {
                      const sponsor = sponsorJoin.sponsor;
                      if (!sponsor) return null;
                      return (
                        <div
                          key={sponsorJoin.id || index}
                          className={`${getSponsorBackground(index)} rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden group cursor-pointer`}
                          style={{
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                            height: '680px'
                          }}
                          onClick={() => sponsor.websiteUrl && window.open(sponsor.websiteUrl, '_blank')}
                        >
                          <div className="flex flex-col h-full">
                            {/* Image Section - Using bannerImageUrl */}
                            <div className="relative w-full h-[448px] rounded-t-2xl overflow-hidden">
                              {sponsor.bannerImageUrl ? (
                                <Image
                                  src={sponsor.bannerImageUrl}
                                  alt={sponsor.name}
                                  width={800}
                                  height={600}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  style={{
                                    borderRadius: '1rem 1rem 0 0'
                                  }}
                                />
                              ) : (
                                <div
                                  className="w-full h-full flex items-center justify-center bg-gray-100"
                                  style={{
                                    borderRadius: '1rem 1rem 0 0'
                                  }}
                                >
                                  <span className="text-gray-400 text-5xl">🏢</span>
                                </div>
                              )}
                              {/* Sponsor Type Badge */}
                              {sponsor.type && (
                                <div className="absolute top-3 right-3">
                                  <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                                    {sponsor.type}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Content Section - Compact with 3-column layout */}
                            <div className="p-4 border-t border-white/20">
                              {/* Sponsor Name */}
                              <h2 className="text-xl font-bold text-gray-800 mb-2">
                                {sponsor.name}
                              </h2>

                              {/* Sponsor Details - 3-column layout with smart centering */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-2">
                                {/* Company Name */}
                                {sponsor.companyName && (
                                  <div className="flex items-center gap-3 text-gray-700">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                      </svg>
                                    </div>
                                    <span className="text-lg font-semibold">
                                      {sponsor.companyName}
                                    </span>
                                  </div>
                                )}

                                {/* Sponsor Type */}
                                {sponsor.type && (
                                  <div className="flex items-center gap-3 text-gray-700">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                      </svg>
                                    </div>
                                    <span className="text-lg font-semibold">
                                      {sponsor.type}
                                    </span>
                                  </div>
                                )}

                                {/* Contact Email */}
                                {sponsor.contactEmail && (
                                  <div className="flex items-center gap-3 text-gray-700">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                      <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                    <span className="text-lg font-semibold">
                                      {sponsor.contactEmail}
                                    </span>
                                  </div>
                                )}

                                {/* Contact Phone */}
                                {sponsor.contactPhone && (
                                  <div className="flex items-center gap-3 text-gray-700">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                      <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                      </svg>
                                    </div>
                                    <span className="text-lg font-semibold">
                                      {sponsor.contactPhone}
                                    </span>
                                  </div>
                                )}

                                {/* Website - Centers if it's the only item in the last row */}
                                {sponsor.websiteUrl && (
                                  <div className="flex items-center gap-3 text-gray-700 lg:justify-self-center lg:col-start-2">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                      <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9a9 9 0 00-9-9m0 18a9 9 0 009-9M12 3a9 9 0 00-9 9" />
                                      </svg>
                                    </div>
                                    <span className="text-lg font-semibold">
                                      {sponsor.websiteUrl.replace(/^https?:\/\//, '')}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Tagline/Description - Minimal bottom spacing */}
                              {sponsor.tagline && (
                                <div className="mb-1">
                                  <p className="text-gray-600 text-sm line-clamp-2">
                                    {sponsor.tagline}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* See All Sponsors Button - Only show if there are more than 12 */}
                  {hasMoreSponsors && (
                    <div className="text-center">
                      <Link
                        href={`/events/${event.id}#sponsors`}
                        className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <span>See All Sponsors</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
        {/* Gallery Section - Styled like gallery page */}
        {gallery.length > 0 && (
          <div className="mb-8 mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Event Gallery</h2>
                <p className="text-lg text-gray-600">
                  {gallery.length} {gallery.length === 1 ? 'photo or video' : 'photos and videos'}
                </p>
              </div>
              {(() => {
                const buttonColor = buttonColors[getColorIndex('gallery', buttonColors.length)];
                return (
                <button
                  onClick={() => {
                    console.log('View Gallery clicked for event:', event.title, 'Media count:', gallery.length);
                    setSlideshowInitialIndex(0);
                    setShowSlideshow(true);
                  }}
                  className={`flex items-center justify-center px-6 py-3 h-12 ${buttonColor.bg} ${buttonColor.hover} ${buttonColor.text} text-sm font-medium rounded-lg shadow-lg hover:shadow-xl border-2 ${buttonColor.border} transform hover:-translate-y-0.5 transition-all duration-200`}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Gallery
                </button>
                );
              })()}
            </div>

            {/* Preview thumbnails grid - Centered like TeamSection */}
            {previewMedia.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className={styles.galleryThumbnailsGrid}>
                  {previewMedia.map((mediaItem, index) => (
                    <button
                      key={mediaItem.id}
                      onClick={() => {
                        // Find the index of this media item in the full gallery
                        const galleryIndex = gallery.findIndex(m => m.id === mediaItem.id);
                        if (galleryIndex !== -1) {
                          setSlideshowInitialIndex(galleryIndex);
                          setShowSlideshow(true);
                        }
                      }}
                      className={`${styles.galleryThumbnail} relative bg-gray-100 rounded overflow-hidden hover:opacity-80 transition-opacity cursor-pointer`}
                    >
                      {mediaItem.fileUrl ? (
                        <Image
                          src={mediaItem.fileUrl}
                          alt={mediaItem.altText || mediaItem.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 150px, (max-width: 1024px) 120px, 100px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          {getMediaTypeIcon(mediaItem.eventMediaType)}
                        </div>
                      )}

                      {/* Media type indicator */}
                      <div className={`absolute bottom-0 right-0 ${getMediaTypeColor(mediaItem.eventMediaType)} p-1 rounded-tl`}>
                        {getMediaTypeIcon(mediaItem.eventMediaType)}
                      </div>
                    </button>
                  ))}

                  {/* Show remaining count */}
                  {remainingCount > 0 && (
                    <button
                      onClick={() => {
                        setSlideshowInitialIndex(previewMedia.length);
                        setShowSlideshow(true);
                      }}
                      className={`${styles.galleryThumbnail} flex items-center justify-center bg-gray-100 rounded text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors`}
                    >
                      +{remainingCount} more
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Slideshow Modal - Using gallery page component */}
        {showSlideshow && event && (
          <EventMediaSlideshow
            event={event}
            media={gallery}
            onClose={() => setShowSlideshow(false)}
            initialIndex={slideshowInitialIndex}
          />
        )}
        <div className="mt-8 text-center">
          <Link href="/events" className="inline-block bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-semibold text-lg shadow hover:bg-yellow-300 transition">
            View All Events
          </Link>
        </div>
      </div>
    </div>
  );
}