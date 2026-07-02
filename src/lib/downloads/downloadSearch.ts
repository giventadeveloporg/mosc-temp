/**
 * Search matching for downloads library explorer.
 */
import { formatDownloadCardTitle, getDownloadCardSubtitle } from './formatDownloadCardTitle';

export type DownloadSearchItem = {
  title: string;
  fileName: string;
  treePath?: string;
  pathSegments: string[];
  categoryLabel?: string | null;
  description?: string | null;
  officialDocumentYear?: number | null;
};

const DOWNLOAD_YEAR_TOKEN_RE = /\b(19|20)\d{2}\b/g;

function isValidDownloadYear(year: number): boolean {
  return Number.isFinite(year) && year >= 1900 && year <= 2100;
}

/** Meta line under the card thumbnail (category · document year, without the word "Year"). */
export function buildDownloadCardMetaLine(item: DownloadSearchItem): string {
  return [item.categoryLabel, item.officialDocumentYear ? String(item.officialDocumentYear) : null]
    .filter(Boolean)
    .join(' · ');
}

/** Collect years from the stored year field and from title / tagline / path text. */
export function extractDownloadItemYears(item: DownloadSearchItem): number[] {
  const years = new Set<number>();
  if (item.officialDocumentYear != null && isValidDownloadYear(item.officialDocumentYear)) {
    years.add(item.officialDocumentYear);
  }

  const rawText = [
    item.title,
    item.fileName,
    item.treePath,
    ...item.pathSegments,
    item.categoryLabel ?? '',
    item.description ?? '',
    getDownloadCardSubtitle({
      pathSegments: item.pathSegments,
      fileName: item.fileName,
      title: item.title,
      categoryLabel: item.categoryLabel,
    }),
    resolveDownloadCardDisplayTitle(item),
  ].join(' ');

  for (const match of rawText.matchAll(DOWNLOAD_YEAR_TOKEN_RE)) {
    const year = Number(match[0]);
    if (isValidDownloadYear(year)) {
      years.add(year);
    }
  }

  return [...years];
}

/** Year chip filter: match stored year or any year token in title / tagline / paths. */
export function matchesDownloadYearFilter(item: DownloadSearchItem, year: number): boolean {
  if (!isValidDownloadYear(year)) {
    return false;
  }
  if (item.officialDocumentYear === year) {
    return true;
  }
  return extractDownloadItemYears(item).includes(year);
}

/** Primary sort year: highest year found on the card (stored field or title/tagline/path). */
export function getDownloadItemPrimarySortYear(item: DownloadSearchItem): number {
  const years = extractDownloadItemYears(item);
  return years.length > 0 ? Math.max(...years) : 0;
}

/** Newest year first; within the same year, lower priority value then title A–Z. */
export function compareDownloadsNewestFirst(
  a: DownloadSearchItem & { priorityRanking?: number | null },
  b: DownloadSearchItem & { priorityRanking?: number | null }
): number {
  const yearA = getDownloadItemPrimarySortYear(a);
  const yearB = getDownloadItemPrimarySortYear(b);
  if (yearA !== yearB) {
    return yearB - yearA;
  }

  const pa = a.priorityRanking ?? 999999;
  const pb = b.priorityRanking ?? 999999;
  if (pa !== pb) {
    return pa - pb;
  }

  const titleA = a.title?.trim() || a.fileName;
  const titleB = b.title?.trim() || b.fileName;
  return titleA.localeCompare(titleB, undefined, { sensitivity: 'base' });
}

export function normalizeDownloadSearchText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[·•|/\\_,\-–—]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildDownloadSearchHaystack(item: DownloadSearchItem): string {
  const formattedTitle = formatDownloadCardTitle(item.title?.trim() || item.fileName);
  const subtitle = getDownloadCardSubtitle({
    pathSegments: item.pathSegments,
    fileName: item.fileName,
    title: item.title,
    categoryLabel: item.categoryLabel,
  });
  const displayTitle = resolveDownloadCardDisplayTitle(item);
  const metaLine = buildDownloadCardMetaLine(item);

  return normalizeDownloadSearchText(
    [
      item.title,
      formattedTitle,
      displayTitle,
      item.fileName,
      item.treePath,
      ...item.pathSegments,
      subtitle,
      item.description ?? '',
      item.categoryLabel ?? '',
      metaLine,
      item.officialDocumentYear ? String(item.officialDocumentYear) : '',
    ].join(' ')
  );
}

export function matchesDownloadSearchQuery(item: DownloadSearchItem, query: string): boolean {
  const haystack = buildDownloadSearchHaystack(item);
  const q = normalizeDownloadSearchText(query);
  if (!q) return true;
  if (haystack.includes(q)) return true;

  const tokens = q.split(' ').filter((token) => token.length >= 2 || /^\d{4}$/.test(token));
  if (tokens.length === 0) {
    return haystack.includes(q);
  }
  return tokens.every((token) => haystack.includes(token));
}

/**
 * Prefer leaf hierarchy segment when stored title duplicates the category label.
 */
export function resolveDownloadCardDisplayTitle(item: DownloadSearchItem): string {
  const leafSegment =
    item.pathSegments.length > 0
      ? formatDownloadCardTitle(item.pathSegments[item.pathSegments.length - 1])
      : '';
  const fromTitle = item.title?.trim();
  const category = item.categoryLabel?.trim();

  if (
    fromTitle &&
    category &&
    fromTitle.toLowerCase() === category.toLowerCase() &&
    leafSegment
  ) {
    return leafSegment;
  }

  if (fromTitle && category && fromTitle.toLowerCase().includes('malankara association') && leafSegment) {
    const formattedLeaf = leafSegment.toLowerCase();
    const formattedTitle = formatDownloadCardTitle(fromTitle).toLowerCase();
    if (formattedTitle === category.toLowerCase() || formattedTitle.startsWith('malankara association')) {
      return leafSegment;
    }
    if (!formattedTitle.includes(formattedLeaf) && formattedLeaf.length > 2) {
      return leafSegment;
    }
  }

  return formatDownloadCardTitle(fromTitle || item.fileName);
}
