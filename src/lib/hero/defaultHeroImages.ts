/**
 * Tenant default homepage hero image helpers.
 * @see documentation/default_hero_images_rotation/DEFAULT_HERO_IMAGES_FRONTEND_ADMIN_PRD.md
 */

export type DefaultHeroDisplayMode = 'slideshow' | 'random' | 'single';

export const BUNDLED_EMERGENCY_HERO_IMAGE =
  '/images/hero_section/hero_images/fallback/default-hero.webp';

export const DEFAULT_HERO_DISPLAY_MODES: DefaultHeroDisplayMode[] = [
  'slideshow',
  'random',
  'single',
];

export const MAX_TENANT_HERO_SLIDES = 20;

type HeroUrlSource = {
  defaultHeroImageUrls?: string[] | null;
  defaultHeroImageUrlsJson?: string | null;
};

function isHttpsUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Parse tenant hero URLs from API DTO fields or a raw JSON string.
 */
export function parseTenantDefaultHeroUrls(
  source?: HeroUrlSource | string | null
): string[] {
  if (!source) return [];

  if (typeof source === 'string') {
    const trimmed = source.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter((item) => item.length > 0 && isHttpsUrl(item));
    } catch {
      return trimmed
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && isHttpsUrl(line));
    }
  }

  if (Array.isArray(source.defaultHeroImageUrls) && source.defaultHeroImageUrls.length > 0) {
    return source.defaultHeroImageUrls
      .map((url) => url.trim())
      .filter((url) => url.length > 0 && isHttpsUrl(url));
  }

  return parseTenantDefaultHeroUrls(source.defaultHeroImageUrlsJson ?? null);
}

/**
 * Serialize ordered hero URLs for tenant_settings.default_hero_image_urls_json.
 */
export function serializeDefaultHeroImageUrls(urls: string[]): string {
  const cleaned = urls
    .map((url) => url.trim())
    .filter((url) => url.length > 0 && isHttpsUrl(url));
  return JSON.stringify(cleaned);
}

/**
 * Parse manual textarea input (one HTTPS URL per line) and merge with existing URLs.
 */
export function mergeHeroUrlLines(existing: string[], lines: string): string[] {
  const parsed = parseTenantDefaultHeroUrls(lines);
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const url of [...existing, ...parsed]) {
    const normalized = url.trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    merged.push(normalized);
  }
  return merged.slice(0, MAX_TENANT_HERO_SLIDES);
}

export function normalizeDefaultHeroDisplayMode(
  value?: string | null
): DefaultHeroDisplayMode {
  if (value === 'random' || value === 'single' || value === 'slideshow') {
    return value;
  }
  return 'slideshow';
}
