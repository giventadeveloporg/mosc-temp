'use client';
import { EventDetailsDTO, EventTypeDetailsDTO, UserProfileDTO, EventCalendarEntryDTO } from '@/types';
import React, { useState, useEffect } from 'react';
import { EventList } from '@/components/EventList';
import { useAuth } from "@clerk/nextjs";
import { FaUsers, FaCalendarAlt, FaPlus, FaEnvelope, FaCreditCard, FaArrowLeft } from 'react-icons/fa';
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
} from '../ApiServerActions';

export default function ManageEventsPage() {
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

      // Add search filters based on selected field
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
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userId) {
      loadAll(page);
    }
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
          console.log(`[handleDeleteClick] Fetched events for series ${seriesId}:`, childEvents.map(e => ({ id: e.id, parentEventId: e.parentEventId, isActive: e.isActive })));
          // Exclude the parent event itself from the count
          // Also filter to only count active child events (children with parentEventId set)
          const children = childEvents.filter(e =>
            e.id !== event.id &&
            e.parentEventId != null &&
            e.parentEventId === event.id
          );
          console.log(`[handleDeleteClick] Filtered children (excluding parent ${event.id}):`, children.map(e => ({ id: e.id, parentEventId: e.parentEventId })));
          console.log(`[handleDeleteClick] Child count: ${children.length}`);
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
    console.log('[handleConfirmDelete] Function called', { eventToDelete, deleteMode, childEventCount });

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

  async function handleCancelEvent(eventId: number) {
    // This function is kept for backward compatibility but should not be called directly
    // Use handleDeleteClick instead
    try {
      setLoading(true);
      await cancelEventServer(eventId);
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
      {/* Header with back button */}
      <div className="flex items-center mb-8">
        <Link
          href="/admin"
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
        >
          <FaArrowLeft className="mr-2" />
          Back to Admin
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Events</h1>
          <p className="text-gray-600">
            Create, edit, and manage all events in the system.
          </p>
        </div>
      </div>

      {/* Admin Navigation */}
      <AdminNavigation currentPage="manage-events" />

      {/* Create Event Button - Matching admin homepage style */}
      <div className="flex justify-end mb-6">
        <Link
          href="/admin/events/new"
          className="bg-blue-600 text-white px-4 py-2 rounded shadow font-bold flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <FaPlus />
          Create Event
        </Link>
      </div>

      {/* Quick Action Buttons */}
      <div className="w-full overflow-x-auto mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-items-center mx-auto">
          <Link href="/admin/events/new" className="w-48 max-w-xs mx-auto flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-md shadow p-1 sm:p-2 text-xs sm:text-xs transition-all">
            <FaPlus className="text-base sm:text-lg mb-1 mx-auto" />
            <span className="font-semibold text-center leading-tight">Create New<br />Event</span>
          </Link>
          <Link href="/admin/event-analytics" className="w-48 max-w-xs mx-auto flex flex-col items-center justify-center bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-md shadow p-1 sm:p-2 text-xs sm:text-xs transition-all">
            <FaCalendarAlt className="text-base sm:text-lg mb-1 mx-auto" />
            <span className="font-semibold text-center leading-tight">Event Analytics<br />Dashboard</span>
          </Link>
          <Link href="/admin/manage-usage" className="w-48 max-w-xs mx-auto flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-md shadow p-1 sm:p-2 text-xs sm:text-xs transition-all">
            <FaUsers className="text-base sm:text-lg mb-1 mx-auto" />
            <span className="font-semibold text-center leading-tight">Manage Usage<br />[Users]</span>
          </Link>
          <Link href="/admin/communication" className="w-48 max-w-xs mx-auto flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 text-green-800 rounded-md shadow p-1 sm:p-2 text-xs sm:text-xs transition-all">
            <FaEnvelope className="text-base sm:text-lg mb-1 mx-auto" />
            <span className="font-semibold text-center leading-tight">Communication<br />Center</span>
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="text-lg font-semibold text-blue-800 mb-4">Search Events</div>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold mb-1">Search By</label>
              <select className="border px-3 py-2 rounded w-40" value={searchField} onChange={e => setSearchField(e.target.value as 'title' | 'id' | 'caption')}>
                <option value="title">Title</option>
                <option value="id">ID</option>
                <option value="caption">Caption</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">{searchField === 'id' ? 'Event ID' : searchField.charAt(0).toUpperCase() + searchField.slice(1)}</label>
              <input
                type={searchField === 'id' ? 'number' : 'text'}
                className="border px-3 py-2 rounded w-48"
                value={searchField === 'title' ? searchTitle : searchField === 'id' ? searchId : searchCaption}
                onChange={e => {
                  if (searchField === 'title') setSearchTitle(e.target.value);
                  else if (searchField === 'id') setSearchId(e.target.value);
                  else setSearchCaption(e.target.value);
                }}
                placeholder={`Search by ${searchField}`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Start Date</label>
              <input type="date" className="border px-3 py-2 rounded" value={searchStartDate} onChange={e => setSearchStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">End Date</label>
              <input type="date" className="border px-3 py-2 rounded" value={searchEndDate} onChange={e => setSearchEndDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Admission</label>
              <select className="border px-3 py-2 rounded w-32" value={searchAdmissionType} onChange={e => setSearchAdmissionType(e.target.value)}>
                <option value="">All</option>
                <option value="Free">Free</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Sort</label>
              <select className="border px-3 py-2 rounded w-40" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="startDate,asc">Date (Earliest)</option>
                <option value="startDate,desc">Date (Latest)</option>
                <option value="title,asc">Title (A-Z)</option>
                <option value="title,desc">Title (Z-A)</option>
                <option value="id,desc">ID (Newest)</option>
                <option value="id,asc">ID (Oldest)</option>
              </select>
            </div>
          </div>

          {/* Event Filter Toggle */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <span className={`text-lg font-medium ${!showPastEvents ? 'text-blue-600' : 'text-gray-500'}`}>
              Future Events
            </span>
            <button
              onClick={() => setShowPastEvents(!showPastEvents)}
              className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{ backgroundColor: showPastEvents ? '#3b82f6' : '#d1d5db' }}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${showPastEvents ? 'translate-x-7' : 'translate-x-1'}`}
              />
            </button>
            <span className={`text-lg font-medium ${showPastEvents ? 'text-blue-600' : 'text-gray-500'}`}>
              Past Events
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <EventList
        events={events}
        eventTypes={eventTypes}
        calendarEvents={calendarEvents}
        loading={loading}
        onCancel={(event) => handleDeleteClick(event, 'soft')}
        onHardDelete={(event) => handleDeleteClick(event, 'hard')}
        onActivate={(event) => handleActivateClick(event)}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        page={page}
        totalCount={totalCount}
        pageSize={pageSize}
        showPastEvents={showPastEvents}
      />

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
        onConfirm={async () => {
          console.log('[ManageEventsPage] onConfirm callback called, calling handleConfirmDelete');
          try {
            await handleConfirmDelete();
            console.log('[ManageEventsPage] handleConfirmDelete completed');
          } catch (err) {
            console.error('[ManageEventsPage] Error in handleConfirmDelete:', err);
          }
        }}
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

