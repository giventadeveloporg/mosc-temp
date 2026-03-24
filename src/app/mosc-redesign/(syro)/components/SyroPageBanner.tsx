'use client';

import React from 'react';
import Link from 'next/link';

export interface SyroPageBannerProps {
  /** Page title shown in uppercase (e.g. "Holy Synod") */
  title: string;
  /** Optional description shown in the banner below the breadcrumb */
  description?: string;
  /** When true, center the title and breadcrumb text (e.g. on saints subpages) */
  centerText?: boolean;
  /** Breadcrumb path: 'home' = Home / Title, 'gallery' = Gallery / Title, 'news' = News / Title, 'directory' = Directory / Title, etc. */
  breadcrumbFrom?: 'home' | 'gallery' | 'downloads' | 'calendar' | 'holy-synod' | 'saints' | 'the-church' | 'catholicate' | 'administration' | 'ecumenical' | 'dioceses' | 'spiritual-organizations' | 'publications' | 'institutions' | 'training' | 'theological-seminaries' | 'lectionary' | 'news' | 'directory';
  /** Optional middle segment for 3-level breadcrumb (e.g. The Church / Theology / Christology). Used on the-church subpages under Theology, Spirituality, History, Liturgy. */
  breadcrumbParent?: { label: string; href: string };
  /** When true, omit the breadcrumb nav (e.g. diocese-scoped parish list where the parent “Directory” link is not desired). Title stays in the h2. */
  hideBreadcrumbNav?: boolean;
}

/**
 * Page banner matching static HTML (holy-synod.html): gradient background,
 * uppercase title, breadcrumb HOME / SYRO / Title in red, shepherd silhouette on right.
 * Replaces the centered hero for consistent header across administration, catholicate, etc.
 */
const SHEPHERD_IMAGE_SRC = 'https://www.syromalabarchurch.in/assets/images/background/shepared.png';

const BREADCRUMB_CONFIG = {
  home: { href: '/mosc-redesign', label: 'Home' },
  gallery: { href: '/mosc-redesign/gallery', label: 'Gallery' },
  downloads: { href: '/mosc-redesign/downloads', label: 'Downloads' },
  calendar: { href: '/mosc-redesign/calendar', label: 'Calendar' },
  'holy-synod': { href: '/mosc-redesign/holy-synod', label: 'Holy Synod' },
  saints: { href: '/mosc-redesign/saints', label: 'Saints' },
  'the-church': { href: '/mosc-redesign/the-church', label: 'The Church' },
  catholicate: { href: '/mosc-redesign/catholicate', label: 'The Catholicate' },
  administration: { href: '/mosc-redesign/administration', label: 'Administration' },
  ecumenical: { href: '/mosc-redesign/ecumenical', label: 'Ecumenical' },
  dioceses: { href: '/mosc-redesign/dioceses', label: 'Dioceses' },
  'spiritual-organizations': { href: '/mosc-redesign/spiritual-organizations', label: 'Spiritual Organizations' },
  publications: { href: '/mosc-redesign/publications', label: 'Publications' },
  institutions: { href: '/mosc-redesign/institutions', label: 'Institutions' },
  training: { href: '/mosc-redesign/training', label: 'Training' },
  'theological-seminaries': { href: '/mosc-redesign/theological-seminaries', label: 'Theological Seminaries' },
  lectionary: { href: '/mosc-redesign/lectionary', label: 'Lectionary' },
  news: { href: '/mosc-redesign/news', label: 'News' },
  directory: { href: '/mosc-redesign/directory', label: 'Directory' },
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
    <nav aria-label="Breadcrumb" className="mb-4 font-dm-sans">
      <ol className="flex flex-wrap items-center gap-x-1.5 text-sm font-medium uppercase tracking-wide text-parchment-light/90">
        <li>
          <Link
            href={config.href}
            className="text-parchment-light/90 hover:text-warmGold transition-colors duration-300"
          >
            {config.label}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="text-warmGold" aria-current="page">
          {currentTitle}
        </li>
      </ol>
    </nav>
  );
}

export default function SyroPageBanner({
  title,
  description,
  centerText,
  breadcrumbFrom = 'home',
  breadcrumbParent,
  hideBreadcrumbNav = false,
}: SyroPageBannerProps) {
  const config = BREADCRUMB_CONFIG[breadcrumbFrom];
  /** Breadcrumb row: cool cyan family on burgundy gradient (distinct from title + description). */
  const breadcrumbLinkClass =
    'text-cyan-100 hover:text-white transition-colors duration-300 [text-shadow:0_1px_2px_rgba(0,0,0,0.25)]';
  const breadcrumbSeparatorClass = 'text-cyan-300/60';
  const breadcrumbCurrentClass = 'text-white font-semibold [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]';
  return (
    <section
      className="relative flex min-h-[150px] h-auto items-center overflow-hidden uppercase py-4 md:py-0 md:min-h-[160px] font-dm-sans border-b border-burgundy/25"
      style={{
        background: 'linear-gradient(135deg, #8B1030 0%, #C0284A 45%, #C8860A 100%)',
      }}
    >
      <div className="absolute inset-0 bg-black/10 pointer-events-none" aria-hidden />

      <div className="relative z-10 flex h-full min-h-full w-full items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        <div className={`flex h-full min-h-full w-full items-center ${centerText ? 'justify-center' : 'justify-between'}`}>
          <div className={`syro-banner-content flex flex-col justify-center min-w-0 flex-1 ${centerText ? 'text-center' : description ? 'pr-24 md:pr-64' : 'pr-24 md:pr-40'}`}>
            <h2 className="syro-banner-title text-base sm:text-xl lg:text-2xl font-bold text-amber-100 uppercase tracking-wide break-words drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
              {title}
            </h2>
            {!hideBreadcrumbNav && (
              <nav aria-label="Breadcrumb" className="syro-banner-breadcrumb mt-1">
                <ol className={`flex flex-wrap items-center gap-x-1.5 text-xs sm:text-sm font-medium uppercase tracking-wide ${centerText ? 'justify-center' : ''}`}>
                  <li>
                    <Link
                      href={config.href}
                      className={breadcrumbLinkClass}
                    >
                      {config.label}
                    </Link>
                  </li>
                  <li className={breadcrumbSeparatorClass} aria-hidden="true">
                    /
                  </li>
                  {breadcrumbParent ? (
                    <>
                      <li>
                        <Link
                          href={breadcrumbParent.href}
                          className={breadcrumbLinkClass}
                        >
                          {breadcrumbParent.label}
                        </Link>
                      </li>
                      <li className={breadcrumbSeparatorClass} aria-hidden="true">
                        /
                      </li>
                      <li className={breadcrumbCurrentClass} aria-current="page">
                        {title}
                      </li>
                    </>
                  ) : (
                    <li className={breadcrumbCurrentClass} aria-current="page">
                      {title}
                    </li>
                  )}
                </ol>
              </nav>
            )}
            {description && (
              <p className="syro-banner-description text-base sm:text-lg text-pink-200 leading-relaxed mt-3 normal-case font-normal [text-shadow:0_1px_4px_rgba(0,0,0,0.35)]">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Shepherd silhouette - right side, absolute (hidden on small screens to avoid overlap) */}
      <div className="absolute bottom-0 right-0 hidden md:block pointer-events-none opacity-80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SHEPHERD_IMAGE_SRC}
          alt=""
          className="h-[140px] w-auto object-contain object-bottom"
          width={280}
          height={140}
        />
      </div>
    </section>
  );
}
