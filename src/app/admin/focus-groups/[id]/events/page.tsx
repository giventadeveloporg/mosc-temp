import { getAppUrl } from '@/lib/env';

async function fetchGroup(baseUrl: string, id: string) {
  try {
    const res = await fetch(`${baseUrl}/api/proxy/focus-groups/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function fetchLinkedEvents(baseUrl: string, id: string) {
  try {
    const res = await fetch(`${baseUrl}/api/proxy/event-details?focusGroupId.equals=${id}&sort=startDate,desc`, { cache: 'no-store' });
    if (!res.ok) return [];
    return Array.isArray(await res.json()) ? await res.json() : [];
  } catch { return []; }
}

async function fetchAllEvents(baseUrl: string) {
  try {
    const res = await fetch(`${baseUrl}/api/proxy/event-details?sort=startDate,desc&page=0&size=100`, { cache: 'no-store' });
    if (!res.ok) return [];
    return Array.isArray(await res.json()) ? await res.json() : [];
  } catch { return []; }
}

export default async function ManageGroupEventsPage(props: { params: Promise<{ id: string }> | { id: string } }) {
  const params = typeof props.params.then === 'function' ? await props.params : props.params;
  const baseUrl = getAppUrl();
  const group = await fetchGroup(baseUrl, params.id);
  const linked = await fetchLinkedEvents(baseUrl, params.id);
  const all = await fetchAllEvents(baseUrl);
  const linkedIds = new Set(linked.map((e: any) => e.id));
  const candidates = all.filter((e: any) => !linkedIds.has(e.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8" style={{ paddingTop: '120px' }}>
      {/* Page Header - design system: pageHeader */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">
          Manage Events for: {group?.name ?? 'Focus Group'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
          Link or unlink events to this focus group.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Content card - design system: tabContent / content card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Linked Events</h2>
          <ul className="space-y-2">
            {linked.map((e: any) => (
              <li key={e.id} className="flex items-center justify-between text-sm border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <span className="font-semibold text-gray-900">{e.title}</span>
                <form action={`${baseUrl}/api/proxy/event-focus-groups`} method="post" className="flex-shrink-0">
                  <input type="hidden" name="_method" value="DELETE" />
                  <input type="hidden" name="eventId" value={e.id} />
                  <input type="hidden" name="focusGroupId" value={params.id} />
                  <button
                    type="submit"
                    className="flex-shrink-0 h-10 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 px-3"
                    title="Unlink event"
                    aria-label="Unlink event"
                  >
                    <span className="w-8 h-8 rounded-lg bg-red-200 flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </span>
                    <span className="font-semibold text-red-700 text-sm hidden sm:inline">Unlink</span>
                  </button>
                </form>
              </li>
            ))}
            {linked.length === 0 && <li className="text-gray-500 text-sm p-4">No linked events.</li>}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Link New Event</h2>
          <form action={`${baseUrl}/api/proxy/event-focus-groups`} method="post" className="flex flex-col sm:flex-row gap-3">
            <input type="hidden" name="focusGroupId" value={params.id} />
            <select
              name="eventId"
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base flex-1"
            >
              {candidates.map((e: any) => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
            <button
              type="submit"
              className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-4"
              title="Link event"
              aria-label="Link event"
            >
              <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </span>
              <span className="font-semibold text-green-700 hidden sm:inline">Link</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
