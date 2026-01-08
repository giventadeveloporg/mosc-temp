"use server";
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getTenantId } from '@/lib/env';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function bootstrapUserProfile({ 
  userId, 
  userData 
}: { 
  userId: string, 
  userData?: { 
    email?: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  } 
}) {
  if (!userId) return;
  try {
    const tenantId = getTenantId();
    let token = await getCachedApiJwt();

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    // 1. Try to fetch by userId
    let res = await fetch(`${API_BASE_URL}/api/user-profiles/by-user/${userId}?tenantId.equals=${tenantId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: controller.signal,
    });

    if (res.status === 401) {
      clearTimeout(timeout);
      const newController = new AbortController();
      const newTimeout = setTimeout(() => newController.abort(), 15000);
      token = await generateApiJwt();
      res = await fetch(`${API_BASE_URL}/api/user-profiles/by-user/${userId}?tenantId.equals=${tenantId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
        signal: newController.signal,
      });
      clearTimeout(newTimeout);
    } else {
      clearTimeout(timeout);
    }

    if (res.ok) return; // Profile exists

    // 2. Fallback: lookup by email
    if (res.status === 404) {
      const email = userData?.email || "";
      if (email) {
        let emailToken = token;
        let emailRes = await fetch(`${API_BASE_URL}/api/user-profiles?email.equals=${encodeURIComponent(email)}&tenantId.equals=${tenantId}`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${emailToken}` },
          cache: 'no-store',
        });
        if (emailRes.status === 401) {
          emailToken = await generateApiJwt();
          emailRes = await fetch(`${API_BASE_URL}/api/user-profiles?email.equals=${encodeURIComponent(email)}&tenantId.equals=${tenantId}`, {
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${emailToken}` },
            cache: 'no-store',
          });
        }
        if (emailRes.ok) {
          const profiles = await emailRes.json();
          if (Array.isArray(profiles) && profiles.length > 0) {
            const userProfile = profiles[0];
            // Update the found profile with the current userId and Clerk data
            const now = new Date().toISOString();
            const updatedProfile = {
              ...userProfile,
              userId,
              firstName: userData?.firstName || userProfile.firstName || "",
              lastName: userData?.lastName || userProfile.lastName || "",
              email,
              profileImageUrl: userData?.imageUrl || userProfile.profileImageUrl || "",
              updatedAt: now,
              tenantId,
            };
            let updateToken = token;
            let updateRes = await fetch(`${API_BASE_URL}/api/user-profiles/${userProfile.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${updateToken}` },
              body: JSON.stringify(updatedProfile),
            });
            if (updateRes.status === 401) {
              updateToken = await generateApiJwt();
              updateRes = await fetch(`${API_BASE_URL}/api/user-profiles/${userProfile.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${updateToken}` },
                body: JSON.stringify(updatedProfile),
              });
            }
            return;
          }
        }
      }
      // 3. If not found by email, create minimal profile
      const now = new Date().toISOString();
      const profile = {
        userId,
        email,
        firstName: userData?.firstName || "",
        lastName: userData?.lastName || "",
        profileImageUrl: userData?.imageUrl || "",
        tenantId,
        createdAt: now,
        updatedAt: now,
      };
      let createToken = token;
      let createRes = await fetch(`${API_BASE_URL}/api/user-profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${createToken}` },
        body: JSON.stringify(profile),
      });
      if (createRes.status === 401) {
        createToken = await generateApiJwt();
        createRes = await fetch(`${API_BASE_URL}/api/user-profiles`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${createToken}` },
          body: JSON.stringify(profile),
        });
      }
      return;
    }
    if (!res.ok) {
      throw new Error(`Failed to fetch user profile: ${res.statusText}`);
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('[bootstrapUserProfile] Profile bootstrap timed out after 15 seconds');
    } else {
      console.error('[bootstrapUserProfile] Error bootstrapping user profile:', error);
    }
    // Don't throw - allow page to continue loading even if bootstrap fails
  }
}