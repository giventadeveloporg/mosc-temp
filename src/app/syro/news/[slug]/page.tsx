import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getFlashNewsForNewsPages } from '../getNewsHomePageData';
import { NewsPageHeader } from '../components/NewsPageHeader';
import { FlashNewsCarousel } from '../components/FlashNewsCarousel';
import { FlashBar } from '../components/FlashBar';

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
  const [article, flashData] = await Promise.all([
    getArticleBySlug(slug),
    getFlashNewsForNewsPages(),
  ]);
  if (!article) notFound();

  return (
    <div className="bg-syro-bg-gray">
      {/* Same header as news index: title, description, section + external links */}
      <NewsPageHeader />

      {/* Flash news: carousel or legacy bar (same as news index) */}
      {flashData.flashNewsItems?.length > 0 ? (
        <FlashNewsCarousel items={flashData.flashNewsItems} />
      ) : flashData.flash?.active && flashData.flash.message ? (
        <FlashBar message={flashData.flash.message} />
      ) : null}

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/syro/news"
          className="inline-flex items-center gap-2 font-syro-primary text-sm text-syro-red hover:underline mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span aria-hidden="true">←</span> Back to News
        </Link>

        <header className="mb-8">
          {article.coverUrl && (
            <div className="relative w-full h-auto rounded-xl overflow-hidden bg-syro-bg-gray mb-6 p-4">
              <Image
                src={article.coverUrl}
                alt={article.coverAlt || article.title}
                width={896}
                height={504}
                className="w-full h-auto object-contain"
                style={{ borderRadius: '0.75rem', backgroundColor: 'transparent' }}
                sizes="(max-width: 896px) 100vw, 896px"
                unoptimized
              />
            </div>
          )}
          <h1 className="font-syro-display font-semibold text-3xl md:text-4xl text-syro-blue">
            {article.title}
          </h1>
          <div className="flex flex-wrap gap-4 mt-4 font-syro-primary text-sm text-syro-dark-gray">
            {article.publishedAt && (
              <time dateTime={article.publishedAt}>
                {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                  dateStyle: 'long',
                })}
              </time>
            )}
            {article.categoryName && <span>{article.categoryName}</span>}
            {article.authorName && <span>By {article.authorName}</span>}
          </div>
        </header>

        <div className="prose prose-lg font-syro-primary text-syro-blue max-w-none prose-headings:font-syro-display prose-a:text-syro-red">
          {article.body ? (
            <div dangerouslySetInnerHTML={{ __html: article.body }} />
          ) : (
            article.excerpt && <p className="text-syro-dark-gray">{article.excerpt}</p>
          )}
        </div>
      </article>
    </div>
  );
}
