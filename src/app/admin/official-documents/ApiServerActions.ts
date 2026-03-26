'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import type {
  EventMediaDTO,
  OfficialDocumentCategoryDTO,
  OfficialDocumentYearBundleDTO,
} from '@/types';
import { withTenantId } from '@/lib/withTenantId';
import { OFFICIAL_DOCUMENT_CATEGORIES_FALLBACK } from '@/data/officialDocumentCategoriesFallback';

/** Spring Data REST page or raw array */
function parseSpringPage<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && Array.isArray((data as { content?: unknown }).content)) {
    return (data as { content: T[] }).content;
  }
  return [];
}

function normalizeOfficialDocumentCategory(row: Record<string, unknown>): OfficialDocumentCategoryDTO {
  return {
    id: typeof row.id === 'number' ? row.id : undefined,
    tenantId: String(row.tenantId ?? row.tenant_id ?? ''),
    slug: String(row.slug ?? ''),
    displayName: String(row.displayName ?? row.display_name ?? ''),
    description:
      row.description === null || row.description === undefined
        ? null
        : String(row.description),
    sortOrder:
      typeof row.sortOrder === 'number'
        ? row.sortOrder
        : typeof row.sort_order === 'number'
          ? row.sort_order
          : undefined,
    isActive:
      typeof row.isActive === 'boolean'
        ? row.isActive
        : typeof row.is_active === 'boolean'
          ? row.is_active
          : undefined,
    createdAt:
      row.createdAt != null
        ? String(row.createdAt)
        : row.created_at != null
          ? String(row.created_at)
          : undefined,
    updatedAt:
      row.updatedAt != null
        ? String(row.updatedAt)
        : row.updated_at != null
          ? String(row.updated_at)
          : undefined,
  };
}

/** Set NEXT_PUBLIC_OFFICIAL_DOCUMENT_CATEGORY_FALLBACK=false to never use built-in slugs when API is missing */
function allowCategoryFallback(): boolean {
  return process.env.NEXT_PUBLIC_OFFICIAL_DOCUMENT_CATEGORY_FALLBACK !== 'false';
}

export type OfficialDocumentCategoriesFetchResult = {
  categories: OfficialDocumentCategoryDTO[];
  source: 'api' | 'fallback';
  /** Shown in admin UI when using fallback or on error */
  message?: string;
};

/**
 * Lists official document categories via GET /api/official-document-categories (fetchWithJwtRetry + tenant criteria).
 * If the backend returns 404 (endpoint not implemented), returns a built-in slug list so admin upload still works.
 */
export async function fetchOfficialDocumentCategoriesServer(): Promise<OfficialDocumentCategoriesFetchResult> {
  const fallback404 = (): OfficialDocumentCategoriesFetchResult =>
    allowCategoryFallback()
      ? {
          categories: OFFICIAL_DOCUMENT_CATEGORIES_FALLBACK,
          source: 'fallback',
          message:
            'The backend returned 404 for GET /api/official-document-categories — that REST endpoint is not registered on your Spring app yet. Showing a built-in slug list that matches typical DB seeds. After you add the controller/resource, categories will load from the API.',
        }
      : {
          categories: [],
          source: 'api',
          message:
            'Categories API returned 404. Implement GET /api/official-document-categories on the backend, or set NEXT_PUBLIC_OFFICIAL_DOCUMENT_CATEGORY_FALLBACK to use built-in slugs (default is on; set to false only to hide them).',
        };

  try {
    const params = new URLSearchParams();
    params.append('tenantId.equals', getTenantId());
    params.append('isActive.equals', 'true');
    params.append('sort', 'sortOrder,asc');
    params.append('size', '200');
    const url = `${getApiBaseUrl()}/api/official-document-categories?${params.toString()}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });

    if (res.status === 404) {
      console.warn('[official-documents] GET /api/official-document-categories → 404 (using fallback if enabled)');
      return fallback404();
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn('[official-documents] categories HTTP', res.status, errText.slice(0, 400));
      return {
        categories: [],
        source: 'api',
        message: `Categories request failed (HTTP ${res.status}).`,
      };
    }

    const data = await res.json();
    const rows = parseSpringPage<Record<string, unknown>>(data)
      .map(normalizeOfficialDocumentCategory)
      .filter((c) => c.slug);

    return { categories: rows, source: 'api' };
  } catch (e) {
    console.error('[official-documents] fetchOfficialDocumentCategoriesServer:', e);
    if (allowCategoryFallback()) {
      return {
        categories: OFFICIAL_DOCUMENT_CATEGORIES_FALLBACK,
        source: 'fallback',
        message: 'Could not reach the categories API; showing built-in slug list.',
      };
    }
    return { categories: [], source: 'api', message: String(e) };
  }
}

export async function fetchTenantOfficialDocumentsServer(filters?: {
  year?: number;
  officialDocumentCategoryId?: number;
}): Promise<EventMediaDTO[]> {
  try {
    const params = new URLSearchParams();
    params.append('tenantId.equals', getTenantId());
    params.append('isEventManagementOfficialDocument.equals', 'true');
    params.append('sort', 'createdAt,desc');
    params.append('size', '500');
    if (filters?.year != null) params.append('officialDocumentYear.equals', String(filters.year));
    if (filters?.officialDocumentCategoryId != null) {
      params.append('officialDocumentCategoryId.equals', String(filters.officialDocumentCategoryId));
    }
    const url = `${getApiBaseUrl()}/api/event-medias?${params.toString()}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return parseSpringPage<EventMediaDTO>(data);
  } catch (e) {
    console.error('[official-documents] fetchTenantOfficialDocumentsServer:', e);
    return [];
  }
}

