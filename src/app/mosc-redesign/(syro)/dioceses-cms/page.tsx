import React, { Suspense } from 'react';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import { getDiocesesData } from '../directory/dioceses/getDiocesesData';
import type { Diocese } from '../directory/dioceses/types';
import DiocesesCmsSearchGrid from './components/DiocesesCmsSearchGrid';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dioceses',
  description:
    'Explore the dioceses of the Malankara Orthodox Syrian Church across India and worldwide.',
};

const BANNER_DESCRIPTION =
  'The Malankara Orthodox Syrian Church is organized into dioceses that serve communities across different regions, ensuring spiritual care and administrative support for all members.';

/** Non-diocese Strapi rows sometimes stored in the dioceses collection. */
const NON_DIOCESE_SLUG_PARTS = ['mgocsm', 'under-direct-control'];

function isDioceseEntry(d: Diocese): boolean {
  const slug = d.slug.toLowerCase();
  return !NON_DIOCESE_SLUG_PARTS.some((part) => slug.includes(part));
}

function classifyRegion(d: Diocese): 'kerala' | 'indian' | 'international' {
  const key = `${d.name} ${d.slug}`.toLowerCase();
  if (
    /\b(america|canada)\b|uk[\s-]|europe|africa|asia[\s-]?pacific/.test(key)
  ) {
    return 'international';
  }
  if (
    /madras|chennai|bangalore|bengaluru|bombay|mumbai|calcutta|kolkata|delhi|ahmedabad/.test(
      key
    )
  ) {
    return 'indian';
  }
  return 'kerala';
}

function DioceseStatistics({ dioceses }: { dioceses: Diocese[] }) {
  const counted = dioceses.filter(isDioceseEntry);
  let kerala = 0;
  let indian = 0;
  let international = 0;
  for (const d of counted) {
    const region = classifyRegion(d);
    if (region === 'international') international += 1;
    else if (region === 'indian') indian += 1;
    else kerala += 1;
  }

  return (
    <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6">
      <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
        Diocese Statistics
      </h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-syro-primary text-syro-dark-gray">Total Dioceses</span>
          <span className="font-syro-display font-semibold text-syro-blue">{counted.length}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-syro-primary text-syro-dark-gray">Kerala Dioceses</span>
          <span className="font-syro-display font-semibold text-syro-blue">{kerala}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-syro-primary text-syro-dark-gray">Indian Dioceses</span>
          <span className="font-syro-display font-semibold text-syro-blue">{indian}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-syro-primary text-syro-dark-gray">International Dioceses</span>
          <span className="font-syro-display font-semibold text-syro-blue">{international}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-syro-primary text-syro-dark-gray">Total Parishes</span>
          <span className="font-syro-display font-semibold text-syro-blue">2000+</span>
        </div>
      </div>
    </div>
  );
}

export default async function DiocesesPage() {
  const { dioceses } = await getDiocesesData({
    page: 1,
    pageSize: 100,
    // Preserve Strapi default / geographic-ish order (omit name:asc).
    sort: null,
  });

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Dioceses"
        breadcrumbFrom="home"
        description={BANNER_DESCRIPTION}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            Our Dioceses
          </h3>

          <Suspense
            fallback={
              <div className="mb-12 h-40 animate-pulse rounded-lg bg-syro-table-border/30" />
            }
          >
            <DiocesesCmsSearchGrid dioceses={dioceses} />
          </Suspense>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16">
            <div>
              <h2 className="text-2xl font-light text-[#798daf] pl-8 border-l-[7px] border-syro-red mb-6">
                About Our Dioceses
              </h2>
              <div className="space-y-4 font-syro-primary text-syro-dark-gray leading-relaxed">
                <p>
                  Each diocese in the Malankara Orthodox Syrian Church is led by a Metropolitan or Bishop
                  who provides spiritual guidance and administrative oversight to the parishes within their jurisdiction.
                </p>
                <p>
                  Our dioceses are organized geographically to serve the spiritual needs of our members,
                  whether they are in Kerala, other parts of India, or in international communities
                  around the world.
                </p>
                <p>
                  Each diocese maintains its own administrative structure while remaining united with
                  the central church authority, ensuring both local autonomy and global unity in our faith.
                </p>
              </div>
            </div>

            <DioceseStatistics dioceses={dioceses} />
          </div>

          <QuickLinks />
        </div>
      </section>
    </div>
  );
}
