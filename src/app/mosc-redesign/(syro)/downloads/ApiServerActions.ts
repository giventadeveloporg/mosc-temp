'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import type { EventMediaDTO } from '@/types';

/** Public tenant official documents for the downloads page (server-side JWT). */
export async function fetchPublicOfficialDocumentsForDownloadsServer(): Promise<EventMediaDTO[]> {
  try {
    const params = new URLSearchParams();
    params.append('tenantId.equals', getTenantId());
    params.append('isEventManagementOfficialDocument.equals', 'true');
    params.append('isPublic.equals', 'true');
    params.append('sort', 'createdAt,desc');
    params.append('size', '200');
    const url = `${getApiBaseUrl()}/api/event-medias?${params.toString()}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('[downloads] fetchPublicOfficialDocumentsForDownloadsServer:', e);
    return [];
  }
}
