import { Suspense } from 'react';
import TenantOrganizationList from '@/app/admin/tenant-management/components/TenantOrganizationList';
import AdminNavigation from '@/components/AdminNavigation';
import Link from 'next/link';

export default async function TenantOrganizationsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '180px' }}>
      <AdminNavigation currentPage="organizations" />

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tenant Organizations</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Manage tenant organizations and their configurations.
            </p>
          </div>
        </div>

        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading organizations...</p>
            </div>
          </div>
        }>
          <TenantOrganizationList />
        </Suspense>
      </div>
    </div>
  );
}
