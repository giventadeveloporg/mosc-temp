import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Holy Qurbana',
  description:
    'The Holy Qurbana (Eucharist) in the Malankara Orthodox Syrian Church: the central act of worship and communion.',
};

export default async function HolyQurbanaPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Holy Qurbana" breadcrumbFrom={breadcrumbFrom} />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                      src="/images/church/liturgy-worship.jpg"
                      alt="Holy Qurbana"
                      width={175} height={175}
                      className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    Holy Qurbana
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Holy Qurbana (Syriac for &quot;offering&quot;) is the central act of worship
                    in the Malankara Orthodox Syrian Church. It is the Eucharistic liturgy in which
                    bread and wine are offered, consecrated, and received as the Body and Blood of
                    Christ, in accordance with the Lord&apos;s command at the Last Supper.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Church uses several anaphoras (eucharistic prayers), the most commonly used
                    being that of St. James. The liturgy includes preparation rites, the Trisagion,
                    Scripture readings, the Creed, the Anaphora (with the Words of Institution and
                    epiclesis), and the distribution of Holy Communion to the faithful. Participation
                    in the Holy Qurbana is the summit of the Christian life and the source of
                    unity with Christ and with one another.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Through the Holy Qurbana we are united to the one sacrifice of Christ and
                    receive the gift of His life. The liturgy is celebrated in Syriac and in the
                    vernacular, so that the people may understand and take part in the mystery of
                    faith.
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
