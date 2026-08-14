import React from 'react';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import LiveUrlSearch from '../../components/LiveUrlSearch';
import { MoscHubCardMedia } from '../../components/MoscHubCardMedia';
import DirectoryPagination from '../../directory/components/DirectoryPagination';
import AdministrationSidebar from '../components/AdministrationSidebar';
import { DIRECTORY_PAGE_SIZE } from '../../directory/types/listPagination';
import { buildCmsListUrl } from '../../lib/cmsListUrl';
import { getManagingCommitteeMembersData } from './getManagingCommitteeMembersData';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Managing Committee Members',
  description:
    'Current Managing Committee members of the Malankara Orthodox Syrian Church — roster with photos, roles, and dioceses.',
};

const BANNER_DESCRIPTION =
  'Members of the Malankara Association Managing Committee for the current term, including office bearers, metropolitans, and elected representatives.';

const BASE_PATH = '/mosc-redesign/administration/managing-committee-members';
const TERM_YEAR = 2026;

export default async function ManagingCommitteeMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const nameSearch = typeof params.q === 'string' ? params.q : undefined;
  const searchTerm = nameSearch?.trim() ?? '';
  const hasSearch = searchTerm.length > 0;

  const { members, pagination } = await getManagingCommitteeMembersData({
    nameSearch: searchTerm || undefined,
    termYear: TERM_YEAR,
    isCurrent: true,
    page,
    pageSize: DIRECTORY_PAGE_SIZE,
  });

  const subtitle = hasSearch
    ? `${pagination.total} member${pagination.total !== 1 ? 's' : ''} matching "${searchTerm}".`
    : `Term ${TERM_YEAR}. ${pagination.total} member${pagination.total !== 1 ? 's' : ''}.`;

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Managing Committee Members"
        breadcrumbFrom="administration"
        description={BANNER_DESCRIPTION}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <AdministrationSidebar currentSlug="managing-committee-members" />
            </div>

            <div className="lg:col-span-3">
              <h3 className="text-2xl font-light text-[#798daf] mb-4 pl-8 border-l-[7px] border-syro-red">
                Current Roster
              </h3>
              <p className="font-syro-primary text-syro-dark-gray mb-6">{subtitle}</p>

              <div className="mb-6">
                <LiveUrlSearch
                  id="managing-committee-members-search"
                  ariaLabel="Search Managing Committee members by name"
                  placeholder="Search members by name..."
                  inputClassName="font-syro-primary w-full px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
                />
              </div>

              {members.length === 0 ? (
                <p className="font-syro-primary text-syro-dark-gray mb-12">
                  {hasSearch
                    ? 'No members match your search.'
                    : 'Managing Committee member roster is not available yet.'}
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                    {members.map((member) => {
                      const hasPhoto = Boolean(member.photoUrl);
                      return (
                        <div
                          key={member.documentId || member.slug}
                          className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 overflow-hidden flex flex-col h-full"
                        >
                          {hasPhoto && member.photoUrl ? (
                            <MoscHubCardMedia
                              src={member.photoUrl}
                              alt={member.photoAlt ?? member.name}
                              frame="portraitUniform"
                              objectPosition="top"
                              frameClassName="bg-white"
                              unoptimized={member.photoUrl.startsWith('http')}
                            />
                          ) : null}
                          <div
                            className={`p-8 flex flex-col flex-1 ${hasPhoto ? 'pt-0' : ''}`}
                          >
                            <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-2 leading-snug">
                              {member.name}
                            </h3>
                            {member.role ? (
                              <p className="font-syro-primary text-sm font-medium text-syro-red mb-2">
                                {member.role}
                              </p>
                            ) : null}
                            {member.electedRegion ? (
                              <p className="font-syro-primary text-sm text-syro-dark-gray mb-2">
                                <span className="font-semibold text-syro-blue">Elected region:</span>{' '}
                                {member.electedRegion}
                              </p>
                            ) : null}
                            {member.address ? (
                              <p className="font-syro-primary text-sm text-syro-dark-gray leading-relaxed whitespace-pre-line flex-1">
                                {member.address}
                              </p>
                            ) : (
                              <div className="flex-1" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <DirectoryPagination
                    page={pagination.page}
                    pageCount={pagination.pageCount}
                    total={pagination.total}
                    pageSize={DIRECTORY_PAGE_SIZE}
                    itemsOnPage={members.length}
                    buildPageHref={(p) => buildCmsListUrl(BASE_PATH, p, searchTerm || undefined)}
                    itemLabel="members"
                    emptyLabel="No members found"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
}
