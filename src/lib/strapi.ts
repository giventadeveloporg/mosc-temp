/**
 * Strapi CMS client configuration for the News Portal (MOSC).
 * Used server-side only for fetching news, homepage, sidebar, and ads.
 * API token is server-only; do not expose via NEXT_PUBLIC_.
 *
 * See: documentation/news_portal/strapi/api_reference.md
 */

import { getTenantId } from '@/lib/env';

/**
 * Lazily loads Strapi server URL (e.g. http://localhost:1337 or https://cms.example.com).
 * Use for resolving media URLs (uploads). Strips trailing slash and /api suffix.
 * Prioritizes AMPLIFY_ prefix for AWS Amplify production.
 */
export function getStrapiUrl(): string {
  const url =
    process.env.AMPLIFY_NEXT_PUBLIC_STRAPI_URL ||
    process.env.NEXT_PUBLIC_STRAPI_URL;
  if (!url) {
    return '';
  }
  const trimmed = url.replace(/\/$/, '');
  return trimmed.endsWith('/api') ? trimmed.slice(0, -4) : trimmed;
}

/**
 * Returns the Content API base URL (server + /api).
 * Per api_reference.md: Base URL is server + /api (e.g. http://localhost:1337/api).
 */
export function getStrapiApiBase(): string {
  const base = getStrapiUrl();
  if (!base) return '';
  return `${base}/api`;
}

/**
 * Lazily loads Strapi API token for authenticated requests.
 * Per api_reference.md: Send as Authorization: Bearer <token>.
 * Server-only; not exposed to the client.
 */
export function getStrapiApiToken(): string | undefined {
  return (
    process.env.AMPLIFY_STRAPI_API_TOKEN ||
    process.env.STRAPI_API_TOKEN
  );
}

/**
 * Returns headers for Strapi API requests. Includes Authorization if token is set.
 * Uses Strapi-Response-Format: v4 for compatibility with media/relation extraction
 * (Strapi 5 flattened format can differ; v4 ensures media.data.attributes.url structure).
 */
export function getStrapiHeaders(): Record<string, string> {
  const token = getStrapiApiToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Strapi-Response-Format': 'v4',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

const LOG_PREFIX = '[STRAPI-NEWS]';

/**
 * Fetches from Strapi Content API with auth. Returns null on failure (caller handles fallback).
 * Path should be relative to /api (e.g. /articles?... or /homepage?populate=*).
 */
export async function fetchStrapi<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T } | null> {
  const base = getStrapiApiBase();
  if (!base) {
    console.warn(`${LOG_PREFIX} Strapi URL not set (NEXT_PUBLIC_STRAPI_URL). Skipping fetch: ${path}`);
    return null;
  }
  const fullPath = path.startsWith('/') ? path : `/${path}`;
  const url = path.startsWith('http') ? path : `${base}${fullPath}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...getStrapiHeaders(),
        ...(options.headers as Record<string, string>),
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      const body = await res.text();
      try {
        const err = body ? JSON.parse(body) : {};
        console.warn(`${LOG_PREFIX} Strapi ${path} ${res.status}:`, err?.error?.message || err?.message || body || res.statusText);
      } catch {
        console.warn(`${LOG_PREFIX} Strapi ${path} returned ${res.status} ${res.statusText}`);
      }
      return null;
    }
    const data = (await res.json()) as { data?: T };
    const payload = (data?.data ?? data) as T;
    const count = Array.isArray(payload) ? payload.length : 1;
    console.info(`${LOG_PREFIX} OK ${path} (${count} item(s))`);
    return { data: payload };
  } catch (err) {
    console.warn(`${LOG_PREFIX} Strapi fetch failed: ${path}`, err);
    return null;
  }
}

/**
 * Returns tenant ID for Strapi filters.
 * Per api_reference.md: filters[tenant][tenantId][$eq]=<tenantId>
 */
export function getStrapiTenantId(): string {
  return getTenantId();
}
