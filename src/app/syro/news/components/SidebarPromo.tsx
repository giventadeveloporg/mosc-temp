import React from 'react';
import Image from 'next/image';
import type { SidebarPromoBlock } from '../types';

interface SidebarPromoProps {
  block: SidebarPromoBlock;
}

/**
 * Sidebar promotional block: embed (e.g. Facebook) or video + thumbnail.
 * Renders embedCode when present; otherwise video link with thumbnail.
 */
export function SidebarPromo({ block }: SidebarPromoProps) {
  const hasEmbed = block.embedCode && block.embedCode.trim().length > 0;

  return (
    <div className="rounded-xl bg-white border border-syro-table-border shadow-syro-card-sm overflow-hidden p-4">
      {block.title && (
        <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-3">
          {block.title}
        </h3>
      )}
      {hasEmbed ? (
        <div
          className="prose prose-sm max-w-none [&>iframe]:max-w-full [&>iframe]:rounded-lg"
          dangerouslySetInnerHTML={{ __html: block.embedCode! }}
        />
      ) : block.videoUrl ? (
        <a
          href={block.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg overflow-hidden border border-syro-table-border hover:opacity-90 transition-all duration-300"
        >
          {block.thumbnailUrl ? (
            <div className="relative aspect-video w-full">
              <Image
                src={block.thumbnailUrl}
                alt={block.title || 'Video'}
                fill
                className="object-cover"
                sizes="320px"
                unoptimized
              />
            </div>
          ) : (
            <span className="block py-8 text-center font-syro-primary text-syro-dark-gray text-sm">
              Watch video
            </span>
          )}
        </a>
      ) : (
        <p className="font-syro-primary text-sm text-syro-dark-gray">
          No promotional content configured.
        </p>
      )}
    </div>
  );
}
