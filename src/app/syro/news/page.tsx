import React from 'react';
import { getNewsHomePageData } from './getNewsHomePageData';
import { FlashBar } from './components/FlashBar';
import { FlashNewsCarousel } from './components/FlashNewsCarousel';
import { ArticleList } from './components/ArticleList';
import { SidebarPromo } from './components/SidebarPromo';
import { FollowUsFacebook } from './components/FollowUsFacebook';
import { AdSlots } from './components/AdSlots';

export const metadata = {
  title: 'News',
  description: 'News and updates from the Malankara Orthodox Syrian Church.',
};

/** Section anchors (same page) */
const SECTION_LINKS = [
  { label: 'Main News', href: '#main-news' },
  { label: 'Featured News', href: '#featured-news' },
  { label: 'Press Release', href: '#press-release' },
  { label: 'Most Read', href: '#most-read' },
] as const;

/** External nav links from legacy index.html - no Strapi, URL forwarding */
const EXTERNAL_LINKS = [
  { label: 'LIVE', href: 'https://www.youtube.com/@DevalokamAramana/streams' },
] as const;

export default async function NewsPage() {
  const data = await getNewsHomePageData();

  return (
    <div className="bg-syro-bg-gray font-syro-primary text-[#0b2848] min-h-screen">
      {/* Hero / Page title - design system mainTitle: h1 2.8rem/700, p 20px/#506276 */}
      <section className="py-syro-xxxl bg-syro-bg-gray border-b border-syro-table-border">
        <div className="max-w-[1200px] mx-auto px-[15px]">
          <h1 className="font-syro-display font-bold text-syro-h1 text-syro-blue mb-2.5">
            News
          </h1>
          <p className="text-syro-body text-syro-dark-gray mb-syro-xxl">
            Latest news, featured stories, and press releases from the Church.
          </p>
          {/* Navigation - same style as Syro home "Know More" button (primary-button) */}
          <nav className="flex flex-wrap gap-syro-xl" aria-label="News sections">
            {SECTION_LINKS.map(({ label, href }) => (
              <a key={href} href={href} className="primary-button">
                {label}
              </a>
            ))}
            {EXTERNAL_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="primary-button"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* Flash news: carousel from Strapi flash-news-items, or legacy single-message bar */}
      {data.flashNewsItems?.length > 0 ? (
        <FlashNewsCarousel items={data.flashNewsItems} />
      ) : data.flash?.active && data.flash.message ? (
        <FlashBar message={data.flash.message} />
      ) : null}

      {/* Top banner ads (position=top) */}
      {data.topAdSlots.length > 0 && (
        <div className="max-w-[1200px] mx-auto px-[15px] py-syro-lg">
          <AdSlots slots={data.topAdSlots} />
        </div>
      )}

      {/* Main content - design system: container 1200px, section padding 60px, grid gap 30px */}
      <section className="py-syro-xxxl bg-syro-bg-gray">
        <div className="max-w-[1200px] mx-auto px-[15px]">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-syro-xl">
            {/* Main column - order per PRD: Main News, Featured News, Press Release, Most Read; design system section margin 60px */}
            <div className="space-y-syro-xxxl">
              <ArticleList
                id="main-news"
                title="Main News"
                articles={data.mainNews}
                baseHref="/syro/news"
              />
              <ArticleList
                id="featured-news"
                title="Featured News"
                articles={data.featured}
                baseHref="/syro/news"
              />
              {/* Between-sections ad slots (position=between_sections) */}
              {data.betweenSectionsAdSlots.length > 0 && (
                <div className="py-syro-lg">
                  <AdSlots slots={data.betweenSectionsAdSlots} />
                </div>
              )}
              <ArticleList
                id="press-release"
                title="Press Release"
                articles={data.pressRelease}
                baseHref="/syro/news"
              />
              <ArticleList
                id="most-read"
                title="Most Read"
                articles={data.mostRead}
                baseHref="/syro/news"
                compact
              />
            </div>

            {/* Sidebar - design system component spacing */}
            <aside className="space-y-syro-xl">
              {data.sidebarPromo ? (
                <SidebarPromo block={data.sidebarPromo} />
              ) : (
                <FollowUsFacebook />
              )}
              <AdSlots slots={data.adSlots} />
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
