import React from 'react';
import Link from 'next/link';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import SearchInputWithClear from '../components/SearchInputWithClear';
import { MoscHubCardMedia } from '../components/MoscHubCardMedia';
import DirectoryPagination from '../directory/components/DirectoryPagination';
import { DIRECTORY_PAGE_SIZE } from '../directory/types/listPagination';
import {
  buildCategoryCardDescription,
  filterInstitutionsByCategory,
  getInstitutionsData,
  pickCategoryCardImage,
} from './getInstitutionsData';
import {
  getInstitutionHubCategory,
  INSTITUTION_HUB_CATEGORIES,
  institutionBelongsToCategory,
} from './institutionHubCategories';
import type { InstitutionEntry } from './types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Institutions | Malankara Orthodox Syrian Church',
  description:
    'Educational, medical, and spiritual institutions of the Malankara Orthodox Syrian Church, serving communities across India and beyond.',
};

const BANNER_DESCRIPTION =
  'Educational, medical, and spiritual institutions of the Malankara Orthodox Syrian Church, serving communities across India and beyond.';

const BASE_PATH = '/mosc-redesign/institutions-cms';
const DETAIL_BASE = '/mosc-redesign/directory/institutions';
const FALLBACK_IMAGE = '/images/institutions/ca.jpg';

function buildUrl(page: number, q?: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (q?.trim()) params.set('q', q.trim());
  const query = params.toString();
  return query ? `${BASE_PATH}?${query}` : BASE_PATH;
}

function institutionHref(entry: InstitutionEntry): string {
  if (getInstitutionHubCategory(entry.slug)) {
    return `${BASE_PATH}/${entry.slug}`;
  }
  const category = INSTITUTION_HUB_CATEGORIES.find((c) =>
    institutionBelongsToCategory(entry.slug, c.slug)
  );
  // Prefer CMS category hub over duplicated directory list routes.
  if (category) {
    return `${BASE_PATH}/${category.slug}`;
  }
  // Individual institution detail (no category CMS page yet).
  return `${DETAIL_BASE}/${entry.slug}`;
}

function cardExcerpt(entry: InstitutionEntry): string {
  if (entry.description?.trim()) {
    const first = entry.description.split('\n\n')[0]?.trim() ?? entry.description.trim();
    return first.length > 280 ? `${first.slice(0, 277)}...` : first;
  }
  if (entry.address?.trim()) {
    const line = entry.address.split('\n').map((l) => l.trim()).find(Boolean);
    if (line) return line;
  }
  return '';
}

