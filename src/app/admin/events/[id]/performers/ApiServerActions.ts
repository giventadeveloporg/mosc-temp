import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { EventFeaturedPerformersDTO } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const baseUrl = getAppUrl();

export async function fetchEventFeaturedPerformersServer(eventId: number) {
  const params = new URLSearchParams();
  params.append('eventId.equals', eventId.toString());

  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-featured-performers?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event featured performers: ${response.statusText}`);
  }

  return await response.json();
}

export async function fetchEventFeaturedPerformerServer(id: number) {
  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-featured-performers/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event featured performer: ${response.statusText}`);
  }

  return await response.json();
}

export async function createEventFeaturedPerformerServer(performer: Omit<EventFeaturedPerformersDTO, 'id' | 'createdAt' | 'updatedAt'>) {
  // Ensure performanceDurationMinutes is at least 1 (backend validation requirement)
  const currentTime = new Date().toISOString();

  // Helper function to convert empty strings to null for URL fields
  const cleanUrlField = (value: string | undefined | null): string | null => {
    return (value && value.trim() !== '') ? value : null;
  };

  const payload = withTenantId({
    ...performer,
    createdAt: currentTime,
    updatedAt: currentTime,
    performanceDurationMinutes: Math.max(1, performer.performanceDurationMinutes || 1),
    // Convert empty URL fields to null to satisfy database constraints
    facebookUrl: cleanUrlField(performer.facebookUrl),
    twitterUrl: cleanUrlField(performer.twitterUrl),
    instagramUrl: cleanUrlField(performer.instagramUrl),
    youtubeUrl: cleanUrlField(performer.youtubeUrl),
    linkedinUrl: cleanUrlField(performer.linkedinUrl),
    tiktokUrl: cleanUrlField(performer.tiktokUrl),
    websiteUrl: cleanUrlField(performer.websiteUrl),
    portraitImageUrl: cleanUrlField(performer.portraitImageUrl),
    performanceImageUrl: cleanUrlField(performer.performanceImageUrl),
    galleryImageUrls: cleanUrlField(performer.galleryImageUrls),
  });

  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-featured-performers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create event featured performer: ${errorText}`);
  }

  return await response.json();
}

export async function updateEventFeaturedPerformerServer(id: number, performer: Partial<EventFeaturedPerformersDTO>) {
  // Helper function to convert empty strings to null for URL fields
  const cleanUrlField = (value: string | undefined | null): string | null => {
    return (value && value.trim() !== '') ? value : null;
  };

  const payload = withTenantId({
    ...performer,
    id,
    // Convert empty URL fields to null to satisfy database constraints
    facebookUrl: performer.facebookUrl ? cleanUrlField(performer.facebookUrl) : undefined,
    twitterUrl: performer.twitterUrl ? cleanUrlField(performer.twitterUrl) : undefined,
    instagramUrl: performer.instagramUrl ? cleanUrlField(performer.instagramUrl) : undefined,
    youtubeUrl: performer.youtubeUrl ? cleanUrlField(performer.youtubeUrl) : undefined,
    linkedinUrl: performer.linkedinUrl ? cleanUrlField(performer.linkedinUrl) : undefined,
    tiktokUrl: performer.tiktokUrl ? cleanUrlField(performer.tiktokUrl) : undefined,
    websiteUrl: performer.websiteUrl ? cleanUrlField(performer.websiteUrl) : undefined,
    portraitImageUrl: performer.portraitImageUrl ? cleanUrlField(performer.portraitImageUrl) : undefined,
    performanceImageUrl: performer.performanceImageUrl ? cleanUrlField(performer.performanceImageUrl) : undefined,
    galleryImageUrls: performer.galleryImageUrls ? cleanUrlField(performer.galleryImageUrls) : undefined,
  });

  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-featured-performers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update event featured performer: ${errorText}`);
  }

  return await response.json();
}

/**
 * Associate a performer with an event using the dedicated associate endpoint.
 * This is the proper way to associate a performer with an event and avoids Hibernate ID change errors.
 */
export async function associatePerformerWithEventServer(performerId: number, eventId: number) {
  const response = await fetchWithJwtRetry(
    `${API_BASE_URL}/api/event-featured-performers/${performerId}/associate/${eventId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to associate performer with event: ${errorText}`);
  }

  return await response.json();
}

/**
 * Disassociate a performer from an event (set event_id to null) using the dedicated disassociate endpoint.
 */
export async function disassociatePerformerFromEventServer(performerId: number) {
  const response = await fetchWithJwtRetry(
    `${API_BASE_URL}/api/event-featured-performers/${performerId}/disassociate`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to disassociate performer from event: ${errorText}`);
  }

  return await response.json();
}

export async function deleteEventFeaturedPerformerServer(id: number) {
  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-featured-performers/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete event featured performer: ${errorText}`);
  }

  return true;
}

// Get available performers (not mapped to current event) with pagination and search
export async function fetchAvailablePerformersServer(eventId: number, page = 0, size = 20, searchTerm = '') {
  try {
    console.log('🔍 Fetching available performers for event ID:', eventId, { page, size, searchTerm });

    // Step 1: Get all performers assigned to the current event
    const assignedPerformers = await fetchEventFeaturedPerformersServer(eventId);
    const assignedPerformerIds = new Set((Array.isArray(assignedPerformers) ? assignedPerformers : [assignedPerformers]).map((performer: any) => performer.id).filter(Boolean));
    console.log('🔍 Performer IDs assigned to current event:', Array.from(assignedPerformerIds));

    // Step 2: Get all tenant-level performers (fetch without eventId filter)
    console.log('🔄 Fetching all tenant-level performers...');
    let allPerformers: EventFeaturedPerformersDTO[] = [];
    try {
      // Fetch all performers for the tenant (no eventId filter)
      const params = new URLSearchParams();
      const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-featured-performers?${params.toString()}`, {
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        allPerformers = Array.isArray(data) ? data : [data];
        console.log('✅ Fetched', allPerformers.length, 'total tenant-level performers');
      } else {
        console.warn('⚠️ Failed to fetch all performers:', response.status, response.statusText);
      }
    } catch (error) {
      console.warn('⚠️ Error fetching all performers:', error instanceof Error ? error.message : String(error));
    }

    // Step 3: Filter out performers that are assigned to the current event
    const availablePerformers = allPerformers.filter((performer: any) =>
      !assignedPerformerIds.has(performer.id)
    );

    console.log('🔍 Available performers (not assigned to current event):', availablePerformers.length);

    // Step 4: Apply search filter if provided
    const filteredPerformers = searchTerm
      ? availablePerformers.filter((performer: any) =>
          performer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          performer.stageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          performer.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          performer.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : availablePerformers;

    console.log('✅ Available performers after search filtering:', filteredPerformers.length);

    // Step 5: Apply pagination to the filtered results
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedPerformers = filteredPerformers.slice(startIndex, endIndex);

    return {
      content: paginatedPerformers,
      totalElements: filteredPerformers.length,
      totalPages: Math.ceil(filteredPerformers.length / size),
      assignedCount: assignedPerformerIds.size,
      totalPerformers: allPerformers.length
    };
  } catch (error) {
    console.warn('❌ Error fetching available performers:', error);
    return { content: [], totalElements: 0, totalPages: 0, assignedCount: 0, totalPerformers: 0 };
  }
}