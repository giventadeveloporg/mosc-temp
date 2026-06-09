export interface CatholicateEntry {
  documentId: string;
  name: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  body: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  order: number;
}

export interface CatholicateEntriesListResult {
  entries: CatholicateEntry[];
}

/** Slugs reserved for hub intro content (excluded from the card grid). */
export const CATHOLICATE_INTRO_SLUGS = new Set([
  'catholicate-intro',
  'catholicate',
  'introduction',
  'the-catholicate-introduction',
]);

export function isCatholicateIntroEntry(entry: CatholicateEntry): boolean {
  return CATHOLICATE_INTRO_SLUGS.has(entry.slug);
}
