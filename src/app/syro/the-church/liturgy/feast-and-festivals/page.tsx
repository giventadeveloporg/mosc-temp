import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Feast and Festivals',
  description:
    'Feasts and festivals in the Malankara Orthodox Syrian Church: major feasts, commemorations, and the liturgical calendar.',
};

export default async function FeastAndFestivalsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Feast and Festivals" breadcrumbFrom={breadcrumbFrom} />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-[280px] h-auto">
                    <Image
                      src="/images/church/liturgy-worship.jpg"
                      alt="Feast and Festivals"
                      width={280}
                      height={180}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    Feast and Festivals
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The liturgical year of the Malankara Orthodox Syrian Church is marked by feasts
                    and festivals that commemorate the events of salvation history and the lives of
                    the saints. These celebrations draw the faithful into the mystery of Christ and
                    the communion of the Church.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-6 mb-3">
                    Major Feasts
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Church celebrates the Nativity (Christmas), Theophany (Baptism of the Lord),
                    Palm Sunday, Holy Week, Pascha (Easter), Ascension, Pentecost, and the
                    Transfiguration. Each feast has its own hymns, readings, and liturgical
                    emphasis, inviting the faithful to enter more deeply into the mystery being
                    celebrated.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-6 mb-3">
                    Commemorations and Fasts
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In addition to the great feasts, the calendar includes commemorations of the
                    Mother of God, the apostles, martyrs, and other saints. Fasting seasons such as
                    Great Lent, the Fast of the Apostles, and the Fast before the Nativity prepare
                    the faithful for the feasts and foster spiritual discipline and repentance.
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
