import Link from 'next/link';
import { fetchOfficialDocumentCategoriesServer } from '../official-documents/ApiServerActions';
import { getTenantId } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default async function OfficialDocumentCategoriesPage() {
  const { categories, source, message } = await fetchOfficialDocumentCategoriesServer();
  let tenantLabel = '';
  try {
    tenantLabel = getTenantId();
  } catch {
    tenantLabel = '(NEXT_PUBLIC_TENANT_ID not set)';
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="mb-8 flex flex-wrap items-center gap-4 text-sm">
        <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Admin Dashboard
        </Link>
        <span className="text-gray-300">|</span>
        <Link href="/admin/official-documents" className="text-blue-600 hover:text-blue-800 font-medium">
          Official documents (upload)
        </Link>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Official document categories</h1>

      {message && (
        <div
          className={`mb-6 rounded-lg border p-4 text-sm ${
            source === 'fallback'
              ? 'border-amber-300 bg-amber-50 text-amber-950'
              : 'border-blue-200 bg-blue-50 text-blue-900'
          }`}
          role="status"
        >
          {source === 'fallback' && <strong className="block mb-1">Fallback list</strong>}
          {message}
        </div>
      )}

      <p className="text-gray-600 mb-2">
        Rows in <code className="text-sm bg-gray-100 px-1 rounded">official_document_category</code> for tenant{' '}
        <code className="text-sm bg-gray-100 px-1 rounded">{tenantLabel}</code>. Slugs must match bulk upload.
      </p>
      <p className="text-sm text-gray-500 mb-8">
        If the table has data but this list is empty, confirm <code>NEXT_PUBLIC_TENANT_ID</code> matches{' '}
        <code>tenant_id</code> in the database. If the API returns 404, the app shows a built-in slug list (see banner
        above) until the backend exposes{' '}
        <code className="text-xs">GET /api/official-document-categories</code>.
      </p>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-700">
            {categories.length} {source === 'api' ? 'active' : 'fallback'} categor{categories.length === 1 ? 'y' : 'ies'}
          </span>
          {source === 'fallback' && (
            <span className="text-xs text-amber-800 font-medium">Source: fallback (not from API)</span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sort</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                    No categories available. Configure the API or enable fallback slugs.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id ?? c.slug}>
                    <td className="px-4 py-3 text-sm text-gray-700">{c.sortOrder ?? '—'}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{c.slug}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{c.displayName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xl">{c.description ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
