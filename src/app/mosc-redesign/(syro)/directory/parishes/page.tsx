import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { getParishesData } from './getParishesData';
import { getDioceseByDocumentId } from '../dioceses/getDiocesesData';
import type { Parish } from './types';
import SyroPageBanner from '../../components/SyroPageBanner';
import LiveUrlSearch from '../../components/LiveUrlSearch';
import DirectoryPagination from '../components/DirectoryPagination';
import DirectoryBackLink from '../components/DirectoryBackLink';

export const metadata: Metadata = {
  title: 'Parishes | Directory | Malankara Orthodox Syrian Church',
  description: 'Directory of parishes of the Malankara Orthodox Syrian Church.',
  keywords: ['MOSC Directory', 'Parishes'],
};

const PAGE_SIZE = 20;
const BASE_PATH = '/mosc-redesign/directory/parishes';

type PageProps = { searchParams: Promise<{ page?: string; q?: string; diocese?: string }> };

function buildUrl(page: number, q?: string, dioceseDocumentId?: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (q?.trim()) params.set('q', q.trim());
  if (dioceseDocumentId?.trim()) params.set('diocese', dioceseDocumentId.trim());
  const query = params.toString();
  return query ? `${BASE_PATH}?${query}` : BASE_PATH;
}

export default async function ParishesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const nameSearch = typeof params.q === 'string' ? params.q : undefined;
  const dioceseParam = typeof params.diocese === 'string' ? params.diocese.trim() : '';
  const dioceseForFilter = dioceseParam.length > 0 ? dioceseParam : undefined;
  const dioceseRecord = dioceseForFilter ? await getDioceseByDocumentId(dioceseForFilter) : null;
  const hasDioceseScope = Boolean(dioceseForFilter);
  const searchTerm = nameSearch?.trim() ?? '';
  const hasParishSearch = searchTerm.length > 0;
  const hasSearch = hasParishSearch;

  const { parishes, pagination } = await getParishesData({
    nameSearch: nameSearch?.trim() || undefined,
    dioceseDocumentId: dioceseForFilter,
    page,
    pageSize: PAGE_SIZE,
  });

  const subtitle = (() => {
    const n = pagination.total;
    const parishWord = n === 1 ? 'parish' : 'parishes';
    if (!hasSearch && !hasDioceseScope) {
      return `${n} paris${n !== 1 ? 'hes' : 'h'}. Data from the directory Parish API.`;
    }
    if (!hasSearch && hasDioceseScope && dioceseRecord) {
      return `${n} ${parishWord} under ${dioceseRecord.name}.`;
    }
    if (!hasSearch && hasDioceseScope && !dioceseRecord) {
      return `Diocese filter applied (record not found in directory). ${n} ${parishWord} in API results.`;
    }
    const bits: string[] = [];
    if (hasParishSearch) bits.push(`parish name contains "${searchTerm}"`);
    const filterNote = hasDioceseScope && dioceseRecord ? ` (under ${dioceseRecord.name})` : '';
    return `${n} ${parishWord} where ${bits.join(' and ')}${filterNote}.`;
  })();

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner
        title="Parishes"
        breadcrumbFrom="directory"
        hideBreadcrumbNav={hasDioceseScope}
      />
      <section className="relative bg-syro-bg-gray py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-body text-syro-dark-gray mt-2">
            {subtitle}
          </p>
        </div>
      </section>

      <section className="py-12 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 space-y-3" role="search" aria-label="Search parishes">
            <LiveUrlSearch
              id="parishes-name-search"
              label="Parish name"
              labelVisible
              ariaLabel="Search parishes by name"
              placeholder="Search parishes by name..."
              preserveParams={dioceseForFilter ? ['diocese'] : []}
            />
            {hasDioceseScope && dioceseForFilter && !hasParishSearch ? (
              <Link
                href={BASE_PATH}
                className="font-body text-sm text-syro-dark-gray hover:text-syro-red hover:underline inline-block"
              >
                Clear diocese filter
              </Link>
            ) : null}
          </div>

          {parishes.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border-l-4 border-syro-red shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
              <p className="font-body text-syro-dark-gray">
                {hasDioceseScope && dioceseRecord
                  ? `No parishes match your search in ${dioceseRecord.name}.`
                  : hasDioceseScope
                    ? 'No parishes found for this diocese filter.'
                    : 'No parishes listed yet. Data is loaded from the directory Parish API.'}
              </p>
              <DirectoryBackLink href="/mosc-redesign/directory" label="Back to Directory" className="mt-4" />
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {parishes.map((p) => (
                  <ParishCard key={p.documentId} parish={p} />
                ))}
              </ul>
              <DirectoryPagination
                page={pagination.page}
                pageCount={pagination.pageCount}
                total={pagination.total}
                pageSize={PAGE_SIZE}
                itemsOnPage={parishes.length}
                buildPageHref={(p) => buildUrl(p, nameSearch, dioceseForFilter)}
                itemLabel="parishes"
                emptyLabel="No parishes found"
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function ParishCard({ parish }: { parish: Parish }) {
  const locationParts = [parish.addressLine1, parish.city, parish.state].filter(Boolean);
  const locationLine = locationParts.length ? locationParts.join(', ') : parish.address ?? null;

  return (
    <li className="h-full bg-white rounded-lg overflow-hidden sacred-shadow-sm border-l-4 border-syro-red hover:sacred-shadow reverent-transition shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
      <Link href={`/mosc-redesign/directory/parishes/${parish.documentId}`} className="block group h-full flex flex-col">
        <div className="flex flex-col sm:flex-row gap-4 p-6 flex-1">
          <div className="relative w-full sm:w-32 h-40 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-syro-bg-gray flex items-center justify-center">
            {parish.imageUrl ? (
              <Image
                src={parish.imageUrl}
                alt={parish.imageAlt ?? parish.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 128px"
                unoptimized={parish.imageUrl.startsWith('http')}
              />
            ) : (
              <svg className="w-10 h-10 text-syro-dark-gray/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-heading font-semibold text-xl text-syro-blue group-hover:text-syro-red reverent-transition">{parish.name}</h2>
            {parish.dioceseName && <p className="font-body text-sm text-syro-dark-gray mt-1">{parish.dioceseName}</p>}
            {parish.vicarName && (
              <p className="font-body text-sm text-syro-dark-gray mt-1">
                Vicar: <span className="font-medium text-syro-blue">{parish.vicarName}</span>
              </p>
            )}
            {locationLine && (
              <p className="font-body text-sm text-syro-dark-gray mt-1">
                {locationLine}
              </p>
            )}
            <span className="syro-primary-button inline-flex items-center gap-2 mt-2 w-fit">
              View details
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
