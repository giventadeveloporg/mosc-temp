'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import SyroPageBanner from '../components/SyroPageBanner';
import {
  getEventMediaDisplayThumbnailUrl,
  getOfficialDocumentPlaceholderKind,
  placeholderGradient,
  placeholderLabel,
} from '@/lib/officialDocumentThumbnail';
import type { PublicOfficialDocumentTreePage } from './ApiServerActions';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

type DownloadSuccessState = {
  fileName: string;
};

type DownloadErrorState = {
  fileName: string;
  message: string;
};

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

const DIALOG_FOOTER_BUTTON_BASE =
  'inline-flex h-12 min-w-[140px] flex-1 sm:flex-none items-center justify-center rounded-xl px-8 py-3 text-sm font-semibold text-white shadow-md border-0 transition-opacity hover:opacity-95 sm:min-w-[160px]';

function DialogFooterActions({
  onClose,
  okLabel,
  okClassName,
  closeClassName,
}: {
  onClose: () => void;
  okLabel: string;
  okClassName: string;
  closeClassName: string;
}) {
  return (
    <AlertDialogFooter className="flex flex-row flex-wrap items-stretch justify-center gap-3 border-t border-syro-gold/20 bg-white px-6 py-4 sm:justify-center">
      <button type="button" onClick={onClose} className={`${DIALOG_FOOTER_BUTTON_BASE} ${closeClassName}`}>
        Close
      </button>
      <button type="button" onClick={onClose} className={`${DIALOG_FOOTER_BUTTON_BASE} ${okClassName}`}>
        {okLabel}
      </button>
    </AlertDialogFooter>
  );
}

