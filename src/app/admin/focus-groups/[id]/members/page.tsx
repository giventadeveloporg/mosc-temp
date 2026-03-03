import { getAppUrl } from '@/lib/env';

async function fetchGroup(baseUrl: string, id: string) {
  try {
    const res = await fetch(`${baseUrl}/api/proxy/focus-groups/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function fetchMembers(baseUrl: string, id: string) {
  try {
    const res = await fetch(`${baseUrl}/api/proxy/focus-group-members?focusGroupId.equals=${id}&sort=createdAt,desc`, { cache: 'no-store' });
    if (!res.ok) return [];
    return Array.isArray(await res.json()) ? await res.json() : [];
  } catch { return []; }
}

export default async function ManageGroupMembersPage(props: { params: Promise<{ id: string }> | { id: string } }) {
  const params = typeof props.params.then === 'function' ? await props.params : props.params;
  const baseUrl = getAppUrl();
  const group = await fetchGroup(baseUrl, params.id);
  const members = await fetchMembers(baseUrl, params.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8" style={{ paddingTop: '120px' }}>
      {/* Page Header - design system: pageHeader */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">
          Manage Members for: {group?.name ?? 'Focus Group'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
          Add or update member roles and statuses (UPPERCASE enforced).
        </p>
      </div>

      {/* Add Member card - design system: tabContent */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Add Member</h2>
        <form action={`${baseUrl}/api/proxy/focus-group-members`} method="post" className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <input type="hidden" name="focusGroupId" value={params.id} />
          <div>
            <label htmlFor="userProfileId" className="block text-sm font-medium text-gray-700 mb-1">User Profile ID</label>
            <input
              type="text"
              id="userProfileId"
              name="userProfileId"
              placeholder="User Profile ID"
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
              required
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              type="text"
              id="role"
              name="role"
              placeholder="MEMBER/LEAD/ADMIN"
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <input
              type="text"
              id="status"
              name="status"
              placeholder="ACTIVE/INACTIVE/PENDING"
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            />
          </div>
          <button
            type="submit"
            className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-4"
            title="Add member"
            aria-label="Add member"
          >
            <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </span>
            <span className="font-semibold text-green-700 hidden sm:inline">Add</span>
          </button>
        </form>
      </div>

      {/* Members table card - design system: tabContent */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Members</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Profile ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((m: any) => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900">{m.userProfileId}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{String(m.role || '').toUpperCase()}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{String(m.status || '').toUpperCase()}</td>
                  <td className="px-4 py-3 text-right text-sm">
                    <form action={`${baseUrl}/api/proxy/focus-group-members/${m.id}`} method="post" className="inline-flex flex-wrap items-center gap-2 justify-end">
                      <input type="hidden" name="_method" value="PATCH" />
                      <input
                        type="text"
                        name="role"
                        placeholder="MEMBER/LEAD/ADMIN"
                        className="block w-28 border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-3 py-2 text-sm"
                        defaultValue={String(m.role || '').toUpperCase()}
                      />
                      <input
                        type="text"
                        name="status"
                        placeholder="ACTIVE/INACTIVE/PENDING"
                        className="block w-28 border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-3 py-2 text-sm"
                        defaultValue={String(m.status || '').toUpperCase()}
                      />
                      <button
                        type="submit"
                        className="flex-shrink-0 h-10 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 px-3"
                        title="Update member"
                        aria-label="Update member"
                      >
                        <span className="w-8 h-8 rounded-lg bg-blue-200 flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </span>
                        <span className="font-semibold text-blue-700 text-sm hidden sm:inline">Update</span>
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr><td className="px-4 py-8 text-sm text-gray-500 text-center" colSpan={4}>No members found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
