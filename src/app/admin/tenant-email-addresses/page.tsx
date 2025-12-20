'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useAuth } from '@clerk/nextjs';
import AdminNavigation from '@/components/AdminNavigation';
import DataTable, { type Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import type { TenantEmailAddressDTO } from '@/types';
import {
  fetchTenantEmailAddressesServer,
  createTenantEmailAddressServer,
  updateTenantEmailAddressServer,
  deleteTenantEmailAddressServer,
  fetchTenantEmailAddressesCountServer,
} from './ApiServerActions';

type FormState = Partial<TenantEmailAddressDTO>;

export default function TenantEmailAddressesPage() {
  const { userId } = useAuth();

  const [items, setItems] = useState<TenantEmailAddressDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TenantEmailAddressDTO | null>(null);

  const [formData, setFormData] = useState<FormState>({
    emailAddress: '',
    copyToEmailAddress: '',
    emailType: 'INFO',
    displayName: '',
    isActive: true,
    isDefault: false,
    description: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('emailType');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [createFormMessage, setCreateFormMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editFormMessage, setEditFormMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (userId) {
      void loadData();
    }
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [list, count] = await Promise.all([
        fetchTenantEmailAddressesServer(),
        fetchTenantEmailAddressesCountServer().catch(() => null),
      ]);
      setItems(list);
      if (typeof count === 'number') setTotalCount(count);
    } catch (err: any) {
      setError(err.message || 'Failed to load tenant email addresses');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      emailAddress: '',
      copyToEmailAddress: '',
      emailType: 'INFO',
      displayName: '',
      isActive: true,
      isDefault: false,
      description: '',
    });
    setCreateFormMessage(null);
    setEditFormMessage(null);
  };

  const handleCreate = async () => {
    try {
      if (!formData.emailAddress?.trim()) {
        setCreateFormMessage({ type: 'error', message: 'Email address is required' });
        return;
      }
      if (!formData.copyToEmailAddress?.trim()) {
        setCreateFormMessage({ type: 'error', message: 'Copy-to email address is required' });
        return;
      }
      if (
        formData.emailAddress.trim().toLowerCase() ===
        formData.copyToEmailAddress.trim().toLowerCase()
      ) {
        setCreateFormMessage({
          type: 'error',
          message: 'From email and Copy-To email address must be different',
        });
        return;
      }
      if (!formData.emailType) {
        setCreateFormMessage({ type: 'error', message: 'Email type is required' });
        return;
      }

      setLoading(true);
      const payload = {
        emailAddress: formData.emailAddress!.trim(),
        copyToEmailAddress: formData.copyToEmailAddress!.trim(),
        emailType: formData.emailType! as TenantEmailAddressDTO['emailType'],
        displayName: formData.displayName?.trim() || undefined,
        isActive: formData.isActive ?? true,
        isDefault: formData.isDefault ?? false,
        description: formData.description?.trim() || undefined,
      };

      const created = await createTenantEmailAddressServer(payload as any);
      setItems(prev => [...prev, created]);
      setIsCreateModalOpen(false);
      resetForm();
      setToastMessage({ type: 'success', message: 'Email address created successfully' });
      void loadData();
    } catch (err: any) {
      setCreateFormMessage({ type: 'error', message: err.message || 'Failed to create email address' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedItem || !selectedItem.id) return;

    try {
      if (!formData.emailAddress?.trim()) {
        setEditFormMessage({ type: 'error', message: 'Email address is required' });
        return;
      }
      if (!formData.copyToEmailAddress?.trim()) {
        setEditFormMessage({ type: 'error', message: 'Copy-to email address is required' });
        return;
      }
      if (
        formData.emailAddress.trim().toLowerCase() ===
        formData.copyToEmailAddress.trim().toLowerCase()
      ) {
        setEditFormMessage({
          type: 'error',
          message: 'From email and Copy-To email address must be different',
        });
        return;
      }
      if (!formData.emailType) {
        setEditFormMessage({ type: 'error', message: 'Email type is required' });
        return;
      }

      setLoading(true);
      const patch: Partial<TenantEmailAddressDTO> = {
        emailAddress: formData.emailAddress!.trim(),
        copyToEmailAddress: formData.copyToEmailAddress!.trim(),
        emailType: formData.emailType as TenantEmailAddressDTO['emailType'],
        displayName: formData.displayName?.trim() || undefined,
        isActive: formData.isActive ?? true,
        isDefault: formData.isDefault ?? false,
        description: formData.description?.trim() || undefined,
      };

      const updated = await updateTenantEmailAddressServer(selectedItem.id, patch);
      setItems(prev => prev.map(e => (e.id === selectedItem.id ? updated : e)));
      setIsEditModalOpen(false);
      setSelectedItem(null);
      resetForm();
      setToastMessage({ type: 'success', message: 'Email address updated successfully' });
      void loadData();
    } catch (err: any) {
      setEditFormMessage({ type: 'error', message: err.message || 'Failed to update email address' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem || !selectedItem.id) return;

    try {
      setLoading(true);
      await deleteTenantEmailAddressServer(selectedItem.id);
      setItems(prev => prev.filter(e => e.id !== selectedItem.id));
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
      setToastMessage({ type: 'success', message: 'Email address deleted successfully' });
      void loadData();
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to delete email address' });
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setSelectedItem(null);
    setCreateFormMessage(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (item: TenantEmailAddressDTO) => {
    setSelectedItem(item);
    setFormData({
      emailAddress: item.emailAddress,
      copyToEmailAddress: item.copyToEmailAddress,
      emailType: item.emailType,
      displayName: item.displayName,
      isActive: item.isActive,
      isDefault: item.isDefault,
      description: item.description,
    });
    setEditFormMessage(null);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (item: TenantEmailAddressDTO) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const filteredAndSortedItems = useMemo(() => {
    let data = [...items];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      data = data.filter(item =>
        item.emailAddress.toLowerCase().includes(q) ||
        (item.displayName?.toLowerCase().includes(q) ?? false) ||
        item.emailType.toLowerCase().includes(q)
      );
    }

    if (sortKey) {
      data.sort((a, b) => {
        const aValue = (a as any)[sortKey];
        const bValue = (b as any)[sortKey];
        if (aValue == null && bValue != null) return sortDirection === 'asc' ? -1 : 1;
        if (aValue != null && bValue == null) return sortDirection === 'asc' ? 1 : -1;
        if (aValue == null && bValue == null) return 0;
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [items, searchTerm, sortKey, sortDirection]);

  const columns: Column<TenantEmailAddressDTO>[] = [
    { key: 'emailType', label: 'Type', sortable: true },
    { key: 'emailAddress', label: 'Email Address', sortable: true },
    { key: 'copyToEmailAddress', label: 'Copy-To Address', sortable: true },
    { key: 'displayName', label: 'Display Name', sortable: true },
    {
      key: 'isActive',
      label: 'Active',
      sortable: true,
      render: (value: boolean) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'isDefault',
      label: 'Default',
      sortable: true,
      render: (value: boolean) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            value ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
  ];

  if (loading && items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
        <AdminNavigation currentPage="tenant-email-addresses" />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tenant email addresses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
      <AdminNavigation currentPage="tenant-email-addresses" />

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tenant Email Addresses</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Configure the verified “From” email addresses for this tenant, categorized by type (info, sales,
              support, noreply, etc.). These addresses are used when sending emails from the platform.
            </p>
            <p className="mt-2 rounded-md bg-blue-50 border border-blue-100 p-2 text-xs text-blue-800">
              Please provide both a <span className="font-semibold">From</span> email and a{' '}
              <span className="font-semibold">Copy-To</span> email address for each entry, and they must be
              different. Both addresses should be AWS SES verified email addresses. Please contact the platform
              administrator to have these addresses added or configured in SES.
            </p>
            {totalCount !== null && (
              <p className="text-gray-500 text-xs mt-1">Total addresses: {totalCount}</p>
            )}
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition-colors"
          >
            <FaPlus className="mr-2" />
            Add Email Address
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search by email, display name, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <DataTable<TenantEmailAddressDTO>
          data={filteredAndSortedItems}
          columns={columns}
          loading={loading}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={(key, direction) => {
            setSortKey(key);
            setSortDirection(direction);
          }}
          emptyMessage="No tenant email addresses configured yet."
        />
      </div>

      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            toastMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toastMessage.message}
          <button
            onClick={() => setToastMessage(null)}
            className="ml-4 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Add Tenant Email Address"
        size="lg"
      >
        <TenantEmailAddressForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          loading={loading}
          submitText="Create Email Address"
          message={createFormMessage}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
          resetForm();
        }}
        title="Edit Tenant Email Address"
        size="lg"
      >
        <TenantEmailAddressForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          loading={loading}
          submitText="Save Changes"
          message={editFormMessage}
        />
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        title="Delete Tenant Email Address"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete this email address{' '}
            <span className="font-semibold">{selectedItem?.emailAddress}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedItem(null);
              }}
              className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

interface TenantEmailAddressFormProps {
  formData: FormState;
  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
  onSubmit: () => void;
  loading: boolean;
  submitText: string;
  message: { type: 'success' | 'error'; message: string } | null;
}

function TenantEmailAddressForm({
  formData,
  setFormData,
  onSubmit,
  loading,
  submitText,
  message,
}: TenantEmailAddressFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type, value, checked } = e.target as any;
    let next: any = value;
    if (type === 'checkbox') {
      next = checked;
    }
    setFormData(prev => ({
      ...prev,
      [name]: next,
    }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="emailAddress"
            value={formData.emailAddress || ''}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Copy-To Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="copyToEmailAddress"
            value={formData.copyToEmailAddress || ''}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Optional CC / copy-to address"
          />
        </div>
      </div>

      {message && (
        <div
          className={`mt-3 rounded-md border px-3 py-2 text-xs ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.message}
        </div>
      )}

      <div className="mt-2 rounded-md bg-blue-50 border border-blue-100 p-3">
        <p className="text-xs text-blue-800">
          Please provide both a <span className="font-semibold">From</span> email and a{' '}
          <span className="font-semibold">Copy-To</span> email address, and they must be different.
          Both addresses should be AWS SES verified email addresses. Please contact the platform
          administrator to have these addresses added or configured in SES.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Type <span className="text-red-500">*</span>
          </label>
          <select
            name="emailType"
            value={formData.emailType || 'INFO'}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="INFO">INFO</option>
            <option value="SALES">SALES</option>
            <option value="TICKETS">TICKETS</option>
            <option value="CONTACT">CONTACT</option>
            <option value="SUPPORT">SUPPORT</option>
            <option value="MARKETING">MARKETING</option>
            <option value="NOREPLY">NOREPLY</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. Customer Support, Sales Team"
          />
        </div>
        <div className="flex items-center gap-6 mt-6">
          <label className="inline-flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive ?? true}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="ml-2">Active</span>
          </label>
          <label className="inline-flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault ?? false}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="ml-2">Default for this type</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Optional notes about how this address is used"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : submitText}
        </button>
      </div>
    </form>
  );
}



