'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import type { EventMediaDTO } from '@/types';
import { parseHierarchyDescription } from '@/lib/officialDocumentHierarchy';
import { resolveOfficialDocumentDownloadUrl } from '@/lib/officialDocumentDownload';
import { getEventMediaDisplayThumbnailUrl } from '@/lib/officialDocumentThumbnail';

/** Public tenant official documents for the downloads page (server-side JWT). */
export async function fetchPublicOfficialDocumentsForDownloadsServer(): Promise<EventMediaDTO[]> {
  try {
    const params = new globalThis.URLSearchParams();
    params.append('tenantId.equals', getTenantId());
    params.append('isEventManagementOfficialDocument.equals', 'true');
    params.append('isPublic.equals', 'true');
    params.append('sort', 'createdAt,desc');
    params.append('size', '200');
    const url = `${getApiBaseUrl()}/api/event-medias?${params.toString()}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    globalThis.console.error('[downloads] fetchPublicOfficialDocumentsForDownloadsServer:', e);
    return [];
  }
}

export type PublicOfficialDocumentTreeItem = {
  id: number | null;
  title: string;
  fileName: string;
  treePath: string;
  pathSegments: string[];
  categoryLabel: string | null;
  officialDocumentCategoryId: number | null;
  officialDocumentYear: number | null;
  priorityRanking: number;
  description: string | null;
  downloadUrl: string | null;
  thumbnailUrl: string | null;
  fileUrl: string | null;
  fileDataContentType: string | null;
  createdAt: string;
};

export type PublicOfficialDocumentTreePage = {
  content: PublicOfficialDocumentTreeItem[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  categoryOptions: Array<{ id: number; slug: string; displayName: string }>;
  /** Distinct years from public official documents (newest first) */
  yearOptions: number[];
};

function mapEventMediaToTreeItem(doc: EventMediaDTO): PublicOfficialDocumentTreeItem {
  const parsed = parseHierarchyDescription(doc.description);
  const fallbackName = (doc.fileUrl || '').split('/').pop() || doc.title || 'file';
  const treePath =
    (doc.hierarchyPath && String(doc.hierarchyPath).trim()) ||
    parsed.treePath ||
    doc.title ||
    fallbackName;
  const pathSegments = treePath.split(/[\\/]+/).map((x) => x.trim()).filter(Boolean);
  return {
    id: doc.id ?? null,
    title: doc.title,
    fileName: pathSegments[pathSegments.length - 1] || fallbackName,
    treePath,
    pathSegments,
    categoryLabel:
      (doc.hierarchyCategoryLabel && String(doc.hierarchyCategoryLabel).trim()) ||
      parsed.categoryLabel ||
      null,
    officialDocumentCategoryId: doc.officialDocumentCategoryId ?? null,
    officialDocumentYear: doc.officialDocumentYear ?? null,
    priorityRanking: doc.displayPriority ?? parsed.priority ?? doc.priorityRanking ?? 999999,
    description: parsed.cleanDescription || null,
    downloadUrl: resolveOfficialDocumentDownloadUrl(doc),
    thumbnailUrl: getEventMediaDisplayThumbnailUrl(
      {
        fileUrl: doc.fileUrl,
        thumbnailUrl: doc.thumbnailUrl,
        thumbnailPreSignedUrl: doc.thumbnailPreSignedUrl,
        fileDataContentType: doc.fileDataContentType || doc.contentType,
        title: doc.title,
        fileName: (doc.fileUrl || '').split('/').pop() || doc.title,
      },
      {
        thumbnailExpiresAtIso: doc.thumbnailPreSignedUrlExpiresAt,
        fileExpiresAtIso: doc.preSignedUrlExpiresAt,
      }
    ),
    fileUrl: doc.fileUrl || null,
    fileDataContentType: doc.fileDataContentType || doc.contentType || null,
    createdAt: doc.createdAt,
  };
}

function matchesOfficialDocumentFilters(
  item: PublicOfficialDocumentTreeItem,
  filters: { categoryId?: number; year?: number }
): boolean {
  if (filters.categoryId && item.officialDocumentCategoryId !== filters.categoryId) {
    return false;
  }
  if (filters.year && item.officialDocumentYear !== filters.year) {
    return false;
  }
  return true;
}

async function fetchAllPublicOfficialDocumentsRaw(): Promise<EventMediaDTO[]> {
  const all: EventMediaDTO[] = [];
  const batchSize = 100;
  let page = 0;
  let totalPages = 1;

  while (page < totalPages && page < 50) {
    const params = new globalThis.URLSearchParams();
    params.append('tenantId.equals', getTenantId());
    params.append('isEventManagementOfficialDocument.equals', 'true');
    params.append('isPublic.equals', 'true');
    params.append('sort', 'priorityRanking,asc');
    params.append('sort', 'createdAt,desc');
    params.append('page', String(page));
    params.append('size', String(batchSize));

    const url = `${getApiBaseUrl()}/api/event-medias?${params.toString()}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) break;

    const json = await res.json();
    const batch = Array.isArray(json) ? json : Array.isArray(json?.content) ? json.content : [];
    all.push(...(batch as EventMediaDTO[]));

    if (Array.isArray(json)) {
      break;
    }
    totalPages = Math.max(1, Number(json?.totalPages ?? 1));
    page += 1;
    if (batch.length === 0) break;
  }

  return all;
}

