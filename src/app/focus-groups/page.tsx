import { getAppUrl } from '@/lib/env';
import FocusGroupsGridWithSearch from './FocusGroupsGridWithSearch';

async function fetchEventsForGroup(baseUrl: string, groupId: number) {
  try {
    const res = await fetch(`${baseUrl}/api/proxy/event-details?focusGroupId.equals=${groupId}&isActive.equals=true&sort=startDate,asc&size=3`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function FocusGroupsPage() {
  const baseUrl = getAppUrl();
  const sort = 'name,asc';
  const size = 50;

  let groups: any[] = [];
  let total = 0;
  try {
    const res = await fetch(`${baseUrl}/api/proxy/focus-groups?isActive.equals=true&page=0&size=${size}&sort=${encodeURIComponent(sort)}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      groups = Array.isArray(data) ? data : [];
      total = Number(res.headers.get('x-total-count') || groups.length || 0);
    }
  } catch { }

  const groupsWithEvents = await Promise.all(
    groups.map(async (group) => {
      const events = group?.id ? await fetchEventsForGroup(baseUrl, group.id) : [];
      return { ...group, events };
    })
  );

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8" style={{ paddingTop: '120px' }}>
      {/* Page Header - design system: pageHeader */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">
          Focus Groups
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
          Explore our specialized groups and their upcoming activities.
        </p>
      </div>

      {/* Focus Groups Grid with Search - same search bar as admin/executive-committee */}
      <div className="bg-white rounded-lg shadow-md p-6 lg:p-8 mb-8 w-full max-w-[75%] mx-auto">
        <FocusGroupsGridWithSearch groups={groupsWithEvents} total={total} />
      </div>
    </div>
  );
}
