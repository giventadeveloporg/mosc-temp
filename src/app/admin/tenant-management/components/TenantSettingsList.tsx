'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaSearch, FaSort } from 'react-icons/fa';
import type { TenantSettingsDTO, TenantSettingsFilters, PaginationParams } from '@/app/admin/tenant-management/types';

interface TenantSettingsListProps {
  initialData?: TenantSettingsDTO[];
  initialTotalCount?: number;
  onRefresh?: () => void;
}

export default function TenantSettingsList({
  initialData = [],
  initialTotalCount = 0,
  onRefresh
}: TenantSettingsListProps) {
  // Don't use initialData in state to prevent flash - we'll fetch filtered data immediately
  const [settings, setSettings] = useState<TenantSettingsDTO[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading true to prevent flash
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const [filters, setFilters] = useState<TenantSettingsFilters>({
    search: '',
    tenantId: '',
    sortBy: 'tenantId',
    sortOrder: 'asc'
  });

  // Selection state for bulk operations
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Track if initial load has completed
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Load data function
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/proxy/tenant-settings?' + new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
        ...(filters.search && { 'tenantId.contains': filters.search }),
        ...(filters.tenantId && { 'tenantId.equals': filters.tenantId }),
        ...(filters.sortBy && { sort: `${filters.sortBy},${filters.sortOrder}` })
      }));

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      const total = parseInt(response.headers.get('x-total-count') || '0');

      setSettings(Array.isArray(data) ? data : []);
      setTotalCount(total);
      setInitialLoadComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when filters/pagination change
  useEffect(() => {
    loadData();
  }, [currentPage, pageSize, filters]);

  // Handle search
  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setCurrentPage(0); // Reset to first page when searching
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof TenantSettingsFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(0);
  };

  // Handle sorting
  const handleSort = (field: 'tenantId' | 'createdAt') => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? settings.map(setting => setting.id!).filter(Boolean) : []);
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    setSelectedIds(prev =>
      checked
        ? [...prev, id]
        : prev.filter(selectedId => selectedId !== id)
    );
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete these settings?')) {
      return;
    }

    try {
      const response = await fetch(`/api/proxy/tenant-settings/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadData(); // Refresh the list
        onRefresh?.();
      }
    } catch (err) {
      console.error('Failed to delete settings:', err);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasPrevPage = currentPage > 0;
  const hasNextPage = currentPage < totalPages - 1;
  const startItem = totalCount > 0 ? currentPage * pageSize + 1 : 0;
  const endItem = currentPage * pageSize + settings.length;

  if (loading && settings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Tenant Settings</h2>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by tenant ID..."
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <input
            type="text"
            placeholder="Filter by specific tenant ID..."
            value={filters.tenantId || ''}
            onChange={(e) => handleFilterChange('tenantId', e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.length === settings.length && settings.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="custom-checkbox"
                />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('tenantId')}
              >
                <div className="flex items-center gap-2">
                  Tenant ID
                  <FaSort className="text-xs" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User Registration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                WhatsApp Integration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email Marketing
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Max Events/Month
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {settings.map((setting) => (
              <tr key={setting.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(setting.id!)}
                    onChange={(e) => handleSelectOne(setting.id!, e.target.checked)}
                    className="custom-checkbox"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{setting.tenantId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${setting.allowUserRegistration
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {setting.allowUserRegistration ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${setting.enableWhatsappIntegration
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}>
                    {setting.enableWhatsappIntegration ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${setting.enableEmailMarketing
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}>
                    {setting.enableEmailMarketing ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {setting.maxEventsPerMonth || 'Unlimited'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={`/admin/tenant-management/settings/${setting.id}`}
                      className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                      title="View details"
                      aria-label="View details"
                    >
                      <svg className="w-10 h-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <Link
                      href={`/admin/tenant-management/settings/${setting.id}/edit`}
                      className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                      title="Edit settings"
                      aria-label="Edit settings"
                    >
                      <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(setting.id!)}
                      className="flex-shrink-0 w-14 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                      title="Delete settings"
                      aria-label="Delete settings"
                    >
                      <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {settings.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No settings found</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <div className="flex justify-between items-center">
            <button
              disabled={!hasPrevPage}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <div className="text-sm font-semibold">
              Page {currentPage + 1} of {totalPages}
            </div>
            <button
              disabled={!hasNextPage}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="text-center text-sm text-gray-600 mt-2">
            Showing {startItem} to {endItem} of {totalCount} settings
          </div>
        </div>
      )}
    </div>
  );
}
