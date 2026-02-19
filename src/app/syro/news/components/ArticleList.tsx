'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { NewsArticle } from '../types';

interface ArticleListProps {
  title: string;
  articles: NewsArticle[];
  baseHref: string;
  compact?: boolean;
  /** Section ID for anchor links (e.g. featured-news, main-news) */
  id?: string;
}

/** Calendar icon for date display */
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

/**
 * Renders a section of news articles: image on top, title/date/description below.
 * Grid layout (2 cols) for non-compact; compact uses 1 col. Click navigates to detail page with hero image.
 * Image aspect 4:3 for list cards; detail page uses 16:9 hero.
 */
export function ArticleList({ title, articles, baseHref, compact, id }: ArticleListProps) {
  return (
    <section id={id} className="syro-news-article-section scroll-mt-24 rounded-[5px] bg-white overflow-hidden shadow-syro-card transition-shadow duration-500 hover:shadow-syro-card-hover">
      {/* Design system section title: h3 1.8rem/600 #0b2848, red accent bar ::after → use border-l */}
      {/* Design system: table/chart title 1.8rem/600 #0b2848, red accent bar 7px left */}
      <h2 className="syro-news-section-title text-syro-h3 font-semibold text-syro-blue pl-5 py-syro-xxl border-b border-syro-table-border bg-white border-l-[7px] border-l-syro-red">
        {title}
      </h2>
      {articles.length > 0 ? (
        <ul className={`grid gap-syro-xl p-syro-xxl ${compact ? 'grid-cols-1 max-w-2xl' : 'grid-cols-1 md:grid-cols-2'}`}>
          {articles.map((article) => (
            <li key={article.id}>
              <Link
                href={`${baseHref}/${article.documentId || article.slug || String(article.id)}`}
                className="block group rounded-[5px] overflow-hidden border border-syro-table-border hover:shadow-syro-card-hover transition-shadow duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-syro-red focus-visible:ring-offset-2 bg-white"
              >
                {/* Image on top - object-contain so header/top is not cropped (image_containment_prevention) */}
                {article.coverUrl && (
                  <div className="relative w-full h-auto rounded-t-lg overflow-hidden bg-syro-bg-gray p-3">
                    <Image
                      src={article.coverUrl}
                      alt={article.coverAlt || article.title}
                      width={800}
                      height={600}
                      className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                      style={{ borderRadius: '0.5rem 0.5rem 0 0', backgroundColor: 'transparent' }}
                      sizes={compact ? '(max-width: 768px) 100vw, 672px' : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px'}
                      unoptimized
                    />
                  </div>
                )}
                {/* Title, date, description - design system card padding 20px for inner content */}
                <div className="p-syro-lg">
                  <h3 className="syro-article-card-title line-clamp-2 reverent-transition">
                    {article.title}
                  </h3>
                  {article.publishedAt && (
                    <time
                      className="syro-article-card-meta mt-2 flex items-center gap-1.5"
                      dateTime={article.publishedAt}
                    >
                      <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                      {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                        dateStyle: 'long',
                      })}
                    </time>
                  )}
                  {!compact && article.excerpt && (
                    <p className="syro-article-card-desc mt-2 line-clamp-3">
                      {article.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-syro-xxl py-8 text-center">
          <p className="font-syro-primary text-syro-small text-syro-dark-gray">
            No articles at the moment. Check back later.
          </p>
        </div>
      )}
    </section>
  );
}
