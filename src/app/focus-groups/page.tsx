import { getAppUrl } from '@/lib/env';

function toInt(v: string | undefined, d: number) {
  const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : d;
}

async function fetchEventsForGroup(baseUrl: string, groupId: number) {
  try {
    // Fetch only events associated with this focus group
    const res = await fetch(`${baseUrl}/api/proxy/event-details?focusGroupId.equals=${groupId}&isActive.equals=true&sort=startDate,asc&size=3`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function FocusGroupsPage({ searchParams }: { searchParams?: { [k: string]: string | string[] | undefined } }) {
  const baseUrl = getAppUrl();
  const page = toInt(typeof searchParams?.page === 'string' ? searchParams?.page : undefined, 0);
  const size = toInt(typeof searchParams?.size === 'string' ? searchParams?.size : undefined, 9);
  const sort = typeof searchParams?.sort === 'string' ? searchParams?.sort : 'name,asc';

  let groups: any[] = [];
  let total = 0;
  try {
    const res = await fetch(`${baseUrl}/api/proxy/focus-groups?isActive.equals=true&page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`,
      { cache: 'no-store', headers: { 'Content-Type': 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      groups = Array.isArray(data) ? data : [];
      total = Number(res.headers.get('x-total-count') || groups.length || 0);
    }
  } catch { }

  // Fetch events for each focus group
  const groupsWithEvents = await Promise.all(
    groups.map(async (group) => {
      const events = group?.id ? await fetchEventsForGroup(baseUrl, group.id) : [];
      return { ...group, events };
    })
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-5xl mx-auto px-8 pt-24 pb-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-6 h-3 bg-gradient-to-r from-indigo-400 to-cyan-400 rounded-full"></div>
            <p className="text-gray-600 font-medium">Community</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-light leading-tight tracking-tight text-gray-900 mb-2">Focus Groups</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">Explore our specialized groups and their upcoming activities.</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupsWithEvents.map(g => (
              <div key={g.id} className="group block bg-white rounded-xl shadow p-6 hover:shadow-md transition">
                <a href={`/focus-groups/${encodeURIComponent(g.slug)}`} className="block">
                  <div className="h-36 rounded-lg mb-4 bg-cover bg-center" style={{ backgroundImage: g.coverImageUrl ? `url(${g.coverImageUrl})` : undefined, backgroundColor: '#f3f4f6' }} />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{g.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">{g.description || 'No description provided.'}</p>
                </a>

                {/* Show events associated with this focus group */}
                {g.events && g.events.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Upcoming Events</h4>
                    <div className="space-y-2">
                      {g.events.slice(0, 3).map((event: any) => (
                        <a
                          key={event.id}
                          href={`/event/${event.id}`}
                          className="block p-2 rounded hover:bg-gray-50 transition-colors"
                        >
                          <div className="text-xs text-gray-500">{event.startDate} • {event.startTime}</div>
                          <div className="text-sm font-medium text-gray-900 mt-1 line-clamp-1">{event.title}</div>
                        </a>
                      ))}
                      {g.events.length > 3 && (
                        <a
                          href={`/focus-groups/${encodeURIComponent(g.slug)}`}
                          className="block text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium"
                        >
                          View all {g.events.length} events →
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {g.events && g.events.length === 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">No upcoming events</p>
                  </div>
                )}
              </div>
            ))}
            {groups.length === 0 && (
              <div className="col-span-full text-center text-gray-500">No focus groups found.</div>
            )}
          </div>

          {(() => {
            const totalPages = Math.max(1, Math.ceil((total || 0) / size));
            const isPrevDisabled = page <= 0;
            const isNextDisabled = page + 1 >= totalPages;
            const startItem = total > 0 ? page * size + 1 : 0;
            const endItem = total > 0 ? page * size + Math.min(size, total - page * size) : 0;
            const displayPage = totalPages === 0 ? 0 : page + 1;
            const qs = (p: number) => `?page=${p}&size=${size}&sort=${encodeURIComponent(sort)}`;
            return (
              <div className="mt-8">
                <div className="flex justify-between items-center">
                  {/* Previous Button */}
                  <a
                    href={isPrevDisabled ? '#' : `/focus-groups${qs(page - 1)}`}
                    aria-disabled={isPrevDisabled}
                    className={`px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md ${isPrevDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                    title="Previous Page"
                    aria-label="Previous Page"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                  </a>

                  {/* Page Info */}
                  <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                    <span className="text-sm font-bold text-blue-700">
                      Page <span className="text-blue-600">{displayPage}</span> of <span className="text-blue-600">{totalPages}</span>
                    </span>
                  </div>

                  {/* Next Button */}
                  <a
                    href={isNextDisabled ? '#' : `/focus-groups${qs(page + 1)}`}
                    aria-disabled={isNextDisabled}
                    className={`px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md ${isNextDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                    title="Next Page"
                    aria-label="Next Page"
                  >
                    <span>Next</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>

                {/* Item Count Text */}
                <div className="text-center mt-3">
                  {total > 0 ? (
                    <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                      <span className="text-sm text-gray-700">
                        Showing <span className="font-bold text-blue-600">{startItem}</span> to <span className="font-bold text-blue-600">{endItem}</span> of <span className="font-bold text-blue-600">{total}</span> focus groups
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-orange-700">No focus groups found</span>
                      <span className="text-sm text-orange-600">[No focus groups match your criteria]</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
