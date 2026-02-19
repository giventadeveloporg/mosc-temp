'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';

/**
 * Removes Clerk __clerk_* query params from the URL in the address bar without reloading.
 *
 * CRITICAL: Must wait for Clerk to fully load (isLoaded === true) before stripping
 * __clerk_synced=true. If we remove it before ClerkProvider processes it, Clerk thinks
 * the satellite session hasn't synced yet and re-initiates the sync redirect — causing
 * an infinite loop between ?__clerk_synced=true and the bare URL.
 *
 * Flow:
 *  1. Primary domain redirects back to satellite with ?__clerk_synced=true
 *  2. ClerkProvider reads the param during init and records sync state internally
 *  3. useAuth().isLoaded flips to true once Clerk is ready
 *  4. Only THEN do we clean the URL via replaceState (no reload, no redirect)
 *  5. sessionStorage guard prevents any edge-case re-trigger within the same tab session
 */
const SYNC_STORAGE_KEY = 'clerk_satellite_synced';

export default function ClerkSyncUrlCleanup() {
  const { isLoaded } = useAuth();
  const cleaned = useRef(false);

  useEffect(() => {
    if (!isLoaded || cleaned.current || typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const hasClerkParam = Array.from(params.keys()).some((key) => key.startsWith('__clerk_'));

    if (!hasClerkParam) return;

    // Mark that satellite sync completed in this tab session
    if (params.has('__clerk_synced')) {
      try { sessionStorage.setItem(SYNC_STORAGE_KEY, '1'); } catch { /* private browsing */ }
    }

    // Small delay as extra safety — gives Clerk one more tick to persist sync state
    const timer = setTimeout(() => {
      // Re-read in case something changed during the delay
      const current = new URLSearchParams(window.location.search);
      const stillHas = Array.from(current.keys()).some((k) => k.startsWith('__clerk_'));
      if (!stillHas) return;

      const cleanParams = new URLSearchParams();
      current.forEach((value, key) => {
        if (!key.startsWith('__clerk_')) cleanParams.set(key, value);
      });
      const cleanSearch = cleanParams.toString();
      const path = window.location.pathname || '/';
      const newUrl = path + (cleanSearch ? `?${cleanSearch}` : '') + window.location.hash;

      window.history.replaceState(null, '', newUrl);
      cleaned.current = true;
    }, 300);

    return () => clearTimeout(timer);
  }, [isLoaded]);

  return null;
}
