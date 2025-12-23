'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaArrowLeft, FaChevronLeft, FaChevronRight, FaEdit, FaTrashAlt, FaUpload, FaImages, FaUnlink, FaHome, FaUsers, FaCalendarAlt, FaPhotoVideo, FaTags, FaTicketAlt, FaPercent } from 'react-icons/fa';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import ImageUpload from '@/components/ui/ImageUpload';
import type { EventProgramDirectorsDTO, EventDetailsDTO } from '@/types';
import {
  fetchEventProgramDirectorsServer,
  createEventProgramDirectorServer,
  updateEventProgramDirectorServer,
  deleteEventProgramDirectorServer,
  associateDirectorWithEventServer,
  disassociateDirectorFromEventServer,
  fetchAvailableProgramDirectorsServer,
} from './ApiServerActions';
import EventDirectorPosterUploadDialog from '@/components/directors/EventDirectorPosterUploadDialog';
import EventDirectorMediaGallery from '@/components/directors/EventDirectorMediaGallery';

export default function EventProgramDirectorsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<EventDetailsDTO | null>(null);
  const [programDirectors, setProgramDirectors] = useState<EventProgramDirectorsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDisassociateModalOpen, setIsDisassociateModalOpen] = useState(false);
  const [selectedDirector, setSelectedDirector] = useState<EventProgramDirectorsDTO | null>(null);
  const [selectedDirectorForPoster, setSelectedDirectorForPoster] = useState<{ eventId: number; directorId: number; currentPosterUrl?: string } | null>(null);
  const [posterUploadOpen, setPosterUploadOpen] = useState(false);
  const [selectedDirectorForMedia, setSelectedDirectorForMedia] = useState<{ eventId: number; directorId: number } | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<EventProgramDirectorsDTO>>({
    name: '',
    photoUrl: '',
    bio: '',
    event: { id: parseInt(eventId) } as EventDetailsDTO,
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Available program directors state (tenant-level directors not mapped to this event)
  const [availableDirectors, setAvailableDirectors] = useState<EventProgramDirectorsDTO[]>([]);
  const [availableDirectorsPage, setAvailableDirectorsPage] = useState(0);
  const [availableDirectorsTotalPages, setAvailableDirectorsTotalPages] = useState(0);
  const [availableDirectorsTotalElements, setAvailableDirectorsTotalElements] = useState(0);
  const [availableDirectorsSearchTerm, setAvailableDirectorsSearchTerm] = useState('');

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (userId && eventId) {
      loadEventAndProgramDirectors();
      loadAvailableDirectors(0, '');
    }
  }, [userId, eventId]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const loadEventAndProgramDirectors = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load event details
      const eventResponse = await fetch(`/api/proxy/event-details/${eventId}`);
      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        setEvent(eventData);
      }

      // Load program directors for this event
      const directorsData = await fetchEventProgramDirectorsServer(parseInt(eventId));
      setProgramDirectors(directorsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load event program directors');
      setToastMessage({ type: 'error', message: err.message || 'Failed to load event program directors' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);

      // Check for duplicates before creating
      const isDuplicate = programDirectors.some(
        (d) =>
          formData.name && d.name && d.name.toLowerCase() === formData.name.toLowerCase()
      );

      if (isDuplicate) {
        setToastMessage({
          type: 'error',
          message: 'A program director with this name is already associated with this event. Duplicate entries are not allowed.'
        });
        return;
      }

      const directorData = { ...formData, event: { id: parseInt(eventId) } as EventDetailsDTO };
      const newDirector = await createEventProgramDirectorServer(directorData as any);
      setProgramDirectors(prev => [...prev, newDirector]);
      setIsCreateModalOpen(false);
      resetForm();
      // Reload event program directors to get fresh data
      await loadEventAndProgramDirectors();
      // Reload available directors in case it should be removed from available list
      await loadAvailableDirectors(availableDirectorsPage, availableDirectorsSearchTerm);
      setToastMessage({ type: 'success', message: 'Program director created successfully' });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create program director';
      // Check if error is due to duplicate constraint
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        setToastMessage({
          type: 'error',
          message: 'A program director with this name is already associated with this event. Duplicate entries are not allowed.'
        });
      } else {
        setToastMessage({ type: 'error', message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedDirector) return;

    try {
      setLoading(true);
      const updatedDirector = await updateEventProgramDirectorServer(selectedDirector.id!, formData);
      setProgramDirectors(prev => prev.map(d => d.id === selectedDirector.id ? updatedDirector : d));
      setIsEditModalOpen(false);
      setSelectedDirector(null);
      resetForm();
      setToastMessage({ type: 'success', message: 'Program director updated successfully' });
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to update program director' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisassociate = async () => {
    if (!selectedDirector) return;

    try {
      setLoading(true);
      // Use the dedicated disassociate endpoint
      await disassociateDirectorFromEventServer(selectedDirector.id!);
      setProgramDirectors(prev => prev.filter(d => d.id !== selectedDirector.id));
      setIsDisassociateModalOpen(false);
      setSelectedDirector(null);
      // Reload event program directors to get fresh data
      await loadEventAndProgramDirectors();
      // Reload available directors in case this director should now appear
      await loadAvailableDirectors(availableDirectorsPage, availableDirectorsSearchTerm);
      setToastMessage({ type: 'success', message: 'Program director disassociated from event successfully' });
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to disassociate program director' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDirector) return;

    try {
      setLoading(true);
      await deleteEventProgramDirectorServer(selectedDirector.id!);
      setProgramDirectors(prev => prev.filter(d => d.id !== selectedDirector.id));
      setIsDeleteModalOpen(false);
      setSelectedDirector(null);
      // Reload event program directors to get fresh data
      await loadEventAndProgramDirectors();
      // Reload available directors in case this director should now appear
      await loadAvailableDirectors(availableDirectorsPage, availableDirectorsSearchTerm);
      setToastMessage({ type: 'success', message: 'Program director permanently deleted' });
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to delete program director' });
    } finally {
      setLoading(false);
    }
  };

  // Load available program directors with pagination and search
  const loadAvailableDirectors = async (page = 0, searchTerm = '') => {
    try {
      setLoading(true);
      console.log('🔄 Loading available program directors for event:', eventId, 'page:', page, 'search:', searchTerm);
      const availableDirectorsData = await fetchAvailableProgramDirectorsServer(
        parseInt(eventId),
        page,
        20, // Page size 20 as per UI style guide
        searchTerm
      );
      console.log('📊 Available program directors data received:', availableDirectorsData);
      setAvailableDirectors(availableDirectorsData.content);
      setAvailableDirectorsTotalPages(availableDirectorsData.totalPages);
      setAvailableDirectorsTotalElements(availableDirectorsData.totalElements);
    } catch (err: any) {
      console.error('Failed to load available program directors:', err);
      setAvailableDirectors([]);
      setAvailableDirectorsTotalPages(0);
      setAvailableDirectorsTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle search for available program directors
  const handleAvailableDirectorsSearch = (searchTerm: string) => {
    setAvailableDirectorsSearchTerm(searchTerm);
    setAvailableDirectorsPage(0);
    loadAvailableDirectors(0, searchTerm);
  };

  // Handle pagination for available program directors
  const handleAvailableDirectorsPageChange = (page: number) => {
    setAvailableDirectorsPage(page);
    loadAvailableDirectors(page, availableDirectorsSearchTerm);
  };

  // Handle adding an available program director to this event
  const handleAddDirectorToEvent = async (director: EventProgramDirectorsDTO) => {
    try {
      setLoading(true);
      console.log('➕ Adding program director to event:', director);

      // Check if director is already associated with this event
      const isAlreadyAssociated = programDirectors.some(
        (d) => d.id === director.id ||
        (d.name && director.name && d.name.toLowerCase() === director.name.toLowerCase())
      );

      if (isAlreadyAssociated) {
        setToastMessage({
          type: 'error',
          message: `Program director "${director.name}" is already associated with this event. Duplicate entries are not allowed.`
        });
        return;
      }

      // Update the existing director to associate with this event (don't create duplicate)
      if (!director.id) {
        setToastMessage({
          type: 'error',
          message: `Cannot add program director "${director.name}" - director ID is missing.`
        });
        return;
      }

      // Use the dedicated associate endpoint to properly associate the director with the event
      console.log('🔄 Associating program director', director.id, 'with event', eventId);
      await associateDirectorWithEventServer(director.id, parseInt(eventId));

      // Reload event program directors to get fresh data from database
      await loadEventAndProgramDirectors();
      // Reload available directors to remove the added one
      await loadAvailableDirectors(availableDirectorsPage, availableDirectorsSearchTerm);

      setToastMessage({ type: 'success', message: `Program director "${director.name}" added to event successfully` });
    } catch (err: any) {
      console.error('❌ Failed to add program director to event:', err);
      // Check if error is due to duplicate constraint
      const errorMessage = err.message || 'Failed to add program director to event';
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        setToastMessage({
          type: 'error',
          message: `Program director "${director.name}" is already associated with this event. Duplicate entries are not allowed.`
        });
      } else {
        setToastMessage({ type: 'error', message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      photoUrl: '',
      bio: '',
      event: { id: parseInt(eventId) } as EventDetailsDTO,
    });
  };

  const openEditModal = (director: EventProgramDirectorsDTO) => {
    setSelectedDirector(director);
    setFormData(director);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (director: EventProgramDirectorsDTO) => {
    setSelectedDirector(director);
    setIsDeleteModalOpen(true);
  };

  const openDisassociateModal = (director: EventProgramDirectorsDTO) => {
    setSelectedDirector(director);
    setIsDisassociateModalOpen(true);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);

    const sorted = [...programDirectors].sort((a, b) => {
      const aVal = a[key as keyof EventProgramDirectorsDTO];
      const bVal = b[key as keyof EventProgramDirectorsDTO];

      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setProgramDirectors(sorted);
  };

  const filteredDirectors = programDirectors.filter(director =>
    director.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    director.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<EventProgramDirectorsDTO>[] = [
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'bio',
      label: 'Bio',
      render: (value) => value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : '-'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, director) => {
        const directorId = director?.id;
        const eventIdNum = parseInt(eventId);
        const currentPosterUrl = director?.photoUrl; // Use photoUrl as current poster URL

        return (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(director);
              }}
              className="icon-btn icon-btn-edit bg-blue-700 hover:bg-blue-800 text-white p-4 shadow-lg"
              title="Edit director details"
            >
              <FaEdit className="text-xl text-white" />
            </button>
            {directorId && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDirectorForPoster({
                      eventId: eventIdNum,
                      directorId,
                      currentPosterUrl,
                    });
                    setPosterUploadOpen(true);
                  }}
                  className="icon-btn bg-blue-500 hover:bg-blue-600 text-white p-4"
                  title="Upload banners in this particular event for this director"
                >
                  <FaUpload className="text-xl" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDirectorForMedia({
                      eventId: eventIdNum,
                      directorId,
                    });
                  }}
                  className="icon-btn bg-purple-500 hover:bg-purple-600 text-white p-4"
                  title="View all the media files associated with this director"
                >
                  <FaImages className="text-xl" />
                </button>
              </>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openDisassociateModal(director);
              }}
              className="icon-btn icon-btn-delete bg-yellow-500 hover:bg-yellow-600 text-white p-4"
              title="Disassociate this director with this event"
            >
              <FaUnlink className="text-xl" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openDeleteModal(director);
              }}
              className="icon-btn icon-btn-delete bg-red-700 hover:bg-red-800 text-white p-4 shadow-lg"
              title="Permanently delete this director"
            >
              <FaTrashAlt className="text-xl text-white" />
            </button>
          </div>
        );
      }
    },
  ];

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!eventId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Event ID not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '180px' }}>
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <Link
          href={`/admin/events/${eventId}/edit`}
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Event
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            🎭 Event Program Directors
            {event && <span className="text-lg font-normal text-gray-600 ml-2">- {event.title}</span>}
          </h1>
          <p className="text-gray-600">Manage program directors for this event</p>
        </div>
      </div>

      {/* Toast Message */}
      {toastMessage && (
        <div className={`mb-4 p-4 rounded-lg ${toastMessage.type === 'success'
          ? 'bg-green-50 border border-green-200 text-green-700'
          : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
          {toastMessage.message}
        </div>
      )}

      {/* Responsive Button Group */}
      <div className="w-full mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link
            href="/admin"
            className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg shadow-md p-3 text-xs transition-all group"
            title="Admin Home"
            aria-label="Admin Home"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Admin Home</span>
          </Link>
          <Link
            href="/admin/manage-usage"
            className="flex flex-col items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg shadow-md p-3 text-xs transition-all group"
            title="Manage Usage"
            aria-label="Manage Usage"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Manage Usage</span>
          </Link>
          <Link
            href={`/admin/events/${eventId}/media/list`}
            className="flex flex-col items-center justify-center bg-yellow-50 hover:bg-yellow-100 text-yellow-800 rounded-lg shadow-md p-3 text-xs transition-all group"
            title="Manage Media Files"
            aria-label="Manage Media Files"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-yellow-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Manage Media Files</span>
          </Link>
          <Link
            href="/admin/manage-events"
            className="flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 text-green-800 rounded-lg shadow-md p-3 text-xs transition-all group"
            title="Manage Events"
            aria-label="Manage Events"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Manage Events</span>
          </Link>
          <Link
            href={`/admin/events/${eventId}/ticket-types/list`}
            className="flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg shadow-md p-3 text-xs transition-all group"
            title="Manage Ticket Types"
            aria-label="Manage Ticket Types"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <FaTags className="w-8 h-8 text-purple-500" />
            </div>
            <span className="font-semibold text-center leading-tight">Manage Ticket Types</span>
          </Link>
          <Link
            href={`/admin/events/${eventId}/tickets/list`}
            className="flex flex-col items-center justify-center bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg shadow-md p-3 text-xs transition-all group"
            title="Manage Tickets"
            aria-label="Manage Tickets"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-teal-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <FaTicketAlt className="w-8 h-8 text-teal-500" />
            </div>
            <span className="font-semibold text-center leading-tight">Manage Tickets</span>
          </Link>
          <Link
            href={`/admin/events/${eventId}/discount-codes/list`}
            className="flex flex-col items-center justify-center bg-pink-50 hover:bg-pink-100 text-pink-800 rounded-lg shadow-md p-3 text-xs transition-all group"
            title="Manage Discount Codes"
            aria-label="Manage Discount Codes"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-pink-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <FaPercent className="w-8 h-8 text-pink-500" />
            </div>
            <span className="font-semibold text-center leading-tight">Manage Discount Codes</span>
          </Link>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="🔍 Search program directors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 text-base"
              />
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors font-semibold whitespace-nowrap"
          >
            <FaPlus />
            Add Program Director
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Program Directors Table */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">
            Event Program Directors ({filteredDirectors.length})
          </h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> Hover over a director's name to view detailed information in a tooltip.
            </p>
            <div className="text-sm text-gray-600">
              <p className="mb-2"><strong>Action Icons:</strong></p>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <button className="icon-btn bg-blue-700 hover:bg-blue-800 text-white p-3 pointer-events-none shadow-lg" disabled>
                    <FaEdit className="text-lg text-white" />
                  </button>
                  <span>Edit director details</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="icon-btn bg-blue-500 hover:bg-blue-600 text-white p-3 pointer-events-none" disabled>
                    <FaUpload className="text-lg" />
                  </button>
                  <span>Upload banners in this particular event for this director</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="icon-btn bg-purple-500 hover:bg-purple-600 text-white p-3 pointer-events-none" disabled>
                    <FaImages className="text-lg" />
                  </button>
                  <span>View all the media files associated with this director</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="icon-btn bg-yellow-500 hover:bg-yellow-600 text-white p-3 pointer-events-none" disabled>
                    <FaUnlink className="text-lg" />
                  </button>
                  <span>Disassociate this director with this event</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="icon-btn bg-red-700 hover:bg-red-800 text-white p-3 pointer-events-none shadow-lg" disabled>
                    <FaTrashAlt className="text-lg text-white" />
                  </button>
                  <span>Permanently delete this director</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <DataTable
            data={filteredDirectors}
            columns={columns}
            loading={loading}
            onSort={handleSort}
            sortKey={sortKey}
            sortDirection={sortDirection}
            emptyMessage="No program directors found for this event"
          />
        </div>
      </div>

      {/* Available Program Directors Section */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Available Program Directors to Add</h2>
          <p className="text-gray-600 text-sm mt-1">
            Tenant-level program directors that are not yet mapped to this event. Click "Add" to associate them with this event.
            Showing {availableDirectors.length > 0 ? (availableDirectorsPage * 20) + 1 : 0} to {availableDirectors.length > 0 ? (availableDirectorsPage * 20) + availableDirectors.length : 0} of {availableDirectorsTotalElements} available program directors
          </p>
        </div>

        {/* Search Bar for Available Program Directors */}
        <div className="mb-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search available program directors..."
                  value={availableDirectorsSearchTerm}
                  onChange={(e) => handleAvailableDirectorsSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Available Program Directors Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {loading && availableDirectors.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : availableDirectors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No available program directors found. All tenant program directors may already be mapped to this event.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bio
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {availableDirectors.map((director) => (
                      <tr key={director.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {director.name || '-'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {director.bio ? (director.bio.length > 50 ? director.bio.substring(0, 50) + '...' : director.bio) : '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleAddDirectorToEvent(director)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition whitespace-nowrap"
                          >
                            Add
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination for Available Program Directors - Always show */}
              <div className="mt-8">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleAvailableDirectorsPageChange(availableDirectorsPage - 1)}
                    disabled={availableDirectorsPage === 0 || loading}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    <FaChevronLeft />
                    Previous
                  </button>
                  <div className="text-sm font-semibold text-gray-700">
                    Page {availableDirectorsTotalPages === 0 ? 0 : availableDirectorsPage + 1} of {availableDirectorsTotalPages}
                  </div>
                  <button
                    onClick={() => handleAvailableDirectorsPageChange(availableDirectorsPage + 1)}
                    disabled={availableDirectorsPage >= availableDirectorsTotalPages - 1 || loading}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    Next
                    <FaChevronRight />
                  </button>
                </div>
                <div className="text-center text-sm text-gray-600 mt-2">
                  {availableDirectorsTotalElements > 0 ? (
                    <>Showing <span className="font-medium">{(availableDirectorsPage * 20) + 1}</span> to <span className="font-medium">{Math.min((availableDirectorsPage * 20) + availableDirectors.length, availableDirectorsTotalElements)}</span> of <span className="font-medium">{availableDirectorsTotalElements}</span> available program directors</>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>No available program directors found</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-medium">
                        [All tenant program directors are mapped to this event]
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Add Program Director"
        size="lg"
      >
        <ProgramDirectorForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          loading={loading}
          submitText="Create Program Director"
          eventId={eventId}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDirector(null);
          resetForm();
        }}
        title="Edit Program Director"
        size="lg"
      >
        <ProgramDirectorForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          loading={loading}
          submitText="Update Program Director"
          eventId={eventId}
        />
      </Modal>

      {/* Disassociate Confirmation Modal */}
      <ConfirmModal
        isOpen={isDisassociateModalOpen}
        onClose={() => {
          setIsDisassociateModalOpen(false);
          setSelectedDirector(null);
        }}
        onConfirm={handleDisassociate}
        title="Disassociate Program Director from Event"
        message={`Are you sure you want to remove "${selectedDirector?.name || 'this program director'}" from this event? The program director will remain in the system and can be added to other events.`}
        confirmText="Disassociate"
        variant="warning"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedDirector(null);
        }}
        onConfirm={handleDelete}
        title="Permanently Delete Program Director"
        message={`Are you sure you want to permanently delete "${selectedDirector?.name || 'this program director'}"? This action cannot be undone and will remove the program director from all events.`}
        confirmText="Delete Permanently"
        variant="danger"
      />

      {/* Poster Upload Dialog */}
      {selectedDirectorForPoster && (
        <EventDirectorPosterUploadDialog
          eventId={selectedDirectorForPoster.eventId}
          directorId={selectedDirectorForPoster.directorId}
          currentPosterUrl={selectedDirectorForPoster.currentPosterUrl}
          isOpen={posterUploadOpen}
          onClose={() => {
            setPosterUploadOpen(false);
            setSelectedDirectorForPoster(null);
          }}
          onUploadSuccess={async (imageUrl) => {
            // Refresh program directors to show updated poster
            await loadEventAndProgramDirectors();
            setPosterUploadOpen(false);
            setSelectedDirectorForPoster(null);
          }}
        />
      )}

      {/* Media Gallery Modal */}
      {selectedDirectorForMedia && (
        <Modal
          isOpen={!!selectedDirectorForMedia}
          onClose={() => setSelectedDirectorForMedia(null)}
          title={`Media Gallery - ${programDirectors.find(d => d.id === selectedDirectorForMedia.directorId)?.name || 'Director'}`}
          size="xl"
        >
          <EventDirectorMediaGallery
            key={`${selectedDirectorForMedia.eventId}-${selectedDirectorForMedia.directorId}`}
            eventId={selectedDirectorForMedia.eventId}
            directorId={selectedDirectorForMedia.directorId}
            showPriorityControls={true}
            allowUpload={true}
            onUploadClick={() => {
              // Refresh gallery after upload by remounting component
              // The component will reload when key changes
              setSelectedDirectorForMedia({
                ...selectedDirectorForMedia,
                eventId: selectedDirectorForMedia.eventId, // Trigger re-render
              });
            }}
            onPriorityChange={async (mediaId, priorityRanking) => {
              // Component handles its own refresh via useEffect
              // This callback is for external notifications if needed
              console.log(`Priority updated for media ${mediaId}: ${priorityRanking}`);
            }}
            onMediaDelete={async (mediaId) => {
              // Component handles its own refresh after delete
              console.log(`Media deleted: ${mediaId}`);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

// Program Director Form Component
interface ProgramDirectorFormProps {
  formData: Partial<EventProgramDirectorsDTO>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<EventProgramDirectorsDTO>>>;
  onSubmit: () => void;
  loading: boolean;
  submitText: string;
  eventId: string;
}

function ProgramDirectorForm({ formData, setFormData, onSubmit, loading, submitText, eventId }: ProgramDirectorFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo URL (Optional)
          </label>
          <input
            type="url"
            name="photoUrl"
            value={formData.photoUrl || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/photo.jpg (optional)"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio || ''}
            onChange={handleChange}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter director's bio and background information"
          />
        </div>
      </div>

      {/* Image Upload Section */}
      {formData.id && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Photo</h3>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Profile Photo
            </label>
            <ImageUpload
              entityId={formData.id}
              entityType="program-director"
              imageType="photo"
              eventId={parseInt(eventId)}
              currentImageUrl={formData.photoUrl}
              onImageUploaded={(url) => setFormData(prev => ({ ...prev, photoUrl: url }))}
              onError={(error) => console.error('Profile photo upload error:', error)}
              disabled={loading}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : submitText}
        </button>
      </div>
    </form>
  );
}
