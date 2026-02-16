/**
 * Server-side data layer for the News Portal homepage.
 * Fetches from Strapi Content API and returns normalized data for the UI.
 *
 * API reference: documentation/news_portal/strapi/api_reference.md
 */

import { fetchStrapi, getStrapiUrl, getStrapiTenantId } from '@/lib/strapi';
import type { BlocksContent } from '@strapi/blocks-react-renderer';
import type { NewsHomePageData, NewsArticle, FlashNews, FlashNewsItemUI, SidebarPromoBlock, AdSlot } from './types';

/** Strapi 5: Array-style populate; comma-separated populate triggers 400. Include cover so list/detail show images. */
const POPULATE = 'populate[0]=cover&populate[1]=category&populate[2]=author';

/**
 * Extracts media URL from Strapi 4 or Strapi 5 response structure.
 * Handles: populated relation (data.attributes.url), flattened (url, data.url),
 * formats.thumbnail, and relative URLs (prepends Strapi base URL).
 * baseUrl should be Strapi server root (no trailing slash, no /api).
 */
function getMediaUrl(media: unknown, baseUrl: string): string | null {
  if (!media || !baseUrl) return null;
  // Handle array (e.g. multiple media) — use first item
  let m = media as Record<string, unknown>;
  if (Array.isArray(media) && media.length > 0) {
    m = media[0] as Record<string, unknown>;
  }
  let url: string | undefined;
  // Strapi 5 flattened: url at top level
  url = m?.url as string | undefined;
  if (!url) {
    // Strapi 5 with data wrapper: data.url
    const data = m?.data as Record<string, unknown> | undefined;
    url = data?.url as string | undefined;
  }
  if (!url) {
    // Strapi 4 / Strapi 5 populated relation: data.attributes.url (common after imports)
    const data = m?.data as Record<string, unknown> | undefined;
    const attrs = data?.attributes as Record<string, unknown> | undefined;
    url = attrs?.url as string | undefined;
  }
  if (!url && m?.formats) {
    const formats = m.formats as Record<string, { url?: string }>;
    url = formats?.thumbnail?.url ?? formats?.small?.url ?? formats?.medium?.url;
  }
  if (!url || typeof url !== 'string') return null;
  // Relative URLs: prepend base URL; ensure one slash between base and path
  if (url.startsWith('http')) return url;
  const base = baseUrl.replace(/\/$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}

/**
 * Extracts alternativeText/caption from Strapi 4 or 5 media structure.
 * Handles populated relation: data.attributes.alternativeText.
 */
function getMediaAlt(media: unknown): string | undefined {
  if (!media) return undefined;
  let m = media as Record<string, unknown>;
  if (Array.isArray(media) && media.length > 0) m = media[0] as Record<string, unknown>;
  let alt = m?.alternativeText as string | undefined;
  if (!alt) {
    const data = m?.data as Record<string, unknown> | undefined;
    alt = data?.alternativeText as string | undefined;
  }
  if (!alt) {
    const data = m?.data as Record<string, unknown> | undefined;
    const attrs = data?.attributes as Record<string, unknown> | undefined;
    alt = attrs?.alternativeText as string | undefined;
  }
  return alt;
}

/** Builds article query path (relative to Content API base /api).
 * Strapi 5: Use filters[publishedAt][$notNull]=true (status=published can cause validation errors).
 * Only published articles are returned; drafts (publishedAt null) do not appear on the news page.
 */
function buildArticleQuery(filters: string, sort: string, limit: number): string {
  const tenantId = getStrapiTenantId();
  const parts = [
    `filters[tenant][tenantId][$eq]=${encodeURIComponent(tenantId)}`,
    'filters[publishedAt][$notNull]=true',
    POPULATE,
    `sort=${sort}`,
    `pagination[limit]=${limit}`,
  ];
  if (filters) parts.unshift(filters);
  return `/articles?${parts.join('&')}`;
}

function normalizeArticle(raw: { id?: number; documentId?: string; attributes?: Record<string, unknown> }): NewsArticle {
  // Strapi 4: raw.attributes; Strapi 5: raw has fields at top level
  const attrs = (raw?.attributes ?? raw) as Record<string, unknown>;
  const cover = attrs?.cover;
  const category = attrs?.category as { data?: { attributes?: { slug?: string; name?: string } }; documentId?: string; slug?: string; name?: string } | undefined;
  const author = attrs?.author as { data?: { attributes?: { name?: string } }; name?: string } | undefined;
  const baseUrl = getStrapiUrl();
  const coverUrl = getMediaUrl(cover, baseUrl) ?? undefined;
  const coverAlt = getMediaAlt(cover);
  // Category: Strapi 4 data.attributes.slug; Strapi 5 slug at top level
  const categorySlug = category?.data?.attributes?.slug ?? category?.slug;
  const categoryName = category?.data?.attributes?.name ?? category?.name;
  const authorName = author?.data?.attributes?.name ?? author?.name;
  // Strapi "Editorial - Article" uses "description" as Rich Text (Blocks) or legacy string
  const descRaw = attrs?.description;
  const descStr = typeof descRaw === 'string' ? (descRaw as string).trim() : '';
  const descriptionBlocks: BlocksContent | undefined =
    Array.isArray(descRaw) && descRaw.length > 0 ? (descRaw as BlocksContent) : undefined;
  const bodyRaw = attrs?.body;
  const bodyStr = typeof bodyRaw === 'string' ? bodyRaw.trim() : '';
  const excerptStr = typeof attrs?.excerpt === 'string' ? (attrs.excerpt as string).trim() : '';
  return {
    id: (raw?.id ?? attrs?.id ?? 0) as number,
    documentId: raw?.documentId as string | undefined,
    title: (attrs?.title ?? '') as string,
    slug: (attrs?.slug ?? '') as string,
    excerpt: excerptStr || (descStr ? descStr.slice(0, 300) + (descStr.length > 300 ? '…' : '') : undefined),
    description: descriptionBlocks,
    body: bodyStr || descStr || undefined,
    publishedAt: (attrs?.publishedAt ?? undefined) as string | undefined,
    views: (attrs?.views ?? undefined) as number | undefined,
    coverUrl,
    coverAlt,
    categorySlug: categorySlug as string | undefined,
    categoryName: categoryName as string | undefined,
    authorName: authorName as string | undefined,
  };
}

function normalizeHomepage(raw: { attributes?: Record<string, unknown> } | null): FlashNews | null {
  if (!raw) return null;
  const attrs = raw?.attributes ?? raw;
  const active = attrs?.flashNewsActive === true;
  const message = (attrs?.flashNewsMessage ?? '') as string;
  if (!message && !active) return null;
  return { message, active };
}

function normalizeSidebarPromo(raw: { attributes?: Record<string, unknown> } | null): SidebarPromoBlock | null {
  if (!raw) return null;
  const attrs = (raw?.attributes ?? raw) as Record<string, unknown>;
  const blockType = attrs?.blockType as string | undefined;
  const embedCode = attrs?.embedCode as string | null | undefined;
  const videoUrl = attrs?.videoUrl as string | null | undefined;
  const thumbnail = attrs?.thumbnail;
  const baseUrl = getStrapiUrl();
  const thumbnailUrl = getMediaUrl(thumbnail, baseUrl);
  return {
    blockType,
    embedCode: embedCode ?? null,
    videoUrl: videoUrl ?? null,
    thumbnailUrl: thumbnailUrl ?? null,
    title: (attrs?.title ?? null) as string | null,
  };
}

function normalizeAdSlot(raw: { id?: number; documentId?: string; attributes?: Record<string, unknown> }): AdSlot {
  const attrs = (raw?.attributes ?? raw) as Record<string, unknown>;
  const media = attrs?.media;
  const baseUrl = getStrapiUrl();
  const mediaUrl = getMediaUrl(media, baseUrl);
  return {
    id: (raw?.id ?? attrs?.id) as number,
    position: (attrs?.position ?? undefined) as string | undefined,
    embedHtml: (attrs?.embedHtml ?? null) as string | null | undefined,
    mediaUrl: mediaUrl ?? null,
    linkUrl: (attrs?.linkUrl ?? null) as string | null | undefined,
  };
}

/** Raw flash-news-item from Strapi (with optional populated article). */
interface RawFlashNewsItem {
  id?: number;
  documentId?: string;
  attributes?: Record<string, unknown>;
  content?: string;
  title?: string;
  externalUrl?: string | null;
  order?: number;
  startDate?: string | null;
  endDate?: string | null;
  publishedAt?: string | null;
  article?: { slug?: string; id?: number; documentId?: string } | { data?: { attributes?: { slug?: string }; slug?: string } } | null;
}

function normalizeFlashNewsItem(raw: RawFlashNewsItem): FlashNewsItemUI {
  const attrs = (raw?.attributes ?? raw) as Record<string, unknown>;
  const content = (attrs?.content ?? raw?.content ?? '') as string;
  const externalUrl = (attrs?.externalUrl ?? raw?.externalUrl ?? null) as string | null | undefined;
  const article = (attrs?.article ?? raw?.article) as RawFlashNewsItem['article'];
  const slug =
    article && typeof article === 'object'
      ? (article as { slug?: string }).slug ?? (article as { data?: { attributes?: { slug?: string }; slug?: string } })?.data?.attributes?.slug ?? (article as { data?: { slug?: string } })?.data?.slug
      : undefined;
  const link =
    externalUrl && externalUrl.trim()
      ? externalUrl
      : slug
        ? `/syro/news/${encodeURIComponent(slug)}`
        : undefined;
  return {
    id: (raw?.id ?? attrs?.id ?? 0) as number,
    content: content.trim() || (raw?.title ?? attrs?.title ?? '') as string,
    link: link ?? null,
    startDate: (attrs?.startDate ?? raw?.startDate ?? null) as string | null | undefined,
    endDate: (attrs?.endDate ?? raw?.endDate ?? null) as string | null | undefined,
  };
}

function filterFlashNewsByDate(items: FlashNewsItemUI[]): FlashNewsItemUI[] {
  const today = new Date().toISOString().split('T')[0];
  return items.filter((item) => {
    if (item.startDate && item.startDate > today) return false;
    if (item.endDate && item.endDate < today) return false;
    return true;
  });
}

/** Max fetch attempts when Strapi returns errors (e.g. 401, network). No retry when Strapi succeeds with 0 articles. */
const MAX_STRAPI_ATTEMPTS = 5;

/** Delay in ms before retrying after a failed attempt. */
const RETRY_DELAY_MS = 1500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches all data needed for the news homepage. Returns empty sections if Strapi is unavailable or on error.
 * Retries up to MAX_STRAPI_ATTEMPTS times only when Strapi requests fail (401, network, etc.). Does not retry
 * when Strapi succeeds and returns 0 articles (valid empty state).
 */
export async function getNewsHomePageData(): Promise<NewsHomePageData> {
  const empty: NewsHomePageData = {
    flash: null,
    flashNewsItems: [],
    featured: [],
    mainNews: [],
    pressRelease: [],
    mostRead: [],
    sidebarPromo: null,
    adSlots: [],
    topAdSlots: [],
    betweenSectionsAdSlots: [],
  };

  let tenantId: string;
  try {
    tenantId = getStrapiTenantId();
  } catch (e) {
    console.warn('[STRAPI-NEWS] Tenant ID not set (NEXT_PUBLIC_TENANT_ID). Returning empty news data.', e);
    return empty;
  }

  const strapiUrl = getStrapiUrl();
  if (!strapiUrl) {
    console.warn('[STRAPI-NEWS] NEXT_PUBLIC_STRAPI_URL not set. Returning empty news data.');
    return empty;
  }

  const flashNewsPath = `/flash-news-items?filters[tenant][tenantId][$eq]=${encodeURIComponent(tenantId)}&filters[publishedAt][$notNull]=true&sort=order:asc,publishedAt:desc&populate[0]=article&pagination[limit]=20`;
  const adsPath = `/advertisement-slots?filters[$or][0][position][$eq]=sidebar&filters[$or][1][position][$eq]=top&filters[$or][2][position][$eq]=between_sections&filters[tenant][tenantId][$eq]=${encodeURIComponent(tenantId)}&populate=media`;

  let lastResult: NewsHomePageData = empty;
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_STRAPI_ATTEMPTS; attempt++) {
    try {
      console.info(`[STRAPI-NEWS] Fetching news homepage data (tenant: ${tenantId}, Strapi: ${strapiUrl}) attempt ${attempt}/${MAX_STRAPI_ATTEMPTS}`);

      const [
        homepageRes,
        flashRes,
        featuredRes,
        mainRes,
        pressRes,
        mostReadRes,
        sidebarRes,
        adsRes,
      ] = await Promise.all([
        fetchStrapi<{ id?: number; attributes?: Record<string, unknown> }>('/homepage?populate=*'),
        fetchStrapi<unknown[]>(flashNewsPath),
        fetchStrapi<unknown[]>(buildArticleQuery('filters[category][slug][$eqi]=featured-news', 'publishedAt:desc', 6)),
        fetchStrapi<unknown[]>(buildArticleQuery('filters[category][slug][$eqi]=main-news', 'publishedAt:desc', 10)),
        fetchStrapi<unknown[]>(buildArticleQuery('filters[category][slug][$eqi]=press-release', 'publishedAt:desc', 10)),
        fetchStrapi<unknown[]>(buildArticleQuery('', 'views:desc', 5)),
        fetchStrapi<{ id?: number; attributes?: Record<string, unknown> }>('/sidebar-promotional-block?populate=*'),
        fetchStrapi<unknown[]>(adsPath),
      ]);

      const hadError =
        homepageRes == null ||
        flashRes == null ||
        featuredRes == null ||
        mainRes == null ||
        pressRes == null ||
        mostReadRes == null ||
        sidebarRes == null ||
        adsRes == null;

      const flashList = Array.isArray(flashRes?.data) ? flashRes.data : [];
      const featuredList = Array.isArray(featuredRes?.data) ? featuredRes.data : [];
      const mainList = Array.isArray(mainRes?.data) ? mainRes.data : [];
      const pressList = Array.isArray(pressRes?.data) ? pressRes.data : [];
      const mostReadList = Array.isArray(mostReadRes?.data) ? mostReadRes.data : [];
      const adsList = Array.isArray(adsRes?.data) ? adsRes.data : [];

      const allFlashItems = (flashList ?? [])
        .map((f) => normalizeFlashNewsItem(f as RawFlashNewsItem))
        .filter((f) => f.content && f.content.length > 0);
      const flashNewsItems = filterFlashNewsByDate(allFlashItems);

      const allAds = (adsList ?? []).map((a) => normalizeAdSlot(a as { id?: number; attributes?: Record<string, unknown> }));
      const sidebarSlots = allAds.filter((a) => (a.position ?? '').toLowerCase() === 'sidebar');
      const topSlots = allAds.filter((a) => (a.position ?? '').toLowerCase() === 'top');
      const betweenSectionsSlots = allAds.filter((a) => (a.position ?? '').toLowerCase().replace(/-/g, '_') === 'between_sections');

      const result: NewsHomePageData = {
        flash: normalizeHomepage(homepageRes?.data ?? null),
        flashNewsItems,
        featured: (featuredList ?? []).map((a) => normalizeArticle(a as { id?: number; documentId?: string; attributes?: Record<string, unknown> })),
        mainNews: (mainList ?? []).map((a) => normalizeArticle(a as { id?: number; documentId?: string; attributes?: Record<string, unknown> })),
        pressRelease: (pressList ?? []).map((a) => normalizeArticle(a as { id?: number; documentId?: string; attributes?: Record<string, unknown> })),
        mostRead: (mostReadList ?? []).map((a) => normalizeArticle(a as { id?: number; documentId?: string; attributes?: Record<string, unknown> })),
        sidebarPromo: normalizeSidebarPromo(sidebarRes?.data ?? null),
        adSlots: sidebarSlots,
        topAdSlots: topSlots,
        betweenSectionsAdSlots: betweenSectionsSlots,
      };

      const totalArticles = result.featured.length + result.mainNews.length + result.pressRelease.length + result.mostRead.length;
      console.info(`[STRAPI-NEWS] Homepage data loaded: ${totalArticles} articles, flash=${!!result.flash?.active}, flashItems=${result.flashNewsItems.length}, sidebar=${!!result.sidebarPromo}, sidebarAds=${result.adSlots.length}, topAds=${result.topAdSlots.length}, betweenSectionsAds=${result.betweenSectionsAdSlots.length}`);
      if (totalArticles === 0 && !hadError) {
        console.info('[STRAPI-NEWS] Tip: Only published articles are shown. If you see 0 articles, ensure entries are Published (not Draft) in Strapi and have the correct category and tenant.');
      }

      if (!hadError) {
        return result;
      }

      lastResult = result;
      if (attempt < MAX_STRAPI_ATTEMPTS) {
        console.warn(`[STRAPI-NEWS] Some Strapi requests failed (attempt ${attempt}/${MAX_STRAPI_ATTEMPTS}). Retrying in ${RETRY_DELAY_MS}ms.`);
        await sleep(RETRY_DELAY_MS);
      }
    } catch (e) {
      lastError = e;
      console.warn(`[STRAPI-NEWS] getNewsHomePageData attempt ${attempt}/${MAX_STRAPI_ATTEMPTS} failed:`, e);
      if (attempt < MAX_STRAPI_ATTEMPTS) {
        console.warn(`[STRAPI-NEWS] Retrying in ${RETRY_DELAY_MS}ms.`);
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  if (lastError) {
    console.warn('[STRAPI-NEWS] All attempts failed. Returning empty news data.', lastError);
    return empty;
  }
  console.warn(`[STRAPI-NEWS] All ${MAX_STRAPI_ATTEMPTS} attempts had partial/failed Strapi responses. Returning last result.`);
  return lastResult;
}

/** Result for shared news layout (header + flash) on index and article detail pages. */
export interface FlashNewsForPage {
  flashNewsItems: FlashNewsItemUI[];
  flash: FlashNews | null;
}

/**
 * Fetches only flash news (carousel items + legacy homepage flash) for use on news index and article detail pages.
 * Lighter than getNewsHomePageData when only header + flash bar are needed.
 */
export async function getFlashNewsForNewsPages(): Promise<FlashNewsForPage> {
  const empty: FlashNewsForPage = { flashNewsItems: [], flash: null };
  let tenantId: string;
  try {
    tenantId = getStrapiTenantId();
  } catch {
    return empty;
  }
  if (!getStrapiUrl()) return empty;
  try {
    const flashNewsPath = `/flash-news-items?filters[tenant][tenantId][$eq]=${encodeURIComponent(tenantId)}&filters[publishedAt][$notNull]=true&sort=order:asc,publishedAt:desc&populate[0]=article&pagination[limit]=20`;
    const [homepageRes, flashRes] = await Promise.all([
      fetchStrapi<{ id?: number; attributes?: Record<string, unknown> }>('/homepage?populate=*'),
      fetchStrapi<unknown[]>(flashNewsPath),
    ]);
    const flashList = Array.isArray(flashRes?.data) ? flashRes.data : [];
    const allFlashItems = (flashList ?? [])
      .map((f) => normalizeFlashNewsItem(f as RawFlashNewsItem))
      .filter((f) => f.content && f.content.length > 0);
    const flashNewsItems = filterFlashNewsByDate(allFlashItems);
    return {
      flashNewsItems,
      flash: normalizeHomepage(homepageRes?.data ?? null),
    };
  } catch (e) {
    console.warn('[STRAPI-NEWS] getFlashNewsForNewsPages failed:', e);
    return empty;
  }
}

/**
 * Fetches a single article by slug or id for the detail page. Returns null if not found or Strapi unavailable.
 * Supports: text slug, numeric id (legacy), or documentId (Strapi 5).
 * Replicates legacy index.html: article links use slug or id in the URL.
 */
export async function getArticleBySlug(slugOrId: string): Promise<NewsArticle | null> {
  if (!getStrapiUrl() || !slugOrId?.trim()) return null;
  let tenantId: string;
  try {
    tenantId = getStrapiTenantId();
  } catch {
    return null;
  }
  const base = `filters[tenant][tenantId][$eq]=${encodeURIComponent(tenantId)}&filters[publishedAt][$notNull]=true&${POPULATE}`;
  try {
    // 1. Try slug (text) — use $eqi for case-insensitive match
    let path = `/articles?filters[slug][$eqi]=${encodeURIComponent(slugOrId.trim())}&${base}`;
    let res = await fetchStrapi<unknown[]>(path);
    let list = Array.isArray(res?.data) ? res.data : [];
    let first = list[0] as { id?: number; documentId?: string; attributes?: Record<string, unknown> } | undefined;

    // 2. If not found and param looks numeric, try by id (Strapi v4 or when id is used)
    if (!first && /^\d+$/.test(slugOrId.trim())) {
      const id = parseInt(slugOrId.trim(), 10);
      path = `/articles?filters[id][$eq]=${id}&${base}`;
      res = await fetchStrapi<unknown[]>(path);
      list = Array.isArray(res?.data) ? res.data : [];
      first = list[0] as { id?: number; documentId?: string; attributes?: Record<string, unknown> } | undefined;
    }

    // 3. If not found, try documentId (Strapi 5 identifier, typically alphanumeric)
    if (!first && slugOrId.trim().length > 10) {
      path = `/articles?filters[documentId][$eq]=${encodeURIComponent(slugOrId.trim())}&${base}`;
      res = await fetchStrapi<unknown[]>(path);
      list = Array.isArray(res?.data) ? res.data : [];
      first = list[0] as { id?: number; documentId?: string; attributes?: Record<string, unknown> } | undefined;
    }

    if (!first) return null;
    return normalizeArticle(first);
  } catch {
    return null;
  }
}

/**
 * Fetches recent articles (by publishedAt desc) for sidebar "Recent Posts".
 */
export async function getRecentArticles(limit: number = 5): Promise<NewsArticle[]> {
  if (!getStrapiUrl()) return [];
  try {
    const tenantId = getStrapiTenantId();
    const path = `/articles?filters[tenant][tenantId][$eq]=${encodeURIComponent(tenantId)}&filters[publishedAt][$notNull]=true&${POPULATE}&sort=publishedAt:desc&pagination[limit]=${limit}`;
    const res = await fetchStrapi<unknown[]>(path);
    const list = Array.isArray(res?.data) ? res.data : [];
    return list.map((raw) => normalizeArticle(raw as { id?: number; documentId?: string; attributes?: Record<string, unknown> }));
  } catch {
    return [];
  }
}

/**
 * Fetches the article published immediately before the given date (for "Previous Post" link).
 */
export async function getPreviousArticle(beforePublishedAt: string): Promise<NewsArticle | null> {
  if (!getStrapiUrl() || !beforePublishedAt) return null;
  try {
    const tenantId = getStrapiTenantId();
    const path = `/articles?filters[tenant][tenantId][$eq]=${encodeURIComponent(tenantId)}&filters[publishedAt][$notNull]=true&filters[publishedAt][$lt]=${encodeURIComponent(beforePublishedAt)}&${POPULATE}&sort=publishedAt:desc&pagination[limit]=1`;
    const res = await fetchStrapi<unknown[]>(path);
    const list = Array.isArray(res?.data) ? res.data : [];
    const first = list[0] as { id?: number; documentId?: string; attributes?: Record<string, unknown> } | undefined;
    return first ? normalizeArticle(first) : null;
  } catch {
    return null;
  }
}
