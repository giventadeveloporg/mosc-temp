import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Connection with the Syrian Churches',
  description:
    'West Syrianization of the Orthodox Thomas Christians, the Patriarch’s jurisdictional claims, and the end of East Syrian connection.',
};

export default async function ConnectionWithSyrianChurchesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Connection with the Syrian Churches"
        breadcrumbFrom={breadcrumbFrom}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                      src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                      alt="Connection with the Syrian Churches"
                      width={175} height={175}
                      className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    The Syrian Connections
                  </h2>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    West Syrianization
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The West Syrian bishops present among the Orthodox Thomas Christians from 1665
                    gradually introduced their church traditions. Exploiting the strong opposition
                    to Roman Catholicism, they introduced doctrinal, liturgical and disciplinary
                    measures. Mar Gregorios (1665) began this work; those who came after him
                    continued it. From the middle of the 19th century the West Syrianization process
                    speeded up. Substantial affinities in language, traditions and discipline between
                    East and West Syrian traditions made the introduction of West Syrian traditions
                    among the Orthodox of India easier.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    When accepting the services of Mar Gregorios, the Orthodox of Malabar did not
                    place themselves under the jurisdictional setup of the Antiochene Syrian Church.
                    The West Syrian Patriarch, however, from the beginning desired that the Indian
                    church formally accept him as Supreme Head—similar to the Portuguese extracting
                    submission to Rome in 1599. Mar Thoma V and VI foiled attempts to realize this
                    claim; a party favourable to the Patriarch had formed by the middle of the 18th
                    century and troubled the Mar Thoma bishops. This party was very active during the
                    CMS collaboration (1816–1836) and was a major factor in its collapse.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Final Attempt to Reinforce East Syrianism
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Between 1709 and 1731 a bishop named Mar Gabriel from the East Syrian Patriarch
                    arrived in Kerala to reclaim the flocks lost since 1599. A number of churches and
                    a considerable body of Thomas Christians, both non-Romo and Romo, accepted him.
                    He died at Kottayam and was buried at Cheriapally. This shows that during the 18th
                    and 19th centuries, until the Orthodox were fully identified with the West Syrian
                    Church, they also remained ecclesiastically identified with East Syrian
                    Christianity. Eastern Syriac remained their liturgical language until Western
                    Syriac was imposed from 1876 after the Synod of Mulanthuruthy. Mar Thoma IV and
                    V clashed with Mar Gabriel both theologically and administratively; Mar Gabriel
                    died without a successor, and with this event the connection of the Indian church
                    with the East Syrian church came to an end. The Portuguese condemnation of the
                    East Syrian Church as Nestorian, and the West Syrian contact’s denunciation of
                    East Syrian Christianity as heretical, gradually led the Indian Orthodox to quit
                    their East Syrian identity and embrace West Syrian identity.
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
