import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { EventProgramDirectorsDTO } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const baseUrl = getAppUrl();

export async function fetchEventProgramDirectorsServer(eventId: number) {
  const params = new URLSearchParams();
  params.append('eventId.equals', eventId.toString());

  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-program-directors?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event program directors: ${response.statusText}`);
  }

  return await response.json();
}

export async function fetchEventProgramDirectorServer(id: number) {
  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-program-directors/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event program director: ${response.statusText}`);
  }

  return await response.json();
}

export async function createEventProgramDirectorServer(director: Omit<EventProgramDirectorsDTO, 'id' | 'createdAt' | 'updatedAt'>) {
  // Helper function to convert empty strings to null for URL fields
  const cleanUrlField = (value: string | undefined | null): string | null => {
    return (value && value.trim() !== '') ? value : null;
  };

  const currentTime = new Date().toISOString();
  const payload = withTenantId({
    ...director,
    createdAt: currentTime,
    updatedAt: currentTime,
    // Convert empty URL fields to null to satisfy database constraints
    photoUrl: cleanUrlField(director.photoUrl),
  });

  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-program-directors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create event program director: ${errorText}`);
  }

  return await response.json();
}

export async function updateEventProgramDirectorServer(id: number, director: Partial<EventProgramDirectorsDTO>) {
  // Helper function to convert empty strings to null for URL fields
  const cleanUrlField = (value: string | undefined | null): string | null => {
    return (value && value.trim() !== '') ? value : null;
  };

  const payload = withTenantId({
    ...director,
    id,
    // Convert empty URL fields to null to satisfy database constraints
    photoUrl: director.photoUrl ? cleanUrlField(director.photoUrl) : undefined,
  });

  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-program-directors/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update event program director: ${errorText}`);
  }

  return await response.json();
}

/**
 * Associate a program director with an event using the dedicated associate endpoint.
 * This is the proper way to associate a director with an event and avoids Hibernate ID change errors.
 */
export async function associateDirectorWithEventServer(directorId: number, eventId: number) {
  const response = await fetchWithJwtRetry(
    `${API_BASE_URL}/api/event-program-directors/${directorId}/associate/${eventId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to associate program director with event: ${errorText}`);
  }

  return await response.json();
}

/**
 * Disassociate a program director from an event (set event_id to null) using the dedicated disassociate endpoint.
 */
export async function disassociateDirectorFromEventServer(directorId: number) {
  const response = await fetchWithJwtRetry(
    `${API_BASE_URL}/api/event-program-directors/${directorId}/disassociate`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to disassociate program director from event: ${errorText}`);
  }

  return await response.json();
}

export async function deleteEventProgramDirectorServer(id: number) {
  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-program-directors/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete event program director: ${errorText}`);
  }

  return true;
}

// Get available program directors (not mapped to current event) with pagination and search
export async function fetchAvailableProgramDirectorsServer(eventId: number, page = 0, size = 20, searchTerm = '') {
  try {
    console.log('🔍 Fetching available program directors for event ID:', eventId, { page, size, searchTerm });

    // Step 1: Get all program directors assigned to the current event
    const assignedDirectors = await fetchEventProgramDirectorsServer(eventId);
    const assignedDirectorIds = new Set((Array.isArray(assignedDirectors) ? assignedDirectors : [assignedDirectors]).map((director: any) => director.id).filter(Boolean));
    console.log('🔍 Program director IDs assigned to current event:', Array.from(assignedDirectorIds));

    // Step 2: Get all tenant-level program directors (fetch without eventId filter)
    console.log('🔄 Fetching all tenant-level program directors...');
    let allDirectors: EventProgramDirectorsDTO[] = [];
    try {
      // Fetch all program directors for the tenant (no eventId filter)
      const params = new URLSearchParams();
      const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-program-directors?${params.toString()}`, {
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        allDirectors = Array.isArray(data) ? data : [data];
        console.log('✅ Fetched', allDirectors.length, 'total tenant-level program directors');
      } else {
        console.warn('⚠️ Failed to fetch all program directors:', response.status, response.statusText);
      }
    } catch (error) {
      console.warn('⚠️ Error fetching all program directors:', error instanceof Error ? error.message : String(error));
    }

    // Step 3: Filter out program directors that are assigned to the current event
    const availableDirectors = allDirectors.filter((director: any) =>
      !assignedDirectorIds.has(director.id)
    );

    console.log('🔍 Available program directors (not assigned to current event):', availableDirectors.length);

    // Step 4: Apply search filter if provided
    const filteredDirectors = searchTerm
      ? availableDirectors.filter((director: any) =>
          director.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          director.bio?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : availableDirectors;

    console.log('✅ Available program directors after search filtering:', filteredDirectors.length);

    // Step 5: Apply pagination to the filtered results
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedDirectors = filteredDirectors.slice(startIndex, endIndex);

    return {
      content: paginatedDirectors,
      totalElements: filteredDirectors.length,
      totalPages: Math.ceil(filteredDirectors.length / size),
      assignedCount: assignedDirectorIds.size,
      totalDirectors: allDirectors.length
    };
  } catch (error) {
    console.warn('❌ Error fetching available program directors:', error);
    return { content: [], totalElements: 0, totalPages: 0, assignedCount: 0, totalDirectors: 0 };
  }
}
