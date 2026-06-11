import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import InstitutionsCmsSidebar from '../../components/InstitutionsCmsSidebar';
import { formatPhoneNumbers } from '../../institutions/lib/formatPhone';
import {
  filterInstitutionsByCategory,
  getInstitutionsData,
  pickCategoryCardImage,
} from '../getInstitutionsData';
import {
  getInstitutionHubCategory,
} from '../institutionHubCategories';
import type { InstitutionEntry } from '../types';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ categorySlug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = getInstitutionHubCategory(categorySlug);
  if (!category) {
    return { title: 'Institution Not Found | Institutions | MOSC' };
  }
  return {
    title: `${category.title} | Institutions | MOSC`,
    description: `${category.title} of the Malankara Orthodox Syrian Church.`,
  };
}

function formatWebsiteHref(website: string): string {
  const trimmed = website.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/\//, '')}`;
}

function InstitutionCard({ entry }: { entry: InstitutionEntry }) {
  const location = entry.address?.split('\n').map((line) => line.trim()).filter(Boolean)[0] ?? null;
  const phoneNumbers = entry.phones ? formatPhoneNumbers(entry.phones) : [];
  const emails = entry.email
    ? entry.email.split(/[,;\n]+/).map((item) => item.trim()).filter(Boolean)
    : [];
  const website = entry.website?.trim() ?? null;

  return (
    <div className="bg-syro-bg-gray/20 rounded-lg p-6 shadow-syro-card-sm border-l-4 border-syro-red hover:shadow-syro-card transition-all duration-300">
      <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3">
        {entry.name}
      </h3>
      {entry.description ? (
        <p className="font-syro-primary text-syro-dark-gray mb-4 leading-relaxed">
          {entry.description}
        </p>
      ) : null}
      <div className="space-y-2 font-syro-primary text-syro-dark-gray">
        {location ? (
          <p className="flex items-start">
            <svg className="w-5 h-5 text-syro-red mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{location}</span>
          </p>
        ) : null}
        {phoneNumbers.length > 0 ? (
          <p className="flex items-start gap-2">
            <svg className="w-5 h-5 text-syro-red mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="min-w-0 flex flex-col">
              {phoneNumbers.map((num, index) => (
                <span key={`${entry.slug}-phone-${index}`} className="block">
                  {index === 0 ? <>Ph: {num}</> : num}
                </span>
              ))}
            </span>
          </p>
        ) : null}
        {emails.map((email) => (
          <p key={`${entry.slug}-${email}`} className="flex items-start gap-2">
            <svg className="w-5 h-5 text-syro-red mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <a href={`mailto:${email}`} className="text-syro-red hover:underline transition-all duration-300">
              {email}
            </a>
          </p>
        ))}
        {website ? (
          <p className="flex items-start gap-2">
            <svg className="w-5 h-5 text-syro-red mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <a
              href={formatWebsiteHref(website)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-syro-red hover:underline transition-all duration-300 break-all"
            >
              {website.replace(/^https?:\/\//i, '')}
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default async function InstitutionCategoryCmsPage({ params }: PageProps) {
  const { categorySlug } = await params;
  const category = getInstitutionHubCategory(categorySlug);
  if (!category) {
    notFound();
  }

  const { entries } = await getInstitutionsData();
  const categoryEntries = filterInstitutionsByCategory(entries, categorySlug);
  const imageSrc = pickCategoryCardImage(categoryEntries, category);
  const introText =
    categoryEntries.find((entry) => entry.description?.trim())?.description ??
    category.fallbackDescription;

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title={category.title} breadcrumbFrom="institutions-cms" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full h-auto rounded-lg overflow-hidden flex items-center justify-center bg-syro-bg-gray/20">
                    <Image
                      src={imageSrc}
                      alt={category.title}
                      width={800}
                      height={600}
                      className="w-full h-auto object-contain"
                      style={{ backgroundColor: 'transparent', borderRadius: '0.5rem' }}
                      priority
                      unoptimized={Boolean(imageSrc.startsWith('http'))}
                    />
                  </div>
                </div>
                <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
                  {introText}
                </p>
              </div>

              <div className="mt-8">
                {categoryEntries.length === 0 ? (
                  <p className="font-syro-primary text-syro-dark-gray">
                    No institutions are available in this category at this time. Please check back later.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryEntries.map((entry) => (
                      <InstitutionCard key={entry.documentId || entry.slug} entry={entry} />
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <InstitutionsCmsSidebar currentSlug={categorySlug} />
            </div>
          </div>

          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
}