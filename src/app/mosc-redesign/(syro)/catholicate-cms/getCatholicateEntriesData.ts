/**
 * Server-side data for Catholicate CMS (Strapi GET /api/catholicate-entries).
 */

import 'server-only';
import {
  getStrapiUrl,
  getStrapiApiBase,
  getStrapiHeaders,
  getStrapiTenantId,
} from '@/lib/strapi';
import { getMediaUrl, getMediaAlt } from '@/app/mosc-redesign/(syro)/directory/lib/strapiMedia';
import type { CatholicateEntry, CatholicateEntriesListResult } from './types';

function parseEntry(raw: Record<string, unknown>, baseUrl: string): CatholicateEntry {
  const documentId = typeof raw.documentId === 'string' ? raw.documentId : '';
  const name = typeof raw.name === 'string' ? raw.name : '';
  const slug = typeof raw.slug === 'string' ? raw.slug : '';
  const subtitle = typeof raw.subtitle === 'string' ? raw.subtitle : null;
  const excerpt = typeof raw.excerpt === 'string' ? raw.excerpt : null;
  const body = typeof raw.body === 'string' ? raw.body : null;
  const order = typeof raw.order === 'number' ? raw.order : 0;
  const image = raw.image;
  const imageUrl = image ? getMediaUrl(image, baseUrl) : null;
  const imageAlt = image ? getMediaAlt(image) ?? null : null;

  return {
    documentId,
    name,
    slug,
    subtitle,
    excerpt,
    body,
    imageUrl,
    imageAlt,
    order,
  };
}

const EMPTY_LIST: CatholicateEntriesListResult = { entries: [] };

/**
 * Fetches all Catholicate entries for the current tenant, sorted by display order.
 */
export async function getCatholicateEntriesData(): Promise<CatholicateEntriesListResult> {
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

  const url = `${base}/catholicate-entries?${params.toString()}`;

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
 * Fetches a single Catholicate entry by slug. Returns null if not found or on error.
 */
export async function getCatholicateEntryBySlug(slug: string): Promise<CatholicateEntry | null> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId || !slug) {
    return null;
  }

  const params = new URLSearchParams();
  params.set('filters[tenant][tenantId][$eq]', tenantId);
  params.set('filters[slug][$eq]', slug);
  params.set('populate[0]', 'image');
  params.set('pagination[pageSize]', '1');

  const url = `${base}/catholicate-entries?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: getStrapiHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) {
      return null;
    }
    const json = (await res.json()) as { data?: unknown[] };
    const list = Array.isArray(json?.data) ? json.data : [];
    const raw = list[0];
    if (!raw || typeof raw !== 'object') {
      return null;
    }
    return parseEntry(raw as Record<string, unknown>, baseUrl);
  } catch {
    return null;
  }
}
