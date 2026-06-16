/**
 * Server-side data for Training CMS (Strapi GET /api/training-programs).
 */

import 'server-only';
import {
  getStrapiUrl,
  getStrapiApiBase,
  getStrapiHeaders,
  getStrapiTenantId,
} from '@/lib/strapi';
import { getMediaUrl, getMediaAlt } from '@/app/mosc-redesign/(syro)/directory/lib/strapiMedia';
import type { TrainingProgramEntry, TrainingProgramsListResult } from './types';

const DEFAULT_IMAGE_BY_SLUG: Record<string, string> = {
  'sruti-school-of-liturgical-music': '/images/training/sruti.jpg',
  divyabodhanam: '/images/training/dvm.jpg',
  'st-basil-bible-school': '/images/training/bs.jpg',
};

const DEFAULT_PROGRAMS: TrainingProgramEntry[] = [
  {
    documentId: 'sruti',
    name: 'Sruti School of Liturgical Music',
    slug: 'sruti-school-of-liturgical-music',
    excerpt:
      'The Sruti School of Liturgical Music is the realization of a long-cherished desire of the Orthodox Theological Seminary to effect a systematised and organised form to the music and hymnody...',
    body: null,
    address: null,
    email: null,
    phones: null,
    website: null,
    imageUrl: DEFAULT_IMAGE_BY_SLUG['sruti-school-of-liturgical-music'],
    imageAlt: 'Sruti School of Liturgical Music',
    order: 0,
  },
  {
    documentId: 'divyabodhanam',
    name: 'Divyabodhanam (Theological Education Programme for the Laity)',
    slug: 'divyabodhanam',
    excerpt:
      'A novel step in the field of theological studies of Malankara Orthodox Syrian Church was officially inaugurated in 1984 July 28 as a laymen training course of the church. The...',
    body: null,
    address: null,
    email: null,
    phones: null,
    website: null,
    imageUrl: DEFAULT_IMAGE_BY_SLUG.divyabodhanam,
    imageAlt: 'Divyabodhanam',
    order: 1,
  },
  {
    documentId: 'st-basil',
    name: 'St. Basil Bible School',
    slug: 'st-basil-bible-school',
    excerpt:
      'St. Basil Bible School and Orientation Center - The origin of the St. Basil Bible School is attributed to the vision and efforts of H. H. Baselios Marthoma Mathews II. It began with...',
    body: null,
    address: null,
    email: null,
    phones: null,
    website: null,
    imageUrl: DEFAULT_IMAGE_BY_SLUG['st-basil-bible-school'],
    imageAlt: 'St. Basil Bible School',
    order: 2,
  },
];

function parseEntry(raw: Record<string, unknown>, baseUrl: string): TrainingProgramEntry {
  const documentId = typeof raw.documentId === 'string' ? raw.documentId : '';
  const name = typeof raw.name === 'string' ? raw.name : '';
  const slug = typeof raw.slug === 'string' ? raw.slug : '';
  const excerpt = typeof raw.excerpt === 'string' ? raw.excerpt : null;
  const body = typeof raw.body === 'string' ? raw.body : null;
  const address = typeof raw.address === 'string' ? raw.address : null;
  const email = typeof raw.email === 'string' ? raw.email : null;
  const phones = typeof raw.phones === 'string' ? raw.phones : null;
  const website = typeof raw.website === 'string' ? raw.website : null;
  const order = typeof raw.order === 'number' ? raw.order : 0;
  const image = raw.image;
  const imageUrl = image ? getMediaUrl(image, baseUrl) : DEFAULT_IMAGE_BY_SLUG[slug] ?? null;
  const imageAlt = image ? getMediaAlt(image) ?? null : name || null;

  return {
    documentId,
    name,
    slug,
    excerpt,
    body,
    address,
    email,
    phones,
    website,
    imageUrl,
    imageAlt,
    order,
  };
}


export async function getTrainingProgramsData(): Promise<TrainingProgramsListResult> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId) {
    return { entries: DEFAULT_PROGRAMS };
  }

  const params = new URLSearchParams();
  params.set('filters[tenant][tenantId][$eq]', tenantId);
  params.set('sort', 'order:asc,name:asc');
  params.set('populate[0]', 'image');
  params.set('pagination[pageSize]', '100');

  const url = `${base}/training-programs?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: getStrapiHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) {
      return { entries: DEFAULT_PROGRAMS };
    }
    const json = (await res.json()) as { data?: unknown[] };
    const list = Array.isArray(json?.data) ? json.data : [];
    const entries = list
      .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
      .map((item) => parseEntry(item, baseUrl));
    return { entries: entries.length > 0 ? entries : DEFAULT_PROGRAMS };
  } catch {
    return { entries: DEFAULT_PROGRAMS };
  }
}

export async function getTrainingProgramBySlug(slug: string): Promise<TrainingProgramEntry | null> {
  const baseUrl = getStrapiUrl();
  const base = getStrapiApiBase();
  const tenantId = getStrapiTenantId();
  if (!baseUrl || !base || !tenantId || !slug) {
    return DEFAULT_PROGRAMS.find((p) => p.slug === slug) ?? null;
  }

  const params = new URLSearchParams();
  params.set('filters[tenant][tenantId][$eq]', tenantId);
  params.set('filters[slug][$eq]', slug);
  params.set('populate[0]', 'image');
  params.set('pagination[pageSize]', '1');

  const url = `${base}/training-programs?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: getStrapiHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) {
      return DEFAULT_PROGRAMS.find((p) => p.slug === slug) ?? null;
    }
    const json = (await res.json()) as { data?: unknown[] };
    const list = Array.isArray(json?.data) ? json.data : [];
    const raw = list[0];
    if (!raw || typeof raw !== 'object') {
      return DEFAULT_PROGRAMS.find((p) => p.slug === slug) ?? null;
    }
    return parseEntry(raw as Record<string, unknown>, baseUrl);
  } catch {
    return DEFAULT_PROGRAMS.find((p) => p.slug === slug) ?? null;
  }
}

export { DEFAULT_IMAGE_BY_SLUG };
