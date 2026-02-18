import React from 'react';
import Image from 'next/image';
import type { AdSlot as AdSlotType } from '../types';

interface AdSlotsProps {
  slots: AdSlotType[];
}

/**
 * Renders sidebar advertisement slots (embed HTML or image + link).
 * Shows empty placeholder when no slots (per layout requirements).
 */
export function AdSlots({ slots }: AdSlotsProps) {
  if (slots.length === 0) {
    return (
      <div className="rounded-xl bg-white border border-syro-table-border sacred-shadow-sm overflow-hidden p-4 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
        <h3 className="font-heading font-semibold text-lg text-syro-blue mb-2">Advertisement</h3>
        <p className="font-body text-sm text-syro-dark-gray">No advertisements at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {slots.map((slot) => (
        <div
          key={slot.id}
          className="rounded-xl bg-white border border-syro-table-border sacred-shadow-sm overflow-hidden p-4 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]"
        >
          {slot.embedHtml && slot.embedHtml.trim().length > 0 ? (
            <div
              className="prose prose-sm max-w-none [&>iframe]:max-w-full [&>iframe]:rounded-lg"
              dangerouslySetInnerHTML={{ __html: slot.embedHtml }}
            />
          ) : slot.mediaUrl ? (
            slot.linkUrl ? (
              <a
                href={slot.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg overflow-hidden border border-border hover:opacity-90 reverent-transition"
              >
                <div className="relative aspect-[120/60] w-full">
                  <Image
                    src={slot.mediaUrl}
                    alt="Advertisement"
                    fill
                    className="object-contain"
                    sizes="320px"
                    unoptimized
                  />
                </div>
              </a>
            ) : (
              <div className="relative aspect-[120/60] w-full rounded-lg overflow-hidden border border-border">
                <Image
                  src={slot.mediaUrl}
                  alt="Advertisement"
                  fill
                  className="object-contain"
                  sizes="320px"
                  unoptimized
                />
              </div>
            )
          ) : null}
        </div>
      ))}
    </div>
  );
}