function DialogCloseButton({ onClose, className = '' }: { onClose: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className={`absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/50 bg-white/20 text-white transition-colors hover:bg-white/35 ${className}`}
      aria-label="Close"
      title="Close"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

function DialogStep({
  number,
  tone,
  children,
}: {
  number: number;
  tone: 'blue' | 'green' | 'orange' | 'purple';
  children: React.ReactNode;
}) {
  const toneClasses = {
    blue: 'bg-blue-100 border-blue-300 text-blue-700',
    green: 'bg-emerald-100 border-emerald-300 text-emerald-700',
    orange: 'bg-orange-100 border-orange-300 text-orange-700',
    purple: 'bg-purple-100 border-purple-300 text-purple-700',
  }[tone];

  return (
    <li className="flex gap-3 items-start">
      <span
        className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 font-bold text-sm flex items-center justify-center ${toneClasses}`}
      >
        {number}
      </span>
      <p className="text-sm text-gray-700 leading-relaxed pt-1">{children}</p>
    </li>
  );
}

function DownloadSuccessDialog({
  state,
  open,
  onClose,
}: {
  state: DownloadSuccessState | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!state) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onClose()}>
      <AlertDialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border-2 border-syro-blue/40 shadow-2xl gap-0">
        <div className="relative px-6 py-5 pr-14 text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-syro-blue">
          <DialogCloseButton onClose={onClose} />
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <AlertDialogTitle className="font-syro-display text-xl sm:text-2xl text-white font-semibold pr-2">
                Download started successfully!
              </AlertDialogTitle>
              <p className="text-sm text-white/90 mt-1">Your file is saving to your device.</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 bg-gradient-to-b from-amber-50/80 via-syro-bg-gray to-white">
          <div className="rounded-xl border-2 border-syro-gold/40 bg-white px-4 py-3 mb-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-syro-red mb-1">Your file</p>
            <p className="font-semibold text-syro-blue break-all">{state.fileName}</p>
          </div>

          <AlertDialogDescription asChild>
            <div>
              <p className="text-sm font-semibold text-syro-blue mb-3">Where to find your file:</p>
              <ol className="space-y-3 list-none m-0 p-0">
                <DialogStep number={1} tone="green">
                  Open your browser <strong className="text-emerald-700">Downloads page</strong>: press{' '}
                  <strong>Ctrl+J</strong> (Windows) or <strong>Cmd+Shift+J</strong> (Mac), or click the{' '}
                  <strong>Downloads ↓ icon</strong> in the toolbar. Your file should appear in that list — click it
                  to open, or choose <strong>Show in folder</strong>.
                </DialogStep>
                <DialogStep number={2} tone="blue">
                  Go to your <strong className="text-syro-blue">Downloads folder</strong> on your computer (File
                  Explorer on Windows, Finder on Mac). Find <strong>{state.fileName}</strong> and double-click to
                  open it.
                </DialogStep>
                <DialogStep number={3} tone="orange">
                  If you do not see the file yet, wait a few seconds and check the download progress on the
                  toolbar <strong>Downloads icon</strong>, then open the file from the downloads list or your
                  Downloads folder.
                </DialogStep>
              </ol>
            </div>
          </AlertDialogDescription>
        </div>

        <DialogFooterActions
          onClose={onClose}
          okLabel="OK — Got it"
          okClassName="bg-gradient-to-r from-syro-blue to-indigo-600"
          closeClassName="bg-gradient-to-r from-syro-orange to-amber-500"
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DownloadErrorDialog({
  state,
  open,
  onClose,
}: {
  state: DownloadErrorState | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!state) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onClose()}>
      <AlertDialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border-2 border-red-300 shadow-2xl gap-0">
        <div className="relative px-6 py-5 pr-14 text-white bg-gradient-to-r from-red-600 via-syro-red to-orange-500">
          <DialogCloseButton onClose={onClose} />
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <AlertDialogTitle className="font-syro-display text-xl text-white font-semibold">
                Download could not start
              </AlertDialogTitle>
              <p className="text-sm text-white/90 mt-1">Please try again in a moment.</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-5 bg-gradient-to-b from-red-50 to-white">
          <p className="text-sm font-semibold text-red-800 mb-2 break-all">{state.fileName}</p>
          <AlertDialogDescription className="text-sm text-gray-700">{state.message}</AlertDialogDescription>
        </div>
        <DialogFooterActions
          onClose={onClose}
          okLabel="OK"
          okClassName="bg-gradient-to-r from-red-600 to-syro-red"
          closeClassName="bg-gradient-to-r from-gray-600 to-slate-700"
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}

function startOfficialDocumentDownload(downloadUrl: string, fileName: string) {
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = fileName;
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

function DownloadCard({
  file,
  onDownload,
  downloadingId,
}: {
  file: TreeItem;
  onDownload: (file: TreeItem) => void;
  downloadingId: number | null;
}) {
  const isDownloading = file.id != null && downloadingId === file.id;
  const thumbInput = {
    fileUrl: file.fileUrl,
    thumbnailUrl: file.thumbnailUrl,
    fileDataContentType: file.fileDataContentType,
    fileName: file.fileName,
    title: file.fileName,
  };
  const displayThumb = getEventMediaDisplayThumbnailUrl(thumbInput);
  const placeholderKind = getOfficialDocumentPlaceholderKind(thumbInput);

  return (
    <article className="bg-white rounded-xl border border-syro-gold/25 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col h-full">
      <div className="relative w-full aspect-[16/10] bg-syro-bg-gray border-b border-syro-gold/20">
        {displayThumb ? (
          <Image
            src={displayThumb}
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 280px, 50vw"
            unoptimized
          />
        ) : (
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${placeholderGradient(placeholderKind)}`}
            aria-hidden="true"
          >
            <span className="text-2xl font-bold text-syro-blue/80">{placeholderLabel(placeholderKind)}</span>
            <span className="text-xs text-gray-600 mt-1 uppercase tracking-wide">Document</span>
          </div>
        )}
        <span className="absolute top-2 left-2 inline-flex items-center rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-syro-red shadow-sm">
          Download
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
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

      <div className="mt-auto pt-4 border-t border-syro-gold/20 flex justify-end">
        {file.downloadUrl ? (
          <button
            type="button"
            onClick={() => onDownload(file)}
            disabled={isDownloading}
            className="syro-primary-button inline-flex items-center gap-2 text-sm px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-busy={isDownloading}
          >
            {isDownloading ? 'Preparing…' : 'Download'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        ) : (
          <span className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-400">
            No link
          </span>
        )}
      </div>
      </div>
    </article>
  );
}