function extractYearOptionsFromDocs(docs: EventMediaDTO[], categoryId?: number): number[] {
  const years = new Set<number>();
  for (const row of docs) {
    if (categoryId && row.officialDocumentCategoryId !== categoryId) {
      continue;
    }
    const y = row.officialDocumentYear;
    if (typeof y === 'number' && Number.isFinite(y) && y >= 1900 && y <= 2100) {
      years.add(y);
    }
  }
  return [...years].sort((a, b) => b - a);
}

async function fetchPublicOfficialDocumentYearOptionsServer(input?: {
  categoryId?: number;
  docs?: EventMediaDTO[];
}): Promise<number[]> {
  try {
    const docs = input?.docs ?? (await fetchAllPublicOfficialDocumentsRaw());
    return extractYearOptionsFromDocs(docs, input?.categoryId);
  } catch {
    return [];
  }
}

export async function fetchPublicOfficialDocumentsTreeServer(input?: {
  page?: number;
  size?: number;
  categoryId?: number;
  year?: number;
}): Promise<PublicOfficialDocumentTreePage> {
  const page = Math.max(0, input?.page ?? 0);
  const size = Math.min(Math.max(1, input?.size ?? 24), 100);
  const hasFilters = Boolean(input?.categoryId || input?.year);

  try {
    const [yearOptions, docsRaw, pagedMeta] = await (async () => {
      if (hasFilters) {
        const allRaw = await fetchAllPublicOfficialDocumentsRaw();
        const yearOpts = extractYearOptionsFromDocs(allRaw, input?.categoryId);
        return [yearOpts, allRaw, null] as const;
      }

      const yearOptsPromise = fetchPublicOfficialDocumentYearOptionsServer({
        categoryId: input?.categoryId,
      });

      const baseParams = new globalThis.URLSearchParams();
      baseParams.append('tenantId.equals', getTenantId());
      baseParams.append('isEventManagementOfficialDocument.equals', 'true');
      baseParams.append('isPublic.equals', 'true');
      baseParams.append('sort', 'priorityRanking,asc');
      baseParams.append('sort', 'createdAt,desc');
      baseParams.append('page', String(page));
      baseParams.append('size', String(size));

      const docsUrl = `${getApiBaseUrl()}/api/event-medias?${baseParams.toString()}`;
      const [docsRes, yearOpts] = await Promise.all([
        fetchWithJwtRetry(docsUrl, { cache: 'no-store' }),
        yearOptsPromise,
      ]);
      if (!docsRes.ok) {
        return [yearOpts, [], { totalElements: 0, totalPages: 0, currentPage: page }] as const;
      }
      const docsJson = await docsRes.json();
      const raw = Array.isArray(docsJson) ? docsJson : Array.isArray(docsJson?.content) ? docsJson.content : [];
      const meta = Array.isArray(docsJson)
        ? { totalElements: raw.length, totalPages: 1, currentPage: 0 }
        : {
            totalElements: Number(docsJson?.totalElements ?? raw.length),
            totalPages: Number(docsJson?.totalPages ?? 1),
            currentPage: Number(docsJson?.number ?? page),
          };
      return [yearOpts, raw as EventMediaDTO[], meta] as const;
    })();

    let content = (docsRaw as EventMediaDTO[]).map(mapEventMediaToTreeItem);

    let totalElements: number;
    let totalPages: number;
    let currentPage: number;

    if (hasFilters) {
      const filtered = content.filter((item) =>
        matchesOfficialDocumentFilters(item, {
          categoryId: input?.categoryId,
          year: input?.year,
        })
      );
      totalElements = filtered.length;
      totalPages = Math.max(1, Math.ceil(totalElements / size));
      currentPage = Math.min(page, totalPages - 1);
      content = filtered.slice(currentPage * size, currentPage * size + size);
    } else if (pagedMeta) {
      totalElements = pagedMeta.totalElements;
      totalPages = pagedMeta.totalPages;
      currentPage = pagedMeta.currentPage;
    } else {
      totalElements = 0;
      totalPages = 0;
      currentPage = page;
    }

    const catParams = new globalThis.URLSearchParams();
    catParams.append('tenantId.equals', getTenantId());
    catParams.append('isActive.equals', 'true');
    catParams.append('sort', 'sortOrder,asc');
    catParams.append('size', '200');
    const catsUrl = `${getApiBaseUrl()}/api/official-document-categories?${catParams.toString()}`;
    const catsRes = await fetchWithJwtRetry(catsUrl, { cache: 'no-store' });
    const catJson = catsRes.ok ? await catsRes.json() : [];
    const catRaw = Array.isArray(catJson) ? catJson : Array.isArray(catJson?.content) ? catJson.content : [];
    const categoryOptions = (catRaw as Array<Record<string, unknown>>)
      .map((row) => ({
        id: Number(row.id),
        slug: String(row.slug ?? ''),
        displayName: String(row.displayName ?? row.display_name ?? row.slug ?? ''),
      }))
      .filter((x) => Number.isFinite(x.id) && x.id > 0);

    return {
      content,
      totalElements,
      totalPages: Math.max(totalPages, 1),
      page: currentPage,
      size,
      categoryOptions,
      yearOptions,
    };
  } catch (e) {
    globalThis.console.error('[downloads] fetchPublicOfficialDocumentsTreeServer:', e);
    return { content: [], totalElements: 0, totalPages: 0, page, size, categoryOptions: [], yearOptions: [] };
  }
}
