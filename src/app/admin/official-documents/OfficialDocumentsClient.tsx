'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type {
  EventMediaDTO,
  OfficialDocumentCategoryDTO,
  OfficialDocumentYearBundleDTO,
} from '@/types';
import { getClientTenantId } from '@/lib/env';
import {
  createOfficialDocumentYearBundleServer,
  fetchOfficialDocumentCategoriesServer,
  fetchOfficialDocumentYearBundlesServer,
  fetchTenantOfficialDocumentsServer,
  patchOfficialDocumentYearBundleServer,
} from './ApiServerActions';

function isImageMedia(d: EventMediaDTO): boolean {
  const t = (d.eventMediaType || '').toLowerCase();
  const c = (d.contentType || d.fileDataContentType || '').toLowerCase();
  return t === 'gallery' || t === 'image' || c.startsWith('image/');
}

function resolveCoverPreviewUrl(
  bundle: OfficialDocumentYearBundleDTO | undefined,
  docs: EventMediaDTO[]
): string | undefined {
  if (!bundle?.coverEventMediaId) return undefined;
  const nested = bundle.coverEventMedia?.fileUrl || bundle.coverEventMedia?.preSignedUrl;
  if (nested) return nested;
  const doc = docs.find((x) => x.id === bundle.coverEventMediaId);
  return doc?.preSignedUrl || doc?.fileUrl || undefined;
}

type Props = {
  initialCategories: OfficialDocumentCategoryDTO[];
  initialDocuments: EventMediaDTO[];
  initialBundles: OfficialDocumentYearBundleDTO[];
  categorySource: 'api' | 'fallback';
  categoryMessage?: string;
};

