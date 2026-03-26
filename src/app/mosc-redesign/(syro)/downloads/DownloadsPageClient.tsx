'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import type { EventMediaDTO } from '@/types';

export type DownloadCard = {
  title: string;
  link: string;
  image?: string;
  /** Legacy static rows use alert when link is # */
  isPlaceholder: boolean;
};

const BANNER_DESCRIPTION =
  'Church resources, forms, publications, and documents available for download.';

type Props = {
  staticCards: DownloadCard[];
  officialLibraryCards: DownloadCard[];
};

function DownloadCardGrid({ items, keyPrefix }: { items: DownloadCard[]; keyPrefix: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {items.map((item, index) => (
        <div
          key={`${keyPrefix}-${item.title}-${index}`}
          className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 p-8 flex flex-col h-full"
        >
          <div className="mb-5 flex justify-center pt-8">
            {item.image ? (
              <div className="relative w-full max-w-[280px] aspect-[280/168] rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-contain rounded-lg"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                />
              </div>
            ) : (
              <div className="w-full max-w-[280px] aspect-[280/168] rounded-lg flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-syro-red"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            )}
          </div>
          <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-2 line-clamp-2">
            {item.title}
          </h3>
          <div className="flex-1 min-h-[24px]" aria-hidden="true" />
          <Link
            href={item.link}
            className="syro-primary-button inline-flex items-center gap-2 w-fit"
            onClick={(e) => {
              if (item.isPlaceholder) {
                e.preventDefault();
                alert('This resource will be available for download soon. Please check back later.');
              }
            }}
          >
            Download
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      ))}
    </div>
  );
}

export default function DownloadsPageClient({ staticCards, officialLibraryCards }: Props) {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Downloads"
        breadcrumbFrom="home"
        description={BANNER_DESCRIPTION}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {officialLibraryCards.length > 0 && (
            <>
              <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
                Official library
              </h3>
              <DownloadCardGrid items={officialLibraryCards} keyPrefix="lib" />
            </>
          )}

          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            Church Resources
          </h3>

          <DownloadCardGrid items={staticCards} keyPrefix="static" />

          <QuickLinks />
        </div>
      </section>
    </div>
  );
}
