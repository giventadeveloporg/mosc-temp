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
 * Matches the news home layout: title, description, section + external links.
 */
export function NewsPageHeader() {
  return (
    <section className="py-12 bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray border-b border-syro-table-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-syro-display font-semibold text-3xl md:text-4xl text-syro-blue">
          News
        </h1>
        <p className="font-syro-primary text-syro-dark-gray mt-2">
          Latest news, featured stories, and press releases from the Church.
        </p>
        <nav className="mt-6 flex flex-wrap gap-3" aria-label="News sections">
          {SECTION_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="font-syro-primary text-sm font-medium text-syro-red hover:text-accent hover:underline transition-all duration-300 px-3 py-1.5 rounded-lg bg-syro-bg-gray/50 hover:bg-syro-bg-gray"
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
              className="font-syro-primary text-sm font-medium text-syro-red hover:text-accent hover:underline transition-all duration-300 px-3 py-1.5 rounded-lg bg-syro-bg-gray/50 hover:bg-syro-bg-gray"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
