import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { getPriestsData } from './getPriestsData';
import { formatPriestDisplayName, type Priest } from './types';
import SyroPageBanner from '../../components/SyroPageBanner';
import SearchInputWithClear from '../../components/SearchInputWithClear';
import DirectoryPagination from '../components/DirectoryPagination';

export const metadata: Metadata = {
  title: 'Priests | Directory | Malankara Orthodox Syrian Church',
  description: 'Directory of priests of the Malankara Orthodox Syrian Church.',
  keywords: ['MOSC Directory', 'Priests'],
};

const PAGE_SIZE = 20;
const BASE_PATH = '/mosc-redesign/directory/priests';

type PageProps = { searchParams: Promise<{ page?: string; q?: string }> };

function buildUrl(page: number, q?: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (q?.trim()) params.set('q', q.trim());
  const query = params.toString();
  return query ? `${BASE_PATH}?${query}` : BASE_PATH;
}

export default async function PriestsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const nameSearch = typeof params.q === 'string' ? params.q : undefined;
  const searchTerm = nameSearch?.trim() ?? '';
  const hasSearch = searchTerm.length > 0;

  const { priests, pagination } = await getPriestsData({
    nameSearch: nameSearch?.trim() || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const subtitle = hasSearch
    ? `${pagination.total} priest${pagination.total !== 1 ? 's' : ''} matching "${searchTerm}".`
    : `${pagination.total} priest${pagination.total !== 1 ? 's' : ''}. Data from the directory API.`;

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="Priests" breadcrumbFrom="directory" />
      <section className="relative bg-syro-bg-gray py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-body text-syro-dark-gray mt-2">{subtitle}</p>
        </div>
      </section>

      <section className="py-12 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6" role="search" aria-label="Search priests by name">
            <form method="get" action={BASE_PATH} className="flex flex-wrap gap-2 items-center">
              <label htmlFor="priests-name-search" className="sr-only">Search by name</label>
              <SearchInputWithClear
                id="priests-name-search"
                name="q"
                defaultValue={nameSearch ?? ''}
                placeholder="Search by name..."
                wrapperClassName="flex-1 min-w-[200px]"
                className="font-body w-full px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
                clearHref={hasSearch ? BASE_PATH : undefined}
              />
              <button type="submit" className="syro-primary-button inline-flex items-center gap-2 px-4 py-2">
                Search
              </button>
              {hasSearch && (
                <Link href={BASE_PATH} className="font-body text-sm text-syro-dark-gray hover:text-syro-red hover:underline">
                  Clear search
                </Link>
              )}
            </form>
          </div>

          {priests.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border-l-4 border-syro-red shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
              <p className="font-body text-syro-dark-gray">No priests listed yet. Data is loaded from the directory API.</p>
              <Link href="/mosc-redesign/directory" className="inline-block no-underline font-light text-white bg-[#dc3545] py-2.5 px-5 border-r-[7px] border-r-[#be1929] mt-4 transition-[1s] hover:bg-[#be1929] hover:border-r-[6px] hover:border-r-[#dc3545] hover:text-white">
            ← Back to Directory
          </Link>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {priests.map((p) => (
                  <PriestCard key={p.documentId} priest={p} />
                ))}
              </ul>
              <DirectoryPagination
                page={pagination.page}
                pageCount={pagination.pageCount}
                total={pagination.total}
                pageSize={PAGE_SIZE}
                itemsOnPage={priests.length}
                buildPageHref={(p) => buildUrl(p, nameSearch)}
                itemLabel="priests"
                emptyLabel="No priests found"
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function PriestCard({ priest }: { priest: Priest }) {
  return (
    <li className="h-full bg-white rounded-lg p-6 sacred-shadow-sm border-l-4 border-syro-red hover:sacred-shadow reverent-transition shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
      <Link href={`/mosc-redesign/directory/priests/${priest.documentId}`} className="flex gap-4 group h-full">
        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-syro-bg-gray flex items-center justify-center">
          {priest.imageUrl ? (
            <Image
              src={priest.imageUrl}
              alt={priest.imageAlt ?? priest.name}
              fill
              className="object-cover"
              sizes="80px"
              unoptimized={priest.imageUrl.startsWith('http')}
            />
          ) : (
            <svg className="w-10 h-10 text-syro-dark-gray/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-heading font-semibold text-xl text-syro-blue group-hover:text-syro-red reverent-transition">
            {formatPriestDisplayName(priest.title, priest.name)}
          </h2>
          {priest.dioceseName && <p className="font-body text-sm text-syro-dark-gray mt-1">{priest.dioceseName}</p>}
          {priest.parishName && <p className="font-body text-sm text-syro-dark-gray">Vicar, {priest.parishName}</p>}
          <span className="syro-primary-button inline-flex items-center gap-2 mt-2 w-fit">
            View details
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </span>
        </div>
      </Link>
    </li>
  );
}
