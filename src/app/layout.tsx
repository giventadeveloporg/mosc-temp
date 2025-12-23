import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
// NOTE: Using Clerk SDK for OAuth (works with custom Google credentials)
// Backend webhook syncs users to multi-tenant system
import TrpcProvider from "@/lib/trpc/Provider";
import Script from "next/script";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ConditionalLayout from "../components/ConditionalLayout";
import MobileDebugConsole from "../components/MobileDebugConsole";
import { TenantSettingsProvider } from "../components/TenantSettingsProvider";
import { headers } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs";
import { getAppUrl, getTenantId } from "@/lib/env";
import { fetchWithJwtRetry } from "@/lib/proxyHandler";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Satellite domain configuration for multi-domain support
  // Primary domain: Read from NEXT_PUBLIC_PRIMARY_DOMAIN env variable
  // Satellite domains: Read from NEXT_PUBLIC_CLERK_DOMAIN and NEXT_PUBLIC_APP_URL env variables
  // IMPORTANT: Only apply satellite config in production, not in development (localhost)

  // CRITICAL: Next.js 15+ requires headers() to be fully resolved before any iteration or access
  // Store the headers promise result to ensure it's fully awaited
  const headersList = await headers();
  // CRITICAL: Access headers synchronously after await to avoid iteration errors
  const hostname = headersList.get('host') || '';

  // Get primary domain from environment variable
  const primaryDomain = process.env.NEXT_PUBLIC_PRIMARY_DOMAIN || 'www.event-site-manager.com';

  // Get satellite domain from environment variable
  const satelliteDomain = process.env.NEXT_PUBLIC_CLERK_DOMAIN || 'www.mosc-temp.com';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  // Detect if this is a satellite domain (check if hostname matches satellite domain or APP_URL)
  const isSatellite = hostname.includes('mosc-temp.com') ||
    (satelliteDomain && hostname.includes(satelliteDomain.replace('www.', '')));

  // Satellite domains must redirect to primary domain for authentication
  const clerkProps = isSatellite
    ? {
      isSatellite: true,
      domain: satelliteDomain, // Use env var to match DNS record
      signInUrl: `https://${primaryDomain}/sign-in`,
      signUpUrl: `https://${primaryDomain}/sign-up`,
    }
    : {
      // Primary domain allows redirects from satellites
      allowedRedirectOrigins: appUrl ? [appUrl] : [],
    };

  // Determine tenant-scoped admin flag on the server
  // CRITICAL: Next.js 15+ requires headers() to be awaited before any function that uses it
  // Both auth() and currentUser() internally use headers(), so we must ensure headers() is awaited first
  // We've already awaited headers() at line 29, but Next.js 15+ is strict about sequential async calls
  let isTenantAdmin = false;
  try {
    // CRITICAL: Call auth() immediately after awaiting headers() to ensure proper async context
    // Do not call any other async functions before auth() completes
    let userId: string | null = null;
    let currentUserData: any = null;
    try {
      // Call auth() first - it internally uses headers() which we've already awaited
      const authResult = await auth();
      userId = authResult?.userId || null;
      console.log('[Layout] 🔍 Auth check result:', { userId, hasUserId: !!userId });

      // CRITICAL: Only call currentUser() after auth() completes successfully
      // This ensures headers() async context is properly maintained
      if (userId) {
        try {
          currentUserData = await currentUser();
        } catch (currentUserError: any) {
          // Handle currentUser() errors gracefully - it also uses headers() internally
          if (currentUserError?.message?.includes('headers()') || currentUserError?.message?.includes('sync-dynamic-apis')) {
            console.warn('[Layout] currentUser() skipped due to Next.js 15+ headers() async requirement:', currentUserError.message);
            currentUserData = null;
          } else {
            throw currentUserError;
          }
        }
      }
    } catch (authError: any) {
      // Handle Next.js 15+ headers() await error gracefully
      if (authError?.message?.includes('headers()') || authError?.message?.includes('sync-dynamic-apis')) {
        console.warn('[Layout] Auth check skipped due to Next.js 15+ headers() async requirement:', authError.message);
        userId = null;
        currentUserData = null;
      } else {
        throw authError;
      }
    }
    if (userId) {
      const baseUrl = getAppUrl();
      const tenantId = getTenantId();
      console.log('[Layout] 🔍 Fetching user profile:', { userId, tenantId, baseUrl });

      // Step 1: Check if userId + tenantId combination exists
      const url = `${baseUrl}/api/proxy/user-profiles?userId.equals=${encodeURIComponent(userId)}&tenantId.equals=${encodeURIComponent(tenantId)}&size=1`;
      console.log('[Layout] 🔍 Profile fetch URL:', url);
      const resp = await fetch(url, { cache: 'no-store', headers: { 'Content-Type': 'application/json' } });
      console.log('[Layout] 🔍 Profile fetch response:', { status: resp.status, ok: resp.ok });

      if (resp.ok) {
        const arr = await resp.json();
        const p = Array.isArray(arr) ? arr[0] : arr;

        if (!p) {
          // Step 2: Profile not found by userId + tenantId
          // Check if email + tenantId combination exists (different userId case)
          // CRITICAL: Use currentUserData from above instead of calling currentUser() again
          // This prevents multiple headers() calls in Next.js 15+
          try {
            const u = currentUserData; // Use already-fetched currentUser data
            const userEmail = u?.emailAddresses?.[0]?.emailAddress || '';

            if (userEmail) {
              // Check for existing profile with same email + tenantId but different userId
              const emailCheckUrl = `${baseUrl}/api/proxy/user-profiles?email.equals=${encodeURIComponent(userEmail)}&tenantId.equals=${encodeURIComponent(tenantId)}&size=1`;
              const emailResp = await fetch(emailCheckUrl, { cache: 'no-store', headers: { 'Content-Type': 'application/json' } });

              if (emailResp.ok) {
                const emailArr = await emailResp.json();
                const existingProfile = Array.isArray(emailArr) ? emailArr[0] : emailArr;

                if (existingProfile && existingProfile.userId !== userId) {
                  // Step 3: Email + tenantId exists but with different userId
                  // UPDATE the existing record's userId to match current Clerk userId
                  console.log('[Layout] Found existing profile with same email but different userId. Updating userId...');
                  console.log('[Layout] Old userId:', existingProfile.userId, '→ New userId:', userId);

                  // Use direct backend call with JWT (not proxy) for PATCH operations
                  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
                  const updatePayload = {
                    id: existingProfile.id, // MUST include id in PATCH payload per backend requirements
                    userId: userId, // Update to current Clerk userId
                    clerkUserId: userId, // Also update clerkUserId
                    tenantId: tenantId, // Include tenantId
                    updatedAt: new Date().toISOString(),
                    // Keep other fields from existing profile
                    email: userEmail,
                    firstName: u?.firstName || existingProfile.firstName,
                    lastName: u?.lastName || existingProfile.lastName,
                    profileImageUrl: u?.imageUrl || existingProfile.profileImageUrl,
                  };

                  console.log('[Layout] Sending PATCH request with payload:', JSON.stringify(updatePayload, null, 2));

                  const updateRes = await fetchWithJwtRetry(`${API_BASE_URL}/api/user-profiles/${existingProfile.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/merge-patch+json' },
                    body: JSON.stringify(updatePayload),
                  });

                  if (updateRes.ok) {
                    const updated = await updateRes.json();
                    isTenantAdmin = updated?.userRole === 'ADMIN';
                    console.log('[Layout] Successfully updated userId. Admin status:', isTenantAdmin);
                  } else {
                    const errorText = await updateRes.text();
                    console.error('[Layout] Failed to update userId:', updateRes.status);
                    console.error('[Layout] Error response:', errorText);
                  }
                } else {
                  // Step 4: No existing profile found - Create new profile
                  console.log('[Layout] Creating new user profile for userId:', userId);
                  const now = new Date().toISOString();
                  const payload = {
                    userId,
                    clerkUserId: userId,
                    email: userEmail,
                    firstName: u?.firstName || '',
                    lastName: u?.lastName || '',
                    profileImageUrl: u?.imageUrl || '',
                    userRole: 'MEMBER',
                    userStatus: 'PENDING_APPROVAL',
                    createdAt: now,
                    updatedAt: now,
                  };

                  const createRes = await fetch(`${baseUrl}/api/proxy/user-profiles`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                  });

                  if (!createRes.ok) {
                    console.error('[Layout] Failed to create user profile:', createRes.status);
                  } else {
                    console.log('[Layout] Successfully created new user profile');
                  }
                }
              }
            } else {
              // No email available, cannot check or create profile
              console.warn('[Layout] User has no email address, skipping profile creation');
            }
          } catch (err) {
            console.error('[Layout] Error in user profile creation/update logic:', err);
          }
        } else {
          // Step 5: Profile found by userId + tenantId - check admin status
          isTenantAdmin = p?.userRole === 'ADMIN';
          console.log('[Layout] Found existing profile. Admin status:', isTenantAdmin);
        }
      }
    }
  } catch (e) {
    // Fail closed (no admin) on error
    console.error('[Layout] ❌ Error determining admin status:', e);
    isTenantAdmin = false;
  }

  console.log('[Layout] 🔍 Final admin status:', { isTenantAdmin });

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      {...clerkProps}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link href="https://fonts.googleapis.com/css?family=Epilogue:300,400,500,600,700|Sora:400,500,600,700&display=swap" rel="stylesheet" />
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
        </head>
        <body className={inter.className + " flex flex-col min-h-screen"} suppressHydrationWarning>
          <TrpcProvider>
            <TenantSettingsProvider>
              <ConditionalLayout
                header={<Header hideMenuItems={false} isTenantAdmin={isTenantAdmin} />}
                footer={<Footer />}
              >
                {children}
              </ConditionalLayout>
            </TenantSettingsProvider>
          </TrpcProvider>
          <Script
            id="hcaptcha-config"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.hcaptchaConfig = {
                  passive: true,
                  usePassiveEventListeners: true
                };
              `,
            }}
          />
          {/* Mobile Debug Console - Always available for log copying, even on error pages */}
          <MobileDebugConsole />
        </body>
      </html>
    </ClerkProvider>
  );
}