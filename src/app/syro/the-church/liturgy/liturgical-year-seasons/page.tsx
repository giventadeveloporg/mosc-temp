import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Liturgical Year & Seasons',
  description:
    'The liturgical year and seasons in the Malankara Orthodox Syrian Church: cycles, feasts, and fasts.',
};

export default async function LiturgicalYearSeasonsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Liturgical Year & Seasons"
        breadcrumbFrom={breadcrumbFrom}
      />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-[280px] h-auto">
                    <Image
                      src="/images/church/liturgy-worship.jpg"
                      alt="Liturgical Year and Seasons"
                      width={280}
                      height={180}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    Liturgical Year & Seasons
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The liturgical year in the Malankara Orthodox Syrian Church is organized around
                    the great events of salvation: the Incarnation, the Passion, the Resurrection,
                    the Ascension, and Pentecost. The calendar also includes the commemoration of
                    the Mother of God and the saints. Through the cycle of feasts and fasts, the
                    Church sanctifies time and draws the faithful into the life of Christ.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-6 mb-3">
                    Cycles and Seasons
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The year is divided into seasons such as the Nativity cycle (Annunciation,
                    Nativity, Theophany), Great Lent and Holy Week, the Resurrection (Pascha) and
                    Pentecost, and the period of the Church (Ordinary Time). Each season has its own
                    hymns, readings, and spiritual emphasis. The aim is that the whole of life be
                    ordered by the rhythm of the liturgy, so that we may live in Christ throughout
                    the year.
                  </p>
                </div>

                <div className="mt-10 hidden lg:block">
                  <QuickLinks />
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <TheChurchSidebar />
            </div>
          </div>
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
}
