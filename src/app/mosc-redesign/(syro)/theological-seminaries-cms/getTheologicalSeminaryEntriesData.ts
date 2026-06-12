/**
 * Server-side data for Theological Seminaries CMS (Strapi GET /api/theological-seminaries).
 */

import 'server-only';
import {
  getStrapiUrl,
  getStrapiApiBase,
  getStrapiHeaders,
  getStrapiTenantId,
} from '@/lib/strapi';
import { getMediaUrl, getMediaAlt } from '@/app/mosc-redesign/(syro)/directory/lib/strapiMedia';
import type {
  TheologicalSeminaryEntry,
  TheologicalSeminaryEntriesListResult,
} from './types';

function parseEntry(raw: Record<string, unknown>, baseUrl: string): TheologicalSeminaryEntry {
  const documentId = typeof raw.documentId === 'string' ? raw.documentId : '';
  const name = typeof raw.name === 'string' ? raw.name : '';
  const slug = typeof raw.slug === 'string' ? raw.slug : '';
  const subtitle = typeof raw.subtitle === 'string' ? raw.subtitle : null;
  const excerpt = typeof raw.excerpt === 'string' ? raw.excerpt : null;
  const body = typeof raw.body === 'string' ? raw.body : null;
  const address = typeof raw.address === 'string' ? raw.address : null;
  const email = typeof raw.email === 'string' ? raw.email : null;
  const phones = typeof raw.phones === 'string' ? raw.phones : null;
  const website = typeof raw.website === 'string' ? raw.website : null;
  const location = typeof raw.location === 'string' ? raw.location : null;
  const established = typeof raw.established === 'string' ? raw.established : null;
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
    address,
    email,
    phones,
    website,
    imageUrl,
    imageAlt,
    location,
    established,
    order,
  };
}

const EMPTY_LIST: TheologicalSeminaryEntriesListResult = { entries: [] };

/**
 * Fetches all theological seminary entries for the current tenant, sorted by display order.
 */
export async function getTheologicalSeminaryEntriesData(): Promise<TheologicalSeminaryEntriesListResult> {
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

  const url = `${base}/theological-seminaries?${params.toString()}`;

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
 * Fetches a single theological seminary entry by slug. Returns null if not found or on error.
 */
export async function getTheologicalSeminaryEntryBySlug(
  slug: string
): Promise<TheologicalSeminaryEntry | null> {
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

  const url = `${base}/theological-seminaries?${params.toString()}`;

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
