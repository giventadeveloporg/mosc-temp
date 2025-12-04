'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EventForm, defaultEvent } from '@/components/EventForm';
import type { EventDetailsDTO, EventTypeDetailsDTO, UserProfileDTO } from '@/types';
import Link from 'next/link';
import { FaUsers, FaPhotoVideo, FaCalendarAlt } from 'react-icons/fa';
import { createCalendarEventServer } from '../../ApiServerActions';
import { useAuth, useUser } from '@clerk/nextjs';
import SaveStatusDialog, { type SaveStatus } from '@/components/SaveStatusDialog';

export default function CreateEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const copyFromId = searchParams?.get('copyFrom');
  const [eventTypes, setEventTypes] = useState<EventTypeDetailsDTO[]>([]);
  const [initialEvent, setInitialEvent] = useState<EventDetailsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const { userId } = useAuth();
  const { user } = useUser();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveMessage, setSaveMessage] = useState<string>('');

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
          // Error is handled silently - user can still create a new event
        });
    }
  }, [copyFromId]);

  async function handleSubmit(event: EventDetailsDTO) {
    setLoading(true);
    setSaveStatus('saving');
    setSaveMessage('Please wait while we create your event...');

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

      if (!res.ok) {
        let errorMessage = 'Failed to create event';
        try {
          const errorText = await res.text();
          // Try to parse as JSON (JHipster error format)
          try {
            const errorJson = JSON.parse(errorText);
            // Extract meaningful error message
            if (errorJson.detail) {
              // Parse JHipster error detail
              const detail = errorJson.detail;
              if (detail.includes('Unable to bind parameter')) {
                errorMessage = 'Invalid data format. Please check all fields and try again.';
              } else if (detail.includes('null') && detail.includes('Unknown Types value')) {
                errorMessage = 'Some required fields are missing or invalid. Please review your event configuration and try again.';
              } else if (detail.includes('recurrence_weekly_days') && detail.includes('integer[]')) {
                errorMessage = 'Recurrence configuration error. Please check your recurrence settings and try again.';
              } else if (detail.includes('could not execute batch')) {
                errorMessage = 'Database error occurred while saving. Please check all fields and try again.';
              } else {
                // Use detail but truncate if too long
                errorMessage = detail.length > 150 ? detail.substring(0, 150) + '...' : detail;
              }
            } else if (errorJson.message) {
              errorMessage = errorJson.message;
            } else if (errorJson.title) {
              errorMessage = errorJson.title;
            }
          } catch {
            // Not JSON, use text as-is but make it more concise
            if (errorText.length > 200) {
              errorMessage = errorText.substring(0, 200) + '...';
            } else {
              errorMessage = errorText;
            }
          }
        } catch {
          errorMessage = 'Failed to create event. Please try again.';
        }
        throw new Error(errorMessage);
      }

      const newEvent = await res.json();
      let userProfile: UserProfileDTO | null = null;
      if (userId) {
        const profileRes = await fetch(`/api/proxy/user-profiles/by-user/${userId}`);
        if (profileRes.ok) {
          userProfile = await profileRes.json();
        }
      }

      // Try to create calendar event (non-blocking)
      try {
        if (userProfile) {
          await createCalendarEventServer(newEvent, userProfile);
        }
      } catch (calendarErr: any) {
        // Calendar error is non-critical, just log it
        console.warn('Calendar event creation failed:', calendarErr);
      }

      // Show success message
      setSaveStatus('success');
      setSaveMessage('Your event has been created successfully. Redirecting to manage events...');

      // Redirect after a brief delay
      setTimeout(() => {
        router.push('/admin/manage-events');
      }, 1500);
    } catch (e: any) {
      setSaveStatus('error');
      const userMessage = e.message || 'Failed to create event. Please try again.';
      setSaveMessage(userMessage);
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
      <div className="border rounded p-4 bg-white shadow-sm min-h-[200px]">
        <EventForm
          event={initialEvent || defaultEvent}
          eventTypes={eventTypes}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>

      {/* Save Status Dialog */}
      <SaveStatusDialog
        isOpen={saveStatus !== 'idle'}
        status={saveStatus}
        message={saveMessage}
        onClose={() => {
          if (saveStatus === 'error') {
            setSaveStatus('idle');
            setSaveMessage('');
          }
        }}
      />
    </div>
  );
}