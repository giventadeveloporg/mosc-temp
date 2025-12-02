'use client';
import { EventDetailsDTO, EventTypeDetailsDTO, UserProfileDTO, EventCalendarEntryDTO } from '@/types';
import React, { useState, useEffect } from 'react';
import { EventList } from '@/components/EventList';
import { useAuth } from "@clerk/nextjs";
import { FaUsers, FaCalendarAlt, FaPlus, FaEnvelope, FaCreditCard } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminNavigation from '@/components/AdminNavigation';
import Image from 'next/image';
import DeleteConfirmationDialog, { type DeleteStatus } from '@/components/DeleteConfirmationDialog';
import {
  fetchEventsFilteredServer,
  fetchEventTypesServer,
  fetchCalendarEventsServer,
  cancelEventServer,
  deleteCalendarEventForEventServer,
  fetchChildEventsBySeriesIdServer,
  softDeleteEventWithChildrenServer,
  hardDeleteEventWithChildrenServer,
  activateEventWithChildrenServer,
} from './ApiServerActions';


export default function AdminPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<EventDetailsDTO[]>([]);
  const [eventTypes, setEventTypes] = useState<EventTypeDetailsDTO[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<EventCalendarEntryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;
  // Search/filter state
  const [searchTitle, setSearchTitle] = useState('');
  const [searchCaption, setSearchCaption] = useState('');
  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');
  const [searchAdmissionType, setSearchAdmissionType] = useState('');
  const [sort, setSort] = useState('startDate,asc');
  const [searchField, setSearchField] = useState<'title' | 'id' | 'caption'>('title');
  const [searchId, setSearchId] = useState('');
  const [showPastEvents, setShowPastEvents] = useState(false);
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<DeleteStatus>('idle');
  const [deleteMessage, setDeleteMessage] = useState<string>('');
  const [eventToDelete, setEventToDelete] = useState<EventDetailsDTO | null>(null);
  const [deleteMode, setDeleteMode] = useState<'soft' | 'hard'>('soft');
  const [childEventCount, setChildEventCount] = useState(0);

  // Activate confirmation dialog state
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [activateStatus, setActivateStatus] = useState<DeleteStatus>('idle');
  const [activateMessage, setActivateMessage] = useState<string>('');
  const [eventToActivate, setEventToActivate] = useState<EventDetailsDTO | null>(null);
  const [activateChildEventCount, setActivateChildEventCount] = useState(0);

  async function loadAll(pageNum = 0) {
    setLoading(true);
    setError(null);
    try {
      // Build date filtering based on toggle
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      const filterParams: any = {
        admissionType: searchAdmissionType,
        sort: showPastEvents ? 'startDate,desc' : 'startDate,asc', // Override sort based on toggle
        pageNum,
        pageSize,
      };

      // Apply date filtering based on toggle
      if (showPastEvents) {
        // Show events that ended before today
        filterParams.endDate = today;
      } else {
        // Show events that start today or later (future events including today)
        filterParams.startDate = today;
      }

      // Override with manual date filters if provided
      if (searchStartDate) filterParams.startDate = searchStartDate;
      if (searchEndDate) filterParams.endDate = searchEndDate;

      if (searchField === 'title') filterParams.title = searchTitle;
      else if (searchField === 'id') filterParams.id = searchId;
      else if (searchField === 'caption') filterParams.caption = searchCaption;
      const { events: eventsResult, totalCount: fetchedTotalCount } = await fetchEventsFilteredServer(filterParams);
      const types = await fetchEventTypesServer();
      const calendarEventsResult = await fetchCalendarEventsServer();
      setEvents(eventsResult);
      setTotalCount(fetchedTotalCount);
      setEventTypes(types);
      setCalendarEvents(calendarEventsResult);
    } catch (e: any) {
      setError(e.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTitle, searchId, searchCaption, searchField, searchStartDate, searchEndDate, searchAdmissionType, sort, showPastEvents]);

  async function handleDeleteClick(event: EventDetailsDTO, mode: 'soft' | 'hard' = 'soft') {
    setEventToDelete(event);
    setDeleteMode(mode);
    setDeleteStatus('confirming');

    // Check if this is a parent event (parentEventId is null/undefined)
    const isParentEvent = event.parentEventId == null || event.parentEventId === undefined;

    if (isParentEvent) {
      // Parent event: check how many children it has
      const seriesId = event.recurrenceSeriesId || event.id;
      if (seriesId) {
        try {
          const childEvents = await fetchChildEventsBySeriesIdServer(seriesId);
          // Exclude the parent event itself from the count
          const children = childEvents.filter(e => e.id !== event.id);
          setChildEventCount(children.length);
        } catch (err) {
          console.error('Failed to fetch child events:', err);
          setChildEventCount(0);
        }
      } else {
        setChildEventCount(0);
      }
    } else {
      // Child event: no children, only delete this one
      setChildEventCount(0);
    }

    setDeleteDialogOpen(true);
  }

  async function handleConfirmDelete() {
    if (!eventToDelete || !eventToDelete.id) {
      console.error('[handleConfirmDelete] No event to delete');
      return;
    }

    console.log(`[handleConfirmDelete] Starting ${deleteMode} delete for event ${eventToDelete.id}, parentEventId: ${eventToDelete.parentEventId}, childCount: ${childEventCount}`);

    setDeleteStatus('deleting');
    setDeleteMessage(
      deleteMode === 'hard'
        ? `Please wait while we permanently delete this event${childEventCount > 0 ? ` and ${childEventCount} child event${childEventCount !== 1 ? 's' : ''}` : ''}...`
        : `Please wait while we deactivate this event${childEventCount > 0 ? ` and ${childEventCount} child event${childEventCount !== 1 ? 's' : ''}` : ''}...`
    );

    try {
      setLoading(true);
      setError(null);

      if (deleteMode === 'hard') {
        console.log(`[handleConfirmDelete] Hard deleting event ${eventToDelete.id}`);
        await hardDeleteEventWithChildrenServer(eventToDelete);
        setDeleteStatus('success');
        setDeleteMessage(
          `The event${childEventCount > 0 ? ` and ${childEventCount} child event${childEventCount !== 1 ? 's' : ''} have` : ' has'} been permanently deleted.`
        );
      } else {
        // Soft delete: always use softDeleteEventWithChildrenServer (it handles parent/child logic internally)
        console.log(`[handleConfirmDelete] Soft deleting event ${eventToDelete.id}, isParent: ${eventToDelete.parentEventId == null}, childCount: ${childEventCount}`);
        await softDeleteEventWithChildrenServer(eventToDelete);
        setDeleteStatus('success');
        if (childEventCount > 0) {
          setDeleteMessage(
            `The event and ${childEventCount} child event${childEventCount !== 1 ? 's' : ''} have been marked as inactive successfully.`
          );
        } else {
          setDeleteMessage('The event has been marked as inactive successfully.');
        }
      }

      console.log(`[handleConfirmDelete] Successfully ${deleteMode === 'hard' ? 'deleted' : 'deactivated'} event ${eventToDelete.id}`);
      await loadAll(page);

      // Close dialog after 1.5 seconds
      setTimeout(() => {
        setDeleteDialogOpen(false);
        setDeleteStatus('idle');
        setEventToDelete(null);
        setChildEventCount(0);
      }, 1500);
    } catch (e: any) {
      console.error(`[handleConfirmDelete] Error ${deleteMode === 'hard' ? 'deleting' : 'deactivating'} event ${eventToDelete.id}:`, e);
      setDeleteStatus('error');
      setDeleteMessage(e.message || `Failed to ${deleteMode === 'hard' ? 'delete' : 'deactivate'} event. Please try again.`);
    } finally {
      setLoading(false);
    }
  }

  function handleCancelDelete() {
    setDeleteDialogOpen(false);
    setDeleteStatus('idle');
    setEventToDelete(null);
    setDeleteMessage('');
    setChildEventCount(0);
  }

  function handleCloseDeleteDialog() {
    setDeleteDialogOpen(false);
    setDeleteStatus('idle');
    setEventToDelete(null);
    setDeleteMessage('');
    setChildEventCount(0);
  }

  async function handleActivateClick(event: EventDetailsDTO) {
    setEventToActivate(event);
    setActivateStatus('confirming');

    // Check if this is a parent event (parentEventId is null/undefined)
    const isParentEvent = event.parentEventId == null || event.parentEventId === undefined;

    if (isParentEvent) {
      // Parent event: check how many children it has
      const seriesId = event.recurrenceSeriesId || event.id;
      if (seriesId) {
        try {
          const childEvents = await fetchChildEventsBySeriesIdServer(seriesId);
          // Exclude the parent event itself from the count
          const children = childEvents.filter(e => e.id !== event.id);
          setActivateChildEventCount(children.length);
        } catch (err) {
          console.error('Failed to fetch child events:', err);
          setActivateChildEventCount(0);
        }
      } else {
        setActivateChildEventCount(0);
      }
    } else {
      // Child event: no children, only activate this one
      setActivateChildEventCount(0);
    }

    setActivateDialogOpen(true);
  }

  async function handleConfirmActivate() {
    if (!eventToActivate || !eventToActivate.id) return;

    setActivateStatus('activating');
    setActivateMessage(
      activateChildEventCount > 0
        ? `Please wait while we activate this event and ${activateChildEventCount} child event${activateChildEventCount !== 1 ? 's' : ''}...`
        : 'Please wait while we activate this event...'
    );

    try {
      setLoading(true);
      setError(null);
      await activateEventWithChildrenServer(eventToActivate);
      setActivateStatus('success');
      setActivateMessage(
        activateChildEventCount > 0
          ? `The event and ${activateChildEventCount} child event${activateChildEventCount !== 1 ? 's' : ''} have been activated successfully.`
          : 'The event has been activated successfully.'
      );

      await loadAll(page);
      // Close dialog after 1.5 seconds
      setTimeout(() => {
        setActivateDialogOpen(false);
        setActivateStatus('idle');
        setEventToActivate(null);
        setActivateChildEventCount(0);
      }, 1500);
    } catch (e: any) {
      setActivateStatus('error');
      setActivateMessage(e.message || 'Failed to activate event. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleCancelActivate() {
    setActivateDialogOpen(false);
    setActivateStatus('idle');
    setEventToActivate(null);
    setActivateMessage('');
    setActivateChildEventCount(0);
  }

  function handleCloseActivateDialog() {
    setActivateDialogOpen(false);
    setActivateStatus('idle');
    setEventToActivate(null);
    setActivateMessage('');
    setActivateChildEventCount(0);
  }

  async function handleCancel(event: EventDetailsDTO) {
    // This function is kept for backward compatibility but should not be called directly
    // Use handleDeleteClick instead
    setLoading(true);
    setError(null);
    try {
      await cancelEventServer(event);
      try {
        await deleteCalendarEventForEventServer(event);
      } catch (calendarErr) {
        setError((prev) => (prev ? prev + '\\n' : '') + (calendarErr instanceof Error ? calendarErr.message : String(calendarErr)));
      }
      await loadAll(page);
    } catch (e: any) {
      setError(e.message || 'Failed to cancel event');
    } finally {
      setLoading(false);
    }
  }

  // Pagination controls
  function handlePrevPage() {
    setPage((p) => Math.max(0, p - 1));
  }
  function handleNextPage() {
    setPage((p) => p + 1);
  }

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Event Management</h1>
      <AdminNavigation />

      <div className="flex justify-end mb-6">
        <Link
          href="/admin/events/new"
          className="bg-blue-600 text-white px-4 py-2 rounded shadow font-bold flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <FaPlus />
          Create Event
        </Link>
      </div>
      {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4">{error}</div>}

      {/* Event Filter Toggle - Above Event List */}
      <div className="mb-4">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="flex justify-center items-center gap-4 mb-2">
            <span className={`text-lg font-medium ${!showPastEvents ? 'text-blue-600' : 'text-gray-500'}`}>
              Future Events
            </span>
            <button
              onClick={() => {
                setShowPastEvents(!showPastEvents);
                setPage(0); // Reset to first page when switching
              }}
              className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{ backgroundColor: showPastEvents ? '#3b82f6' : '#d1d5db' }}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${showPastEvents ? 'translate-x-7' : 'translate-x-1'
                  }`}
              />
            </button>
            <span className={`text-lg font-medium ${showPastEvents ? 'text-blue-600' : 'text-gray-500'}`}>
              Past Events
            </span>
          </div>

          {/* Filter Description */}
          <p className="text-gray-600 text-sm text-center">
            {showPastEvents
              ? 'Showing past events (events that have already ended)'
              : 'Showing future events (including events happening today)'
            }
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          {showPastEvents ? 'Past Events' : 'Future Events'}
        </h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <EventList
            events={events}
            eventTypes={eventTypes}
            calendarEvents={calendarEvents}
            onEdit={event => router.push(`/admin/events/${event.id}/edit`)}
            onCancel={(event) => handleDeleteClick(event, 'soft')}
            onHardDelete={(event) => handleDeleteClick(event, 'hard')}
            onActivate={(event) => handleActivateClick(event)}
            loading={loading}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            page={page + 1}
            totalCount={totalCount}
            pageSize={pageSize}
            boldEventIdLabel={true}
            showDetailsOnHover={true}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        status={deleteStatus}
        eventTitle={eventToDelete?.title}
        isRecurring={eventToDelete?.isRecurring || false}
        hasChildren={childEventCount > 0}
        childCount={childEventCount}
        deleteMode={deleteMode}
        message={deleteMessage}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        onClose={handleCloseDeleteDialog}
      />

      {/* Activate Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={activateDialogOpen}
        status={activateStatus}
        eventTitle={eventToActivate?.title}
        isRecurring={eventToActivate?.isRecurring || false}
        hasChildren={activateChildEventCount > 0}
        childCount={activateChildEventCount}
        deleteMode="activate"
        message={activateMessage}
        onConfirm={handleConfirmActivate}
        onCancel={handleCancelActivate}
        onClose={handleCloseActivateDialog}
      />
    </div>
  );
}