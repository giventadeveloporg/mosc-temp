/**
 * Types for News Portal (Strapi-backed) used by the MOSC news homepage and article detail.
 */

export interface NewsArticle {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: string;
  publishedAt?: string;
  views?: number;
  coverUrl?: string;
  coverAlt?: string;
  categorySlug?: string;
  categoryName?: string;
  authorName?: string;
}

export interface FlashNews {
  message: string;
  active: boolean;
}

export interface SidebarPromoBlock {
  blockType?: string;
  embedCode?: string | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  title?: string | null;
}

export interface AdSlot {
  id: number;
  position?: string;
  embedHtml?: string | null;
  mediaUrl?: string | null;
  linkUrl?: string | null;
}

export interface NewsHomePageData {
  flash: FlashNews | null;
  featured: NewsArticle[];
  mainNews: NewsArticle[];
  pressRelease: NewsArticle[];
  mostRead: NewsArticle[];
  sidebarPromo: SidebarPromoBlock | null;
  /** Sidebar ad slots (position=sidebar) */
  adSlots: AdSlot[];
  /** Top banner ad slots (position=top) */
  topAdSlots: AdSlot[];
}
