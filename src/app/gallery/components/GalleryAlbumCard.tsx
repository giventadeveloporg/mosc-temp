'use client';

import { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { AlbumMediaSlideshow } from './AlbumMediaSlideshow';
import type { GalleryAlbumWithMedia } from '../../ApiServerActions';

interface GalleryAlbumCardProps {
  albumWithMedia: GalleryAlbumWithMedia;
}

export function GalleryAlbumCard({ albumWithMedia }: GalleryAlbumCardProps) {
  const [showSlideshow, setShowSlideshow] = useState(false);
  const { album, media, totalMediaCount } = albumWithMedia;

  const coverImage = album.coverImageUrl
    ? { fileUrl: album.coverImageUrl, altText: album.title }
    : media.find(m => m.fileUrl);

  const formatAlbumDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Date TBD';
    }
  };

  return (
    <>
      <div
        className="group homepage-glass-card services-glass-card-face rounded-2xl overflow-hidden flex flex-col h-full hover:-translate-y-1 transition-all duration-300"
        style={{ padding: 0 }}
      >
        <div className="relative w-full h-48 overflow-hidden">
          {coverImage?.fileUrl ? (
            <Image
              src={coverImage.fileUrl}
              alt={coverImage.altText || album.title}
              fill
              className="object-contain group-hover:scale-105 transition-all duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-100/80 via-purple-50/60 to-violet-100/80 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <svg className="w-32 h-32 text-violet-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 2h4v7h7v4h-7v9h-4v-9H3v-4h7V2z" />
                </svg>
              </div>
              <svg className="w-16 h-16 text-violet-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {totalMediaCount > 0 && (
            <div className="absolute top-3 right-3 bg-violet-600 px-3 py-1 rounded-full text-xs font-medium shadow-md text-white">
              {totalMediaCount} {totalMediaCount === 1 ? 'photo' : 'photos'}
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8 flex flex-col flex-1">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-violet-700 transition-all duration-300">
            {album.title}
          </h3>

          {album.createdAt && (
            <p className="text-sm text-gray-600 mb-4">
              {formatAlbumDate(album.createdAt)}
            </p>
          )}

          {album.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {album.description}
            </p>
          )}

          <div className="flex items-center mt-auto">
            <button
              onClick={() => setShowSlideshow(true)}
              disabled={media.length === 0}
              className="flex-shrink-0 h-12 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 px-5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="View Album"
              aria-label="View Album"
              type="button"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-200 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="font-semibold text-blue-700">View Album</span>
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showSlideshow && (
        <AlbumMediaSlideshow
          album={album}
          media={media}
          onClose={() => setShowSlideshow(false)}
        />
      )}
    </>
  );
}
