import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'West Syrian Worship',
  description:
    'The West Syrian (Antiochene) liturgical tradition in the Malankara Orthodox Syrian Church: anaphoras, language, and structure.',
};

export default async function WestSyrianWorshipPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="West Syrian Worship" breadcrumbFrom={breadcrumbFrom} />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-[280px] h-auto">
                    <Image
                      src="/images/church/liturgy-worship.jpg"
                      alt="West Syrian Worship"
                      width={280}
                      height={180}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    West Syrian Worship
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Since the 17th century the Malankara Orthodox Church uses the Syrian Orthodox
                    Liturgy, which belongs to the Antiochene liturgical tradition. The East Syrian
                    (Persian), Byzantine, Armenian, Georgian, and Maronite liturgies also belong to
                    the same liturgical family. In the first half of the fifth century the
                    Antiochene Church adopted the anaphora of Jerusalem, known under the name of St.
                    James, the brother of Our Lord. The original form of the St. James liturgy was
                    composed in Greek.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Following the Council of Chalcedon (451), the Eastern Church was divided; both
                    groups continued to use the Greek version of St. James. The Byzantine emperor
                    Justin (518â€“527) expelled the Non-Chalcedonians from Antioch; they took refuge in
                    Syriac-speaking Mesopotamia. Gradually the Antiochene liturgical rites were
                    translated into Syriac, and new elements such as Syriac hymns were introduced. It
                    was Mar Gregorios of Jerusalem, who came to Malankara in 1665, who introduced
                    Syrian Orthodox liturgical rites in our Church.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The most striking characteristic of the Antiochene liturgy is the large number of
                    anaphoras (Order of the celebration of the Eucharist). About eighty are known
                    and about a dozen are used in India. All of them have been composed following
                    the model of St. James. Our worship is thus rooted in the ancient West Syrian
                    tradition, with Syriac as the primary liturgical language and a structure that
                    includes preparation rites, the Trisagion, Scripture readings, Sedra, Creed,
                    Anaphora, and Holy Communion.
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
