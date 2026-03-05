import { getAppUrl } from '@/lib/env';

async function fetchGroup(baseUrl: string, slug: string) {
  try {
    const res = await fetch(`${baseUrl}/api/proxy/focus-groups?slug.equals=${encodeURIComponent(slug)}&size=1`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch {
    return null;
  }
}

async function fetchEvents(baseUrl: string, groupId: number) {
  try {
    const res = await fetch(`${baseUrl}/api/proxy/event-details?focusGroupId.equals=${groupId}&sort=startDate,asc`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** Top padding so content (including cover image) is not cut off by the fixed header. Per design_systems/event_site_general_design_final.json pageLayout.container.topOffset. */
const PAGE_TOP_OFFSET = 120;

export default async function FocusGroupDetailPage({ params }: { params: { slug: string } }) {
  const baseUrl = getAppUrl();
  const slug = typeof params.slug === 'string' ? params.slug : Array.isArray(params.slug) ? params.slug[0] : '';
  const group = await fetchGroup(baseUrl, slug);
  const events = group?.id ? await fetchEvents(baseUrl, group.id) : [];

  /* Design system: semantic colors for card accents (blue, teal, purple cycle) */
  const cardAccentColors = ['border-indigo-500', 'border-teal-500', 'border-amber-500'] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50" style={{ paddingTop: `${PAGE_TOP_OFFSET}px` }}>
      {/* Container: design system pageLayout - max-w-7xl, responsive padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Page header section: design system sectionSpacing medium (mb-8) */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          {/* Cover image: fixed height 250px, contain so full image visible */}
          <div
            className="relative w-full h-[250px] overflow-hidden rounded-xl shadow-md bg-transparent"
            style={{
              backgroundImage: group?.coverImageUrl ? `url(${group.coverImageUrl})` : undefined,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
            role="img"
            aria-label={group?.name ? `${group.name} cover` : 'Focus group cover'}
          >
            {!group?.coverImageUrl && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-400 text-sm">No cover image</span>
              </div>
            )}
          </div>
          {/* Title: design system pageHeader with colored accent (indigo) */}
          <h1 className="mt-6 text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 pb-2 border-b-2 border-indigo-200 text-center sm:text-left">
            {group?.name || 'Focus Group'}
          </h1>
          {/* Description: design system pageHeader.description - muted with slight color */}
          <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left max-w-3xl">
            {group?.description || 'Details coming soon.'}
          </p>
        </div>

        {/* Upcoming Events: design system section title with colored left border (indigo) */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-indigo-800 border-l-4 border-indigo-500 pl-3 mb-4 sm:mb-6">
            Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {events.map((e: any, idx: number) => {
              const accentClass = cardAccentColors[idx % cardAccentColors.length];
              return (
                <a
                  key={e.id}
                  href={`/events/${e.id}`}
                  className={`border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-all duration-300 bg-white border-l-4 ${accentClass} hover:border-indigo-400`}
                  title={e.title}
                >
                  {/* Date: design system semantic color (blue/indigo for info) */}
                  <div className="text-sm font-medium text-indigo-600 truncate">
                    {e.startDate} • {e.startTime}
                  </div>
                  {/* Title: primary text with hover color */}
                  <div className="mt-1 text-lg font-semibold text-gray-900 hover:text-indigo-700 transition-colors">
                    {e.title}
                  </div>
                  {/* Description: design system muted */}
                  <div className="mt-2 text-sm text-gray-600 line-clamp-3">
                    {e.caption || e.description || ''}
                  </div>
                </a>
              );
            })}
            {events.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500 text-sm">
                No upcoming events.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
