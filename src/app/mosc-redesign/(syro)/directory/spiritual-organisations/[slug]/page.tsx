import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getSpiritualOrganisationBySlug,
} from '../../../spiritual-organizations-cms/getSpiritualOrganisationData';
import {
  mergeContactLists,
  parseSpiritualOrganisationDescription,
} from '../../../spiritual-organizations-cms/parseDescription';
import SyroPageBanner from '../../../components/SyroPageBanner';

export const dynamic = 'force-dynamic';

const LIST_PATH = '/mosc-redesign/directory/spiritual-organisations';
const TYPE_LABEL = 'Spiritual Organisations';

type PageProps = { params: Promise<{ slug: string }> };

function formatWebsiteHref(website: string): string {
  const trimmed = website.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/\//, '')}`;
}

function formatWebsiteLabel(website: string): string {
  return website.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getSpiritualOrganisationBySlug(slug);
  if (!entry) return { title: 'Entry Not Found | Directory | MOSC' };
  return {
    title: `${entry.name} | Directory | Malankara Orthodox Syrian Church`,
    description: entry.description ?? `Directory entry for ${entry.name}.`,
  };
}

export default async function SpiritualOrganisationDirectoryDetailPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const entry = await getSpiritualOrganisationBySlug(slug);
  if (!entry) notFound();

  // Same contact merge as spiritual-organizations-cms contact card
  const { contact: extracted } = parseSpiritualOrganisationDescription(entry.description);
  const addressLines = entry.address?.trim()
    ? entry.address
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
    : extracted.addressLines;
  const phones = mergeContactLists(entry.phones, extracted.phones);
  const emails = mergeContactLists(entry.email, extracted.emails);
  const websites = mergeContactLists(entry.website, extracted.websites);

  const hasContact =
    addressLines.length > 0 || phones.length > 0 || emails.length > 0 || websites.length > 0;

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title={entry.name} breadcrumbFrom="directory" />
      <section className="relative bg-syro-bg-gray py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={LIST_PATH}
            className="inline-block no-underline font-light text-white bg-[#dc3545] py-2.5 px-5 border-r-[7px] border-r-[#be1929] mb-6 transition-[1s] hover:bg-[#be1929] hover:border-r-[6px] hover:border-r-[#dc3545] hover:text-white"
          >
            ← Back to {TYPE_LABEL}
          </Link>

          <div className="bg-white rounded-lg p-6 sm:p-8 sacred-shadow-sm border-l-4 border-syro-red shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {entry.imageUrl && (
                <div className="relative w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-syro-bg-gray sacred-shadow">
                  <Image
                    src={entry.imageUrl}
                    alt={entry.imageAlt ?? entry.name}
                    fill
                    className="object-contain"
                    sizes="160px"
                    priority
                    unoptimized={entry.imageUrl.startsWith('http')}
                  />
                </div>
              )}
              {hasContact ? (
                <div className="min-w-0 flex-1 space-y-2 font-body text-syro-dark-gray">
                  {addressLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  {phones.length > 0 ? (
                    <div className={addressLines.length > 0 ? 'mt-4' : undefined}>
                      <p className="mb-2">
                        <strong>Ph.:</strong> {phones.join(', ')}
                      </p>
                    </div>
                  ) : null}
                  {emails.length > 0 ? (
                    <div className="mt-6 pt-4 border-t border-syro-table-border">
                      <p className="mb-2">
                        <strong>Email:</strong>
                      </p>
                      {emails.map((email) => (
                        <p key={email}>
                          <a
                            href={`mailto:${email}`}
                            className="text-syro-blue hover:underline"
                          >
                            {email}
                          </a>
                        </p>
                      ))}
                    </div>
                  ) : null}
                  {websites.length > 0 ? (
                    <div
                      className={
                        emails.length > 0
                          ? 'mt-4'
                          : addressLines.length > 0 || phones.length > 0
                            ? 'mt-6 pt-4 border-t border-syro-table-border'
                            : undefined
                      }
                    >
                      <p className="mb-2">
                        <strong>Website:</strong>
                      </p>
                      {websites.map((website) => (
                        <p key={website}>
                          <a
                            href={formatWebsiteHref(website)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-syro-blue hover:underline"
                          >
                            {formatWebsiteLabel(website)}
                          </a>
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="font-body text-syro-dark-gray">
                  No address or contact details are available for this organisation yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
