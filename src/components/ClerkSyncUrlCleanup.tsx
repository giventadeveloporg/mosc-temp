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
 *
 * First load after deploy: Use a longer initial delay (600ms) so Clerk has time to
 * persist sync state on cold start. A second safety-net cleanup runs once after 2s
 * so if Clerk re-appends the param we strip it again without requiring a manual reload.
 */
const SYNC_STORAGE_KEY = 'clerk_satellite_synced';
const INITIAL_DELAY_MS = 600;
const SAFETY_NET_DELAY_MS = 2000;

function stripClerkParamsFromUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  const hasClerkParam = Array.from(params.keys()).some((key) => key.startsWith('__clerk_'));
  if (!hasClerkParam) return false;

  const cleanParams = new URLSearchParams();
  params.forEach((value, key) => {
    if (!key.startsWith('__clerk_')) cleanParams.set(key, value);
  });
  const cleanSearch = cleanParams.toString();
  const path = window.location.pathname || '/';
  const newUrl = path + (cleanSearch ? `?${cleanSearch}` : '') + window.location.hash;
  window.history.replaceState(null, '', newUrl);
  return true;
}

export default function ClerkSyncUrlCleanup() {
  const { isLoaded } = useAuth();
  const cleaned = useRef(false);
  const safetyNetScheduled = useRef(false);

  // Primary cleanup: after Clerk is loaded, wait then strip __clerk_* params
  useEffect(() => {
    if (!isLoaded || cleaned.current || typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const hasClerkParam = Array.from(params.keys()).some((key) => key.startsWith('__clerk_'));

    if (!hasClerkParam) return;

    if (params.has('__clerk_synced')) {
      try {
        sessionStorage.setItem(SYNC_STORAGE_KEY, '1');
      } catch {
        /* private browsing */
      }
    }

    const timer = setTimeout(() => {
      if (stripClerkParamsFromUrl()) cleaned.current = true;
    }, INITIAL_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isLoaded]);

  // Safety net: once per load, after SAFETY_NET_DELAY_MS, strip __clerk_* again if still present
  // Handles first request after deploy where Clerk may re-append the param after initial cleanup
  useEffect(() => {
    if (!isLoaded || safetyNetScheduled.current || typeof window === 'undefined') return;

    safetyNetScheduled.current = true;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const stillHas = Array.from(params.keys()).some((k) => k.startsWith('__clerk_'));
      if (stillHas) stripClerkParamsFromUrl();
    }, SAFETY_NET_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isLoaded]);

  return null;
}