function DownloadsGrid({
  files,
  onDownload,
  downloadingId,
}: {
  files: TreeItem[];
  onDownload: (file: TreeItem) => void;
  downloadingId: number | null;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {files.map((file) => (
        <DownloadCard
          key={`file-${file.id ?? file.treePath}`}
          file={file}
          onDownload={onDownload}
          downloadingId={downloadingId}
        />
      ))}
    </div>
  );
}

type CategoryFilterOption = { id: number; slug: string; displayName: string };

/**
 * Primary category chips (2–3 rows). Order matches the public downloads menu.
 * Any active API category not listed here goes in "More categories…".
 */
const FEATURED_CATEGORY_DISPLAY_NAMES = [
  'Photos',
  'Catholicate Day Book Cover, Brochure',
  'Brochures',
  'Panjangom',
  'Calendars',
  'Medical Insurance',
  'Insurance & benefits',
  'Covering Note to be submitted along with financial statements',
  'Official circulars',
  'Church Financial Statements format for the year ended 31March 2025 of MOSC',
  'Financial statements',
  'MALANKARA SABHA MAGAZINE',
  'Magazines',
  'EDUCATIONAL SPECIAL SCHOLARSHIP',
  'Scholarships',
  'Merit Awards 2025',
  'Awards & merit events',
  'Marriage Marga Nirdesha Form',
  'Budget format 2025-26',
  'GST',
  'Tenders',
  'Mega Quiz qualified list',
] as const;

