/**
 * Server-side data for Managing Committee Members roster
 * (Strapi GET /api/managing-committee-members).
 */

import 'server-only';
import { unstable_noStore as noStore } from 'next/cache';
import { getStrapiUrl, getStrapiApiBase, getStrapiHeaders, getStrapiTenantId } from '@/lib/strapi';
import { unwrapStrapiRecord } from '@/lib/strapi/unwrapRecord';
import { getMediaUrl, getMediaAlt } from '@/app/mosc-redesign/(syro)/directory/lib/strapiMedia';
import {
  EMPTY_DIRECTORY_PAGINATION,
  DIRECTORY_PAGE_SIZE,
  type DirectoryListPagination,
} from '@/app/mosc-redesign/(syro)/directory/types/listPagination';
import type {
  ManagingCommitteeMember,
  ManagingCommitteeMembersListResult,
  ManagingCommitteeMembersListOptions,
} from './types';

const STRAPI_LIST_FETCH: RequestInit = {
  cache: 'no-store',
  next: { revalidate: 0 },
};

const LOAD_ALL_PAGE_SIZE = 100;
const DEFAULT_TERM_YEAR = 2026;

/** Strip mobile/telephone lines and inline phone labels from address-like text. */
function stripPhoneNumbers(text: string | null | undefined): string | null {
  if (!text || typeof text !== 'string') return null;
  const cleaned = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter(
      (line) =>
        !/^(mob|mobile|ph|tel|telephone|cell|fax|land\s*line)\s*[:.]/i.test(line) &&
        !/\b(mob|mobile|ph|tel|telephone|cell|fax)\s*[:.]\s*[+\d]/i.test(line)
    )
    .map((line) =>
      line
        .replace(/\b(mob|mobile|ph|tel|telephone|cell|fax|land\s*line)\s*[:.]\s*[+\d][\d\s\-/,.]*/gi, '')
        .replace(/(?:^|[\s,;])(?:\+?\d[\d\s\-()]{7,}\d)/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim()
    )
    .filter(Boolean)
    .join('\n')
    .trim();
  return cleaned || null;
}

function parseMember(raw: Record<string, unknown>, baseUrl: string): ManagingCommitteeMember {
  const item = unwrapStrapiRecord(raw);
  const documentId = typeof item.documentId === 'string' ? item.documentId : '';
  const name = typeof item.name === 'string' ? item.name : '';
  const slug = typeof item.slug === 'string' ? item.slug : '';
  const role = typeof item.role === 'string' ? item.role : null;
  const diocese = typeof item.diocese === 'string' ? item.diocese : null;
  const parish = typeof item.parish === 'string' ? item.parish : null;
  const addressRaw = typeof item.address === 'string' ? item.address : null;
  const electedRegion =
    typeof item.electedRegion === 'string' && item.electedRegion.trim()
      ? item.electedRegion.trim()
      : null;
  const serialNumber = typeof item.serialNumber === 'number' ? item.serialNumber : null;
  const order = typeof item.order === 'number' ? item.order : 0;
  const isCurrent = item.isCurrent !== false;
  const termYear = typeof item.termYear === 'number' ? item.termYear : null;
  const notes = typeof item.notes === 'string' ? item.notes : null;
  const photo = item.photo;
  const photoUrl = photo ? getMediaUrl(photo, baseUrl) : null;
  const photoAlt = photo ? getMediaAlt(photo) ?? null : null;

  return {
    documentId,
    name,
    slug,
    role,
    diocese,
    parish,
    address: stripPhoneNumbers(addressRaw),
    electedRegion,
    serialNumber,
    order,
    isCurrent,
    termYear,
    notes,
    photoUrl,
    photoAlt,
  };
}

function parsePagination(
  meta: { page?: number; pageCount?: number; pageSize?: number; total?: number } | undefined,
  page: number,
  pageSize: number
): DirectoryListPagination {
  return {
    page: meta?.page ?? page,
    pageCount: meta?.pageCount ?? 0,
    pageSize: meta?.pageSize ?? pageSize,
    total: meta?.total ?? 0,
  };
}

const EMPTY_LIST: ManagingCommitteeMembersListResult = {
  members: [],
  pagination: EMPTY_DIRECTORY_PAGINATION,
};

function buildBaseParams(
  tenantId: string,
  options?: ManagingCommitteeMembersListOptions
): URLSearchParams {
  const params = new URLSearchParams();
  params.set('filters[tenant][tenantId][$eq]', tenantId);
  const termYear = options?.termYear ?? DEFAULT_TERM_YEAR;
  params.set('filters[termYear][$eq]', String(termYear));
  if (options?.isCurrent !== false) {
    params.set('filters[isCurrent][$eq]', 'true');
  }
  const nameQuery = options?.nameSearch?.trim();
  if (nameQuery) {
    params.set('filters[name][$containsi]', nameQuery);
  }
  params.set('sort', 'order:asc,name:asc');
  params.set('populate[0]', 'photo');
  return params;
}

export async function getManagingCommitteeMembersData(
  options?: ManagingCommitteeMembersListOptions
): Promise<ManagingCommitteeMembersListResult> {
  noStore();
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId) {
    return EMPTY_LIST;
  }

  const loadAll =
    options?.loadAll === true ||
    options == null ||
    (options.page == null && options.pageSize == null && !options.nameSearch?.trim());

  try {
    if (!loadAll) {
      const page = Math.max(1, options?.page ?? 1);
      const pageSize = Math.min(100, Math.max(1, options?.pageSize ?? DIRECTORY_PAGE_SIZE));
      const params = buildBaseParams(tenantId, options);
      params.set('pagination[page]', String(page));
      params.set('pagination[pageSize]', String(pageSize));

      const res = await fetch(`${base}/managing-committee-members?${params.toString()}`, {
        headers: getStrapiHeaders(),
        ...STRAPI_LIST_FETCH,
      });
      if (!res.ok) {
        return EMPTY_LIST;
      }
      const json = (await res.json()) as {
        data?: unknown[];
        meta?: {
          pagination?: {
            page?: number;
            pageCount?: number;
            pageSize?: number;
            total?: number;
          };
        };
      };
      const list = Array.isArray(json?.data) ? json.data : [];
      const members = list
        .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
        .map((item) => parseMember(item, baseUrl));
      return {
        members,
        pagination: parsePagination(json?.meta?.pagination, page, pageSize),
      };
    }

    const allMembers: ManagingCommitteeMember[] = [];
    let page = 1;
    let pageCount = 1;
    let total = 0;

    while (page <= pageCount) {
      const params = buildBaseParams(tenantId, options);
      params.set('pagination[page]', String(page));
      params.set('pagination[pageSize]', String(LOAD_ALL_PAGE_SIZE));

      const res = await fetch(`${base}/managing-committee-members?${params.toString()}`, {
        headers: getStrapiHeaders(),
        ...STRAPI_LIST_FETCH,
      });
      if (!res.ok) {
        return EMPTY_LIST;
      }
      const json = (await res.json()) as {
        data?: unknown[];
        meta?: {
          pagination?: {
            page?: number;
            pageCount?: number;
            pageSize?: number;
            total?: number;
          };
        };
      };
      const list = Array.isArray(json?.data) ? json.data : [];
      allMembers.push(
        ...list
          .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
          .map((item) => parseMember(item, baseUrl))
      );
      const meta = json?.meta?.pagination;
      pageCount = meta?.pageCount ?? 1;
      total = meta?.total ?? allMembers.length;
      page += 1;
      if (list.length === 0) break;
    }

    return {
      members: allMembers,
      pagination: {
        page: 1,
        pageCount: 1,
        pageSize: allMembers.length || DIRECTORY_PAGE_SIZE,
        total: total || allMembers.length,
      },
    };
  } catch {
    return EMPTY_LIST;
  }
}
