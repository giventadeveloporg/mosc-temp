'use client';

import React from 'react';
import Link from 'next/link';

export interface SyroPageBannerProps {
  /** Page title shown in uppercase (e.g. "Holy Synod") */
  title: string;
  /** When true, center the title and breadcrumb text (e.g. on saints subpages) */
  centerText?: boolean;
  /** Breadcrumb path: 'home' = Home / Title, 'holy-synod' = Holy Synod / Title, 'saints' = Saints / Title, 'the-church' = The Church / Title, 'catholicate' = The Catholicate / Title, 'administration' = Administration / Title, 'ecumenical' = Ecumenical / Title, 'dioceses' = Dioceses / Title */
  breadcrumbFrom?: 'home' | 'holy-synod' | 'saints' | 'the-church' | 'catholicate' | 'administration' | 'ecumenical' | 'dioceses';
}

/**
 * Page banner matching static HTML (holy-synod.html): gradient background,
 * uppercase title, breadcrumb HOME / SYRO / Title in red, shepherd silhouette on right.
 * Replaces the centered hero for consistent header across administration, catholicate, etc.
 */
const SHEPHERD_IMAGE_SRC = 'https://www.syromalabarchurch.in/assets/images/background/shepared.png';

const BREADCRUMB_CONFIG = {
  home: { href: '/syro', label: 'Home' },
  'holy-synod': { href: '/syro/holy-synod', label: 'Holy Synod' },
  saints: { href: '/syro/saints', label: 'Saints' },
  'the-church': { href: '/syro/the-church', label: 'The Church' },
  catholicate: { href: '/syro/catholicate', label: 'The Catholicate' },
  administration: { href: '/syro/administration', label: 'Administration' },
  ecumenical: { href: '/syro/ecumenical', label: 'Ecumenical' },
  dioceses: { href: '/syro/dioceses', label: 'Dioceses' },
} as const;

export type SyroBreadcrumbFrom = keyof typeof BREADCRUMB_CONFIG;

export interface SyroBreadcrumbProps {
  /** Same as SyroPageBanner breadcrumbFrom (e.g. 'ecumenical', 'dioceses') */
  breadcrumbFrom: SyroBreadcrumbFrom;
  /** Current page title (last segment of breadcrumb) */
  currentTitle: string;
}

/**
 * Standalone breadcrumb nav for use inside hero sections (ecumenical, dioceses subpages).
 * Renders: Parent / Current Title in the same style as SyroPageBanner.
 */
export function SyroBreadcrumb({ breadcrumbFrom, currentTitle }: SyroBreadcrumbProps) {
  const config = BREADCRUMB_CONFIG[breadcrumbFrom];
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-x-1.5 text-sm font-medium uppercase tracking-wide text-[#990b3f]">
        <li>
          <Link
            href={config.href}
            className="text-[#990b3f] hover:text-syro-red transition-colors duration-300"
          >
            {config.label}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="text-syro-red" aria-current="page">
          {currentTitle}
        </li>
      </ol>
    </nav>
  );
}

export default function SyroPageBanner({ title, centerText, breadcrumbFrom = 'home' }: SyroPageBannerProps) {
  const config = BREADCRUMB_CONFIG[breadcrumbFrom];
  return (
    <section
      className="relative flex h-[150px] items-center overflow-hidden uppercase"
      style={{
        background: 'linear-gradient(-90deg, #dc354662, #ff790348)',
      }}
    >
      <div className="relative z-10 flex h-full w-full items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex h-full w-full items-center ${centerText ? 'justify-center' : 'justify-between'}`}>
          <div className={`flex flex-col justify-center ${centerText ? 'text-center' : 'pr-24 md:pr-40'}`}>
            <h2 className="font-syro-display text-2xl font-semibold text-syro-blue uppercase tracking-wide">
              {title}
            </h2>
            <nav aria-label="Breadcrumb" className="mt-1">
              <ol className={`flex flex-wrap items-center gap-x-1.5 text-sm font-medium uppercase tracking-wide ${centerText ? 'justify-center' : ''}`}>
                <li>
                  <Link
                    href={config.href}
                    className="text-[#990b3f] hover:text-syro-red transition-colors duration-300"
                  >
                    {config.label}
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
