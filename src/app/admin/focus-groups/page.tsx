import { getAppUrl } from '@/lib/env';
// Icons removed - using inline SVGs instead

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
                  <div className="flex items-center justify-end gap-2">
                    <a className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110" href={`/admin/focus-groups/${g.id}/edit`} title="Edit Focus Group" aria-label="Edit Focus Group">
                      <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </a>
                    <a className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center transition-all duration-300 hover:scale-110" href={`/admin/focus-groups/${g.id}/events`} title="Manage Events" aria-label="Manage Events">
                      <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </a>
                    <a className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-all duration-300 hover:scale-110" href={`/admin/focus-groups/${g.id}/members`} title="Manage Members" aria-label="Manage Members">
                      <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
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
