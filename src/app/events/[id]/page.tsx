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
            <div className="p-6 border-t border-white/20">
              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-800 mb-3">
                {event.title}
              </h1>

              {/* Caption */}
              {event.caption && (
                <p className="text-gray-600 text-lg mb-4">
                  {event.caption}
                </p>
              )}

              {/* Event Details - Matching events page format */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-700">
                  <span className="text-2xl">📅</span>
                  <span className="text-lg font-semibold">
                    {formatDate(event.startDate || '', event.timezone || 'America/New_York')}
                  </span>
                </div>
                {event.startTime && event.endTime && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <span className="text-2xl">🕐</span>
                    <span className="text-lg font-semibold">
                      {formatTime(event.startTime)} - {formatTime(event.endTime)} (EDT)
                    </span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <span className="text-2xl">📍</span>
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
                        className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                        title="Copy Address"
                      >
                        <span className="text-sm">📋</span>
                      </button>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                        title="Open in Google Maps"
                      >
                        <span className="text-sm">🗺️</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-muted/50 via-background to-muted/30 border-2 border-primary/30 shadow-lg relative overflow-hidden">
                  {/* Beveled border effect - Inner highlight */}
                  <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.05) 100%)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -1px 2px rgba(0,0,0,0.1)',
                  }}></div>
                  {/* Content */}
                  <div className="relative text-lg text-foreground whitespace-pre-wrap leading-relaxed z-10">
                    {event.description}
                  </div>
                </div>
              )}

              {/* Featured Performers Section */}
              {featuredPerformers.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
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
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    title="Website"
                                  >
                                    🌐
                                  </a>
                                )}
                                {performer.facebookUrl && (
                                  <a
                                    href={performer.facebookUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    title="Facebook"
                                  >
                                    📘
                                  </a>
                                )}
                                {performer.instagramUrl && (
                                  <a
                                    href={performer.instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-pink-600 hover:text-pink-800 text-sm"
                                    title="Instagram"
                                  >
                                    📷
                                  </a>
                                )}
                                {performer.youtubeUrl && (
                                  <a
                                    href={performer.youtubeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-red-600 hover:text-red-800 text-sm"
                                    title="YouTube"
                                  >
                                    ▶️
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
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📞</span>
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
                        <h3 className="font-semibold text-gray-800 text-lg mb-2">{contact.name}</h3>
                        <div className="space-y-2">
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <span className="text-lg">📱</span>
                              <a
                                href={`tel:${contact.phone}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {contact.phone}
                              </a>
                            </div>
                          )}
                          {contact.email && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <span className="text-lg">✉️</span>
                              <a
                                href={`mailto:${contact.email}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
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
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎬</span>
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
                {/* Buy Tickets Image - Only for upcoming events */}
                {(() => {
                  if (!event.startDate) return null;

                  // Get today's date in YYYY-MM-DD format using local timezone
                  const today = new Date();
                  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

                  // Compare dates as strings to avoid timezone parsing issues
                  const eventDateStr = event.startDate ? event.startDate.split('T')[0] : null; // Get just the date part (YYYY-MM-DD)

                  if (!eventDateStr) return null;

                  // Check if event date is today or in the future
                  const isToday = eventDateStr === todayStr;
                  const isFuture = eventDateStr > todayStr;
                  const isUpcomingLocal = isToday || isFuture;

                  if (!isUpcomingLocal) return null;

                  return (
                    <Link
                      href={`/events/${event.id}/tickets`}
                      className="transition-transform hover:scale-105"
                    >
                      <img
                        src="/images/buy_tickets_click_here_red.webp"
                        alt="Buy Tickets"
                        className="object-contain"
                        style={{
                          width: '200px',
                          height: '70px'
                        }}
                      />
                    </Link>
                  );
                })()}

                {/* Calendar Link - Only for upcoming events */}
                {isUpcoming && calendarLink && (() => {
                  const buttonColor = buttonColors[getColorIndex('calendar', buttonColors.length)];
                  return (
                  <a
                    href={calendarLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${buttonColor.bg} ${buttonColor.hover} ${buttonColor.text} font-medium py-3 px-6 rounded-xl border-2 ${buttonColor.border} transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-3`}
                  >
                    <span className="text-2xl">📅</span>
                    <span className="text-lg">Add to Calendar</span>
                  </a>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Sponsors Section - Stacked one on top of another */}
        {sponsors.length > 0 && (
          <div className="mb-8 mt-8">
            <div className={`${getRandomBackground(event.id!)} rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden`}>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-2xl">🏢</span>
                  Our Sponsors
                </h2>
                <div className="space-y-4">
                  {sponsors.map((sponsorJoin, index) => {
                    const sponsor = sponsorJoin.sponsor;
                    if (!sponsor) return null;
                    const cardColor = cardColors[getColorIndex(sponsor.id || sponsor.name || index, cardColors.length)];
                    return (
                      <div
                        key={sponsorJoin.id || index}
                        className={`${cardColor.bg} ${cardColor.border} rounded-lg shadow-md border-2 p-4 ${cardColor.hover} transition-all duration-200`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Sponsor Logo */}
                          {sponsor.logoUrl && !failedImages.has(`sponsor-${sponsor.id}`) ? (
                            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 border-gray-300 bg-white">
                              <Image
                                src={sponsor.logoUrl}
                                alt={sponsor.name}
                                fill
                                className="object-contain p-2"
                                onError={() => {
                                  setFailedImages(prev => new Set(prev).add(`sponsor-${sponsor.id}`));
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                              <span className="text-gray-400 text-2xl">🏢</span>
                            </div>
                          )}

                          {/* Sponsor Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 text-lg mb-1">
                                  {sponsor.name || 'Sponsor'}
                                </h3>
                                {sponsor.companyName && (
                                  <p className="text-sm text-gray-600 mb-1">{sponsor.companyName}</p>
                                )}
                                {sponsor.tagline && (
                                  <p className="text-sm text-gray-700 mb-2 italic">{sponsor.tagline}</p>
                                )}
                                {sponsor.description && (
                                  <p className="text-sm text-gray-700 mb-2" style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                  }}>{sponsor.description}</p>
                                )}
                                {/* Sponsor Type Badge */}
                                {sponsor.type && (
                                  <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full mb-2">
                                    {sponsor.type}
                                  </span>
                                )}
                                {/* Contact and Social Links */}
                                <div className="flex flex-wrap gap-3 mt-2">
                                  {sponsor.websiteUrl && (
                                    <a
                                      href={sponsor.websiteUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-sm"
                                      title="Website"
                                    >
                                      🌐 Website
                                    </a>
                                  )}
                                  {sponsor.contactEmail && (
                                    <a
                                      href={`mailto:${sponsor.contactEmail}`}
                                      className="text-blue-600 hover:text-blue-800 text-sm"
                                      title="Email"
                                    >
                                      ✉️ {sponsor.contactEmail}
                                    </a>
                                  )}
                                  {sponsor.contactPhone && (
                                    <a
                                      href={`tel:${sponsor.contactPhone}`}
                                      className="text-blue-600 hover:text-blue-800 text-sm"
                                      title="Phone"
                                    >
                                      📱 {sponsor.contactPhone}
                                    </a>
                                  )}
                                  {sponsor.facebookUrl && (
                                    <a
                                      href={sponsor.facebookUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-sm"
                                      title="Facebook"
                                    >
                                      📘 Facebook
                                    </a>
                                  )}
                                  {sponsor.instagramUrl && (
                                    <a
                                      href={sponsor.instagramUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-pink-600 hover:text-pink-800 text-sm"
                                      title="Instagram"
                                    >
                                      📷 Instagram
                                    </a>
                                  )}
                                  {sponsor.linkedinUrl && (
                                    <a
                                      href={sponsor.linkedinUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-700 hover:text-blue-900 text-sm"
                                      title="LinkedIn"
                                    >
                                      💼 LinkedIn
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
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