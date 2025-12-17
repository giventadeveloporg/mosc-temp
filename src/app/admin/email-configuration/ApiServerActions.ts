'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import type { TenantEmailAddressDTO } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Fetch all email addresses for a tenant
 */
export async function fetchTenantEmailAddressesServer(tenantId: string): Promise<TenantEmailAddressDTO[]> {
  try {
    const url = `${API_BASE_URL}/api/tenant-email-addresses?tenantId.equals=${tenantId}&sort=emailType,asc&sort=isDefault,desc&sort=id,asc`;
    const res = await fetchWithJwtRetry(url, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('[fetchTenantEmailAddressesServer] Error:', res.status, await res.text());
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[fetchTenantEmailAddressesServer] Exception:', error);
    return [];
  }
}

/**
 * Fetch email address by tenant and email type
 */
export async function fetchTenantEmailByTypeServer(
  tenantId: string,
  emailType: string
): Promise<TenantEmailAddressDTO | null> {
  try {
    const url = `${API_BASE_URL}/api/tenant-email-addresses?tenantId.equals=${tenantId}&emailType.equals=${emailType}&isActive.equals=true&isDefault.equals=true`;
    const res = await fetchWithJwtRetry(url, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('[fetchTenantEmailByTypeServer] Error:', res.status, await res.text());
      return null;
    }

    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('[fetchTenantEmailByTypeServer] Exception:', error);
    return null;
  }
}

/**
 * Create a new email address
 */
export async function createTenantEmailAddressServer(
  payload: Omit<TenantEmailAddressDTO, 'id' | 'createdAt' | 'updatedAt'>
): Promise<TenantEmailAddressDTO | null> {
  try {
    const url = `${API_BASE_URL}/api/tenant-email-addresses`;
    const body = {
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const res = await fetchWithJwtRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[createTenantEmailAddressServer] Error:', res.status, errorText);
      throw new Error(errorText || 'Failed to create email address');
    }

    return await res.json();
  } catch (error) {
    console.error('[createTenantEmailAddressServer] Exception:', error);
    throw error;
  }
}

/**
 * Update an existing email address
 */
export async function updateTenantEmailAddressServer(
  id: number,
  payload: Partial<TenantEmailAddressDTO>
): Promise<TenantEmailAddressDTO | null> {
  try {
    const url = `${API_BASE_URL}/api/tenant-email-addresses/${id}`;
    const body = {
      ...payload,
      id,
      updatedAt: new Date().toISOString(),
    };

    const res = await fetchWithJwtRetry(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[updateTenantEmailAddressServer] Error:', res.status, errorText);
      throw new Error(errorText || 'Failed to update email address');
    }

    return await res.json();
  } catch (error) {
    console.error('[updateTenantEmailAddressServer] Exception:', error);
    throw error;
  }
}

/**
 * Delete an email address
 */
export async function deleteTenantEmailAddressServer(id: number): Promise<boolean> {
  try {
    const url = `${API_BASE_URL}/api/tenant-email-addresses/${id}`;
    const res = await fetchWithJwtRetry(url, {
      method: 'DELETE',
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[deleteTenantEmailAddressServer] Error:', res.status, errorText);
      throw new Error(errorText || 'Failed to delete email address');
    }

    return true;
  } catch (error) {
    console.error('[deleteTenantEmailAddressServer] Exception:', error);
    throw error;
  }
}


