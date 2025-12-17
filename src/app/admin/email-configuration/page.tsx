'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaHome, FaPlus, FaEdit, FaTrashAlt, FaEnvelopeOpenText, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import type { TenantEmailAddressDTO, TenantEmailType } from '@/types';
import { getTenantId } from '@/lib/env';
import {
  fetchTenantEmailAddressesServer,
  createTenantEmailAddressServer,
  updateTenantEmailAddressServer,
  deleteTenantEmailAddressServer,
} from './ApiServerActions';
import { parseBackendError, formatSuccessMessage, formatErrorMessage } from '@/lib/errorMessages';

const EMAIL_TYPES: TenantEmailType[] = ['INFO', 'SALES', 'TICKETS', 'CONTACT', 'SUPPORT', 'MARKETING', 'NOREPLY', 'ADMIN'];

export default function EmailConfigurationPage() {
  const [emails, setEmails] = useState<TenantEmailAddressDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEmail, setEditingEmail] = useState<TenantEmailAddressDTO | null>(null);
  const [formData, setFormData] = useState<Partial<TenantEmailAddressDTO>>({
    emailAddress: '',
    emailType: 'INFO',
    displayName: '',
    isActive: true,
    isDefault: false,
    description: '',
  });

  const tenantId = getTenantId();

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTenantEmailAddressesServer(tenantId);
      setEmails(data);
    } catch (err: any) {
      const friendlyMessage = parseBackendError(err, 'Failed to load email addresses');
      setError(formatErrorMessage(friendlyMessage));
      console.error('Error loading emails:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingEmail(null);
    setFormData({
      emailAddress: '',
      emailType: 'INFO',
      displayName: '',
      isActive: true,
      isDefault: false,
      description: '',
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleEdit = (email: TenantEmailAddressDTO) => {
    setEditingEmail(email);
    setFormData({
      emailAddress: email.emailAddress,
      emailType: email.emailType,
      displayName: email.displayName || '',
      isActive: email.isActive,
      isDefault: email.isDefault,
      description: email.description || '',
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (email: TenantEmailAddressDTO) => {
    if (!email.id) return;

    if (!confirm(`Are you sure you want to delete this email address?\n\n${email.emailAddress} (${email.emailType})`)) {
      return;
    }

    try {
      await deleteTenantEmailAddressServer(email.id);
      setSuccess(formatSuccessMessage('Email address deleted successfully!'));
      loadEmails();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const friendlyMessage = parseBackendError(err, 'Failed to delete email address');
      setError(formatErrorMessage(friendlyMessage));
      console.error('Error deleting email:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.emailAddress || !formData.emailType) {
      setError(formatErrorMessage('Email address and type are required'));
      return;
    }

    try {
      if (editingEmail && editingEmail.id) {
        // Update existing
        await updateTenantEmailAddressServer(editingEmail.id, formData);
        setSuccess(formatSuccessMessage('Email address updated successfully!'));
      } else {
        // Create new
        await createTenantEmailAddressServer({
          ...formData as Omit<TenantEmailAddressDTO, 'id' | 'createdAt' | 'updatedAt'>,
          tenantId,
        });
        setSuccess(formatSuccessMessage('Email address created successfully!'));
      }

      setShowForm(false);
      loadEmails();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const friendlyMessage = parseBackendError(err, 'Failed to save email address');
      setError(formatErrorMessage(friendlyMessage));
      console.error('Error saving email:', err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEmail(null);
    setError(null);
  };

  const getEmailTypeColor = (type: TenantEmailType) => {
    const colorMap: Record<TenantEmailType, string> = {
      INFO: 'bg-blue-100 text-blue-800',
      SALES: 'bg-green-100 text-green-800',
      TICKETS: 'bg-indigo-100 text-indigo-800',
      CONTACT: 'bg-purple-100 text-purple-800',
      SUPPORT: 'bg-orange-100 text-orange-800',
      MARKETING: 'bg-pink-100 text-pink-800',
      NOREPLY: 'bg-gray-100 text-gray-800',
      ADMIN: 'bg-red-100 text-red-800',
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '140px' }}>
      {/* Admin Navigation */}
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
        >
          <FaHome />
          <span>Back to Admin Home</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaEnvelopeOpenText className="text-blue-600" />
              Email Configuration
            </h1>
            <p className="text-gray-600 mt-2">
              Manage email addresses used for sending emails to clients and users
            </p>
          </div>
          {!showForm && (
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <FaPlus />
              <span>Add New Email</span>
            </button>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg flex items-center gap-2">
            <FaCheckCircle />
            <span>{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg flex items-center gap-2">
            <FaTimesCircle />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-blue-200">
            <h2 className="text-xl font-semibold mb-4">
              {editingEmail ? 'Edit Email Address' : 'Add New Email Address'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="info@example.com"
                    required
                  />
                </div>

                {/* Email Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.emailType}
                    onChange={(e) => setFormData({ ...formData, emailType: e.target.value as TenantEmailType })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {EMAIL_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Customer Support"
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex items-center gap-6 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Set as Default</span>
                  </label>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Optional notes about this email address"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {editingEmail ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Email List */}
        {!showForm && (
          <div className="overflow-x-auto">
            {emails.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FaEnvelopeOpenText className="mx-auto text-6xl mb-4 text-gray-300" />
                <p className="text-xl">No email addresses configured yet</p>
                <p className="mt-2">Click "Add New Email" to get started</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Display Name
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Default
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {emails.map((email) => (
                    <tr key={email.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{email.emailAddress}</div>
                        {email.description && (
                          <div className="text-sm text-gray-500">{email.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEmailTypeColor(email.emailType)}`}>
                          {email.emailType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {email.displayName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {email.isActive ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <FaCheckCircle />
                            <span className="text-xs">Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <FaTimesCircle />
                            <span className="text-xs">Inactive</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {email.isDefault ? (
                          <span className="inline-flex items-center gap-1 text-blue-600">
                            <FaCheckCircle />
                            <span className="text-xs">Default</span>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(email)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(email)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <FaTrashAlt size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