function normalizeCategoryLabel(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function findCategoryForFeaturedLabel(
  label: string,
  categoryOptions: CategoryFilterOption[],
  usedIds: Set<number>
): CategoryFilterOption | undefined {
  const norm = normalizeCategoryLabel(label);
  return categoryOptions.find(
    (cat) => !usedIds.has(cat.id) && normalizeCategoryLabel(cat.displayName) === norm
  );
}

function partitionCategoryOptions(categoryOptions: CategoryFilterOption[]) {
  const featured: CategoryFilterOption[] = [];
  const featuredIds = new Set<number>();

  for (const label of FEATURED_CATEGORY_DISPLAY_NAMES) {
    const cat = findCategoryForFeaturedLabel(label, categoryOptions, featuredIds);
    if (cat) {
      featured.push(cat);
      featuredIds.add(cat.id);
    }
  }

  const dropdownOptions = categoryOptions.filter((cat) => !featuredIds.has(cat.id));
  return { featured, dropdownOptions };
}

function yearFilterChipClass(active: boolean) {
  return `px-3 py-1.5 rounded-md text-xs font-semibold ${
    active ? 'bg-syro-red text-white' : 'bg-syro-bg-gray text-syro-blue'
  }`;
}

function categoryFilterChipClass(active: boolean) {
  return `inline-block max-w-[14rem] truncate rounded-md px-3 py-1.5 text-xs font-semibold ${
    active ? 'bg-syro-blue text-white' : 'bg-syro-bg-gray text-syro-blue'
  }`;
}

const filterDropdownClass = (active: boolean, tone: 'year' | 'category') =>
  `min-w-[11rem] max-w-[22rem] rounded-md border-2 px-3 py-1.5 text-xs font-semibold text-syro-blue bg-white focus:outline-none focus:ring-2 focus:ring-syro-blue/30 ${
    active
      ? tone === 'year'
        ? 'border-syro-red bg-red-50'
        : 'border-syro-blue bg-blue-50'
      : 'border-syro-gold/40'
  }`;

function YearFilterBar({
  yearOptions,
  currentFilters,
  buildFilterHref,
}: {
  yearOptions: number[];
  currentFilters: { categoryId: number | null; year: number | null };
  buildFilterHref: (categoryId: number | null, year: number | null) => string;
}) {
  const router = useRouter();
  const currentCalendarYear = new Date().getFullYear();
  const priorCalendarYear = currentCalendarYear - 1;

  const olderYearOptions = React.useMemo(() => {
    const pinned = new Set([currentCalendarYear, priorCalendarYear]);
    return yearOptions.filter((y) => !pinned.has(y));
  }, [yearOptions, currentCalendarYear, priorCalendarYear]);

  const dropdownValue =
    currentFilters.year != null && olderYearOptions.includes(currentFilters.year)
      ? String(currentFilters.year)
      : '';

  const dropdownActive = dropdownValue !== '';

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-syro-blue mb-2">Filter by year</p>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={buildFilterHref(currentFilters.categoryId, null)}
          className={yearFilterChipClass(!currentFilters.year)}
        >
          All years
        </Link>
        <Link
          href={buildFilterHref(currentFilters.categoryId, currentCalendarYear)}
          className={yearFilterChipClass(currentFilters.year === currentCalendarYear)}
        >
          {currentCalendarYear}
        </Link>
        <Link
          href={buildFilterHref(currentFilters.categoryId, priorCalendarYear)}
          className={yearFilterChipClass(currentFilters.year === priorCalendarYear)}
        >
          {priorCalendarYear}
        </Link>
        {olderYearOptions.length > 0 ? (
          <label className="inline-flex items-center gap-2">
            <span className="sr-only">Select another year</span>
            <select
              value={dropdownValue}
              onChange={(e) => {
                const next = e.target.value;
                router.push(
                  buildFilterHref(
                    currentFilters.categoryId,
                    next ? Number(next) : null
                  )
                );
              }}
              className={filterDropdownClass(dropdownActive, 'year')}
              aria-label="Filter by other years"
            >
              <option value="">More years…</option>
              {olderYearOptions.map((yr) => (
                <option key={yr} value={String(yr)}>
                  {yr}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
    </div>
  );
}

function CategoryFilterBar({
  categoryOptions,
  currentFilters,
  buildFilterHref,
}: {
  categoryOptions: CategoryFilterOption[];
  currentFilters: { categoryId: number | null; year: number | null };
  buildFilterHref: (categoryId: number | null, year: number | null) => string;
}) {
  const router = useRouter();
  if (categoryOptions.length === 0) {
    return null;
  }

  const { featured, dropdownOptions } = React.useMemo(
    () => partitionCategoryOptions(categoryOptions),
    [categoryOptions]
  );

  const featuredIds = React.useMemo(() => new Set(featured.map((c) => c.id)), [featured]);

  const dropdownValue =
    currentFilters.categoryId != null && !featuredIds.has(currentFilters.categoryId)
      ? String(currentFilters.categoryId)
      : '';
  const dropdownActive = dropdownValue !== '';

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-syro-blue mb-2">Filter by category</p>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={buildFilterHref(null, currentFilters.year)}
          className={categoryFilterChipClass(!currentFilters.categoryId)}
          title="All categories"
        >
          All categories
        </Link>
        {featured.map((cat) => (
          <Link
            key={cat.id}
            href={buildFilterHref(cat.id, currentFilters.year)}
            className={categoryFilterChipClass(currentFilters.categoryId === cat.id)}
            title={cat.displayName}
          >
            {cat.displayName}
          </Link>
        ))}
        {dropdownOptions.length > 0 ? (
          <label className="inline-flex shrink-0 items-center gap-2">
            <span className="sr-only">Select another document category</span>
            <select
              value={dropdownValue}
              onChange={(e) => {
                const next = e.target.value;
                router.push(
                  buildFilterHref(next ? Number(next) : null, currentFilters.year)
                );
              }}
              className={filterDropdownClass(dropdownActive, 'category')}
              aria-label="Filter by other categories"
            >
              <option value="">More categories…</option>
              {dropdownOptions.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.displayName}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
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

  const [downloadingId, setDownloadingId] = React.useState<number | null>(null);
  const [downloadSuccess, setDownloadSuccess] = React.useState<DownloadSuccessState | null>(null);
  const [downloadError, setDownloadError] = React.useState<DownloadErrorState | null>(null);

  const handleDownload = React.useCallback(async (file: TreeItem) => {
    if (!file.downloadUrl) {
      return;
    }

    setDownloadingId(file.id);
    setDownloadError(null);

    try {
      const jsonUrl = file.downloadUrl.includes('?')
        ? `${file.downloadUrl}&format=json`
        : `${file.downloadUrl}?format=json`;

      const res = await fetch(jsonUrl, { method: 'GET', cache: 'no-store' });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const details =
          typeof errBody?.error === 'string' ? errBody.error : 'Could not prepare the download link.';
        throw new Error(details);
      }

      const payload = (await res.json()) as { downloadUrl?: string };
      const freshUrl = payload.downloadUrl?.trim();
      if (!freshUrl) {
        throw new Error('No download URL was returned for this file.');
      }

      startOfficialDocumentDownload(freshUrl, file.fileName);

      setDownloadSuccess({
        fileName: file.fileName,
      });
    } catch (error) {
      setDownloadError({
        fileName: file.fileName,
        message: error instanceof Error ? error.message : 'Download failed. Please try again.',
      });
    } finally {
      setDownloadingId(null);
    }
  }, []);

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

      <DownloadSuccessDialog
        state={downloadSuccess}
        open={!!downloadSuccess}
        onClose={() => setDownloadSuccess(null)}
      />

      <DownloadErrorDialog
        state={downloadError}
        open={!!downloadError}
        onClose={() => setDownloadError(null)}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-6 pl-8 border-l-[7px] border-syro-red">
            Official Library Explorer
          </h3>
          <div className="bg-white rounded-xl border border-syro-gold/25 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6 md:p-8 mb-12">
            <div className="mb-6 space-y-4">
              <div className="text-sm text-gray-600">
                Showing page <span className="font-semibold">{currentPage}</span> of{' '}
                <span className="font-semibold">{totalPages}</span> (
                <span className="font-semibold">{officialTreePage.totalElements}</span> files
                {currentFilters.categoryId ? (
                  <>
                    {' '}
                    in{' '}
                    <span className="font-semibold">
                      {officialTreePage.categoryOptions.find((c) => c.id === currentFilters.categoryId)?.displayName ??
                        'selected category'}
                    </span>
                  </>
                ) : null}
                {currentFilters.year ? (
                  <>
                    {' '}
                    for year <span className="font-semibold">{currentFilters.year}</span>
                  </>
                ) : null}
                ). Lower priority values are shown first.
              </div>

              <YearFilterBar
                yearOptions={officialTreePage.yearOptions}
                currentFilters={currentFilters}
                buildFilterHref={queryWithFilter}
              />

              <CategoryFilterBar
                categoryOptions={officialTreePage.categoryOptions}
                currentFilters={currentFilters}
                buildFilterHref={queryWithFilter}
              />
            </div>

            {officialTreePage.content.length === 0 ? (
              <div className="rounded-lg border border-syro-gold/25 bg-syro-bg-gray/50 px-5 py-6 text-sm text-gray-500">
                No files available for the selected filters.
              </div>
            ) : (
              <DownloadsGrid
                files={sortedDownloads}
                onDownload={handleDownload}
                downloadingId={downloadingId}
              />
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
