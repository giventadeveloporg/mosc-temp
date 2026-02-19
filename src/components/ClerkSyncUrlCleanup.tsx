'use client';

import { useEffect } from 'react';

/**
 * Removes Clerk __clerk_* query params from the URL in the address bar without reloading.
 * Prevents "site not available" / flicker when Clerk adds e.g. __clerk_synced=true on
 * satellite/production (root and /syro, etc.). Uses replaceState so no redirect loop.
 */
export default function ClerkSyncUrlCleanup() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const hasClerkParam = Array.from(params.keys()).some((key) => key.startsWith('__clerk_'));

    if (!hasClerkParam) return;

    const cleanParams = new URLSearchParams();
    params.forEach((value, key) => {
      if (!key.startsWith('__clerk_')) cleanParams.set(key, value);
    });
    const cleanSearch = cleanParams.toString();
    const path = window.location.pathname || '/';
    const newUrl = path + (cleanSearch ? `?${cleanSearch}` : '') + window.location.hash;

    window.history.replaceState(null, '', newUrl);
  }, []);

  return null;
}
