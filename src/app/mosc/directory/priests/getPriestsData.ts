/**
 * Server-side data for Directory Priests (Strapi GET /api/priests).
 * API reference: documentation/parish_directory_portal/directory_api_reference.md §7
 */

import 'server-only';
import { getStrapiUrl, getStrapiApiBase, getStrapiHeaders, getStrapiTenantId } from '@/lib/strapi';
import { getMediaUrl, getMediaAlt } from '../lib/strapiMedia';
import type { Priest, PriestsListResult, StrapiPagination } from './types';

function parsePriest(raw: Record<string, unknown>, baseUrl: string): Priest {
  const documentId = typeof raw.documentId === 'string' ? raw.documentId : '';
  const name = typeof raw.name === 'string' ? raw.name : '';
  const slug = typeof raw.slug === 'string' ? raw.slug : '';
  const title = typeof raw.title === 'string' ? raw.title : null;
  const address = typeof raw.address === 'string' ? raw.address : null;
  const email = typeof raw.email === 'string' ? raw.email : null;
  const phones = typeof raw.phones === 'string' ? raw.phones : null;
  const image = raw.image;
  const imageUrl = image ? getMediaUrl(image, baseUrl) : null;
  const imageAlt = image ? getMediaAlt(image) ?? null : null;
  let dioceseName: string | null = null;
  let parishName: string | null = null;
  const diocese = raw.diocese as Record<string, unknown> | undefined;
  if (diocese && typeof diocese.name === 'string') dioceseName = diocese.name;
  const parish = raw.parish as Record<string, unknown> | undefined;
  if (parish && typeof parish.name === 'string') parishName = parish.name;
  return {
    documentId,
    name,
    slug,
    title,
    dioceseName,
    parishName,
    address,
    email,
    phones,
    imageUrl,
    imageAlt,
  };
}

const DEFAULT_PAGINATION: StrapiPagination = {
  page: 1,
  pageCount: 0,
  pageSize: 10,
  total: 0,
};

export async function getPriestsData(options: {
  nameSearch?: string;
  page?: number;
  pageSize?: number;
}): Promise<PriestsListResult> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId) return { priests: [], pagination: DEFAULT_PAGINATION };

  const params = new URLSearchParams();
  params.set('filters[tenant][tenantId][$eq]', tenantId);
  const nameQuery = options.nameSearch?.trim();
  if (nameQuery) params.set('filters[name][$containsi]', nameQuery);
  params.set('sort', 'name:asc');
  params.set('populate[0]', 'diocese');
  params.set('populate[1]', 'parish');
  params.set('populate[2]', 'image');
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 20));
  params.set('pagination[page]', String(page));
  params.set('pagination[pageSize]', String(pageSize));

  try {
    const res = await fetch(`${base}/priests?${params.toString()}`, {
      headers: getStrapiHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return { priests: [], pagination: DEFAULT_PAGINATION };
    const json = (await res.json()) as {
      data?: unknown[];
      meta?: { pagination?: { page?: number; pageCount?: number; pageSize?: number; total?: number } };
    };
    const list = Array.isArray(json?.data) ? json.data : [];
    const meta = json?.meta?.pagination;
    const pagination: StrapiPagination = {
      page: meta?.page ?? page,
      pageCount: meta?.pageCount ?? 0,
      pageSize: meta?.pageSize ?? pageSize,
      total: meta?.total ?? 0,
    };
    const priests = list
      .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
      .map((item) => parsePriest(item, baseUrl));
    return { priests, pagination };
  } catch {
    return { priests: [], pagination: DEFAULT_PAGINATION };
  }
}

export async function getPriestByDocumentId(documentId: string): Promise<Priest | null> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  if (!baseUrl || !base || !documentId) return null;
  try {
    const res = await fetch(`${base}/priests/${documentId}?populate[0]=diocese&populate[1]=parish&populate[2]=image`, {
      headers: getStrapiHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: Record<string, unknown> };
    const raw = json?.data;
    if (!raw || typeof raw !== 'object') return null;
    return parsePriest(raw, baseUrl);
  } catch {
    return null;
  }
}
