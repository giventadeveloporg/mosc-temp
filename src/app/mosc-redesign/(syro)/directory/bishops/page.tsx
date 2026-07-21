import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { getBishopsData } from './getBishopsData';
import type { Bishop, BishopType } from './types';
import SyroPageBanner from '../../components/SyroPageBanner';
import LiveUrlSearch from '../../components/LiveUrlSearch';
import DirectoryPagination from '../components/DirectoryPagination';
import DirectoryBackLink from '../components/DirectoryBackLink';

export const metadata: Metadata = {
  title: 'Bishops | Directory | Malankara Orthodox Syrian Church',
  description: 'Directory of bishops — The Catholicos, Diocesan Bishops, Retired Bishops.',
  keywords: ['MOSC Directory', 'Bishops', 'Holy Synod', 'Catholicos', 'Diocesan Bishops'],
};

const SECTION_TITLES: Record<BishopType, string> = {
  catholicos: 'The Catholicos',
  diocesan: 'Diocesan Bishops',
  retired: 'Retired Bishops',
};

const PAGE_SIZE = 20;

type FilterValue = 'all' | BishopType;

type PageProps = {
  searchParams: Promise<{ type?: string; page?: string; q?: string }>;
};

function buildBishopsUrl(
  type: FilterValue,
  page: number,
  nameSearch?: string
): string {
  const base = '/mosc-redesign/directory/bishops';
  const q = new URLSearchParams();
  if (type !== 'all') q.set('type', type);
  if (page > 1) q.set('page', String(page));
  if (nameSearch?.trim()) q.set('q', nameSearch.trim());
  const query = q.toString();
  return query ? `${base}?${query}` : base;
}

export default async function BishopsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const typeParam = params.type as string | undefined;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const nameSearch = typeof params.q === 'string' ? params.q : undefined;

  const currentFilter: FilterValue =
    typeParam === 'catholicos' || typeParam === 'diocesan' || typeParam === 'retired'
      ? typeParam
      : 'all';

  const bishopTypeFilter: BishopType | undefined =
    currentFilter === 'all' ? undefined : currentFilter;

  const { bishops, pagination } = await getBishopsData({
    bishopType: bishopTypeFilter,
    nameSearch: nameSearch?.trim() || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const title =
    currentFilter === 'all'
      ? 'The Holy Synod of Bishops'
      : SECTION_TITLES[currentFilter];
  const searchTerm = nameSearch?.trim() ?? '';
  const hasSearch = searchTerm.length > 0;
  const subtitle = hasSearch
    ? `${pagination.total} bishop${pagination.total !== 1 ? 's' : ''} matching "${searchTerm}".`
    : currentFilter === 'all'
      ? `All bishops. ${pagination.total} total.`
      : `${pagination.total} bishop${pagination.total !== 1 ? 's' : ''} in this category.`;

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title={title} breadcrumbFrom="directory" />
      <section className="relative bg-syro-bg-gray py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-body text-syro-dark-gray mt-2">
            {subtitle}
          </p>
        </div>
      </section>

      <section className="py-8 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search by name — live as you type */}
          <div className="mb-6">
            <LiveUrlSearch
              id="bishops-name-search"
              ariaLabel="Search bishops by name"
              placeholder="Search by name..."
              preserveParams={currentFilter !== 'all' ? ['type'] : []}
              describedBy="bishops-search-desc"
            />
            <p id="bishops-search-desc" className="sr-only">
              Case-insensitive search by bishop name. Combine with category filter if needed.
            </p>
          </div>

          {/* Category filter: All, Catholicos, Diocesan Bishops, Retired Bishops */}
          <div className="mb-8">
            <p className="font-body text-sm font-medium text-syro-dark-gray mb-2">
              Filter by category
            </p>
            <nav className="flex flex-wrap gap-2" aria-label="Bishop category filter">
              {(['all', 'catholicos', 'diocesan', 'retired'] as const).map((filter) => {
                const label =
                  filter === 'all' ? 'All' : SECTION_TITLES[filter];
                const isActive = currentFilter === filter;
                const href = buildBishopsUrl(filter, 1, nameSearch);
                return (
                  <Link
                    key={filter}
                    href={href}
                    className={`font-body font-medium px-4 py-2 rounded-lg reverent-transition ${
                      isActive
                        ? 'bg-syro-red text-white'
                        : 'bg-white/80 text-syro-blue hover:bg-white hover:text-syro-red border border-syro-table-border'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {bishops.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border-l-4 border-syro-red shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
              <p className="font-body text-syro-dark-gray">
                No bishops listed for this selection yet. Data is loaded from the directory API.
              </p>
              <DirectoryBackLink href="/mosc-redesign/directory" label="Back to Directory" className="mt-4" />
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {bishops.map((bishop) => (
                  <BishopCard key={bishop.documentId} bishop={bishop} />
                ))}
              </ul>
              <DirectoryPagination
                page={pagination.page}
                pageCount={pagination.pageCount}
                total={pagination.total}
                pageSize={PAGE_SIZE}
                itemsOnPage={bishops.length}
                buildPageHref={(p) => buildBishopsUrl(currentFilter, p, nameSearch)}
                itemLabel="bishops"
                emptyLabel="No bishops found"
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function BishopCard({ bishop }: { bishop: Bishop }) {
  return (
    <li className="h-full bg-white rounded-lg p-4 sacred-shadow-sm hover:sacred-shadow reverent-transition border-l-4 border-syro-red shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
      <Link href={`/mosc-redesign/directory/bishops/${bishop.documentId}`} className="flex gap-4 group h-full">
        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-syro-bg-gray flex items-center justify-center">
          {bishop.imageUrl ? (
            <Image
              src={bishop.imageUrl}
              alt={bishop.imageAlt ?? bishop.name}
              fill
              className="object-contain object-center"
              sizes="80px"
              unoptimized={bishop.imageUrl.startsWith('http')}
            />
          ) : (
            <svg className="w-10 h-10 text-syro-dark-gray/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading font-medium text-lg text-syro-blue group-hover:text-syro-red reverent-transition">
            {bishop.name}
          </h3>
          {bishop.dioceseName && (
            <p className="font-body text-sm text-syro-dark-gray mt-0.5">
              {bishop.dioceseName}
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
