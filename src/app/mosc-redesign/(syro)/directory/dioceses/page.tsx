import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { getDiocesesData } from './getDiocesesData';
import { getPriestsData } from '../priests/getPriestsData';
import type { Diocese } from './types';
import type { Priest } from '../priests/types';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata: Metadata = {
  title: 'Dioceses | Directory | Malankara Orthodox Syrian Church',
  description: 'Directory of dioceses of the Malankara Orthodox Syrian Church.',
  keywords: ['MOSC Directory', 'Dioceses'],
};

const PAGE_SIZE = 20;
const BASE_PATH = '/mosc-redesign/directory/dioceses';

type PageProps = { searchParams: Promise<{ page?: string; q?: string; pq?: string }> };

function buildUrl(page: number, q?: string, pq?: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (q?.trim()) params.set('q', q.trim());
  if (pq?.trim()) params.set('pq', pq.trim());
  const query = params.toString();
  return query ? `${BASE_PATH}?${query}` : BASE_PATH;
}

export default async function DiocesesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const nameSearch = typeof params.q === 'string' ? params.q : undefined;
  const priestSearch = typeof params.pq === 'string' ? params.pq : undefined;
  const searchTerm = nameSearch?.trim() ?? '';
  const priestTerm = priestSearch?.trim() ?? '';
  const hasDioceseSearch = searchTerm.length > 0;
  const hasPriestSearch = priestTerm.length > 0;

  const { dioceses, pagination } = await getDiocesesData({
    nameSearch: nameSearch?.trim() || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const priestLookup = hasPriestSearch
    ? await getPriestsData({
        nameSearch: priestTerm,
        page: 1,
        pageSize: 24,
      })
    : null;

  const subtitle = hasDioceseSearch
    ? `${pagination.total} diocese${pagination.total !== 1 ? 's' : ''} matching "${searchTerm}".`
    : `${pagination.total} diocese${pagination.total !== 1 ? 's' : ''}. Data from the directory API.`;

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="Dioceses" breadcrumbFrom="directory" />
      <section className="relative bg-syro-bg-gray py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-body text-syro-dark-gray mt-2">
            {subtitle}
          </p>
        </div>
      </section>

      <section className="py-12 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-4" role="search" aria-label="Search dioceses and priests">
            <form method="get" action={BASE_PATH} className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label htmlFor="dioceses-name-search" className="font-body text-sm text-syro-dark-gray block mb-1">
                    Diocese name
                  </label>
                  <input
                    id="dioceses-name-search"
                    type="search"
                    name="q"
                    defaultValue={nameSearch ?? ''}
                    placeholder="Search dioceses by name..."
                    className="font-body w-full px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label htmlFor="dioceses-priest-search" className="font-body text-sm text-syro-dark-gray block mb-1">
                    Priest name (parish &amp; diocese)
                  </label>
                  <input
                    id="dioceses-priest-search"
                    type="search"
                    name="pq"
                    defaultValue={priestSearch ?? ''}
                    placeholder="Find a priest's parish and diocese..."
                    className="font-body w-full px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
                  />
                </div>
                <button type="submit" className="syro-primary-button inline-flex items-center gap-2 px-4 py-2 shrink-0">
                  Search
                </button>
              </div>
              {(hasDioceseSearch || hasPriestSearch) && (
                <Link href={BASE_PATH} className="font-body text-sm text-syro-dark-gray hover:text-syro-red hover:underline inline-block">
                  Clear all filters
                </Link>
              )}
            </form>
          </div>

          {hasPriestSearch && priestLookup && (
            <section className="mb-10" aria-labelledby="priest-lookup-heading">
              <h2 id="priest-lookup-heading" className="font-heading text-lg font-semibold text-syro-blue mb-2">
                Priests matching &quot;{priestTerm}&quot;
              </h2>
              <p className="font-body text-sm text-syro-dark-gray mb-4">
                {priestLookup.pagination.total} match{priestLookup.pagination.total !== 1 ? 'es' : ''} across all dioceses
                {priestLookup.pagination.total > priestLookup.priests.length ? ' (showing first page)' : ''}.
                {' '}
                <Link
                  href={`/mosc-redesign/directory/priests?q=${encodeURIComponent(priestTerm)}`}
                  className="text-syro-red hover:underline"
                >
                  Open full priest directory
                </Link>
              </p>
              {priestLookup.priests.length === 0 ? (
                <p className="font-body text-syro-dark-gray bg-white rounded-lg p-6 border border-syro-table-border">
                  No priests found for that name. Try a shorter or alternate spelling.
                </p>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {priestLookup.priests.map((p) => (
                    <PriestLookupCard key={p.documentId} priest={p} />
                  ))}
                </ul>
              )}
            </section>
          )}

          {dioceses.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border-l-4 border-syro-red shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
              <p className="font-body text-syro-dark-gray">
                {hasDioceseSearch
                  ? `No dioceses match "${searchTerm}". Try different keywords or clear filters.`
                  : 'No dioceses listed yet. Data is loaded from the directory API.'}
              </p>
              <Link href="/mosc-redesign/directory" className="inline-block no-underline font-light text-white bg-[#dc3545] py-2.5 px-5 border-r-[7px] border-r-[#be1929] mt-4 transition-[1s] hover:bg-[#be1929] hover:border-r-[6px] hover:border-r-[#dc3545] hover:text-white">
                ← Back to Directory
              </Link>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {dioceses.map((d) => (
                  <DioceseCard key={d.documentId} diocese={d} />
                ))}
              </ul>
              {pagination.pageCount > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                  <span className="font-body text-sm text-syro-dark-gray">
                    Page {pagination.page} of {pagination.pageCount}
                  </span>
                  <div className="flex gap-3">
                    {pagination.page > 1 && (
                      <Link
                        href={buildUrl(pagination.page - 1, nameSearch, priestSearch)}
                        className="px-4 py-2 bg-syro-red/10 text-syro-blue font-body font-medium rounded-lg hover:bg-syro-red/20 reverent-transition"
                      >
                        Previous
                      </Link>
                    )}
                    {pagination.page < pagination.pageCount && (
                      <Link
                        href={buildUrl(pagination.page + 1, nameSearch, priestSearch)}
                        className="px-4 py-2 bg-syro-red/10 text-syro-blue font-body font-medium rounded-lg hover:bg-syro-red/20 reverent-transition"
                      >
                        Next
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function PriestLookupCard({ priest }: { priest: Priest }) {
  const displayName = priest.title ? `${priest.title} ${priest.name}` : priest.name;
  return (
    <li className="h-full bg-white rounded-lg p-5 sacred-shadow-sm border-l-4 border-syro-red shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
      <Link href={`/mosc-redesign/directory/priests/${priest.documentId}`} className="flex gap-3 group h-full">
        {priest.imageUrl && (
          <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-syro-bg-gray">
            <Image
              src={priest.imageUrl}
              alt={priest.imageAlt ?? priest.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-heading font-semibold text-lg text-syro-blue group-hover:text-syro-red reverent-transition">
            {displayName}
          </p>
          {priest.dioceseName && (
            <p className="font-body text-sm text-syro-dark-gray mt-1">
              <span className="text-syro-dark-gray/80">Diocese:</span> {priest.dioceseName}
            </p>
          )}
          {priest.parishName ? (
            <p className="font-body text-sm text-syro-dark-gray mt-0.5">
              <span className="text-syro-dark-gray/80">Parish:</span> {priest.parishName}
            </p>
          ) : (
            <p className="font-body text-sm text-syro-dark-gray/70 mt-0.5 italic">Parish not linked in directory</p>
          )}
          <span className="syro-primary-button inline-flex items-center gap-2 mt-2 w-fit text-sm py-1.5 px-3">
            Priest profile
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </Link>
    </li>
  );
}

function DioceseCard({ diocese }: { diocese: Diocese }) {
  return (
    <li className="h-full bg-white rounded-lg overflow-hidden sacred-shadow-sm border-l-4 border-syro-red hover:sacred-shadow reverent-transition shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
      <Link href={`/mosc-redesign/directory/dioceses/${diocese.documentId}`} className="flex gap-4 p-6 group h-full">
        {diocese.imageUrl && (
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-syro-bg-gray">
            <Image
              src={diocese.imageUrl}
              alt={diocese.imageAlt ?? diocese.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-heading font-semibold text-xl text-syro-blue group-hover:text-syro-red reverent-transition">
            {diocese.name}
          </h2>
          {diocese.description && (
            <p className="font-body text-sm text-syro-dark-gray mt-1 line-clamp-2">
              {diocese.description}
            </p>
          )}
          <span className="syro-primary-button inline-flex items-center gap-2 mt-2 w-fit">
            View details
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </Link>
    </li>
  );
}
