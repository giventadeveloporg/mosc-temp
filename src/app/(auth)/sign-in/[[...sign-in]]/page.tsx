// Satellite domain - redirect to primary domain for authentication
// For localhost - show Clerk component directly for development
// For primary domain (event-site-manager.com) - show Clerk SignIn and honor redirect_url for satellite return
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SignIn } from '@clerk/nextjs';
import { useAuth, useUser } from '@clerk/nextjs';
import { bootstrapUserProfile } from '@/components/ProfileBootstrapperApiServerActions';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isSignedIn, userId, isLoaded } = useAuth();
  const { user } = useUser();

  // redirect_url from query (e.g. https://www.mosc-temp.com when returning to satellite after sign-in)
  const redirectUrlFromQuery = searchParams?.get('redirect_url') ?? null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // After sign-in completes locally, bootstrap tenant-scoped profile (upsert)
    if (isLoaded && isSignedIn && userId && user) {
      bootstrapUserProfile({
        userId,
        userData: {
          email: user.emailAddresses?.[0]?.emailAddress || undefined,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          imageUrl: user.imageUrl || undefined,
        },
      }).catch(() => { });
    }

    // Check if we're on a satellite domain
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;

      // Check if localhost - show Clerk component for development
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        setIsLocalhost(true);
        return;
      }

      // If on satellite domain, redirect to primary domain with return URL
      const satelliteDomain = process.env.NEXT_PUBLIC_CLERK_DOMAIN || 'mosc-temp.com';
      if (hostname.includes('mosc-temp.com') || hostname.includes(satelliteDomain.replace('www.', ''))) {
        setShouldRedirect(true);
        // Get the current URL to return to after authentication
        const currentUrl = window.location.origin;

        // Get primary domain from environment variable
        const primaryDomain = process.env.NEXT_PUBLIC_PRIMARY_DOMAIN || 'www.event-site-manager.com';

        // Redirect to primary domain with redirect_url parameter
        // Clerk will redirect back to this URL after successful authentication
        const redirectUrl = `https://${primaryDomain}/sign-in?redirect_url=${encodeURIComponent(currentUrl)}`;
        window.location.href = redirectUrl;
      }
    }
  }, []);

  // Show Clerk component for localhost development
  if (isLocalhost) {
    return (
      <main className="flex flex-col items-center justify-center flex-1 py-2">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center text-gray-900">Sign In</h1>
          <p className="text-sm text-gray-500 text-center mt-2">(Development Mode)</p>
        </div>
        <SignIn
          routing="path"
          path="/sign-in"
        />
      </main>
    );
  }

  // Show loading state while redirecting (satellite domain)
  if (shouldRedirect) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </main>
    );
  }

  // Primary domain (e.g. event-site-manager.com): show Clerk SignIn so the page is not blank.
  // When opened with ?redirect_url=https://www.mosc-temp.com (from satellite), pass it so Clerk redirects back after sign-in.
  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
      </main>
    );
  }

  const afterSignInRedirect = redirectUrlFromQuery && redirectUrlFromQuery.startsWith('http') ? redirectUrlFromQuery : '/';

  return (
    <main className="flex flex-col items-center justify-center flex-1 py-2">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center text-gray-900">Sign In</h1>
        {redirectUrlFromQuery && (
          <p className="text-sm text-gray-500 text-center mt-2">You will be returned to the site after signing in.</p>
        )}
      </div>
      <SignIn
        routing="path"
        path="/sign-in"
        redirectUrl={afterSignInRedirect}
        signUpUrl={process.env.NEXT_PUBLIC_PRIMARY_DOMAIN ? `https://${process.env.NEXT_PUBLIC_PRIMARY_DOMAIN}/sign-up` : '/sign-up'}
      />
    </main>
  );
}