import type { MoscRedesignSaint } from '@/components/mosc-redesign/MoscRedesignSaintsCarousel';
import type { SaintEntry } from '@/app/mosc-redesign/(syro)/saints-cms/types';

const PLACEHOLDER_IMAGE = '/images/saints/st-mary-mother-of-god.jpg';

/** Slug bases for the four homepage carousel saints (order preserved). */
export const CAROUSEL_SAINT_SLUG_BASES = [
  'st-baselios-yeldho-kothamangalam-bava',
  'st-geevarghese-mar-dionysius-vattasseril',
  'st-gregorios-of-parumala-metropolitan-geevarghese-mar-gregorios',
  'st-mary-mother-of-god',
] as const;

export function pickHomepageCarouselSaintEntries(entries: SaintEntry[]): SaintEntry[] {
  return CAROUSEL_SAINT_SLUG_BASES.map((base) => {
    const candidates = entries.filter((entry) => entry.slug.replace(/-mo2$/, '') === base);
    if (candidates.length === 0) return null;
    return candidates.sort((a, b) => {
      const aMo2 = a.slug.endsWith('-mo2') ? 1 : 0;
      const bMo2 = b.slug.endsWith('-mo2') ? 1 : 0;
      if (aMo2 !== bMo2) return aMo2 - bMo2;
      return b.name.length - a.name.length;
    })[0];
  }).filter((entry): entry is SaintEntry => entry != null);
}

export function mapSaintEntriesToCarouselSaints(entries: SaintEntry[]): MoscRedesignSaint[] {
  return entries.map((entry) => {
    const baseSlug = entry.slug.replace(/-mo2$/, '');
    const isBaselios = baseSlug === 'st-baselios-yeldho-kothamangalam-bava';

    return {
      name: entry.name,
      href: entry.slug ? `/mosc-redesign/saints-cms/${entry.slug}` : '/mosc-redesign/saints-cms',
      image: entry.imageUrl ?? PLACEHOLDER_IMAGE,
      alt: entry.imageAlt ?? entry.name,
      ...(isBaselios ? { imageClassName: 'scale-y-90 origin-top' as const } : {}),
    };
  });
}
