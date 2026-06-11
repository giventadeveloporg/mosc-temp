/**
 * Server-side data for Institutions CMS (Strapi GET /api/institutions).
 */

import 'server-only';
import {
  getStrapiUrl,
  getStrapiApiBase,
  getStrapiHeaders,
  getStrapiTenantId,
} from '@/lib/strapi';
import { getMediaUrl, getMediaAlt } from '@/app/mosc-redesign/(syro)/directory/lib/strapiMedia';
import {
  institutionBelongsToCategory,
  type InstitutionHubCategory,
} from './institutionHubCategories';
import type { InstitutionEntry, InstitutionsListResult } from './types';

function parseEntry(raw: Record<string, unknown>, baseUrl: string): InstitutionEntry {
  const documentId = typeof raw.documentId === 'string' ? raw.documentId : '';
  const name = typeof raw.name === 'string' ? raw.name : '';
  const slug = typeof raw.slug === 'string' ? raw.slug : '';
  const description = typeof raw.description === 'string' ? raw.description : null;
  const address = typeof raw.address === 'string' ? raw.address : null;
  const email = typeof raw.email === 'string' ? raw.email : null;
  const phones = typeof raw.phones === 'string' ? raw.phones : null;
  const website = typeof raw.website === 'string' ? raw.website : null;
  const order = typeof raw.order === 'number' ? raw.order : 0;
  const image = raw.image;
  const imageUrl = image ? getMediaUrl(image, baseUrl) : null;
  const imageAlt = image ? getMediaAlt(image) ?? null : null;

  return {
    documentId,
    name,
    slug,
    description,
    address,
    email,
    phones,
    website,
    imageUrl,
    imageAlt,
    order,
  };
}

const EMPTY_LIST: InstitutionsListResult = { entries: [] };

/**
 * Fetches all institution entries for the current tenant, sorted by display order.
 */
export async function getInstitutionsData(): Promise<InstitutionsListResult> {
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
  params.set('pagination[pageSize]', '500');

  const url = `${base}/institutions?${params.toString()}`;

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

export function filterInstitutionsByCategory(
  entries: InstitutionEntry[],
  categorySlug: string
): InstitutionEntry[] {
  return entries.filter((entry) => institutionBelongsToCategory(entry.slug, categorySlug));
}

function firstLine(value: string | null): string | null {
  if (!value?.trim()) return null;
  return value.split('\n').map((line) => line.trim()).find(Boolean) ?? null;
}

function firstPhone(phones: string | null): string | null {
  if (!phones?.trim()) return null;
  const part = phones.split(/[,;\n/]+/).map((item) => item.trim()).find(Boolean);
  return part ?? null;
}

/** Builds hub card preview text from Strapi institutions in a category. */
export function buildCategoryCardDescription(
  entries: InstitutionEntry[],
  category: InstitutionHubCategory
): string {
  if (entries.length === 0) {
    return category.fallbackDescription;
  }

  const parts = entries.slice(0, 6).map((entry) => {
    const location = firstLine(entry.address);
    const phone = firstPhone(entry.phones);
    let segment = entry.name;
    if (location && location !== entry.name) {
      segment += ` - ${location}`;
    }
    if (phone) {
      segment += ` Ph: ${phone}`;
    }
    return segment;
  });

  let text = parts.join(', ');
  if (entries.length > parts.length) {
    text += '...';
  }
  if (text.length > 320) {
    return `${text.slice(0, 317)}...`;
  }
  return text || category.fallbackDescription;
}

export function pickCategoryCardImage(
  entries: InstitutionEntry[],
  category: InstitutionHubCategory
): string {
  const withImage = entries.find((entry) => entry.imageUrl);
  return withImage?.imageUrl ?? category.fallbackImage;
}
