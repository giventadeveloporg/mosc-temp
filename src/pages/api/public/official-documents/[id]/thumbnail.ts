import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl } from '@/lib/env';
import { getEventMediaDisplayThumbnailUrl, isImageMime } from '@/lib/officialDocumentThumbnail';
import type { EventMediaDTO } from '@/types';

function parseMediaId(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }
  return Math.trunc(id);
}

function mimeFromDoc(doc: EventMediaDTO): string {
  const mime = (doc.fileDataContentType || doc.contentType || '').toLowerCase();
  if (mime) return mime;
  const name = doc.fileUrl || doc.title || '';
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
    return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  }
  return '';
}

async function fetchFreshDownloadUrl(mediaId: number): Promise<string | null> {
  const url = `${getApiBaseUrl()}/api/event-medias/${mediaId}/download-url?expirationHours=24`;
  const backendRes = await fetchWithJwtRetry(url, { cache: 'no-store' });
  if (!backendRes.ok) {
    return null;
  }
  const payload = (await backendRes.json()) as { downloadUrl?: string };
  return payload.downloadUrl?.trim() || null;
}

/**
 * Public thumbnail redirect: loads fresh event_media metadata (and download-url for image files)
 * so card previews do not use expired presigned URLs from list responses.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    return;
  }

  const mediaId = parseMediaId(req.query.id);
  if (mediaId == null) {
    res.status(400).json({ error: 'Invalid media id' });
    return;
  }

  try {
    const mediaUrl = `${getApiBaseUrl()}/api/event-medias/${mediaId}`;
    const mediaRes = await fetchWithJwtRetry(mediaUrl, { cache: 'no-store' });
    if (!mediaRes.ok) {
      res.status(mediaRes.status === 404 ? 404 : 502).json({ error: 'Unable to load document metadata' });
      return;
    }

    const doc = (await mediaRes.json()) as EventMediaDTO;
    const previewUrl = getEventMediaDisplayThumbnailUrl(
      {
        fileUrl: doc.fileUrl,
        thumbnailUrl: doc.thumbnailUrl,
        thumbnailPreSignedUrl: doc.thumbnailPreSignedUrl,
        fileDataContentType: doc.fileDataContentType || doc.contentType,
        title: doc.title,
        fileName: doc.fileUrl?.split('/').pop(),
      },
      {
        thumbnailExpiresAtIso: doc.thumbnailPreSignedUrlExpiresAt,
        fileExpiresAtIso: doc.preSignedUrlExpiresAt,
      }
    );

    if (previewUrl) {
      res.redirect(302, previewUrl);
      return;
    }

    if (isImageMime(mimeFromDoc(doc))) {
      const downloadUrl = await fetchFreshDownloadUrl(mediaId);
      if (downloadUrl) {
        res.redirect(302, downloadUrl);
        return;
      }
    }

    res.status(404).json({ error: 'No thumbnail available for this document' });
  } catch (error) {
    globalThis.console.error('[official-documents thumbnail] error:', error);
    res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}
