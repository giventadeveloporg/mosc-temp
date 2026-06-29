import { getHomepageSaintCarouselEntries } from '@/app/mosc-redesign/(syro)/saints-cms/getSaintEntriesData';
import type { MoscRedesignSaint } from '@/components/mosc-redesign/MoscRedesignSaintsCarousel';
import MoscRedesignHomeClient from './MoscRedesignHomeClient';
import {
  CAROUSEL_SAINT_SLUG_BASES,
  mapSaintEntriesToCarouselSaints,
} from './mapSaintEntriesToCarouselSaints';

export const dynamic = 'force-dynamic';

export default async function MoscRedesignHomePage() {
  let saints: MoscRedesignSaint[] = [];

  try {
    const carouselEntries = await getHomepageSaintCarouselEntries(CAROUSEL_SAINT_SLUG_BASES);
    saints = mapSaintEntriesToCarouselSaints(carouselEntries);
  } catch (error) {
    console.error('[mosc-redesign home] Failed to load saint entries from Strapi:', error);
  }

  return <MoscRedesignHomeClient saints={saints} />;
}
