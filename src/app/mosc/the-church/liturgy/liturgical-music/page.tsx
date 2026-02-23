import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Liturgical Music',
  description:
    'Liturgical music in the Malankara Orthodox Syrian Church: hymns, melodies, and the role of music in worship.',
};

export default async function LiturgicalMusicPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Liturgical Music" breadcrumbFrom={breadcrumbFrom} />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-[280px] h-auto">
                    <Image
                      src="/images/church/liturgy-worship.jpg"
                      alt="Liturgical Music"
                      width={280}
                      height={180}
                      className="w-auto h-auto object-contain rounded-lg block mx-auto"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    Liturgical Music
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Music has always held a central place in the worship of the Malankara Orthodox
                    Syrian Church. The liturgical tradition uses a system of melodies (tones) and
                    hymns that give expression to the feasts, seasons, and texts of the liturgy.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The hymns are drawn from the Syriac tradition and from the compositions of the
                    Fathers and saints. They are sung by the choir and the faithful, often in
                    response to the priest&apos;s prayers and readings. The eight tones of the
                    liturgical calendar provide a structure for the music, and special melodies are
                    used for Great Lent, Holy Week, and the feasts.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Liturgical music is not merely decorative; it carries the theology and piety of
                    the Church and helps the faithful to pray and to enter into the mystery of
                    worship. Training in the traditional melodies and hymns is part of the formation
                    of clergy and choir members, so that the heritage of the Church may be
                    preserved and handed on.
                  </p>
                </div>

                <div className="mt-10 hidden lg:block">
                  <QuickLinks />
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
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
