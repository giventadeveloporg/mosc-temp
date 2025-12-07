import { getAppUrl } from '@/lib/env';
import { FaEdit, FaCalendarAlt, FaUsers } from 'react-icons/fa';

function toInt(v: string | undefined, d: number) {
  const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : d;
}

export default async function AdminFocusGroupsPage({ searchParams }: { searchParams?: { [k: string]: string | string[] | undefined } | Promise<{ [k: string]: string | string[] | undefined }> }) {
  // Await searchParams if it's a promise (Next.js 15+ requirement)
  const resolvedSearchParams = typeof searchParams?.then === 'function' ? await searchParams : searchParams;

  const baseUrl = getAppUrl();
  const page = toInt(typeof resolvedSearchParams?.page === 'string' ? resolvedSearchParams?.page : undefined, 0);
  const size = toInt(typeof resolvedSearchParams?.size === 'string' ? resolvedSearchParams?.size : undefined, 10);
  const sort = typeof resolvedSearchParams?.sort === 'string' ? resolvedSearchParams?.sort : 'createdAt,desc';

  let groups: any[] = [];
  let total = 0;
  try {
    const url = `${baseUrl}/api/proxy/focus-groups?page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`;
    console.log('[FocusGroups] Fetching from:', url);

    const res = await fetch(url, { cache: 'no-store' });
    console.log('[FocusGroups] Response status:', res.status, res.statusText);

    if (res.ok) {
      const data = await res.json();
      console.log('[FocusGroups] Response data type:', typeof data, 'Is array:', Array.isArray(data), 'Has content:', data?.content);

      // Handle different response formats:
      // 1. Direct array
      // 2. Paginated response with content array (Spring Data REST)
      // 3. Single object (wrap in array)
      if (Array.isArray(data)) {
        groups = data;
        console.log('[FocusGroups] Using direct array format, count:', groups.length);
      } else if (data && typeof data === 'object' && Array.isArray(data.content)) {
        // Spring Data REST paginated response
        groups = data.content;
        console.log('[FocusGroups] Using paginated content array format, count:', groups.length);
      } else if (data && typeof data === 'object' && data.id) {
        // Single object - wrap in array
        groups = [data];
        console.log('[FocusGroups] Using single object format, wrapped in array');
      } else {
        groups = [];
        console.log('[FocusGroups] Unknown format, defaulting to empty array');
      }

      // Get total count from header (preferred) or from response
      const totalCountHeader = res.headers.get('x-total-count') || res.headers.get('X-Total-Count');
      if (totalCountHeader) {
        total = Number(totalCountHeader);
        console.log('[FocusGroups] Total from header:', total);
      } else if (data && typeof data === 'object' && typeof data.totalElements === 'number') {
        // Spring Data REST paginated response total
        total = data.totalElements;
        console.log('[FocusGroups] Total from totalElements:', total);
      } else {
        total = groups.length;
        console.log('[FocusGroups] Total from groups length:', total);
      }

      console.log('[FocusGroups] Final result - groups:', groups.length, 'total:', total);
    } else {
      const errorText = await res.text();
      console.error('[FocusGroups] API error:', res.status, errorText);
    }
  } catch (err) {
    console.error('[FocusGroups] Error fetching focus groups:', err);
  }

  return (
    <div className="px-8 pt-24 pb-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Manage Focus Groups</h1>
        <a href="/admin/focus-groups/new" className="px-3 py-2 bg-blue-600 text-white rounded">New Group</a>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {groups.map(g => (
              <tr key={g.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{g.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{g.isActive ? 'YES' : 'NO'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex items-center justify-end gap-4">
                    <a className="text-blue-600 hover:text-blue-800 flex items-center gap-1" href={`/admin/focus-groups/${g.id}/edit`}>
                      <FaEdit className="text-base" />
                      <span>Edit</span>
                    </a>
                    <a className="text-blue-600 hover:text-blue-800 flex items-center gap-1" href={`/admin/focus-groups/${g.id}/events`}>
                      <FaCalendarAlt className="text-base" />
                      <span>Events</span>
                    </a>
                    <a className="text-blue-600 hover:text-blue-800 flex items-center gap-1" href={`/admin/focus-groups/${g.id}/members`}>
                      <FaUsers className="text-base" />
                      <span>Members</span>
                    </a>
                  </div>
                </td>
              </tr>
            ))}
            {groups.length === 0 && (
              <tr><td className="px-6 py-4 text-sm text-gray-500" colSpan={4}>No focus groups found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {(
        () => {
          const totalPages = Math.max(1, Math.ceil((total || 0) / size));
          const isPrevDisabled = page <= 0;
          const isNextDisabled = page + 1 >= totalPages;
          const qs = (p: number) => `?page=${p}&size=${size}&sort=${encodeURIComponent(sort)}`;
          return (
            <div className="mt-8">
              <div className="flex justify-between items-center">
                <a aria-disabled={isPrevDisabled} className={`px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 ${isPrevDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`} href={isPrevDisabled ? '#' : `/admin/focus-groups${qs(page - 1)}`}>Previous</a>
                <div className="text-sm font-semibold text-gray-700">Page {totalPages === 0 ? 0 : page + 1} of {totalPages}</div>
                <a aria-disabled={isNextDisabled} className={`px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 ${isNextDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`} href={isNextDisabled ? '#' : `/admin/focus-groups${qs(page + 1)}`}>Next</a>
              </div>
              <div className="text-center text-sm text-gray-600 mt-2">
                {total > 0 ? (
                  <>Showing <span className="font-medium">{page * size + 1}</span> to <span className="font-medium">{page * size + Math.min(size, total - page * size)}</span> of <span className="font-medium">{total}</span> items</>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>No items found</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-medium">[No items match your criteria]</span>
                  </div>
                )}
              </div>
            </div>
          );
        }
      )()}
    </div>
  );
}
