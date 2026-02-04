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

/**
 * Renders a section of news articles with optional cover images and links to detail page.
 * Shows empty placeholder when no articles (per layout requirements).
 */
export function ArticleList({ title, articles, baseHref, compact, id }: ArticleListProps) {
  return (
    <section id={id} className="scroll-mt-24 rounded-xl bg-card border border-border sacred-shadow-sm overflow-hidden">
      <h2 className="font-heading font-semibold text-xl text-foreground border-b border-border px-6 py-4 bg-muted/30">
        {title}
      </h2>
      {articles.length > 0 ? (
        <ul className="divide-y divide-border">
          {articles.map((article) => (
            <li key={article.id}>
              <Link
                href={`${baseHref}/${article.slug || article.id}`}
                className="flex gap-4 p-4 hover:bg-muted/30 reverent-transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {!compact && article.coverUrl && (
                  <div className="flex-shrink-0 w-28 h-20 sm:w-36 sm:h-24 relative rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={article.coverUrl}
                      alt={article.coverAlt || article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 112px, 144px"
                      unoptimized
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-body font-semibold text-foreground line-clamp-2">
                    {article.title}
                  </h3>
                  {!compact && article.excerpt && (
                    <p className="font-body text-sm text-muted-foreground mt-1 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                  {article.publishedAt && (
                    <time
                      className="font-caption text-xs text-muted-foreground mt-1 block"
                      dateTime={article.publishedAt}
                    >
                      {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                        dateStyle: 'medium',
                      })}
                    </time>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-6 py-8 text-center">
          <p className="font-body text-sm text-muted-foreground">
            No articles at the moment. Check back later.
          </p>
        </div>
      )}
    </section>
  );
}
