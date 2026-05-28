'use client';

import React from 'react';
import Link from 'next/link';
import SyroPageBanner from '../components/SyroPageBanner';
import type { PublicOfficialDocumentTreePage } from './ApiServerActions';

const BANNER_DESCRIPTION =
  'Official documents available for download. Browse, filter, and download.';

type Props = {
  officialTreePage: PublicOfficialDocumentTreePage;
  currentFilters: {
    page: number;
    categoryId: number | null;
    year: number | null;
  };
};

type TreeItem = PublicOfficialDocumentTreePage['content'][number];
function buildSortedDownloads(content: PublicOfficialDocumentTreePage['content']): TreeItem[] {
  return [...content].sort((a, b) => {
    const aPriority = Number.isFinite(a.priorityRanking) ? a.priorityRanking : 999999;
    const bPriority = Number.isFinite(b.priorityRanking) ? b.priorityRanking : 999999;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.fileName.localeCompare(b.fileName);
  });
}

function getFolderPath(item: TreeItem) {
  if (item.pathSegments.length <= 1) return 'Library Root';
  return item.pathSegments.slice(0, -1).join(' / ');
}

function DownloadCard({ file }: { file: TreeItem }) {
  return (
    <article className="bg-white rounded-xl border border-syro-gold/25 shadow-sm hover:shadow-md transition-shadow duration-300 p-5 flex flex-col h-full">
      <div className="inline-flex items-center gap-2 mb-3 text-syro-blue">
        <span className="w-8 h-8 rounded-lg bg-syro-bg-gray flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </span>
        <span className="text-xs font-semibold tracking-wide uppercase text-syro-red">
          Download Material
        </span>
      </div>

      <h4 className="font-syro-display text-lg font-semibold text-syro-blue leading-snug line-clamp-2">
        {file.fileName}
      </h4>
      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{getFolderPath(file)}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-full bg-syro-bg-gray px-2.5 py-1 text-[11px] font-semibold text-syro-blue">
          Priority {file.priorityRanking}
        </span>
        {file.officialDocumentYear ? (
          <span className="inline-flex items-center rounded-full bg-syro-bg-gray px-2.5 py-1 text-[11px] font-semibold text-syro-blue">
            Year {file.officialDocumentYear}
          </span>
        ) : null}
        {file.categoryLabel ? (
          <span className="inline-flex items-center rounded-full bg-syro-bg-gray px-2.5 py-1 text-[11px] font-semibold text-syro-blue">
            {file.categoryLabel}
          </span>
        ) : null}
      </div>

      {file.description ? (
        <p className="text-sm text-gray-600 mt-4 line-clamp-3">{file.description}</p>
      ) : (
        <p className="text-sm text-gray-500 mt-4 line-clamp-3">Official document file ready for download.</p>
      )}

      <div className="mt-5 pt-4 border-t border-syro-gold/20 flex justify-end">
        {file.downloadUrl ? (
          <a
            href={file.downloadUrl}
            className="syro-primary-button inline-flex items-center gap-2 text-sm px-4 py-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        ) : (
          <span className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-400">
            No link
          </span>
        )}
      </div>
    </article>
  );
}

function DownloadsGrid({ files }: { files: TreeItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {files.map((file) => (
        <DownloadCard key={`file-${file.id ?? file.treePath}`} file={file} />
      ))}
    </div>
  );
}

export default function DownloadsPageClient({
  officialTreePage,
  currentFilters,
}: Props) {
  const sortedDownloads = React.useMemo(() => buildSortedDownloads(officialTreePage.content), [officialTreePage.content]);
  const totalPages = Math.max(officialTreePage.totalPages || 1, 1);
  const currentPage = Math.min(Math.max(currentFilters.page, 1), totalPages);

  const queryWithPage = (page: number) => {
    const params = new globalThis.URLSearchParams();
    params.set('page', String(page));
    if (currentFilters.categoryId) params.set('categoryId', String(currentFilters.categoryId));
    if (currentFilters.year) params.set('year', String(currentFilters.year));
    return `/mosc-redesign/downloads?${params.toString()}`;
  };

  const queryWithFilter = (categoryId: number | null, year: number | null) => {
    const params = new globalThis.URLSearchParams();
    params.set('page', '1');
    if (categoryId) params.set('categoryId', String(categoryId));
    if (year) params.set('year', String(year));
    return `/mosc-redesign/downloads?${params.toString()}`;
  };

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Downloads"
        breadcrumbFrom="home"
        description={BANNER_DESCRIPTION}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-6 pl-8 border-l-[7px] border-syro-red">
            Official Library Explorer
          </h3>
          <div className="bg-white rounded-xl border border-syro-gold/25 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6 md:p-8 mb-12">
            <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                Showing page <span className="font-semibold">{currentPage}</span> of{' '}
                <span className="font-semibold">{totalPages}</span> (
                <span className="font-semibold">{officialTreePage.totalElements}</span> files). Lower priority values are shown first.
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={queryWithFilter(null, currentFilters.year)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                    !currentFilters.categoryId ? 'bg-syro-blue text-white' : 'bg-syro-bg-gray text-syro-blue'
                  }`}
                >
                  All categories
                </Link>
                {officialTreePage.categoryOptions.map((cat) => (
                  <Link
                    key={cat.id}
                    href={queryWithFilter(cat.id, currentFilters.year)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                      currentFilters.categoryId === cat.id ? 'bg-syro-blue text-white' : 'bg-syro-bg-gray text-syro-blue'
                    }`}
                  >
                    {cat.displayName}
                  </Link>
                ))}
              </div>
            </div>

            {officialTreePage.content.length === 0 ? (
              <div className="rounded-lg border border-syro-gold/25 bg-syro-bg-gray/50 px-5 py-6 text-sm text-gray-500">
                No files available for the selected filters.
              </div>
            ) : (
              <DownloadsGrid files={sortedDownloads} />
            )}

            <div className="mt-6 flex items-center justify-between">
              {currentPage > 1 ? (
                <Link href={queryWithPage(currentPage - 1)} className="syro-primary-button inline-flex items-center gap-2">
                  Previous
                </Link>
              ) : (
                <span className="text-sm text-gray-400">Previous</span>
              )}
              {currentPage < totalPages ? (
                <Link href={queryWithPage(currentPage + 1)} className="syro-primary-button inline-flex items-center gap-2">
                  Next
                </Link>
              ) : (
                <span className="text-sm text-gray-400">Next</span>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
