import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  getArticleBySlug,
  getFlashNewsForNewsPages,
  getRecentArticles,
  getPreviousArticle,
} from '../getNewsHomePageData';
import { NewsPageHeader } from '../components/NewsPageHeader';
import { FlashNewsCarousel } from '../components/FlashNewsCarousel';
import { FlashBar } from '../components/FlashBar';
import { ArticleShareButtons } from '../components/ArticleShareButtons';
import { FollowUsFacebook } from '../components/FollowUsFacebook';
import { getAppUrl } from '@/lib/env';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'News' };
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
  };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const [flashData, recentArticles, previousArticle] = await Promise.all([
    getFlashNewsForNewsPages(),
    getRecentArticles(5),
    article.publishedAt ? getPreviousArticle(article.publishedAt) : Promise.resolve(null),
  ]);

  const articleUrl = `${getAppUrl()}/syro/news/${article.slug}`;
  const postedDate =
    article.publishedAt &&
    new Date(article.publishedAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div className="bg-background">
      <NewsPageHeader />

      {flashData.flashNewsItems?.length > 0 ? (
        <FlashNewsCarousel items={flashData.flashNewsItems} />
      ) : flashData.flash?.active && flashData.flash.message ? (
        <FlashBar message={flashData.flash.message} />
      ) : null}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/syro/news"
          className="syro-news-link inline-flex items-center gap-2 font-body text-sm hover:underline mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span aria-hidden="true">←</span> Back to News
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
          {/* Main content */}
          <article className="lg:col-span-2">
            <header className="mb-6">
              <h1 className="syro-article-detail-title">
                {article.title}
              </h1>
              <p className="syro-article-detail-meta mt-3 tracking-wide">
                {postedDate && article.authorName && (
                  <>Posted on {postedDate} by {article.authorName}</>
                )}
                {postedDate && !article.authorName && <>Posted on {postedDate}</>}
                {!postedDate && article.authorName && <>By {article.authorName}</>}
              </p>
            </header>

            {article.coverUrl && (
              <div className="relative w-full h-auto rounded-xl overflow-hidden bg-muted mb-8">
                <Image
                  src={article.coverUrl}
                  alt={article.coverAlt || article.title}
                  width={896}
                  height={504}
                  className="w-full h-auto object-contain"
                  style={{ borderRadius: '0.75rem', backgroundColor: 'transparent' }}
                  sizes="(max-width: 896px) 100vw, 66vw"
                  unoptimized
                />
              </div>
            )}

            {article.excerpt && !(typeof article.body === 'string' && article.body.trim()) && (
              <p className="syro-article-detail-lead mb-6 border-l-4 border-primary/30 pl-4">
                {article.excerpt}
              </p>
            )}

            <div className="syro-article-detail-body prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-foreground prose-headings:font-semibold prose-p:leading-relaxed prose-p:text-base prose-a:no-underline">
              {typeof article.body === 'string' && article.body.trim() ? (
                <div dangerouslySetInnerHTML={{ __html: article.body }} />
              ) : article.excerpt ? null : (
                <p>No additional content for this article.</p>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <ArticleShareButtons url={articleUrl} title={article.title} />
            </div>

            {article.categoryName && (
              <p className="syro-article-detail-meta mt-6">
                <span className="font-semibold uppercase tracking-wide">Posted in</span>{' '}
                <span className="inline-flex flex-wrap gap-2 mt-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-muted text-foreground/80 border border-border">
                    {article.categoryName}
                  </span>
                </span>
              </p>
            )}

            {previousArticle && (
              <div className="mt-8 pt-6 border-t border-border">
                <Link
                  href={`/syro/news/${previousArticle.slug}`}
                  className="syro-news-link inline-flex items-center gap-2 font-body text-sm hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span aria-hidden="true">←</span> Previous Post
                </Link>
                <p className="syro-article-detail-body font-body text-base mt-1 line-clamp-2">
                  {previousArticle.title}
                </p>
              </div>
            )}
          </article>

          {/* Sidebar - same Facebook Follow Us widget as news list page */}
          <aside className="lg:col-span-1 space-y-8">
            <FollowUsFacebook />

            {/* Recent Posts */}
            <div className="bg-card rounded-xl border border-border p-6 sacred-shadow">
              <h3 className="font-heading font-semibold text-lg text-foreground uppercase tracking-wide mb-4">
                Recent Posts
              </h3>
              <ul className="space-y-3">
                {recentArticles.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/syro/news/${item.slug}`}
                      className={`syro-news-link font-body text-sm leading-snug focus:outline-none focus-visible:ring-2 focus-visible:ring-ring block ${
                        item.slug === article.slug ? 'font-medium' : ''
                      }`}
                    >
                      <span className="line-clamp-2">{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
