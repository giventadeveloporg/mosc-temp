'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import AdminNavigation from '@/components/AdminNavigation';
import type { EventFeaturedPerformersDTO, EventDetailsDTO } from '@/types';
import {
  fetchEventFeaturedPerformersServer,
  createEventFeaturedPerformerServer,
  updateEventFeaturedPerformerServer,
  deleteEventFeaturedPerformerServer,
} from './ApiServerActions';
import { fetchEventsFilteredServer } from '../ApiServerActions';

export default function EventFeaturedPerformersPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const { toasts, showSuccess, showError, removeToast } = useToast();

  const [performers, setPerformers] = useState<EventFeaturedPerformersDTO[]>([]);
  const [events, setEvents] = useState<EventDetailsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState<string>('');

  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPerformer, setSelectedPerformer] = useState<EventFeaturedPerformersDTO | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<EventFeaturedPerformersDTO>>({
    name: '',
    stageName: '',
    role: '',
    bio: '',
    performanceDescription: '',
    socialMediaLinks: '',
    website: '',
    contactEmail: '',
    contactPhone: '',
    performanceOrder: 0,
    isHeadliner: false,
    performanceDuration: 0,
    specialRequirements: '',
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (userId) {
      loadPerformers();
      loadEvents();
    }
  }, [userId, page]);

  const loadEvents = async () => {
    try {
      const result = await fetchEventsFilteredServer({
        pageSize: 1000, // Load all events for dropdown
        sort: 'startDate,desc'
      });
      setEvents(result.events);
    } catch (err: any) {
      console.error('Failed to load events:', err);
    }
  };

  const loadPerformers = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchEventFeaturedPerformersServer(undefined, page, pageSize);
      setPerformers(result.data);
      setTotalCount(result.totalCount);
    } catch (err: any) {
      setError(err.message || 'Failed to load performers');
      showError('Error', err.message || 'Failed to load performers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      // Include event association if selected
      const performerData = {
        ...formData,
        event: formData.event?.id ? { id: formData.event.id } as EventDetailsDTO : undefined
      };
      const newPerformer = await createEventFeaturedPerformerServer(performerData as any);
      setIsCreateModalOpen(false);
      resetForm();
      showSuccess('Success', 'Performer created successfully');
      // Reload current page to refresh the list
      await loadPerformers();
    } catch (err: any) {
      showError('Error', err.message || 'Failed to create performer');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedPerformer) return;

    try {
      setLoading(true);
      // Include event association if selected
      const performerData = {
        ...formData,
        event: formData.event?.id ? { id: formData.event.id } as EventDetailsDTO : undefined
      };
      const updatedPerformer = await updateEventFeaturedPerformerServer(selectedPerformer.id!, performerData);
      setPerformers(prev => prev.map(p => p.id === selectedPerformer.id ? updatedPerformer : p));
      setIsEditModalOpen(false);
      setSelectedPerformer(null);
      resetForm();
      showSuccess('Success', 'Performer updated successfully');
    } catch (err: any) {
      showError('Error', err.message || 'Failed to update performer');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPerformer) return;

    try {
      setLoading(true);
      await deleteEventFeaturedPerformerServer(selectedPerformer.id!);
      setIsDeleteModalOpen(false);
      setSelectedPerformer(null);
      showSuccess('Success', 'Performer deleted successfully');
      // Reload current page to refresh the list
      await loadPerformers();
    } catch (err: any) {
      showError('Error', err.message || 'Failed to delete performer');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      stageName: '',
      role: '',
      bio: '',
      performanceDescription: '',
      socialMediaLinks: '',
      website: '',
      contactEmail: '',
      contactPhone: '',
      performanceOrder: 0,
      isHeadliner: false,
      performanceDuration: 0,
      specialRequirements: '',
      event: undefined,
    });
  };

  const openEditModal = (performer: EventFeaturedPerformersDTO) => {
    // Navigate to detail/edit page instead of opening modal
    router.push(`/admin/event-featured-performers/${performer.id}`);
  };

  const openDeleteModal = (performer: EventFeaturedPerformersDTO) => {
    setSelectedPerformer(performer);
    setIsDeleteModalOpen(true);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);

    const sorted = [...performers].sort((a, b) => {
      const aVal = a[key as keyof EventFeaturedPerformersDTO];
      const bVal = b[key as keyof EventFeaturedPerformersDTO];

      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setPerformers(sorted);
  };

  const filteredPerformers = performers.filter(performer => {
    const matchesSearch = performer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      performer.stageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      performer.role?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEventFilter = !eventFilter || performer.event?.id?.toString() === eventFilter;

    return matchesSearch && matchesEventFilter;
  });

  const columns: Column<EventFeaturedPerformersDTO>[] = [
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'stageName',
      label: 'Stage Name',
      sortable: true,
      render: (value) => value || '-'
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value) => value || '-'
    },
    {
      key: 'event',
      label: 'Event',
      sortable: false,
      render: (value, row) => {
        if (row.event?.id && row.event?.title) {
          return (
            <a
              href={`/admin/events/${row.event.id}`}
              className="text-blue-600 hover:text-blue-800 underline"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {row.event.title}
            </a>
          );
        }
        return <span className="text-gray-400">-</span>;
      }
    },
    {
      key: 'isHeadliner',
      label: 'Headliner',
      sortable: true,
      render: (value) => value ? 'Yes' : 'No'
    },
    {
      key: 'performanceOrder',
      label: 'Order',
      sortable: true,
      render: (value) => value || 0
    },
  ];

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Global Performers</h1>
      <p className="text-gray-600 mb-8">(You can add or disassociate these items with any events. Please go to the corresponding event page to manage these associated entities.)</p>
      <AdminNavigation />

      {/* Search and Filter Bar */}
      <div className="mb-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search performers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="min-w-48">
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="">All Events</option>
                {events.map(event => (
                  <option key={event.id} value={event.id?.toString()}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Add Performer"
            aria-label="Add Performer"
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <FaPlus className="w-6 h-6 text-blue-600" />
            </div>
            <span className="font-semibold text-blue-700">Add Performer</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <DataTable
        data={filteredPerformers}
        columns={columns}
        loading={loading}
        onSort={handleSort}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        sortKey={sortKey}
        sortDirection={sortDirection}
        emptyMessage="No performers found"
      />

      {/* Pagination Controls - Always visible, matching admin page style */}
      <div className="mt-8">
        <div className="flex justify-between items-center">
          {/* Previous Button */}
          <button
            onClick={() => setPage(prev => Math.max(0, prev - 1))}
            disabled={page === 0 || loading}
            className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
            title="Previous Page"
            aria-label="Previous Page"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </button>

          {/* Page Info */}
          <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
            <span className="text-sm font-bold text-blue-700">
              Page <span className="text-blue-600">{page + 1}</span> of <span className="text-blue-600">{Math.max(1, Math.ceil(totalCount / pageSize))}</span>
            </span>
          </div>

          {/* Next Button */}
          <button
            onClick={() => setPage(prev => prev + 1)}
            disabled={page >= Math.ceil(totalCount / pageSize) - 1 || loading}
            className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
            title="Next Page"
            aria-label="Next Page"
            type="button"
          >
            <span>Next</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Item Count Text */}
        <div className="text-center mt-3">
          {totalCount > 0 ? (
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
              <span className="text-sm text-gray-700">
                Showing <span className="font-bold text-blue-600">{page * pageSize + 1}</span> to <span className="font-bold text-blue-600">{Math.min((page + 1) * pageSize, totalCount)}</span> of <span className="font-bold text-blue-600">{totalCount}</span> performers
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-orange-700">No performers found</span>
              <span className="text-sm text-orange-600">[No performers match your criteria]</span>
            </div>
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
        title="Add Featured Performer"
        size="lg"
      >
        <PerformerForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          loading={loading}
          submitText="Create Performer"
          events={events}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPerformer(null);
          resetForm();
        }}
        title="Edit Featured Performer"
        size="lg"
      >
        <PerformerForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          loading={loading}
          submitText="Update Performer"
          events={events}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedPerformer(null);
        }}
        onConfirm={handleDelete}
        title="Delete Performer"
        message={`Are you sure you want to delete "${selectedPerformer?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div key={toast.id} className="bg-white shadow-lg rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{toast.title}</p>
                  {toast.message && <p className="text-sm text-gray-600">{toast.message}</p>}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Performer Form Component
interface PerformerFormProps {
  formData: Partial<EventFeaturedPerformersDTO>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<EventFeaturedPerformersDTO>>>;
  onSubmit: () => void;
  loading: boolean;
  submitText: string;
  events: EventDetailsDTO[];
}

function PerformerForm({ formData, setFormData, onSubmit, loading, submitText, events }: PerformerFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
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
            Event (Optional)
          </label>
          <select
            name="event"
            value={formData.event?.id?.toString() || ''}
            onChange={(e) => {
              const eventId = e.target.value ? parseInt(e.target.value) : undefined;
              setFormData(prev => ({
                ...prev,
                event: eventId ? { id: eventId } as EventDetailsDTO : undefined
              }));
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">No Event (Global)</option>
            {events.map(event => (
              <option key={event.id} value={event.id?.toString()}>
                {event.title} {event.startDate ? `(${event.startDate})` : ''}
              </option>
            ))}
          </select>
        </div>

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
            Stage Name
          </label>
          <input
            type="text"
            name="stageName"
            value={formData.stageName || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <input
            type="text"
            name="role"
            value={formData.role || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Performance Order
          </label>
          <input
            type="number"
            name="performanceOrder"
            value={formData.performanceOrder || 0}
            onChange={handleChange}
            min="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Performance Duration (minutes)
          </label>
          <input
            type="number"
            name="performanceDuration"
            value={formData.performanceDuration || 0}
            onChange={handleChange}
            min="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isHeadliner"
            checked={formData.isHeadliner || false}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Is Headliner
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          name="bio"
          value={formData.bio || ''}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Performance Description
        </label>
        <textarea
          name="performanceDescription"
          value={formData.performanceDescription || ''}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Email
          </label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Phone
          </label>
          <input
            type="tel"
            name="contactPhone"
            value={formData.contactPhone || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Website
        </label>
        <input
          type="url"
          name="website"
          value={formData.website || ''}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Social Media Links
        </label>
        <textarea
          name="socialMediaLinks"
          value={formData.socialMediaLinks || ''}
          onChange={handleChange}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter social media links separated by commas"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Special Requirements
        </label>
        <textarea
          name="specialRequirements"
          value={formData.specialRequirements || ''}
          onChange={handleChange}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

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
