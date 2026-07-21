import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { getWorkingCommitteesData } from './getWorkingCommitteesData';
import type { WorkingCommitteeEntry } from './types';
import SyroPageBanner from '../../components/SyroPageBanner';
import LiveUrlSearch from '../../components/LiveUrlSearch';
import DirectoryPagination from '../components/DirectoryPagination';
import { DIRECTORY_PAGE_SIZE } from '../types/listPagination';
import DirectoryBackLink from '../components/DirectoryBackLink';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Working Committee | Directory | Malankara Orthodox Syrian Church',
  description: 'Directory of the Working Committee of the Malankara Orthodox Syrian Church.',
  keywords: ['MOSC Directory', 'Working Committee'],
};

const TITLE = 'Working Committee';
const BASE_PATH = '/mosc-redesign/directory/working-committee';

function buildUrl(page: number, q?: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (q?.trim()) params.set('q', q.trim());
  const query = params.toString();
  return query ? `${BASE_PATH}?${query}` : BASE_PATH;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const nameSearch = typeof params.q === 'string' ? params.q : undefined;
  const searchTerm = nameSearch?.trim() ?? '';
  const hasSearch = searchTerm.length > 0;

  const { entries, pagination } = await getWorkingCommitteesData({
    nameSearch: searchTerm || undefined,
    page,
    pageSize: DIRECTORY_PAGE_SIZE,
  });

  const subtitle = hasSearch
    ? `${pagination.total} entr${pagination.total !== 1 ? 'ies' : 'y'} matching "${searchTerm}".`
    : `${pagination.total} entr${pagination.total !== 1 ? 'ies' : 'y'}. Data from the working committee CMS.`;

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title={TITLE} breadcrumbFrom="directory" />
      <section className="relative bg-syro-bg-gray py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-body text-syro-dark-gray mt-2">{subtitle}</p>
        </div>
      </section>

      <section className="py-12 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <LiveUrlSearch
              id="entries-name-search"
              ariaLabel={`Search ${TITLE.toLowerCase()} by name`}
              placeholder="Search by name..."
            />
          </div>

          {entries.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border-l-4 border-syro-red shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
              <p className="font-body text-syro-dark-gray">
                No entries in this section yet. Data is loaded from the working committee CMS.
              </p>
              <DirectoryBackLink href="/mosc-redesign/directory" label="Back to Directory" className="mt-4" />
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {entries.map((entry) => (
                  <EntryCard key={entry.documentId || entry.slug} entry={entry} />
                ))}
              </ul>
              <DirectoryPagination
                page={pagination.page}
                pageCount={pagination.pageCount}
                total={pagination.total}
                pageSize={DIRECTORY_PAGE_SIZE}
                itemsOnPage={entries.length}
                buildPageHref={(p) => buildUrl(p, nameSearch)}
                itemLabel="members"
                emptyLabel="No members found"
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function EntryCard({ entry }: { entry: WorkingCommitteeEntry }) {
  return (
    <li className="h-full bg-white rounded-lg overflow-hidden sacred-shadow-sm border-l-4 border-syro-red hover:sacred-shadow reverent-transition shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
      <Link href={`${BASE_PATH}/${entry.slug}`} className="flex gap-4 p-6 group h-full">
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-syro-bg-gray flex items-center justify-center">
          {entry.imageUrl ? (
            <Image
              src={entry.imageUrl}
              alt={entry.imageAlt ?? entry.name}
              fill
              className="object-contain"
              sizes="96px"
              unoptimized={entry.imageUrl.startsWith('http')}
            />
          ) : (
            <svg
              className="w-10 h-10 text-syro-dark-gray/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1 flex flex-col">
          <h2 className="font-heading font-semibold text-xl text-syro-blue group-hover:text-syro-red reverent-transition">
            {entry.name}
          </h2>
          <span className="syro-primary-button inline-flex items-center gap-2 mt-auto w-fit">
            View details
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </span>
        </div>
      </Link>
    </li>
  );
}
