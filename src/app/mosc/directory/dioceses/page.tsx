import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { getDiocesesData } from './getDiocesesData';
import type { Diocese } from './types';

export const metadata: Metadata = {
  title: 'Dioceses | Directory | Malankara Orthodox Syrian Church',
  description: 'Directory of dioceses of the Malankara Orthodox Syrian Church.',
  keywords: ['MOSC Directory', 'Dioceses'],
};

const PAGE_SIZE = 20;

type PageProps = { searchParams: Promise<{ page?: string }> };

export default async function DiocesesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const { dioceses, pagination } = await getDiocesesData({ page, pageSize: PAGE_SIZE });

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/mosc/directory" className="font-body text-primary hover:underline mb-4 inline-block">
            ← Directory
          </Link>
          <h1 className="font-heading font-semibold text-3xl lg:text-4xl text-foreground">
            Dioceses
          </h1>
          <p className="font-body text-muted-foreground mt-2">
            {pagination.total} diocese{pagination.total !== 1 ? 's' : ''}. Data from the directory API.
          </p>
        </div>
      </section>

      <section className="py-12 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {dioceses.length === 0 ? (
            <div className="bg-muted/20 rounded-lg p-8 text-center">
              <p className="font-body text-muted-foreground">
                No dioceses listed yet. Data is loaded from the directory API.
              </p>
              <Link href="/mosc/directory" className="font-body text-primary font-medium mt-4 inline-block hover:underline">
                Back to Directory
              </Link>
            </div>
          ) : (
            <>
              <ul className="space-y-6">
                {dioceses.map((d) => (
                  <DioceseCard key={d.documentId} diocese={d} />
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
                        href={`/mosc/directory/dioceses?page=${pagination.page - 1}`}
                        className="px-4 py-2 bg-primary/10 text-primary font-body font-medium rounded-lg hover:bg-primary/20 reverent-transition"
                      >
                        Previous
                      </Link>
                    )}
                    {pagination.page < pagination.pageCount && (
                      <Link
                        href={`/mosc/directory/dioceses?page=${pagination.page + 1}`}
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

function DioceseCard({ diocese }: { diocese: Diocese }) {
  return (
    <li className="bg-muted/20 rounded-lg overflow-hidden sacred-shadow-sm border-l-4 border-primary hover:sacred-shadow reverent-transition">
      <Link href={`/mosc/directory/dioceses/${diocese.documentId}`} className="flex gap-4 p-6 group">
        {diocese.imageUrl && (
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted/40">
            <Image
              src={diocese.imageUrl}
              alt={diocese.imageAlt ?? diocese.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-heading font-semibold text-xl text-foreground group-hover:text-primary reverent-transition">
            {diocese.name}
          </h2>
          {diocese.description && (
            <p className="font-body text-sm text-muted-foreground mt-1 line-clamp-2">
              {diocese.description}
            </p>
          )}
          <span className="inline-flex items-center font-body text-primary text-sm font-medium mt-2">
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
