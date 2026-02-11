'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { EventcubeCheckoutData } from './EventcubeCheckoutServerData';

interface EventcubeCheckoutClientProps {
  initialData: EventcubeCheckoutData;
  eventId: string;
}

const IFRAME_RESIZER_SRC = 'https://d20c5uea2cqk8c.cloudfront.net/_shared/iframeSizer.min.js';

/**
 * Event Cube embed checkout – hero at top, embedded Event Cube iframe below.
 * Loads Event Cube iframe resizer script and injects iframe with eventcubeEmbedUrl.
 */
export default function EventcubeCheckoutClient({ initialData, eventId }: EventcubeCheckoutClientProps) {
  const { event, heroImageUrl, eventcubeEmbedUrl } = initialData;
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!eventcubeEmbedUrl || !containerRef.current) return;

    const iframeId = `ecEmbedIframe_${eventId}`;

    const runResizer = () => {
      const win = typeof window !== 'undefined' ? window : null;
      if (win && typeof (win as unknown as { iFrameResize?: (opts: unknown, selector: string) => void }).iFrameResize === 'function') {
        try {
          (win as unknown as { iFrameResize: (opts: unknown, selector: string) => void }).iFrameResize(
            { checkOrigin: false },
            `#${iframeId}`
          );
        } catch (e) {
          console.warn('[EventcubeCheckoutClient] iFrameResize failed:', e);
        }
      }
    };

    const loadScript = () => {
      const existing = document.querySelector(`script[src="${IFRAME_RESIZER_SRC}"]`);
      if (existing) {
        setTimeout(runResizer, 500);
        return;
      }
      const script = document.createElement('script');
      script.src = IFRAME_RESIZER_SRC;
      script.async = true;
      script.onload = () => setTimeout(runResizer, 500);
      document.body.appendChild(script);
    };

    loadScript();
  }, [eventId, eventcubeEmbedUrl]);

  return (
    <div className="min-h-screen bg-background">
      {/* Event Hero – Top */}
      {heroImageUrl && (
        <div className="relative w-full h-auto min-h-[240px] sm:min-h-[280px] md:min-h-[320px] overflow-hidden rounded-t-2xl">
          <Image
            src={heroImageUrl}
            alt={event.title}
            width={1200}
            height={400}
            className="w-full h-auto object-contain sm:object-cover min-h-[240px] sm:min-h-[280px] md:min-h-[320px]"
            style={{ backgroundColor: 'transparent', borderRadius: '1rem 1rem 0 0' }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none">
            <h1 className="font-heading font-semibold text-2xl sm:text-3xl text-white drop-shadow-md">
              {event.title}
            </h1>
            {event.caption && (
              <p className="text-lg opacity-90 mt-1 line-clamp-2">{event.caption}</p>
            )}
          </div>
        </div>
      )}

      {/* Event Cube embed */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="bg-card rounded-2xl sacred-shadow p-6 sm:p-8 lg:p-10">
          <div ref={containerRef} id={`ecEmbed_${eventId}`} className="min-h-[200px]">
            <iframe
              ref={iframeRef}
              id={`ecEmbedIframe_${eventId}`}
              src={eventcubeEmbedUrl}
              title="Event Cube – Buy tickets"
              frameBorder={0}
              style={{
                width: '1px',
                minWidth: '100%',
                height: '1000px',
                minHeight: '200px',
                border: 'none',
              }}
            />
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href={`/events/${eventId}`}
            className="font-body text-sm font-medium text-primary hover:underline"
          >
            ← Return to event
          </Link>
        </div>
      </div>
    </div>
  );
}
