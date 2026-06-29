/**
 * Server-side data for Saints CMS (Strapi GET /api/saint-entries).
 */

import 'server-only';
import {
  getStrapiUrl,
  getStrapiApiBase,
  getStrapiHeaders,
  getStrapiTenantId,
  fetchStrapiEntryBySlug,
} from '@/lib/strapi';
import { unwrapStrapiRecord } from '@/lib/strapi/unwrapRecord';
import { getMediaUrl, getMediaAlt } from '@/app/mosc-redesign/(syro)/directory/lib/strapiMedia';
import type { SaintEntry, SaintEntriesListResult } from './types';

function parseEntry(raw: Record<string, unknown>, baseUrl: string): SaintEntry {
  const item = unwrapStrapiRecord(raw);
  const documentId = typeof item.documentId === 'string' ? item.documentId : '';
  const name = typeof item.name === 'string' ? item.name : '';
  const slug = typeof item.slug === 'string' ? item.slug : '';
  const excerpt = typeof item.excerpt === 'string' ? item.excerpt : null;
  const body = typeof item.body === 'string' ? item.body : null;
  const order = typeof item.order === 'number' ? item.order : 0;
  const image = item.image;
  const imageUrl = image ? getMediaUrl(image, baseUrl) : null;
  const imageAlt = image ? getMediaAlt(image) ?? null : null;

  return {
    documentId,
    name,
    slug,
    excerpt,
    body,
    imageUrl,
    imageAlt,
    order,
  };
}

const EMPTY_LIST: SaintEntriesListResult = { entries: [] };

async function fetchSaintEntryBySlugFromStrapi(
  slug: string,
  options?: { tenantId?: string },
): Promise<SaintEntry | null> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  if (!baseUrl || !base || !slug.trim()) {
    return null;
  }

  const params = new URLSearchParams();
  if (options?.tenantId) {
    params.set('filters[tenant][tenantId][$eq]', options.tenantId);
  }
  params.set('filters[slug][$eqi]', slug.trim());
  params.set('populate[0]', 'image');
  params.set('pagination[pageSize]', '1');

  try {
    const res = await fetch(`${base}/saint-entries?${params.toString()}`, {
      headers: getStrapiHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: unknown[] };
    const raw = Array.isArray(json?.data) ? json.data[0] : null;
    if (!raw || typeof raw !== 'object') return null;
    return parseEntry(raw as Record<string, unknown>, baseUrl);
  } catch {
    return null;
  }
}

/**
 * Homepage carousel: resolve each saint by canonical slug (no -mo2 suffix) so the
 * card title matches the Strapi entry detail page, then fall back to tenant-scoped list.
 */
export async function getHomepageSaintCarouselEntries(
  slugBases: readonly string[],
): Promise<SaintEntry[]> {
  const tenantId = getStrapiTenantId();
  const resolved: SaintEntry[] = [];

  for (const baseSlug of slugBases) {
    const canonical =
      (await fetchSaintEntryBySlugFromStrapi(baseSlug)) ??
      (tenantId ? await fetchSaintEntryBySlugFromStrapi(baseSlug, { tenantId }) : null) ??
      (await fetchSaintEntryBySlugFromStrapi(`${baseSlug}-mo2`)) ??
      (tenantId ? await fetchSaintEntryBySlugFromStrapi(`${baseSlug}-mo2`, { tenantId }) : null);

    if (canonical) {
      resolved.push(canonical);
    }
  }

  if (resolved.length === slugBases.length) {
    return resolved;
  }

  const { entries } = await getSaintEntriesData();
  const picked = slugBases
    .map((base) => {
      const candidates = entries.filter((entry) => entry.slug.replace(/-mo2$/, '') === base);
      if (candidates.length === 0) return null;
      return candidates.sort((a, b) => {
        const aMo2 = a.slug.endsWith('-mo2') ? 1 : 0;
        const bMo2 = b.slug.endsWith('-mo2') ? 1 : 0;
        if (aMo2 !== bMo2) return aMo2 - bMo2;
        return b.name.length - a.name.length;
      })[0];
    })
    .filter((entry): entry is SaintEntry => entry != null);

  return picked.length > 0 ? picked : resolved;
}

/**
 * Fetches all saint entries for the current tenant, sorted by display order.
 */
export async function getSaintEntriesData(): Promise<SaintEntriesListResult> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId) {
    return EMPTY_LIST;
  }

  const params = new URLSearchParams();
  params.set('filters[tenant][tenantId][$eq]', tenantId);
  params.set('sort', 'order:asc,name:asc');
  params.set('populate[0]', 'image');
  params.set('pagination[pageSize]', '100');

  const url = `${base}/saint-entries?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: getStrapiHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) {
      return EMPTY_LIST;
    }
    const json = (await res.json()) as { data?: unknown[] };
    const list = Array.isArray(json?.data) ? json.data : [];
    const entries = list
      .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
      .map((item) => parseEntry(item, baseUrl));
    return { entries };
  } catch {
    return EMPTY_LIST;
  }
}

/**
 * Fetches a single saint entry by slug. Returns null if not found or on error.
 */
export async function getSaintEntryBySlug(slug: string): Promise<SaintEntry | null> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId || !slug) {
    return null;
  }

  return fetchStrapiEntryBySlug({
    collectionPath: 'saint-entries',
    slug,
    baseUrl,
    apiBase: base,
    tenantId,
    populate: ['image'],
    parse: parseEntry,
    fetchList: async () => (await getSaintEntriesData()).entries,
    isValid: (entry) => Boolean(entry.slug || entry.name),
  });
}
