'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EventForm, defaultEvent } from '@/components/EventForm';
import type { EventDetailsDTO, EventTypeDetailsDTO, UserProfileDTO } from '@/types';
import Link from 'next/link';
import { FaUsers, FaPhotoVideo, FaCalendarAlt } from 'react-icons/fa';
import { createCalendarEventServer } from '../../ApiServerActions';
import { useAuth, useUser } from '@clerk/nextjs';

export default function CreateEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const copyFromId = searchParams?.get('copyFrom');
  const [eventTypes, setEventTypes] = useState<EventTypeDetailsDTO[]>([]);
  const [initialEvent, setInitialEvent] = useState<EventDetailsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    fetch('/api/proxy/event-type-details')
      .then(res => res.ok ? res.json() : [])
      .then(data => setEventTypes(Array.isArray(data) ? data : []));
  }, []);

  // Fetch event to copy if copyFromId is provided
  useEffect(() => {
    if (copyFromId) {
      fetch(`/api/proxy/event-details/${copyFromId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch event');
          return res.json();
        })
        .then((event: EventDetailsDTO) => {
          // Create a copy of the event with updated dates
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          // Format dates as YYYY-MM-DD (EventForm expects this format internally)
          const formatDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };

          const copiedEvent: EventDetailsDTO = {
            ...event,
            id: undefined, // Remove ID so it's treated as a new event
            title: event.title ? `${event.title} (Copy)` : '',
            startDate: formatDate(today), // YYYY-MM-DD format - EventForm will convert to MM/DD/YYYY for display
            endDate: formatDate(tomorrow), // YYYY-MM-DD format - EventForm will convert to MM/DD/YYYY for display
            createdAt: '',
            updatedAt: '',
            createdBy: undefined,
          };

          setInitialEvent(copiedEvent);
        })
        .catch(err => {
          console.error('Error fetching event to copy:', err);
          setError('Failed to load event to copy');
        });
    }
  }, [copyFromId]);

  async function handleSubmit(event: EventDetailsDTO) {
    setLoading(true);
    setError(null);
    try {
      const now = new Date().toISOString();
      const eventToSend = {
        ...event,
        createdAt: now,
        updatedAt: now,
      };
      const res = await fetch('/api/proxy/event-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventToSend),
      });
      if (!res.ok) throw new Error('Failed to create event');
      const newEvent = await res.json();
      let userProfile: UserProfileDTO | null = null;
      if (userId) {
        const profileRes = await fetch(`/api/proxy/user-profiles/by-user/${userId}`);
        if (profileRes.ok) {
          userProfile = await profileRes.json();
        }
      }
      try {
        if (userProfile) {
          await createCalendarEventServer(newEvent, userProfile);
        }
      } catch (calendarErr: any) {
        setError('Event created, but failed to create calendar entry: ' + (calendarErr?.message || 'Unknown error'));
      }
      router.push('/admin');
    } catch (e: any) {
      setError(e.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-[80%] max-w-5xl mx-auto p-4" style={{ paddingTop: '118px' }}>
      {/* Dashboard Card with Grid Buttons */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full">
          <div className="flex justify-center gap-8">
            <Link href="/admin/manage-usage" className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg shadow-sm px-4 py-4 transition font-semibold text-sm">
              <FaUsers className="mb-2 text-2xl" />
              <span>Manage Usage</span>
              <span className="text-xs text-blue-500 mt-1">[Users]</span>
            </Link>
            <Link href="/admin" className="flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 text-green-700 rounded-lg shadow-sm px-4 py-4 transition font-semibold text-sm">
              <FaCalendarAlt className="mb-2 text-2xl" />
              Manage Events
            </Link>
          </div>
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-4">
        {copyFromId ? 'Create Event (Copy)' : 'Create Event'}
      </h1>
      {copyFromId && initialEvent && (
        <div className="bg-blue-50 text-blue-800 p-3 rounded mb-4 border border-blue-200">
          <p className="text-sm">
            <strong>Copying from Event ID {copyFromId}:</strong> All fields have been pre-populated.
            Start date set to today and end date set to tomorrow. Please review and update as needed.
          </p>
        </div>
      )}
      {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4">{error}</div>}
      <div className="border rounded p-4 bg-white shadow-sm min-h-[200px]">
        <EventForm
          event={initialEvent || defaultEvent}
          eventTypes={eventTypes}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
}