import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { getBishopsData } from './getBishopsData';
import type { Bishop, BishopType } from './types';

export const metadata: Metadata = {
  title: 'Bishops | Directory | Malankara Orthodox Syrian Church',
  description: 'Directory of bishops — The Catholicos, Diocesan Bishops, Retired Bishops.',
  keywords: ['MOSC Directory', 'Bishops', 'Holy Synod', 'Catholicos', 'Diocesan Bishops'],
};

const SECTION_TITLES: Record<BishopType, string> = {
  catholicos: 'The Catholicos',
  diocesan: 'Diocesan Bishops',
  retired: 'Retired Bishops',
};

const PAGE_SIZE = 20;

type PageProps = {
  searchParams: Promise<{ type?: string; page?: string }>;
};

export default async function BishopsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const typeParam = params.type as BishopType | undefined;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);

  const validType =
    typeParam === 'catholicos' || typeParam === 'diocesan' || typeParam === 'retired'
      ? typeParam
      : undefined;

  if (validType) {
    const { bishops, pagination } = await getBishopsData({
      bishopType: validType,
      page,
      pageSize: PAGE_SIZE,
    });
    const title = SECTION_TITLES[validType];
    return (
      <div className="min-h-screen bg-background">
        <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/mosc/directory"
              className="font-body text-primary hover:underline mb-4 inline-block"
            >
              ← Directory
            </Link>
            <h1 className="font-heading font-semibold text-3xl lg:text-4xl text-foreground">
              {title}
            </h1>
            <p className="font-body text-muted-foreground mt-2">
              {pagination.total} bishop{pagination.total !== 1 ? 's' : ''} in this section
            </p>
          </div>
        </section>

        <section className="py-12 bg-card">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {bishops.length === 0 ? (
              <div className="bg-muted/20 rounded-lg p-8 text-center">
                <p className="font-body text-muted-foreground">
                  No bishops listed for this section yet. Data is loaded from the directory API.
                </p>
                <Link href="/mosc/directory" className="font-body text-primary font-medium mt-4 inline-block hover:underline">
                  Back to Directory
                </Link>
              </div>
            ) : (
              <>
                <ul className="space-y-6">
                  {bishops.map((bishop) => (
                    <BishopCard key={bishop.documentId} bishop={bishop} />
                  ))}
                </ul>
                {pagination.pageCount > 1 && (
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                    <span className="font-body text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.pageCount}
                    </span>
                    <div className="flex gap-3">
                      {pagination.page > 1 && (
                        <Link
                          href={`/mosc/directory/bishops?type=${validType}&page=${pagination.page - 1}`}
                          className="px-4 py-2 bg-primary/10 text-primary font-body font-medium rounded-lg hover:bg-primary/20 reverent-transition"
                        >
                          Previous
                        </Link>
                      )}
                      {pagination.page < pagination.pageCount && (
                        <Link
                          href={`/mosc/directory/bishops?type=${validType}&page=${pagination.page + 1}`}
                          className="px-4 py-2 bg-primary/10 text-primary font-body font-medium rounded-lg hover:bg-primary/20 reverent-transition"
                        >
                          Next
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    );
  }

  const [catholicos, diocesan, retired] = await Promise.all([
    getBishopsData({ bishopType: 'catholicos', page: 1, pageSize: 10 }),
    getBishopsData({ bishopType: 'diocesan', page: 1, pageSize: 10 }),
    getBishopsData({ bishopType: 'retired', page: 1, pageSize: 10 }),
  ]);

  const sections: { type: BishopType; title: string; bishops: Bishop[]; total: number }[] = [
    { type: 'catholicos', title: SECTION_TITLES.catholicos, bishops: catholicos.bishops, total: catholicos.pagination.total },
    { type: 'diocesan', title: SECTION_TITLES.diocesan, bishops: diocesan.bishops, total: diocesan.pagination.total },
    { type: 'retired', title: SECTION_TITLES.retired, bishops: retired.bishops, total: retired.pagination.total },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/mosc/directory"
            className="font-body text-primary hover:underline mb-4 inline-block"
          >
            ← Directory
          </Link>
          <h1 className="font-heading font-semibold text-3xl lg:text-4xl text-foreground">
            The Holy Synod of Bishops
          </h1>
          <p className="font-body text-muted-foreground mt-2">
            The Catholicos, Diocesan Bishops, and Retired Bishops. Data from the directory API.
          </p>
        </div>
      </section>

      <section className="py-12 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {sections.map(({ type, title, bishops, total }) => (
            <div key={type} className="bg-muted/20 rounded-lg overflow-hidden sacred-shadow-sm border-l-4 border-primary">
              <div className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <h2 className="font-heading font-semibold text-2xl text-foreground">
                    {title}
                  </h2>
                  {total > bishops.length && (
                    <Link
                      href={`/mosc/directory/bishops?type=${type}`}
                      className="font-body text-primary font-medium hover:underline inline-flex items-center gap-1"
                    >
                      View all ({total})
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
                {bishops.length === 0 ? (
                  <p className="font-body text-muted-foreground">No entries in this section yet.</p>
                ) : (
                  <ul className="space-y-4">
                    {bishops.map((bishop) => (
                      <BishopCard key={bishop.documentId} bishop={bishop} />
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function BishopCard({ bishop }: { bishop: Bishop }) {
  return (
    <li className="bg-card rounded-lg p-4 sacred-shadow-sm hover:sacred-shadow reverent-transition">
      <Link href={`/mosc/directory/bishops/${bishop.documentId}`} className="flex gap-4 group">
        {bishop.imageUrl && (
          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted/40">
            <Image
              src={bishop.imageUrl}
              alt={bishop.imageAlt ?? bishop.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-heading font-medium text-lg text-foreground group-hover:text-primary reverent-transition">
            {bishop.name}
          </h3>
          {bishop.dioceseName && (
            <p className="font-body text-sm text-muted-foreground mt-0.5">
              {bishop.dioceseName}
            </p>
          )}
          <span className="inline-flex items-center font-body text-primary text-sm font-medium mt-2 group-hover:gap-2 reverent-transition">
            View details
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </Link>
    </li>
  );
}
