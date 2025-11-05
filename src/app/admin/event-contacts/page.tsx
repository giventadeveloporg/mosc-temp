'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/Modal';
import AdminNavigation from '@/components/AdminNavigation';
import type { EventContactsDTO, EventDetailsDTO } from '@/types';
import {
  fetchEventContactsServer,
  createEventContactServer,
  updateEventContactServer,
  deleteEventContactServer,
} from './ApiServerActions';
import { fetchEventsFilteredServer } from '../ApiServerActions';

export default function EventContactsPage() {
  const { userId } = useAuth();
  const router = useRouter();

  const [contacts, setContacts] = useState<EventContactsDTO[]>([]);
  const [events, setEvents] = useState<EventDetailsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState<string>('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<EventContactsDTO | null>(null);

  // Form state - Fixed to match DTO: name, phone, email only
  const [formData, setFormData] = useState<Partial<EventContactsDTO>>({
    name: '',
    phone: '',
    email: '',
    event: undefined,
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (userId) {
      loadContacts();
      loadEvents();
    }
  }, [userId]);

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

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEventContactsServer();
      setContacts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load contacts');
      setToastMessage({ type: 'error', message: err.message || 'Failed to load contacts' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      // Include event association if selected, ensure required fields
      const contactData = {
        name: formData.name || '',
        phone: formData.phone || '',
        email: formData.email || undefined,
        event: formData.event?.id ? { id: formData.event.id } as EventDetailsDTO : undefined
      };
      const newContact = await createEventContactServer(contactData as any);
      setContacts(prev => [...prev, newContact]);
      setIsCreateModalOpen(false);
      resetForm();
      setToastMessage({ type: 'success', message: 'Contact created successfully' });
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to create contact' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedContact) return;

    try {
      setLoading(true);
      // Include event association if selected
      const contactData = {
        ...formData,
        event: formData.event?.id ? { id: formData.event.id } as EventDetailsDTO : undefined
      };
      const updatedContact = await updateEventContactServer(selectedContact.id!, contactData);
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

  const handleDelete = async () => {
    if (!selectedContact) return;

    try {
      setLoading(true);
      await deleteEventContactServer(selectedContact.id!);
      setContacts(prev => prev.filter(c => c.id !== selectedContact.id));
      setIsDeleteModalOpen(false);
      setSelectedContact(null);
      setToastMessage({ type: 'success', message: 'Contact deleted successfully' });
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to delete contact' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      event: undefined,
    });
  };

  const openEditModal = (contact: EventContactsDTO) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name || '',
      phone: contact.phone || '',
      email: contact.email || '',
      event: contact.event || undefined
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (contact: EventContactsDTO) => {
    setSelectedContact(contact);
    setIsDeleteModalOpen(true);
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

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEventFilter = !eventFilter || contact.event?.id?.toString() === eventFilter;

    return matchesSearch && matchesEventFilter;
  });

  const columns: Column<EventContactsDTO>[] = [
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'phone',
      label: 'Phone',
      sortable: true,
      render: (value) => value || '-'
    },
    {
      key: 'email',
      label: 'Email',
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
    }
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Event Contacts</h1>
      <AdminNavigation />

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
      <div className="mb-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow font-bold flex items-center gap-2 hover:bg-blue-700 transition"
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

      <DataTable
        data={filteredContacts}
        columns={columns}
        loading={loading}
        onSort={handleSort}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        sortKey={sortKey}
        sortDirection={sortDirection}
        emptyMessage="No contacts found"
      />

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
          events={events}
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
          events={events}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedContact(null);
        }}
        onConfirm={handleDelete}
        title="Delete Contact"
        message={`Are you sure you want to delete "${selectedContact?.contactName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

// Contact Form Component - Fixed to match DTO: name, phone, email only
interface ContactFormProps {
  formData: Partial<EventContactsDTO>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<EventContactsDTO>>>;
  onSubmit: () => void;
  loading: boolean;
  submitText: string;
  events: EventDetailsDTO[];
}

function ContactForm({ formData, setFormData, onSubmit, loading, submitText, events }: ContactFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
            Phone *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
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
