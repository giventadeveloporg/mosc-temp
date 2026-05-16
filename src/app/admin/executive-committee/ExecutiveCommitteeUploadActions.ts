'use server';

import { headers } from 'next/headers';
import { getAppUrl, getTenantId } from '@/lib/env';

/** Server-side fetch to this Next app (upload proxy). Prefer request host over env default port. */
async function getInternalAppOrigin(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get('x-forwarded-host') ?? h.get('host');
    if (host) {
      const proto = h.get('x-forwarded-proto') ?? 'http';
      return `${proto}://${host}`;
    }
  } catch {
    /* outside request context */
  }
  return getAppUrl();
}

/**
 * Uploads a profile image for a team member via Next proxy (multipart).
 * Uses request Host so server actions work on any port (not only getAppUrl() default).
 */
export async function uploadTeamMemberProfileImage(
  memberId: number,
  file: File,
  _userProfileId?: number
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const params = new URLSearchParams();
    params.append('eventId', '0');
    params.append('executiveTeamMemberID', String(memberId));
    params.append('eventFlyer', 'false');
    params.append('isEventManagementOfficialDocument', 'false');
    params.append('isHeroImage', 'false');
    params.append('isActiveHeroImage', 'false');
    params.append('isFeaturedImage', 'false');
    params.append('isPublic', 'true');
    params.append('isTeamMemberProfileImage', 'true');
    params.append('title', `Team Member Profile Image - ${memberId}`);
    params.append('description', 'Profile image uploaded for executive committee team member');
    params.append('tenantId', getTenantId());

    const origin = await getInternalAppOrigin();
    const url = `${origin}/api/proxy/event-medias/upload?${params.toString()}`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (response.status >= 200 && response.status < 300) {
      try {
        const result = await response.json();
        let imageUrl: string | null = null;
        if (result && typeof result === 'object') {
          if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            const firstItem = result.data[0];
            if (firstItem && typeof firstItem === 'object') {
              imageUrl = firstItem.fileUrl || firstItem.url || null;
            }
          } else if (result.fileUrl) {
            imageUrl = result.fileUrl;
          } else if (result.url) {
            imageUrl = result.url;
          }
        }
        if (imageUrl && typeof imageUrl === 'string') {
          return imageUrl;
        }
        return 'upload-successful-no-url';
      } catch {
        return 'upload-successful-parse-error';
      }
    }
    throw new Error(`Upload failed with HTTP status ${response.status}. Please try again or contact support if the issue persists.`);
  } catch (error) {
    console.error('Error uploading team member profile image:', error);
    throw error;
  }
}
