import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { fetchAdminProfileServer } from './manage-usage/ApiServerActions';
import { bootstrapUserProfile } from '@/components/ProfileBootstrapperApiServerActions';

/**
 * Admin Layout - Protects all /admin/* routes
 *
 * This layout ensures that only users with ADMIN role can access admin pages.
 * If a user is not authenticated or doesn't have ADMIN role, they are redirected to the homepage.
 *
 * This prevents the "freezing" issue by redirecting immediately on the server-side
 * before any client components can render.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Check authentication
    // When user is logged out, auth() returns { userId: null } without throwing
    let userId: string | null = null;
    try {
      const authResult = await auth();
      userId = authResult?.userId || null;
    } catch (authError) {
      // If auth() throws (e.g., middleware not configured), assume not authenticated
      console.warn('[AdminLayout] Auth check failed, assuming not authenticated:', authError);
      redirect('/');
    }

    // If not authenticated, redirect to homepage immediately
    if (!userId) {
      // Silent redirect for logged-out users (no console warning needed)
      redirect('/');
    }

    // Ensure tenant-scoped profile exists for the current user
    // This is non-blocking - if it fails, we'll still check the profile
    try {
      const u = await currentUser();
      if (u) {
        await bootstrapUserProfile({ userId, user: u });
      }
    } catch (error) {
      console.error('[AdminLayout] Error bootstrapping user profile (non-fatal):', error);
      // Continue - fetchAdminProfileServer will check if profile exists
    }

    // Fetch user profile to check admin role
    // Use a timeout approach: if profile fetch fails or is slow, assume not admin
    let userProfile = null;
    try {
      userProfile = await fetchAdminProfileServer(userId);
    } catch (error) {
      console.error('[AdminLayout] Error fetching user profile:', error);
      // If we can't fetch the profile, assume user is not admin for security
      console.warn('[AdminLayout] Cannot verify admin status, redirecting to homepage');
      redirect('/');
    }

    // Check if user has ADMIN role
    const isAdmin = userProfile?.userRole === 'ADMIN';

    // If not admin or profile doesn't exist, redirect to homepage immediately
    if (!isAdmin) {
      console.warn(
        `[AdminLayout] User ${userId} attempted to access admin route but does not have ADMIN role. ` +
        `Role: ${userProfile?.userRole || 'NONE'}, Status: ${userProfile?.userStatus || 'NONE'}`
      );
      redirect('/');
    }

    // User is authenticated and has ADMIN role - render children
    return <>{children}</>;
  } catch (error) {
    // If any error occurs, redirect to homepage for security
    console.error('[AdminLayout] Unexpected error:', error);
    redirect('/');
  }
}

