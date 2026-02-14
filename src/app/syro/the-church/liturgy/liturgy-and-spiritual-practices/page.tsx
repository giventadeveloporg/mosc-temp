import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Liturgy and Spiritual Practices',
  description:
    'The meaning of the liturgy and spiritual practices in the Orthodox tradition: worship, Eucharist, and the breaking of bread.',
};

export default async function LiturgyAndSpiritualPracticesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Liturgy and Spiritual Practices"
        breadcrumbFrom={breadcrumbFrom}
      />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-[280px] h-auto">
                    <Image
                      src="/images/church/liturgy-worship.jpg"
                      alt="Liturgy and Spiritual Practices"
                      width={280}
                      height={180}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    Liturgy and Spiritual Practices
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    When Moses led the people of Israel out of Egypt, he was given explicit
                    instructions on how they were to worship the God who freed them. From this
                    beginning arose the complex liturgical Temple worship of ancient Israel. In the
                    New Testament, Jesus&apos; disciples, who were all Jewish, at first continued
                    to worship in the Temple and afterwards gathered to celebrate the particularly
                    Christian &quot;breaking of bread,&quot; the Holy Eucharist.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Christian life is described in the Book of Acts as continuing &quot;steadfastly
                    in the apostle&apos;s doctrine and fellowship, in the breaking of bread, and in
                    the prayers.&quot; The liturgy is the common work of the people of God—the
                    offering of praise, thanksgiving, and the Eucharist in which we participate in
                    the Body and Blood of Christ. In the Malankara Orthodox Syrian Church, the
                    liturgy and spiritual practices are rooted in the West Syrian (Antiochene)
                    tradition, which shapes our worship, calendar, and daily prayer.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Through the liturgy we encounter the limitless God in time and space; we offer
                    moments and places purified for worship. The aim of the liturgical year and
                    spiritual practices is that our entire life be filled with God&apos;s presence—
                    through humility, submission, service, lent, fasting, and participation in the
                    liturgical services with ever-increasing preparation and devotion.
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