function normalizeOfficialDocumentYearBundle(row: Record<string, unknown>): OfficialDocumentYearBundleDTO {
  const catId = row.officialDocumentCategoryId ?? row.official_document_category_id;
  const coverId = row.coverEventMediaId ?? row.cover_event_media_id;
  const coverRaw = row.coverEventMedia ?? row.cover_event_media;
  const nestedCover =
    coverRaw && typeof coverRaw === 'object'
      ? (coverRaw as Partial<EventMediaDTO>)
      : undefined;
  return {
    id: typeof row.id === 'number' ? row.id : row.id != null ? Number(row.id) : undefined,
    tenantId: row.tenantId != null ? String(row.tenantId) : row.tenant_id != null ? String(row.tenant_id) : undefined,
    officialDocumentCategoryId: Number(catId),
    documentYear: Number(row.documentYear ?? row.document_year),
    coverEventMediaId:
      coverId === null || coverId === undefined ? null : Number(coverId),
    createdAt:
      row.createdAt != null
        ? String(row.createdAt)
        : row.created_at != null
          ? String(row.created_at)
          : undefined,
    updatedAt:
      row.updatedAt != null
        ? String(row.updatedAt)
        : row.updated_at != null
          ? String(row.updated_at)
          : undefined,
    coverEventMedia: nestedCover ?? undefined,
  };
}

/** Lists year bundles for the tenant (GET /api/official-document-year-bundles). Returns [] if backend 404 or error. */
export async function fetchOfficialDocumentYearBundlesServer(): Promise<OfficialDocumentYearBundleDTO[]> {
  try {
    const params = new URLSearchParams();
    params.append('tenantId.equals', getTenantId());
    params.append('sort', 'documentYear,desc');
    params.append('size', '500');
    const url = `${getApiBaseUrl()}/api/official-document-year-bundles?${params.toString()}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (res.status === 404) return [];
    if (!res.ok) return [];
    const data = await res.json();
    return parseSpringPage<Record<string, unknown>>(data)
      .map(normalizeOfficialDocumentYearBundle)
      .filter((b) => b.officialDocumentCategoryId != null && !Number.isNaN(b.officialDocumentCategoryId));
  } catch (e) {
    console.error('[official-documents] fetchOfficialDocumentYearBundlesServer:', e);
    return [];
  }
}

/** POST create bundle (tenant + category + year). */
export async function createOfficialDocumentYearBundleServer(
  officialDocumentCategoryId: number,
  documentYear: number
): Promise<{ ok: true; bundle: OfficialDocumentYearBundleDTO } | { ok: false; message: string }> {
  try {
    const url = `${getApiBaseUrl()}/api/official-document-year-bundles`;
    const res = await fetchWithJwtRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(withTenantId({ officialDocumentCategoryId, documentYear })),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      return { ok: false, message: t || `HTTP ${res.status}` };
    }
    const data = await res.json();
    const bundle = normalizeOfficialDocumentYearBundle(data as Record<string, unknown>);
    return { ok: true, bundle };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

/** PATCH bundle cover (merge-patch). */
export async function patchOfficialDocumentYearBundleServer(
  bundleId: number,
  patch: { coverEventMediaId?: number | null }
): Promise<{ ok: true; bundle: OfficialDocumentYearBundleDTO } | { ok: false; message: string }> {
  try {
    const url = `${getApiBaseUrl()}/api/official-document-year-bundles/${bundleId}`;
    const finalPayload = { ...patch, id: bundleId };
    const res = await fetchWithJwtRetry(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(finalPayload),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      return { ok: false, message: t || `HTTP ${res.status}` };
    }
    const data = await res.json();
    const bundle = normalizeOfficialDocumentYearBundle(data as Record<string, unknown>);
    return { ok: true, bundle };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}
