"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { EventSponsorsDTO, EventMediaDTO } from "@/types";
import { Camera, Video, Eye } from 'lucide-react';
import styles from '../../events/[id]/GalleryThumbnails.module.css';
import { EventMediaSlideshow } from '@/app/gallery/components/EventMediaSlideshow';

// Array of modern background colors for sponsor cards
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
const getSponsorBackground = (sponsorId: number) => {
  return cardBackgrounds[sponsorId % cardBackgrounds.length];
};

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

export default function SponsorDetailsPage() {
  const params = useParams();
  const sponsorId = params?.id;
  const [sponsor, setSponsor] = useState<EventSponsorsDTO | null>(null);
  const [media, setMedia] = useState<EventMediaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [slideshowInitialIndex, setSlideshowInitialIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchSponsorDetails() {
      if (!sponsorId) return;
      setLoading(true);
      try {
        // Fetch sponsor details
        const sponsorRes = await fetch(`/api/proxy/event-sponsors/${sponsorId}`);
        if (!sponsorRes.ok) {
          throw new Error('Failed to fetch sponsor');
        }
        const sponsorData: EventSponsorsDTO = await sponsorRes.json();
        setSponsor(sponsorData);

        // Fetch sponsor media
        const mediaRes = await fetch(`/api/proxy/event-medias?sponsorId.equals=${sponsorId}&sort=priorityRanking,asc`);
        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          // Handle paginated response (Spring Data REST format)
          if (mediaData && typeof mediaData === 'object' && '_embedded' in mediaData && 'eventMedias' in mediaData._embedded) {
            setMedia(Array.isArray(mediaData._embedded.eventMedias) ? mediaData._embedded.eventMedias : []);
          } else {
            // Handle direct array response
            setMedia(Array.isArray(mediaData) ? mediaData : [mediaData]);
          }
        } else {
          setMedia([]);
        }
      } catch (err) {
        console.error('Error fetching sponsor details:', err);
        setSponsor(null);
        setMedia([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSponsorDetails();
  }, [sponsorId]);

  if (loading) return <div className="p-8 text-center">Loading sponsor details...</div>;
  if (!sponsor) return <div className="p-8 text-center text-red-500">Sponsor not found.</div>;

  // Find hero image - prioritize banner image
  const heroImage = media.find((m) => m.fileUrl && (m.isHomePageHeroImage || m.isFeaturedEventImage)) ||
                    media.find((m) => m.fileUrl);
  const gallery = media.filter((m) => m.fileUrl && (!heroImage || m.id !== heroImage.id));

  // Get preview images (first 12 media items for grid display)
  const previewMedia = gallery.slice(0, 12);
  const remainingCount = Math.max(0, gallery.length - 12);

  return (
    <div>
      {/* Hero Section - Full width banner image */}
      <section className="relative w-full bg-transparent" style={{ marginTop: '100px', paddingTop: '20px', paddingBottom: '20px' }}>
        <div className="w-full relative">
          {/* Main hero image container */}
          {(sponsor.bannerImageUrl || heroImage?.fileUrl) ? (
            <div className="relative w-full flex items-center justify-center" style={{ maxWidth: '100%', minHeight: '200px' }}>
              {/* Blurred background image */}
              <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                <Image
                  src={sponsor.bannerImageUrl || heroImage?.fileUrl || ''}
                  alt="Sponsor banner background"
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

              {/* Main hero image */}
              <div className="relative w-full flex items-center justify-center" style={{ zIndex: 1, maxWidth: '100%' }}>
                <Image
                  src={sponsor.bannerImageUrl || heroImage?.fileUrl || ''}
                  alt={`${sponsor.name} Banner`}
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

              {/* Fade overlays */}
              <div className="pointer-events-none absolute left-0 top-0 w-full h-16" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)', zIndex: 20 }} />
              <div className="pointer-events-none absolute left-0 bottom-0 w-full h-16" style={{ background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)', zIndex: 20 }} />
            </div>
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200" />
          )}
        </div>
      </section>

      {/* Sponsor Details - Styled like event details page */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className={`${getSponsorBackground(sponsor.id || 0)} rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden`}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="flex flex-col h-full">
            {/* Content Section */}
            <div className="p-6 border-t border-white/20 relative">
              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-800 mb-3">
                {sponsor.name}
              </h1>

              {/* Sponsor Type Badge */}
              {sponsor.type && (
                <div className="mb-4">
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                    {sponsor.type}
                  </span>
                </div>
              )}

              {/* Sponsor Details - Centered flexbox layout */}
              <div className="flex flex-wrap justify-center gap-3 mb-6 lg:max-w-4xl lg:mx-auto">
                {/* Company Name */}
                {sponsor.companyName && (
                  <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[280px]">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold">
                      {sponsor.companyName}
                    </span>
                  </div>
                )}

                {/* Contact Email */}
                {sponsor.contactEmail && (
                  <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[280px]">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <a
                      href={`mailto:${sponsor.contactEmail}`}
                      className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {sponsor.contactEmail}
                    </a>
                  </div>
                )}

                {/* Contact Phone */}
                {sponsor.contactPhone && (
                  <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[280px]">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <a
                      href={`tel:${sponsor.contactPhone}`}
                      className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {sponsor.contactPhone}
                    </a>
                  </div>
                )}

                {/* Website */}
                {sponsor.websiteUrl && (
                  <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[280px]">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-teal-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9a9 9 0 00-9-9m0 18a9 9 0 009-9M12 3a9 9 0 00-9 9" />
                      </svg>
                    </div>
                    <a
                      href={sponsor.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {sponsor.websiteUrl.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>

              {/* Tagline */}
              {sponsor.tagline && (
                <div className="mb-8 lg:max-w-3xl lg:mx-auto px-3">
                  <div className="relative overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-100 shadow-[0_18px_38px_-20px_rgba(146,118,65,0.45)] px-6 sm:px-10 py-8 text-center">
                    <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
                      background: 'linear-gradient(130deg, rgba(255,255,255,0.75) 0%, rgba(255,248,235,0.35) 50%, rgba(214,173,96,0.2) 100%)'
                    }}/>
                    <p className="relative z-10 font-heading text-xl sm:text-2xl text-amber-800 italic leading-relaxed tracking-wide">
                      {sponsor.tagline}
                    </p>
                  </div>
                </div>
              )}

              {/* Description */}
              {sponsor.description && sponsor.description.trim().length > 0 && (
                <div className="mb-10 lg:max-w-4xl lg:mx-auto px-3">
                  <div className="relative rounded-3xl border border-white/70 bg-gradient-to-br from-sky-100 via-white to-sky-50 shadow-[0_22px_45px_-25px_rgba(15,23,42,0.35)] px-8 sm:px-12 py-10 text-center">
                    <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.1) 40%, rgba(135,206,250,0.15) 100%)'
                    }}/>
                    <div className="relative z-10 text-left">
                      {sponsor.description.split(/\n{2,}|\r\n\r\n/).map((paragraph, idx) => (
                        <p
                          key={idx}
                          className="font-heading text-[1.1rem] sm:text-[1.2rem] text-slate-700 leading-relaxed tracking-[0.01em] mb-4 last:mb-0"
                        >
                          {paragraph.trim()}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button - Visit Website */}
              {sponsor.websiteUrl && (
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <a
                    href={sponsor.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-xl border-2 border-emerald-400 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-3"
                  >
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9a9 9 0 00-9-9m0 18a9 9 0 009-9M12 3a9 9 0 00-9 9" />
                      </svg>
                    </div>
                    <span className="text-lg">Visit Website</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gallery Section - Styled like event details page */}
        {gallery.length > 0 && (
          <div className="mb-8 mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Sponsor Gallery</h2>
                <p className="text-lg text-gray-600">
                  {gallery.length} {gallery.length === 1 ? 'photo or video' : 'photos and videos'}
                </p>
              </div>
              <button
                onClick={() => {
                  setSlideshowInitialIndex(0);
                  setShowSlideshow(true);
                }}
                className="flex items-center justify-center px-6 py-3 h-12 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl border-2 border-blue-400 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Full Gallery
              </button>
            </div>

            {/* Preview thumbnails grid */}
            {previewMedia.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className={styles.galleryThumbnailsGrid}>
                  {previewMedia.map((mediaItem) => (
                    <button
                      key={mediaItem.id}
                      onClick={() => {
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
                          alt={mediaItem.altText || mediaItem.title || 'Media'}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 150px, (max-width: 1024px) 120px, 100px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          {getMediaTypeIcon(mediaItem.eventMediaType || '')}
                        </div>
                      )}

                      {/* Media type indicator */}
                      <div className={`absolute bottom-0 right-0 ${getMediaTypeColor(mediaItem.eventMediaType || '')} p-1 rounded-tl`}>
                        {getMediaTypeIcon(mediaItem.eventMediaType || '')}
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

        {/* Slideshow Modal */}
        {showSlideshow && sponsor && (
          <EventMediaSlideshow
            event={{
              id: sponsor.id,
              title: sponsor.name || 'Sponsor',
              startDate: '',
              endDate: '',
              promotionStartDate: '',
              startTime: '',
              endTime: '',
              timezone: 'America/New_York',
            }}
            media={gallery}
            onClose={() => setShowSlideshow(false)}
            initialIndex={slideshowInitialIndex}
          />
        )}

        <div className="mt-8 text-center">
          <Link href="/sponsors" className="inline-block bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-semibold text-lg shadow hover:bg-yellow-300 transition">
            View All Sponsors
          </Link>
        </div>
      </div>
    </div>
  );
}

