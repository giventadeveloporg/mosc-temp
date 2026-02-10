'use client';

import React from 'react';
import Link from 'next/link';

export interface SyroPageBannerProps {
  /** Page title shown in uppercase (e.g. "Holy Synod") */
  title: string;
}

/**
 * Page banner matching static HTML (holy-synod.html): gradient background,
 * uppercase title, breadcrumb HOME / SYRO / Title in red, shepherd silhouette on right.
 * Replaces the centered hero for consistent header across administration, catholicate, etc.
 */
const SHEPHERD_IMAGE_SRC = 'https://www.syromalabarchurch.in/assets/images/background/shepared.png';

export default function SyroPageBanner({ title }: SyroPageBannerProps) {
  return (
    <section
      className="relative flex min-h-[150px] max-h-[150px] items-center overflow-hidden uppercase"
      style={{
        background: 'linear-gradient(-90deg, #dc354662, #ff790348)',
      }}
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="pr-24 md:pr-40">
            <h2 className="font-syro-display text-2xl font-semibold text-syro-blue uppercase tracking-wide">
              {title}
            </h2>
            <nav aria-label="Breadcrumb" className="mt-1">
              <ol className="flex flex-wrap items-center gap-x-1.5 text-sm font-medium uppercase tracking-wide">
                <li>
                  <Link
                    href="/syro"
                    className="text-[#990b3f] hover:text-syro-red transition-colors duration-300"
                  >
                    Home
                  </Link>
                </li>
                <li className="text-[#990b3f]" aria-hidden="true">
                  /
                </li>
                <li className="text-syro-red" aria-current="page">
                  {title}
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Shepherd silhouette - right side, absolute (hidden on small screens to avoid overlap) */}
      <div className="absolute bottom-0 right-0 hidden md:block pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SHEPHERD_IMAGE_SRC}
          alt=""
          className="h-[140px] w-auto object-contain object-bottom opacity-90"
          width={280}
          height={140}
        />
      </div>
    </section>
  );
}
