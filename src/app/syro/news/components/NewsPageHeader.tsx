import React from 'react';

/** Section anchors (same page) - used on news index and article detail. */
const SECTION_LINKS = [
  { label: 'Main News', href: '/syro/news#main-news' },
  { label: 'Featured News', href: '/syro/news#featured-news' },
  { label: 'Press Release', href: '/syro/news#press-release' },
  { label: 'Most Read', href: '/syro/news#most-read' },
] as const;

/** External nav links from legacy index.html. */
const EXTERNAL_LINKS = [
  { label: 'LIVE', href: 'https://www.youtube.com/@DevalokamAramana/streams' },
] as const;

/**
 * Shared hero/header for News index and article detail pages.
 * Design system: mainTitle h1 2.8rem/700, p 20px/#506276, container 1200px.
 */
export function NewsPageHeader() {
  return (
    <section className="py-syro-xxxl bg-syro-bg-gray border-b border-syro-table-border font-syro-primary">
      <div className="max-w-[1200px] mx-auto px-[15px]">
        <h1 className="font-syro-display font-bold text-syro-h1 text-syro-blue mb-2.5">
          News
        </h1>
        <p className="text-syro-body text-syro-dark-gray mb-syro-xxl">
          Latest news, featured stories, and press releases from the Church.
        </p>
        <nav className="flex flex-wrap gap-syro-xl" aria-label="News sections">
          {SECTION_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-syro-small font-medium text-syro-blue hover:text-syro-red transition-colors duration-300 px-syro-md py-syro-sm rounded-[5px] bg-syro-light-gray/80 hover:bg-syro-light-gray"
            >
              {label}
            </a>
          ))}
          {EXTERNAL_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-syro-small font-medium text-syro-blue hover:text-syro-red transition-colors duration-300 px-syro-md py-syro-sm rounded-[5px] bg-syro-light-gray/80 hover:bg-syro-light-gray"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
