/**
 * Server-side data for Holy Synod CMS (Strapi GET /api/holy-synod-members).
 */

import 'server-only';
import {
  getStrapiUrl,
  getStrapiApiBase,
  getStrapiHeaders,
  getStrapiTenantId,
} from '@/lib/strapi';
import { getMediaUrl, getMediaAlt } from '@/app/mosc-redesign/(syro)/directory/lib/strapiMedia';
import type { HolySynodMember, HolySynodMemberType, HolySynodMembersListResult } from './types';

function parseMember(raw: Record<string, unknown>, baseUrl: string): HolySynodMember {
  const documentId = typeof raw.documentId === 'string' ? raw.documentId : '';
  const name = typeof raw.name === 'string' ? raw.name : '';
  const slug = typeof raw.slug === 'string' ? raw.slug : '';
  const memberType = (raw.memberType as HolySynodMemberType) ?? 'metropolitan';
  const excerpt = typeof raw.excerpt === 'string' ? raw.excerpt : null;
  const body = typeof raw.body === 'string' ? raw.body : null;
  const address = typeof raw.address === 'string' ? raw.address : null;
  const email = typeof raw.email === 'string' ? raw.email : null;
  const phones = typeof raw.phones === 'string' ? raw.phones : null;
  const order = typeof raw.order === 'number' ? raw.order : 0;
  const image = raw.image;
  const imageUrl = image ? getMediaUrl(image, baseUrl) : null;
  const imageAlt = image ? getMediaAlt(image) ?? null : null;

  return {
    documentId,
    name,
    slug,
    memberType,
    excerpt,
    body,
    imageUrl,
    imageAlt,
    address,
    email,
    phones,
    order,
  };
}

const EMPTY_LIST: HolySynodMembersListResult = { members: [] };

/**
 * Fetches all Holy Synod members for the current tenant, sorted by display order.
 */
export async function getHolySynodMembersData(): Promise<HolySynodMembersListResult> {
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

  const url = `${base}/holy-synod-members?${params.toString()}`;

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
    const members = list
      .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
      .map((item) => parseMember(item, baseUrl));
    return { members };
  } catch {
    return EMPTY_LIST;
  }
}

/**
 * Fetches a single Holy Synod member by slug. Returns null if not found or on error.
 */
export async function getHolySynodMemberBySlug(slug: string): Promise<HolySynodMember | null> {
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

  const url = `${base}/holy-synod-members?${params.toString()}`;

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
    return parseMember(raw as Record<string, unknown>, baseUrl);
  } catch {
    return null;
  }
}
