import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import EcumenicalSidebar from '../../components/EcumenicalSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'The Fraternity at Vienna',
  description:
    'His Holiness the Catholicos visited Vienna on 3rd September 2013 as the special invitee of Pro-Oriente. Ecumenical relations of the Malankara Orthodox Syrian Church.',
};

const TheFraternityAtViennaPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="The Fraternity at Vienna" breadcrumbFrom="ecumenical" />

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/mosc/ecumenical/vienna.jpg"
                    alt="Ecumenical meeting in Vienna"
                    width={600}
                    height={360}
                    className="rounded-lg w-full h-auto object-contain max-w-full"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    His Holiness the Catholicos visited Vienna on 3rd September 2013 as the special
                    invitee of Pro-Oriente. Pro-Oriente is the fellowship of all the Churches which
                    use Syriac as the sacramental language. From the very inception of the
                    organization, Malankara Orthodox Church has played a decisive role to this day
                    in Pro Oriente.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Cardinal Christoph Schonborn, the Arch Bishop of Vienna received His Holiness
                    the Catholicos. An ecumenical meeting was organized at his official residence in
                    honour of the Catholicos. Franz Scharl, the Auxiliary Bishop of Vienna and the
                    office bearers of Pro-Oriente attended the meeting. The meeting discussed many
                    important measures to strengthen the relationship among Syrian Churches and to
                    foster co-operations among them.
                  </p>
                </div>
              </div>

              {/* Quick Links - Horizontal Below Main Content (desktop only in column) */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <EcumenicalSidebar />
            </div>
          </div>
          {/* Quick Links - mobile only: just above footer */}
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
};

export default TheFraternityAtViennaPage;
