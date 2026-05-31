import type { EventMediaDTO } from '@/types';

export type EventMediaThumbnailInput = Pick<
  EventMediaDTO,
  'fileUrl' | 'thumbnailUrl' | 'thumbnailPreSignedUrl' | 'fileDataContentType' | 'contentType' | 'title'
> & {
  fileName?: string;
};

export type OfficialDocumentPlaceholderKind = 'pdf' | 'word' | 'excel' | 'image' | 'generic';

function mimeFromMedia(media: EventMediaThumbnailInput): string {
  const mime = (media.fileDataContentType || media.contentType || '').toLowerCase();
  if (mime) return mime;
  const name = media.fileName || media.title || media.fileUrl || '';
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return 'application/pdf';
  if (['doc', 'docx'].includes(ext)) return 'application/msword';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'application/vnd.ms-excel';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  return '';
}

export function isImageMime(mime: string): boolean {
  return mime.startsWith('image/');
}

/** Resolved URL for card/list preview, or null when a placeholder should be shown. */
export function getEventMediaDisplayThumbnailUrl(media: EventMediaThumbnailInput): string | null {
  const mime = mimeFromMedia(media);
  if (isImageMime(mime) && media.fileUrl) {
    return media.fileUrl;
  }
  const thumb = media.thumbnailPreSignedUrl || media.thumbnailUrl;
  if (thumb && thumb.trim().length > 0) {
    return thumb;
  }
  return null;
}

export function getOfficialDocumentPlaceholderKind(
  media: EventMediaThumbnailInput
): OfficialDocumentPlaceholderKind {
  const mime = mimeFromMedia(media);
  if (isImageMime(mime)) return 'image';
  if (mime.includes('pdf')) return 'pdf';
  if (mime.includes('word') || mime.includes('msword') || mime.includes('document')) return 'word';
  if (mime.includes('excel') || mime.includes('spreadsheet') || mime.includes('csv')) return 'excel';
  const name = (media.fileName || media.title || '').toLowerCase();
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.doc') || name.endsWith('.docx')) return 'word';
  if (name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.csv')) return 'excel';
  return 'generic';
}

export function placeholderGradient(kind: OfficialDocumentPlaceholderKind): string {
  switch (kind) {
    case 'pdf':
      return 'from-red-50 via-red-100 to-orange-50';
    case 'word':
      return 'from-blue-50 via-blue-100 to-indigo-50';
    case 'excel':
      return 'from-emerald-50 via-green-100 to-teal-50';
    case 'image':
      return 'from-violet-50 via-purple-100 to-fuchsia-50';
    default:
      return 'from-slate-50 via-gray-100 to-slate-100';
  }
}

export function placeholderLabel(kind: OfficialDocumentPlaceholderKind): string {
  switch (kind) {
    case 'pdf':
      return 'PDF';
    case 'word':
      return 'DOC';
    case 'excel':
      return 'XLS';
    case 'image':
      return 'IMG';
    default:
      return 'FILE';
  }
}