export default async function InstitutionsCmsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const nameSearch = typeof params.q === 'string' ? params.q : undefined;
  const searchTerm = nameSearch?.trim() ?? '';
  const hasSearch = searchTerm.length > 0;

  // Default hub: carved category cards (original look). Search: paged institution cards.
  if (!hasSearch) {
    const { entries: allEntries } = await getInstitutionsData({ loadAll: true });

    return (
      <div className="bg-syro-bg-gray">
        <SyroPageBanner
          title="Institutions"
          breadcrumbFrom="home"
          description={BANNER_DESCRIPTION}
        />

        <section className="py-16 bg-syro-bg-gray">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl font-light text-[#798daf] mb-4 pl-8 border-l-[7px] border-syro-red">
              Our Institutions
            </h3>

            <div className="mb-10" role="search" aria-label="Search institutions by name">
              <form method="get" action={BASE_PATH} className="flex flex-wrap gap-2 items-center">
                <label htmlFor="cms-institutions-name-search" className="sr-only">
                  Search by name
                </label>
                <SearchInputWithClear
                  id="cms-institutions-name-search"
                  name="q"
                  defaultValue=""
                  placeholder="Search institutions by name..."
                  wrapperClassName="flex-1 min-w-[200px]"
                  className="font-syro-primary w-full px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
                />
                <button type="submit" className="syro-primary-button inline-flex items-center gap-2 px-4 py-2">
                  Search
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {INSTITUTION_HUB_CATEGORIES.map((category) => {
                const categoryEntries = filterInstitutionsByCategory(allEntries, category.slug);
                const description = buildCategoryCardDescription(categoryEntries, category);
                const imageSrc = pickCategoryCardImage(categoryEntries, category);
                const href = `${BASE_PATH}/${category.slug}`;

                return (
                  <div
                    key={category.slug}
                    className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 overflow-hidden flex flex-col h-full"
                  >
                    <MoscHubCardMedia
                      src={imageSrc}
                      alt={category.title}
                      unoptimized={Boolean(imageSrc.startsWith('http'))}
                    />
                    <div className="p-8 pt-0 flex flex-col flex-1">
                      <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug">
                        {category.title}
                      </h3>
                      <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed line-clamp-3">
                        {description}
                      </p>
                      <Link
                        href={href}
                        className="syro-primary-button inline-flex items-center gap-2 mt-auto w-fit"
                      >
                        <span>Read More</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            <MissionAndStats />
            <QuickLinks />
          </div>
        </section>
      </div>
    );
  }

  const { entries, pagination } = await getInstitutionsData({
    nameSearch: searchTerm,
    page,
    pageSize: DIRECTORY_PAGE_SIZE,
  });

  const subtitle = `${pagination.total} institutio${pagination.total !== 1 ? 'ns' : 'n'} matching "${searchTerm}".`;

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Institutions"
        breadcrumbFrom="home"
        description={BANNER_DESCRIPTION}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-4 pl-8 border-l-[7px] border-syro-red">
            Our Institutions
          </h3>
          <p className="font-syro-primary text-syro-dark-gray mb-6">{subtitle}</p>

          <div className="mb-10" role="search" aria-label="Search institutions by name">
            <form method="get" action={BASE_PATH} className="flex flex-wrap gap-2 items-center">
              <label htmlFor="cms-institutions-name-search-results" className="sr-only">
                Search by name
              </label>
              <SearchInputWithClear
                id="cms-institutions-name-search-results"
                name="q"
                defaultValue={nameSearch ?? ''}
                placeholder="Search institutions by name..."
                wrapperClassName="flex-1 min-w-[200px]"
                className="font-syro-primary w-full px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
                clearHref={BASE_PATH}
              />
              <button type="submit" className="syro-primary-button inline-flex items-center gap-2 px-4 py-2">
                Search
              </button>
              <Link
                href={BASE_PATH}
                className="font-syro-primary text-sm text-syro-dark-gray hover:text-syro-red hover:underline"
              >
                Clear search
              </Link>
            </form>
          </div>

          {entries.length === 0 ? (
            <p className="font-syro-primary text-syro-dark-gray mb-12">
              No institutions match your search.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                {entries.map((entry) => (
                  <InstitutionHubCard key={entry.documentId || entry.slug} entry={entry} />
                ))}
              </div>
              <DirectoryPagination
                page={pagination.page}
                pageCount={pagination.pageCount}
                total={pagination.total}
                pageSize={DIRECTORY_PAGE_SIZE}
                itemsOnPage={entries.length}
                buildPageHref={(p) => buildUrl(p, nameSearch)}
                itemLabel="institutions"
                emptyLabel="No institutions found"
              />
            </>
          )}

          <div className="mt-16">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
}

function InstitutionHubCard({ entry }: { entry: InstitutionEntry }) {
  const href = institutionHref(entry);
  const imageSrc = entry.imageUrl ?? FALLBACK_IMAGE;
  const excerpt = cardExcerpt(entry);

  return (
    <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 overflow-hidden flex flex-col h-full">
      <MoscHubCardMedia
        src={imageSrc}
        alt={entry.imageAlt ?? entry.name}
        unoptimized={Boolean(entry.imageUrl?.startsWith('http'))}
      />
      <div className="p-8 pt-0 flex flex-col flex-1">
        <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug">
          {entry.name}
        </h3>
        {excerpt ? (
          <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed line-clamp-3">
            {excerpt}
          </p>
        ) : (
          <div className="flex-1 mb-5" />
        )}
        <Link href={href} className="syro-primary-button inline-flex items-center gap-2 mt-auto w-fit">
          <span>Read More</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function MissionAndStats() {
  return (
    <>
      <div className="max-w-3xl mx-auto mt-16">
        <h2 className="font-syro-display text-[2.2rem] font-bold text-black mb-5">
          Our Mission of Service
        </h2>
        <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed mb-6">
          Following the example of Christ who came to serve, the Malankara Orthodox Syrian Church has established numerous institutions dedicated to education, healthcare, and social welfare.
        </p>
        <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
          From schools and colleges to hospitals and orphanages, from monasteries to medical missions, these institutions embody our commitment to serving humanity with love and compassion.
        </p>
      </div>

      <div className="max-w-7xl mx-auto mt-16 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="font-syro-display font-semibold text-3xl text-syro-blue mb-2">100+</h3>
            <p className="font-syro-primary text-syro-dark-gray">Educational Institutions</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="font-syro-display font-semibold text-3xl text-syro-blue mb-2">25+</h3>
            <p className="font-syro-primary text-syro-dark-gray">Healthcare Facilities</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-syro-display font-semibold text-3xl text-syro-blue mb-2">15+</h3>
            <p className="font-syro-primary text-syro-dark-gray">Monasteries &amp; Convents</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="font-syro-display font-semibold text-3xl text-syro-blue mb-2">10+</h3>
            <p className="font-syro-primary text-syro-dark-gray">Orphanages &amp; Care Centers</p>
          </div>
        </div>
      </div>
    </>
  );
}