export default function OfficialDocumentsClient({
  initialCategories,
  initialDocuments,
  initialBundles,
  categorySource: initialCategorySource,
  categoryMessage: initialCategoryMessage,
}: Props) {
  const router = useRouter();
  const tenantId = getClientTenantId();
  const [categories, setCategories] = useState<OfficialDocumentCategoryDTO[]>(initialCategories);
  const [categorySource, setCategorySource] = useState<'api' | 'fallback'>(initialCategorySource);
  const [categoryMessage, setCategoryMessage] = useState<string | undefined>(initialCategoryMessage);
  const [documents, setDocuments] = useState<EventMediaDTO[]>(initialDocuments);
  const [bundles, setBundles] = useState<OfficialDocumentYearBundleDTO[]>(initialBundles);
  const [categorySlug, setCategorySlug] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [titlePrefix, setTitlePrefix] = useState('Official Document');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [filterYear, setFilterYear] = useState<number | ''>('');
  const [filterCategoryId, setFilterCategoryId] = useState<number | ''>('');
  const [bundleError, setBundleError] = useState<string | null>(null);
  const [bundleBusy, setBundleBusy] = useState(false);
  const [coverSelectId, setCoverSelectId] = useState<number | '' | 'none'>('none');

  useEffect(() => {
    setBundles(initialBundles);
  }, [initialBundles]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.slug === categorySlug),
    [categories, categorySlug]
  );
  const selectedCategoryId = selectedCategory?.id;

  const currentBundle = useMemo(() => {
    if (selectedCategoryId == null) return undefined;
    return bundles.find(
      (b) => b.officialDocumentCategoryId === selectedCategoryId && b.documentYear === year
    );
  }, [bundles, selectedCategoryId, year]);

  const coverCandidateDocs = useMemo(() => {
    if (selectedCategoryId == null) return [];
    return documents.filter(
      (d) =>
        d.officialDocumentCategoryId === selectedCategoryId &&
        d.officialDocumentYear === year &&
        isImageMedia(d) &&
        d.id != null
    );
  }, [documents, selectedCategoryId, year]);

  /** Include current cover media if it is not in the filtered list (e.g. different filter). */
  const coverSelectOptions = useMemo(() => {
    const curId = currentBundle?.coverEventMediaId;
    const base = coverCandidateDocs;
    if (curId != null && !base.some((d) => d.id === curId)) {
      const extra = documents.find((d) => d.id === curId && isImageMedia(d));
      if (extra?.id != null) return [...base, extra];
    }
    return base;
  }, [coverCandidateDocs, currentBundle?.coverEventMediaId, documents]);

  useEffect(() => {
    const cur = currentBundle?.coverEventMediaId;
    if (cur == null) setCoverSelectId('none');
    else setCoverSelectId(cur);
  }, [currentBundle?.coverEventMediaId, currentBundle?.id]);

  const reloadBundles = useCallback(async () => {
    const next = await fetchOfficialDocumentYearBundlesServer();
    setBundles(next);
  }, []);

  const reloadCategories = useCallback(async () => {
    const next = await fetchOfficialDocumentCategoriesServer();
    setCategories(next.categories);
    setCategorySource(next.source);
    setCategoryMessage(next.message);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };

  const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
      if (fileInputRef.current) {
        const dt = new DataTransfer();
        Array.from(e.target.files).forEach((f) => dt.items.add(f));
        fileInputRef.current.files = dt.files;
      }
    }
  };

  const reloadDocuments = useCallback(async () => {
    const f: { year?: number; officialDocumentCategoryId?: number } = {};
    if (filterYear !== '') f.year = filterYear;
    if (filterCategoryId !== '') f.officialDocumentCategoryId = filterCategoryId;
    const next = await fetchTenantOfficialDocumentsServer(f);
    setDocuments(next);
  }, [filterYear, filterCategoryId]);

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!tenantId) {
      setError('Tenant ID is not configured (NEXT_PUBLIC_TENANT_ID).');
      return;
    }
    if (!categorySlug.trim()) {
      setError('Select or enter a category slug.');
      return;
    }
    if (!year || year < 1900 || year > 2100) {
      setError('Enter a valid year.');
      return;
    }
    if (!files || files.length < 1) {
      setError('Select at least one file.');
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append('tenantId', tenantId);
      form.append('categorySlug', categorySlug.trim().toLowerCase());
      form.append('officialDocumentYear', String(year));
      if (titlePrefix.trim()) form.append('titlePrefix', titlePrefix.trim());
      if (description.trim()) form.append('description', description.trim());
      form.append('isPublic', isPublic ? 'true' : 'false');
      for (let i = 0; i < files.length; i++) {
        form.append('files', files[i]);
      }

      const res = await fetch('/api/proxy/event-medias/upload/bulk-tenant-official', {
        method: 'POST',
        headers: {
          'X-Tenant-ID': tenantId,
        },
        body: form,
      });

      if (!res.ok) {
        let detail = `Upload failed (${res.status})`;
        try {
          const j = await res.json();
          if (j?.message) detail = j.message;
          else if (j?.error) detail = String(j.error);
        } catch {
          /* ignore */
        }
        setError(detail);
        return;
      }

      const data = await res.json();
      const count = Array.isArray(data) ? data.length : 1;
      setMessage(`Uploaded ${count} file(s) successfully.`);
      setFiles(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (folderInputRef.current) folderInputRef.current.value = '';
      await reloadDocuments();
      await reloadBundles();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateYearBundle = async () => {
    setBundleError(null);
    if (selectedCategoryId == null) {
      setBundleError('Category must have a numeric id from the API. Use categories loaded from the backend or seed categories with ids.');
      return;
    }
    setBundleBusy(true);
    try {
      const r = await createOfficialDocumentYearBundleServer(selectedCategoryId, year);
      if (!r.ok) {
        setBundleError(r.message);
        return;
      }
      setBundles((prev) => {
        const rest = prev.filter(
          (b) =>
            !(
              b.officialDocumentCategoryId === r.bundle.officialDocumentCategoryId &&
              b.documentYear === r.bundle.documentYear
            )
        );
        return [...rest, r.bundle];
      });
      router.refresh();
    } catch (e) {
      setBundleError(e instanceof Error ? e.message : String(e));
    } finally {
      setBundleBusy(false);
    }
  };

  const handleSaveCover = async () => {
    setBundleError(null);
    if (!currentBundle?.id) {
      setBundleError('Create a year bundle first.');
      return;
    }
    setBundleBusy(true);
    try {
      const coverEventMediaId =
        coverSelectId === 'none' || coverSelectId === '' ? null : Number(coverSelectId);
      const r = await patchOfficialDocumentYearBundleServer(currentBundle.id, { coverEventMediaId });
      if (!r.ok) {
        setBundleError(r.message);
        return;
      }
      setBundles((prev) =>
        prev.map((b) => (b.id === r.bundle.id ? r.bundle : b))
      );
      router.refresh();
    } catch (e) {
      setBundleError(e instanceof Error ? e.message : String(e));
    } finally {
      setBundleBusy(false);
    }
  };

  const coverPreview = resolveCoverPreviewUrl(currentBundle, documents);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="mb-8 flex flex-wrap items-center gap-4 text-sm">
        <Link
          href="/admin"
          className="inline-flex items-center font-medium text-blue-600 hover:text-blue-800"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Admin Dashboard
        </Link>
        <span className="text-gray-300">|</span>
        <Link href="/admin/official-document-categories" className="font-medium text-blue-600 hover:text-blue-800">
          Browse categories (list)
        </Link>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Official documents</h1>
      {categoryMessage && (
        <div
          className={`mb-4 rounded-lg border p-4 text-sm ${
            categorySource === 'fallback'
              ? 'border-amber-300 bg-amber-50 text-amber-950'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
          role="status"
        >
          {categorySource === 'fallback' && (
            <strong className="block mb-1">Category list (fallback)</strong>
          )}
          {categoryMessage}
        </div>
      )}
      <p className="text-gray-600 mb-2">
        Bulk upload tenant library files under{' '}
        <code className="text-sm bg-gray-100 px-1 rounded">official_document/&#123;slug&#125;/&#123;year&#125;</code>.
        Category must exist in{' '}
        <code className="text-sm bg-gray-100 px-1">official_document_category</code> for your tenant (
        <Link href="/admin/official-document-categories" className="text-blue-600 hover:underline">
          view slugs
        </Link>
        ).
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Tenant in this app: <code className="bg-gray-100 px-1 rounded">{tenantId || 'not set'}</code>. Must match{' '}
        <code>tenant_id</code> in the database (your seed uses <code>tenant_demo_002</code>).
      </p>

      <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50/80 p-5 text-sm text-gray-800 space-y-3">
        <h2 className="text-base font-semibold text-gray-900">Workflow &amp; capabilities</h2>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>
            <strong>Category</strong> — Pick a slug that already exists in{' '}
            <code className="text-xs bg-white/80 px-1 rounded">official_document_category</code> for this tenant (or
            create rows in the DB / API first).
          </li>
          <li>
            <strong>Year &amp; metadata</strong> — Set the calendar year segment for S3 paths and optional title prefix /
            description / public flag.
          </li>
          <li>
            <strong>Cover image (year bundle)</strong> — One row per tenant + category + year in{' '}
            <code className="text-xs bg-white/80 px-1">official_document_year_bundle</code> with optional{' '}
            <code className="text-xs bg-white/80 px-1">cover_event_media_id</code> pointing at an uploaded{' '}
            <code className="text-xs bg-white/80 px-1">event_media</code> image. Use the panel below (same category slug
            and year as bulk upload). See{' '}
            <code className="text-xs bg-white/80 px-1">documentation/mosc_document_downloads_page/cover_image/</code>.
          </li>
          <li>
            <strong>Files</strong> — Use <strong>Choose files</strong> or <strong>Upload folder</strong> (same as event
            media / gallery album pages: all files in the folder are sent in one request). Multiple files are supported;
            there is no separate folder entity—only the file list is posted.
          </li>
        </ol>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bulk upload</h2>
          <form onSubmit={handleBulkUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category (slug)</label>
              {categories.length > 0 ? (
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id ?? c.slug} value={c.slug}>
                      {c.displayName} ({c.slug})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  placeholder="e.g. photos, financial-statements"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              )}
              <p className="text-xs text-gray-500 mt-1">
                No categories loaded? Enter slug manually or seed{' '}
                <code className="bg-gray-100 px-0.5">official_document_category</code> rows.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                min={1900}
                max={2100}
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10) || new Date().getFullYear())}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title prefix (optional)</label>
              <input
                type="text"
                value={titlePrefix}
                onChange={(e) => setTitlePrefix(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span className="text-sm text-gray-700">Public (visible on downloads when data-driven mode is on)</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Files</label>
              <p className="text-xs text-gray-500 mb-2">
                Same pattern as <span className="font-medium">Admin → Event → Media</span> and{' '}
                <span className="font-medium">Gallery album media</span>: multi-select or an entire folder (flat file
                list).
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                <label className="inline-flex cursor-pointer items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800 hover:bg-blue-100">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileInputChange}
                    className="sr-only"
                  />
                  Choose files
                </label>
                <label className="inline-flex cursor-pointer items-center rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-800 hover:bg-green-100">
                  <input
                    ref={folderInputRef}
                    type="file"
                    multiple
                    onChange={handleFolderInputChange}
                    className="sr-only"
                    {...({ webkitdirectory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
                  />
                  Upload folder
                </label>
              </div>
              {files && files.length > 0 && (
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold text-blue-700">{files.length}</span> file
                  {files.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
            )}
            {message && (
              <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">{message}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-semibold text-blue-700">{loading ? 'Uploading…' : 'Upload batch'}</span>
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="flex flex-wrap gap-4 items-end mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                placeholder="Any"
                value={filterYear}
                onChange={(e) =>
                  setFilterYear(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                }
                className="w-32 border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filterCategoryId === '' ? '' : String(filterCategoryId)}
                onChange={(e) =>
                  setFilterCategoryId(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                }
                className="border border-gray-300 rounded-lg px-3 py-2 min-w-[200px]"
              >
                <option value="">All</option>
                {categories.map((c) =>
                  c.id != null ? (
                    <option key={c.id} value={c.id}>
                      {c.displayName}
                    </option>
                  ) : null
                )}
              </select>
            </div>
            <button
              type="button"
              onClick={() => void reloadDocuments()}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => void reloadCategories()}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
            >
              Refresh categories
            </button>
          </div>
          <p className="text-sm text-gray-500">
            {documents.length} document(s) loaded. Filters use backend criteria when supported.
          </p>
        </div>
      </div>

      <div className="mb-12 rounded-lg border border-violet-200 bg-violet-50/60 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Year bundle cover</h2>
        <p className="text-sm text-gray-600 mb-4">
          Matches the <strong>category slug</strong> and <strong>year</strong> from bulk upload above. Create a bundle
          row, then pick an image already uploaded for that category and year.
        </p>
        <div className="flex flex-wrap gap-6 items-start">
          <div className="min-w-[200px] space-y-1 text-sm">
            <div>
              <span className="text-gray-500">Category id:</span>{' '}
              <span className="font-mono">{selectedCategoryId ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-500">Year:</span> <span className="font-mono">{year}</span>
            </div>
            <div>
              <span className="text-gray-500">Bundle:</span>{' '}
              {currentBundle?.id != null ? (
                <span className="text-green-700 font-medium">#{currentBundle.id}</span>
              ) : (
                <span className="text-amber-800">none — create below</span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end flex-wrap">
            <button
              type="button"
              disabled={
                bundleBusy ||
                selectedCategoryId == null ||
                currentBundle != null
              }
              onClick={() => void handleCreateYearBundle()}
              className="px-4 py-2 rounded-xl bg-violet-100 hover:bg-violet-200 text-violet-900 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {bundleBusy ? 'Working…' : 'Create year bundle'}
            </button>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cover image (from uploads)</label>
              <select
                value={coverSelectId === 'none' ? 'none' : String(coverSelectId)}
                onChange={(e) => {
                  const v = e.target.value;
                  setCoverSelectId(v === 'none' ? 'none' : parseInt(v, 10));
                }}
                disabled={!currentBundle?.id}
                className="border border-gray-300 rounded-lg px-3 py-2 min-w-[220px] text-sm disabled:bg-gray-100"
              >
                <option value="none">No cover</option>
                {coverSelectOptions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title || `Media #${d.id}`} (id {d.id})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              disabled={bundleBusy || !currentBundle?.id}
              onClick={() => void handleSaveCover()}
              className="px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-medium text-sm disabled:opacity-50"
            >
              Save cover
            </button>
          </div>
          {coverPreview && (
            <div className="relative h-24 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white">
              <Image
                src={coverPreview}
                alt="Cover preview"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}
        </div>
        {selectedCategoryId == null && categorySlug && (
          <p className="mt-3 text-sm text-amber-800">
            Categories from fallback slugs have no database id — load categories from the API or pick a category that has
            an id to use year bundles.
          </p>
        )}
        {coverSelectOptions.length === 0 && currentBundle?.id != null && (
          <p className="mt-3 text-sm text-gray-600">
            No image files found for this category and year in the table below. Upload images (same slug/year), refresh the
            list, then choose one here.
          </p>
        )}
        {bundleError && (
          <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{bundleError}</div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 px-6 py-4 border-b border-gray-200">Tenant official documents</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category id</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Public</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No documents found. Upload above or adjust filters.
                  </td>
                </tr>
              ) : (
                documents.map((d) => (
                  <tr key={d.id != null ? `doc-${d.id}` : `doc-${d.title}-${d.createdAt}`}>
                    <td className="px-4 py-3 text-sm text-gray-900">{d.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{d.officialDocumentYear ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{d.officialDocumentCategoryId ?? '—'}</td>
                    <td className="px-4 py-3 text-sm">{d.isPublic ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-sm">
                      {(d.preSignedUrl || d.fileUrl) ? (
                        <a
                          href={d.preSignedUrl || d.fileUrl}
                          className="text-blue-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
