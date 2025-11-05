'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaArrowLeft, FaChevronLeft, FaChevronRight, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import type { EventContactsDTO, EventDetailsDTO } from '@/types';
import {
  fetchEventContactsServer,
  createEventContactServer,
  updateEventContactServer,
  deleteEventContactServer,
  fetchAvailableContactsServer,
  associateContactWithEventServer,
  disassociateContactFromEventServer,
} from './ApiServerActions';

export default function EventContactsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<EventDetailsDTO | null>(null);
  const [contacts, setContacts] = useState<EventContactsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDisassociateModalOpen, setIsDisassociateModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<EventContactsDTO | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<EventContactsDTO>>({
    name: '',
    phone: '',
    email: '',
    event: { id: parseInt(eventId) } as EventDetailsDTO,
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Available contacts state (tenant-level contacts not mapped to this event)
  const [availableContacts, setAvailableContacts] = useState<EventContactsDTO[]>([]);
  const [availableContactsPage, setAvailableContactsPage] = useState(0);
  const [availableContactsTotalPages, setAvailableContactsTotalPages] = useState(0);
  const [availableContactsTotalElements, setAvailableContactsTotalElements] = useState(0);
  const [availableContactsSearchTerm, setAvailableContactsSearchTerm] = useState('');

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (userId && eventId) {
      loadEventAndContacts();
      loadAvailableContacts(0, '');
    }
  }, [userId, eventId]);

  // Debug modal state changes
  useEffect(() => {
    console.log('🔍 Modal state changed:', {
      isDeleteModalOpen,
      selectedContact: selectedContact?.name,
      hasSelectedContact: !!selectedContact
    });
  }, [isDeleteModalOpen, selectedContact]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const loadEventAndContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading event and contacts for eventId:', eventId);

      // Load event details
      const eventResponse = await fetch(`/api/proxy/event-details/${eventId}`);
      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        console.log('✅ Event loaded:', eventData);
        setEvent(eventData);
      }

      // Load contacts for this event
      console.log('🔄 Fetching contacts...');
      const contactsData = await fetchEventContactsServer(parseInt(eventId));
      console.log('✅ Contacts loaded:', contactsData);
      setContacts(contactsData);
    } catch (err: any) {
      console.error('❌ Error loading event and contacts:', err);
      setError(err.message || 'Failed to load event contacts');
      setToastMessage({ type: 'error', message: err.message || 'Failed to load event contacts' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    console.log('🚀 handleCreate called!');
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.name?.trim()) {
        setToastMessage({ type: 'error', message: 'Name is required' });
        return;
      }

      if (!formData.phone?.trim()) {
        setToastMessage({ type: 'error', message: 'Phone is required' });
        return;
      }

      // Check for duplicates before creating
      const isDuplicate = contacts.some(
        (c) =>
          (formData.email && c.email && c.email.toLowerCase() === formData.email.toLowerCase()) ||
          (formData.phone && c.phone && c.phone === formData.phone)
      );

      if (isDuplicate) {
        setToastMessage({
          type: 'error',
          message: 'A contact with this email or phone number is already associated with this event. Duplicate entries are not allowed.'
        });
        return;
      }

      const contactData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || undefined,
        event: { id: parseInt(eventId) } as EventDetailsDTO,
      };

      // Debug logging
      console.log('🔍 Frontend Event Contact Debug:');
      console.log('📝 Form data:', formData);
      console.log('📤 Contact data being sent:', contactData);
      console.log('🎯 Event ID:', eventId);

      const newContact = await createEventContactServer(contactData);
      setContacts(prev => [...prev, newContact]);
      setIsCreateModalOpen(false);
      resetForm();
      // Reload available contacts in case this was a duplicate
      await loadAvailableContacts(availableContactsPage, availableContactsSearchTerm);
      // Reload event contacts to get fresh data
      await loadEventAndContacts();
      setToastMessage({ type: 'success', message: 'Contact created successfully' });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create contact';
      // Check if error is due to duplicate constraint
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        setToastMessage({
          type: 'error',
          message: 'A contact with this email or phone number is already associated with this event. Duplicate entries are not allowed.'
        });
      } else {
        setToastMessage({ type: 'error', message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedContact) return;

    try {
      setLoading(true);
      const updatedContact = await updateEventContactServer(selectedContact.id!, formData);
      setContacts(prev => prev.map(c => c.id === selectedContact.id ? updatedContact : c));
      setIsEditModalOpen(false);
      setSelectedContact(null);
      resetForm();
      setToastMessage({ type: 'success', message: 'Contact updated successfully' });
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to update contact' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisassociate = async () => {
    if (!selectedContact) {
      console.log('❌ No selected contact for disassociation');
      return;
    }

    console.log('🔗 Disassociating contact from event:', selectedContact);

    try {
      setLoading(true);
      // Use the dedicated disassociate endpoint
      await disassociateContactFromEventServer(selectedContact.id!);

      console.log('✅ Contact disassociated successfully, updating UI');
      setContacts(prev => prev.filter(c => c.id !== selectedContact.id));
      setIsDisassociateModalOpen(false);
      setSelectedContact(null);
      // Reload available contacts so this contact appears in the available list
      await loadAvailableContacts(availableContactsPage, availableContactsSearchTerm);
      setToastMessage({ type: 'success', message: 'Contact disassociated from event successfully' });
    } catch (err: any) {
      console.error('❌ Disassociate error:', err);
      setToastMessage({ type: 'error', message: err.message || 'Failed to disassociate contact' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedContact) {
      console.log('❌ No selected contact for deletion');
      return;
    }

    console.log('🗑️ Hard deleting contact:', selectedContact);

    try {
      setLoading(true);
      console.log('🔄 Calling deleteEventContactServer with ID:', selectedContact.id);
      await deleteEventContactServer(selectedContact.id!);

      console.log('✅ Contact deleted successfully, updating UI');
      setContacts(prev => prev.filter(c => c.id !== selectedContact.id));
      setIsDeleteModalOpen(false);
      setSelectedContact(null);
      // Reload available contacts in case this contact should now appear
      await loadAvailableContacts(availableContactsPage, availableContactsSearchTerm);
      setToastMessage({ type: 'success', message: 'Contact permanently deleted' });
    } catch (err: any) {
      console.error('❌ Delete error:', err);
      setToastMessage({ type: 'error', message: err.message || 'Failed to delete contact' });
    } finally {
      setLoading(false);
    }
  };

  // Load available contacts with pagination and search
  const loadAvailableContacts = async (page = 0, searchTerm = '') => {
    try {
      setLoading(true);
      console.log('🔄 Loading available contacts for event:', eventId, 'page:', page, 'search:', searchTerm);
      const availableContactsData = await fetchAvailableContactsServer(
        parseInt(eventId),
        page,
        20, // Page size 20 as per UI style guide
        searchTerm
      );
      console.log('📊 Available contacts data received:', availableContactsData);
      setAvailableContacts(availableContactsData.content);
      setAvailableContactsTotalPages(availableContactsData.totalPages);
      setAvailableContactsTotalElements(availableContactsData.totalElements);
    } catch (err: any) {
      console.error('Failed to load available contacts:', err);
      setAvailableContacts([]);
      setAvailableContactsTotalPages(0);
      setAvailableContactsTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle search for available contacts
  const handleAvailableContactsSearch = (searchTerm: string) => {
    setAvailableContactsSearchTerm(searchTerm);
    setAvailableContactsPage(0);
    loadAvailableContacts(0, searchTerm);
  };

  // Handle pagination for available contacts
  const handleAvailableContactsPageChange = (page: number) => {
    setAvailableContactsPage(page);
    loadAvailableContacts(page, availableContactsSearchTerm);
  };

  // Handle adding an available contact to this event
  const handleAddContactToEvent = async (contact: EventContactsDTO) => {
    try {
      setLoading(true);
      console.log('➕ Adding contact to event:', contact);

      // Check if contact is already associated with this event
      const isAlreadyAssociated = contacts.some(
        (c) => c.id === contact.id ||
        (c.email && contact.email && c.email.toLowerCase() === contact.email.toLowerCase()) ||
        (c.phone && contact.phone && c.phone === contact.phone)
      );

      if (isAlreadyAssociated) {
        setToastMessage({
          type: 'error',
          message: `Contact "${contact.name}" is already associated with this event. Duplicate entries are not allowed.`
        });
        return;
      }

      // Update the existing contact to associate with this event (don't create duplicate)
      if (!contact.id) {
        setToastMessage({
          type: 'error',
          message: `Cannot add contact "${contact.name}" - contact ID is missing.`
        });
        return;
      }

      // Use the dedicated associate endpoint to properly associate the contact with the event
      console.log('🔄 Associating contact', contact.id, 'with event', eventId);
      await associateContactWithEventServer(contact.id, parseInt(eventId));

      // Reload event contacts to get fresh data from database
      await loadEventAndContacts();
      // Reload available contacts to remove the added one
      await loadAvailableContacts(availableContactsPage, availableContactsSearchTerm);

      setToastMessage({ type: 'success', message: `Contact "${contact.name}" added to event successfully` });
    } catch (err: any) {
      console.error('❌ Failed to add contact to event:', err);
      // Check if error is due to duplicate constraint
      const errorMessage = err.message || 'Failed to add contact to event';
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        setToastMessage({
          type: 'error',
          message: `Contact "${contact.name}" is already associated with this event. Duplicate entries are not allowed.`
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
      phone: '',
      email: '',
      event: { id: parseInt(eventId) } as EventDetailsDTO,
    });
  };

  const openEditModal = (contact: EventContactsDTO) => {
    setSelectedContact(contact);
    setFormData(contact);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (contact: EventContactsDTO) => {
    console.log('🗑️ Opening delete modal for contact:', contact);
    setSelectedContact(contact);
    setIsDeleteModalOpen(true);
  };

  const openDisassociateModal = (contact: EventContactsDTO) => {
    console.log('🔗 Opening disassociate modal for contact:', contact);
    setSelectedContact(contact);
    setIsDisassociateModalOpen(true);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);

    const sorted = [...contacts].sort((a, b) => {
      const aVal = a[key as keyof EventContactsDTO];
      const bVal = b[key as keyof EventContactsDTO];

      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setContacts(sorted);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<EventContactsDTO>[] = [
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'phone',
      label: 'Phone',
      render: (value) => value || '-'
    },
    {
      key: 'email',
      label: 'Email',
      render: (value) => value || '-'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, contact) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(contact);
            }}
            className="icon-btn icon-btn-edit"
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openDisassociateModal(contact);
            }}
            className="icon-btn icon-btn-delete bg-yellow-500 hover:bg-yellow-600"
            title="Disassociate from Event"
          >
            <FaTrashAlt />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openDeleteModal(contact);
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
    <div className="max-w-5xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
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
            📞 Event Contacts
            {event && <span className="text-lg font-normal text-gray-600 ml-2">- {event.title}</span>}
          </h1>
          <p className="text-gray-600">Manage contacts for this event</p>
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
                placeholder="🔍 Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 text-base"
              />
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors font-semibold"
          >
            <FaPlus />
            Add Contact
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Contacts Table */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Event Contacts ({filteredContacts.length})
        </h2>
        <DataTable
          data={filteredContacts}
          columns={columns}
          loading={loading}
          onSort={handleSort}
          sortKey={sortKey}
          sortDirection={sortDirection}
          emptyMessage="No contacts found for this event"
        />
      </div>

      {/* Available Contacts Section */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Available Contacts to Add</h2>
          <p className="text-gray-600 text-sm mt-1">
            Tenant-level contacts that are not yet mapped to this event. Click "Add" to associate them with this event.
            Showing {availableContacts.length > 0 ? (availableContactsPage * 20) + 1 : 0} to {availableContacts.length > 0 ? (availableContactsPage * 20) + availableContacts.length : 0} of {availableContactsTotalElements} available contacts
          </p>
        </div>

        {/* Search Bar for Available Contacts */}
        <div className="mb-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search available contacts..."
                  value={availableContactsSearchTerm}
                  onChange={(e) => handleAvailableContactsSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Available Contacts Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {loading && availableContacts.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : availableContacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No available contacts found. All tenant contacts may already be mapped to this event.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {availableContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {contact.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contact.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contact.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleAddContactToEvent(contact)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                          >
                            Add
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination for Available Contacts - Always show */}
              <div className="mt-8">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleAvailableContactsPageChange(availableContactsPage - 1)}
                    disabled={availableContactsPage === 0 || loading}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    <FaChevronLeft />
                    Previous
                  </button>
                  <div className="text-sm font-semibold text-gray-700">
                    Page {availableContactsTotalPages === 0 ? 0 : availableContactsPage + 1} of {availableContactsTotalPages}
                  </div>
                  <button
                    onClick={() => handleAvailableContactsPageChange(availableContactsPage + 1)}
                    disabled={availableContactsPage >= availableContactsTotalPages - 1 || loading}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    Next
                    <FaChevronRight />
                  </button>
                </div>
                <div className="text-center text-sm text-gray-600 mt-2">
                  {availableContactsTotalElements > 0 ? (
                    <>Showing <span className="font-medium">{(availableContactsPage * 20) + 1}</span> to <span className="font-medium">{Math.min((availableContactsPage * 20) + availableContacts.length, availableContactsTotalElements)}</span> of <span className="font-medium">{availableContactsTotalElements}</span> available contacts</>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>No available contacts found</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-medium">
                        [All tenant contacts are mapped to this event]
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
        title="Add Event Contact"
        size="lg"
      >
        <ContactForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          loading={loading}
          submitText="Create Contact"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedContact(null);
          resetForm();
        }}
        title="Edit Event Contact"
        size="lg"
      >
        <ContactForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          loading={loading}
          submitText="Update Contact"
        />
      </Modal>

      {/* Disassociate Confirmation Modal */}
      <ConfirmModal
        isOpen={isDisassociateModalOpen}
        onClose={() => {
          setIsDisassociateModalOpen(false);
          setSelectedContact(null);
        }}
        onConfirm={handleDisassociate}
        title="Disassociate Contact from Event"
        message={`Are you sure you want to remove "${selectedContact?.name || 'this contact'}" from this event? The contact will remain in the system and can be added to other events.`}
        confirmText="Disassociate"
        variant="warning"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedContact(null);
        }}
        onConfirm={handleDelete}
        title="Permanently Delete Contact"
        message={`Are you sure you want to permanently delete "${selectedContact?.name || 'this contact'}"? This action cannot be undone and will remove the contact from all events.`}
        confirmText="Delete Permanently"
        variant="danger"
      />
    </div>
  );
}

// Contact Form Component
interface ContactFormProps {
  formData: Partial<EventContactsDTO>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<EventContactsDTO>>>;
  onSubmit: () => void;
  loading: boolean;
  submitText: string;
}

function ContactForm({ formData, setFormData, onSubmit, loading, submitText }: ContactFormProps) {
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
          <label className="block text-sm font-medium text-gray-700">
            👤 Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            📧 Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            📞 Phone *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          />
        </div>
      </div>


      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="bg-teal-100 hover:bg-teal-200 text-teal-800 px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : submitText}
        </button>
      </div>
    </form>
  );
}
