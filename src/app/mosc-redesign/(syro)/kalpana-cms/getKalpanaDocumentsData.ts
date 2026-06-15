/**
 * Server-side data for Kalpana edition detail (documents list per year).
 */

import 'server-only';
import {
  getStrapiUrl,
  getStrapiApiBase,
  getStrapiHeaders,
  getStrapiTenantId,
} from '@/lib/strapi';
import { getMediaUrl } from '@/app/mosc-redesign/(syro)/directory/lib/strapiMedia';
import type { KalpanaDocument, KalpanaEdition } from './types';
import { getKalpanaCmsData } from './getKalpanaData';

function parseDocument(raw: Record<string, unknown>, baseUrl: string): KalpanaDocument {
  const documentId = typeof raw.documentId === 'string' ? raw.documentId : '';
  const title = typeof raw.title === 'string' ? raw.title : '';
  const slug = typeof raw.slug === 'string' ? raw.slug : '';
  const sourceUrl = typeof raw.sourceUrl === 'string' && raw.sourceUrl.trim() ? raw.sourceUrl.trim() : null;
  const kalpanaNumber =
    typeof raw.kalpanaNumber === 'string' && raw.kalpanaNumber.trim() ? raw.kalpanaNumber.trim() : null;
  const order = typeof raw.order === 'number' ? raw.order : 0;
  const pdf = raw.pdf;
  const pdfUrl = pdf ? getMediaUrl(pdf, baseUrl) : sourceUrl;

  return {
    documentId,
    title,
    slug,
    pdfUrl,
    sourceUrl,
    kalpanaNumber,
    order,
  };
}

export async function getKalpanaEditionBySlug(editionSlug: string): Promise<KalpanaEdition | null> {
  const { editions } = await getKalpanaCmsData();
  return editions.find((e) => e.slug === editionSlug) ?? null;
}

export async function getKalpanaDocumentsByEditionSlug(editionSlug: string): Promise<KalpanaDocument[]> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId || !editionSlug) {
    return [];
  }

  const params = new URLSearchParams();
  params.set('filters[tenant][tenantId][$eq]', tenantId);
  params.set('filters[edition][slug][$eq]', editionSlug);
  params.set('sort', 'order:desc,title:asc');
  params.set('populate[0]', 'pdf');
  params.set('pagination[pageSize]', '500');

  const url = `${base}/kalpana-documents?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: getStrapiHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) {
      return [];
    }
    const json = (await res.json()) as { data?: unknown[] };
    const list = Array.isArray(json?.data) ? json.data : [];
    return list
      .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
      .map((item) => parseDocument(item, baseUrl))
      .filter((doc) => doc.title);
  } catch {
    return [];
  }
}
