'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaArrowLeft, FaChevronLeft, FaChevronRight, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import type { EventEmailsDTO, EventDetailsDTO } from '@/types';
import {
  fetchEventEmailsServer,
  createEventEmailServer,
  updateEventEmailServer,
  deleteEventEmailServer,
  associateEmailWithEventServer,
  disassociateEmailFromEventServer,
  fetchAvailableEmailsServer,
} from './ApiServerActions';

export default function EventEmailsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<EventDetailsDTO | null>(null);
  const [emails, setEmails] = useState<EventEmailsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDisassociateModalOpen, setIsDisassociateModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EventEmailsDTO | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<EventEmailsDTO>>({
    email: '',
    event: { id: parseInt(eventId) } as EventDetailsDTO,
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Available emails state (tenant-level emails not mapped to this event)
  const [availableEmails, setAvailableEmails] = useState<EventEmailsDTO[]>([]);
  const [availableEmailsPage, setAvailableEmailsPage] = useState(0);
  const [availableEmailsTotalPages, setAvailableEmailsTotalPages] = useState(0);
  const [availableEmailsTotalElements, setAvailableEmailsTotalElements] = useState(0);
  const [availableEmailsSearchTerm, setAvailableEmailsSearchTerm] = useState('');

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (userId && eventId) {
      loadEventAndEmails();
      loadAvailableEmails(0, '');
    }
  }, [userId, eventId]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const loadEventAndEmails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load event details
      const eventResponse = await fetch(`/api/proxy/event-details/${eventId}`);
      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        setEvent(eventData);
      }

      // Load emails for this event
      const emailsData = await fetchEventEmailsServer(parseInt(eventId));
      setEmails(emailsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load event emails');
      setToastMessage({ type: 'error', message: err.message || 'Failed to load event emails' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);

      // Check for duplicates before creating
      const isDuplicate = emails.some(
        (e) =>
          formData.email && e.email && e.email.toLowerCase() === formData.email.toLowerCase()
      );

      if (isDuplicate) {
        setToastMessage({
          type: 'error',
          message: `An email "${formData.email}" is already associated with this event. Duplicate entries are not allowed.`
        });
        return;
      }

      const emailData = { ...formData, event: { id: parseInt(eventId) } as EventDetailsDTO };
      const newEmail = await createEventEmailServer(emailData as any);
      setEmails(prev => [...prev, newEmail]);
      setIsCreateModalOpen(false);
      resetForm();
      // Reload event emails to get fresh data
      await loadEventAndEmails();
      // Reload available emails in case it should be removed from available list
      await loadAvailableEmails(availableEmailsPage, availableEmailsSearchTerm);
      setToastMessage({ type: 'success', message: 'Email created successfully' });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create email';
      // Check if error is due to duplicate constraint
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        setToastMessage({
          type: 'error',
          message: `An email "${formData.email}" is already associated with this event. Duplicate entries are not allowed.`
        });
      } else {
        setToastMessage({ type: 'error', message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedEmail) return;

    try {
      setLoading(true);
      const updatedEmail = await updateEventEmailServer(selectedEmail.id!, formData);
      setEmails(prev => prev.map(e => e.id === selectedEmail.id ? updatedEmail : e));
      setIsEditModalOpen(false);
      setSelectedEmail(null);
      resetForm();
      setToastMessage({ type: 'success', message: 'Email updated successfully' });
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to update email' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisassociate = async () => {
    if (!selectedEmail) {
      console.log('❌ No selected email for disassociation');
      return;
    }

    console.log('🔗 Disassociating email from event:', selectedEmail);

    try {
      setLoading(true);
      // Use the dedicated disassociate endpoint
      await disassociateEmailFromEventServer(selectedEmail.id!);

      console.log('✅ Email disassociated successfully, updating UI');
      setEmails(prev => prev.filter(e => e.id !== selectedEmail.id));
      setIsDisassociateModalOpen(false);
      setSelectedEmail(null);
      // Reload event emails to get fresh data
      await loadEventAndEmails();
      // Reload available emails in case this email should now appear
      await loadAvailableEmails(availableEmailsPage, availableEmailsSearchTerm);
      setToastMessage({ type: 'success', message: 'Email disassociated from event successfully' });
    } catch (err: any) {
      console.error('❌ Disassociate error:', err);
      setToastMessage({ type: 'error', message: err.message || 'Failed to disassociate email' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEmail) {
      console.log('❌ No selected email for deletion');
      return;
    }

    console.log('🗑️ Hard deleting email:', selectedEmail);

    try {
      setLoading(true);
      console.log('🔄 Calling deleteEventEmailServer with ID:', selectedEmail.id);
      await deleteEventEmailServer(selectedEmail.id!);

      console.log('✅ Email deleted successfully, updating UI');
      setEmails(prev => prev.filter(e => e.id !== selectedEmail.id));
      setIsDeleteModalOpen(false);
      setSelectedEmail(null);
      // Reload event emails to get fresh data
      await loadEventAndEmails();
      // Reload available emails in case this email should now appear
      await loadAvailableEmails(availableEmailsPage, availableEmailsSearchTerm);
      setToastMessage({ type: 'success', message: 'Email permanently deleted' });
    } catch (err: any) {
      console.error('❌ Delete error:', err);
      setToastMessage({ type: 'error', message: err.message || 'Failed to delete email' });
    } finally {
      setLoading(false);
    }
  };

  // Load available emails with pagination and search
  const loadAvailableEmails = async (page = 0, searchTerm = '') => {
    try {
      setLoading(true);
      console.log('🔄 Loading available emails for event:', eventId, 'page:', page, 'search:', searchTerm);
      const availableEmailsData = await fetchAvailableEmailsServer(
        parseInt(eventId),
        page,
        20, // Page size 20 as per UI style guide
        searchTerm
      );
      console.log('📊 Available emails data received:', availableEmailsData);
      setAvailableEmails(availableEmailsData.content);
      setAvailableEmailsTotalPages(availableEmailsData.totalPages);
      setAvailableEmailsTotalElements(availableEmailsData.totalElements);
    } catch (err: any) {
      console.error('Failed to load available emails:', err);
      setAvailableEmails([]);
      setAvailableEmailsTotalPages(0);
      setAvailableEmailsTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle search for available emails
  const handleAvailableEmailsSearch = (searchTerm: string) => {
    setAvailableEmailsSearchTerm(searchTerm);
    setAvailableEmailsPage(0);
    loadAvailableEmails(0, searchTerm);
  };

  // Handle pagination for available emails
  const handleAvailableEmailsPageChange = (page: number) => {
    setAvailableEmailsPage(page);
    loadAvailableEmails(page, availableEmailsSearchTerm);
  };

  // Handle adding an available email to this event
  const handleAddEmailToEvent = async (email: EventEmailsDTO) => {
    try {
      setLoading(true);
      console.log('➕ Adding email to event:', email);

      // Check if email is already associated with this event
      const isAlreadyAssociated = emails.some(
        (e) => e.id === email.id ||
        (e.email && email.email && e.email.toLowerCase() === email.email.toLowerCase())
      );

      if (isAlreadyAssociated) {
        setToastMessage({
          type: 'error',
          message: `Email "${email.email}" is already associated with this event. Duplicate entries are not allowed.`
        });
        return;
      }

      // Update the existing email to associate with this event (don't create duplicate)
      if (!email.id) {
        setToastMessage({
          type: 'error',
          message: `Cannot add email "${email.email}" - email ID is missing.`
        });
        return;
      }

      // Use the dedicated associate endpoint to properly associate the email with the event
      console.log('🔄 Associating email', email.id, 'with event', eventId);
      await associateEmailWithEventServer(email.id, parseInt(eventId));

      // Reload event emails to get fresh data from database
      await loadEventAndEmails();
      // Reload available emails to remove the added one
      await loadAvailableEmails(availableEmailsPage, availableEmailsSearchTerm);

      setToastMessage({ type: 'success', message: `Email "${email.email}" added to event successfully` });
    } catch (err: any) {
      console.error('❌ Failed to add email to event:', err);
      // Check if error is due to duplicate constraint
      const errorMessage = err.message || 'Failed to add email to event';
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        setToastMessage({
          type: 'error',
          message: `Email "${email.email}" is already associated with this event. Duplicate entries are not allowed.`
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
      email: '',
      event: { id: parseInt(eventId) } as EventDetailsDTO,
    });
  };

  const openEditModal = (email: EventEmailsDTO) => {
    setSelectedEmail(email);
    setFormData(email);
    setIsEditModalOpen(true);
  };

  const openDisassociateModal = (email: EventEmailsDTO) => {
    console.log('🔗 Opening disassociate modal for email:', email);
    setSelectedEmail(email);
    setIsDisassociateModalOpen(true);
  };

  const openDeleteModal = (email: EventEmailsDTO) => {
    console.log('🗑️ Opening delete modal for email:', email);
    setSelectedEmail(email);
    setIsDeleteModalOpen(true);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);

    const sorted = [...emails].sort((a, b) => {
      const aVal = a[key as keyof EventEmailsDTO];
      const bVal = b[key as keyof EventEmailsDTO];

      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setEmails(sorted);
  };

  const filteredEmails = emails.filter(email =>
    email.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<EventEmailsDTO>[] = [
    { key: 'email', label: 'Email Address', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, email) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(email);
            }}
            className="icon-btn icon-btn-edit"
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openDisassociateModal(email);
            }}
            className="icon-btn icon-btn-delete bg-yellow-500 hover:bg-yellow-600"
            title="Disassociate from Event"
          >
            <FaTrashAlt />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openDeleteModal(email);
            }}
            className="icon-btn icon-btn-delete"
            title="Permanently Delete"
          >
            <FaTrashAlt />
          </button>
        </div>
      )
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
            📧 Event Emails
            {event && <span className="text-lg font-normal text-gray-600 ml-2">- {event.title}</span>}
          </h1>
          <p className="text-gray-600">Manage emails for this event</p>
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

      {/* Search and Filter Bar */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="🔍 Search emails..."
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
            Add Email
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Emails Table */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Event Emails ({filteredEmails.length})
        </h2>
        <div className="overflow-x-auto">
          <DataTable
            data={filteredEmails}
            columns={columns}
            loading={loading}
            onSort={handleSort}
            sortKey={sortKey}
            sortDirection={sortDirection}
            emptyMessage="No emails found for this event"
          />
        </div>
      </div>

      {/* Available Emails Section */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Available Emails to Add</h2>
          <p className="text-gray-600 text-sm mt-1">
            Tenant-level emails that are not yet mapped to this event. Click "Add" to associate them with this event.
            Showing {availableEmails.length > 0 ? (availableEmailsPage * 20) + 1 : 0} to {availableEmails.length > 0 ? (availableEmailsPage * 20) + availableEmails.length : 0} of {availableEmailsTotalElements} available emails
          </p>
        </div>

        {/* Search Bar for Available Emails */}
        <div className="mb-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search available emails..."
                  value={availableEmailsSearchTerm}
                  onChange={(e) => handleAvailableEmailsSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Available Emails Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {loading && availableEmails.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : availableEmails.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No available emails found. All tenant emails may already be mapped to this event.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email Address
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {availableEmails.map((email) => (
                      <tr key={email.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {email.email || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleAddEmailToEvent(email)}
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

              {/* Pagination for Available Emails - Always show */}
              <div className="mt-8">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleAvailableEmailsPageChange(availableEmailsPage - 1)}
                    disabled={availableEmailsPage === 0 || loading}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    <FaChevronLeft />
                    Previous
                  </button>
                  <div className="text-sm font-semibold text-gray-700">
                    Page {availableEmailsTotalPages === 0 ? 0 : availableEmailsPage + 1} of {availableEmailsTotalPages}
                  </div>
                  <button
                    onClick={() => handleAvailableEmailsPageChange(availableEmailsPage + 1)}
                    disabled={availableEmailsPage >= availableEmailsTotalPages - 1 || loading}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    Next
                    <FaChevronRight />
                  </button>
                </div>
                <div className="text-center text-sm text-gray-600 mt-2">
                  {availableEmailsTotalElements > 0 ? (
                    <>Showing <span className="font-medium">{(availableEmailsPage * 20) + 1}</span> to <span className="font-medium">{Math.min((availableEmailsPage * 20) + availableEmails.length, availableEmailsTotalElements)}</span> of <span className="font-medium">{availableEmailsTotalElements}</span> available emails</>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>No available emails found</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-medium">
                        [All tenant emails are mapped to this event]
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
        title="Add Event Email"
        size="lg"
      >
        <EmailForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          loading={loading}
          submitText="Create Email"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmail(null);
          resetForm();
        }}
        title="Edit Event Email"
        size="lg"
      >
        <EmailForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          loading={loading}
          submitText="Update Email"
        />
      </Modal>

      {/* Disassociate Confirmation Modal */}
      <ConfirmModal
        isOpen={isDisassociateModalOpen}
        onClose={() => {
          setIsDisassociateModalOpen(false);
          setSelectedEmail(null);
        }}
        onConfirm={handleDisassociate}
        title="Disassociate Email from Event"
        message={`Are you sure you want to remove "${selectedEmail?.email || 'this email'}" from this event? The email will remain in the system and can be added to other events.`}
        confirmText="Disassociate"
        variant="warning"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedEmail(null);
        }}
        onConfirm={handleDelete}
        title="Permanently Delete Email"
        message={`Are you sure you want to permanently delete "${selectedEmail?.email || 'this email'}"? This action cannot be undone and will remove the email from all events.`}
        confirmText="Delete Permanently"
        variant="danger"
      />
    </div>
  );
}

// Email Form Component
interface EmailFormProps {
  formData: Partial<EventEmailsDTO>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<EventEmailsDTO>>>;
  onSubmit: () => void;
  loading: boolean;
  submitText: string;
}

function EmailForm({ formData, setFormData, onSubmit, loading, submitText }: EmailFormProps) {
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email || ''}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter email address"
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
