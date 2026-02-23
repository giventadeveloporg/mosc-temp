import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Kuriakose Mar Clemis Metropolitan',
  description: 'His Grace Kuriakose Mar Clemis Metropolitan, Metropolitan of Sultan Bathery (Sultan Battery) Diocese. Social worker and author.',
};

const HisGraceKuriakoseMarClemisPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Kuriakose Mar Clemis Metropolitan"
        breadcrumbFrom="holy-synod"
      />
      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Featured Portrait - Left Side - Large Display */}
                  <div className="flex-shrink-0 flex justify-center md:justify-start">
                    <div className="relative w-72 h-[28rem] md:w-80 md:h-[32rem] lg:w-96 lg:h-[36rem] rounded-lg overflow-hidden shadow-syro-card-hover">
                      <Image
                        src="/images/holy-synod/mar-clemis.jpg"
                        alt="H.G. Kuriakose Mar Clemis Metropolitan"
                        fill
                        sizes="(max-width: 768px) 288px, (max-width: 1024px) 320px, 384px"
                        className="object-cover object-top"
                        style={{
                          objectPosition: 'center 15%'
                        }}
                        priority
                      />
                    </div>
                  </div>

                  {/* Content - Right Side of Image */}
                  <div className="flex-1">
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H.G. Kuriakose Mar Clemis Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace was born in 1936 at Nellikkal, Koipram Village in Thiruvalla Taluk as the second son to Perumethmannil Mr PK Mathai and Mrs Sosamma. He has one brother and two sisters. He belongs to Koorthamala St. Mary&apos;s Orthodox Church in Chengannur Diocese.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        After his schooling, he joined Kerala University and did his graduation, post graduation in Science and B.Ed from Catholicate College, Pathanahitta and Mount Tabore Training College Pathanapuram respectively. Thereupon His Grace was teaching Botany at Catholicate College, Pathanamthitta, until he was elected to the Episcopal order.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        He became a priest in 1964 after his studies at Orthodox Theological Seminary, Kottayam. He was also a member of St Basil Daya, Pathanamthitta. His Grace also served the Thumpamon Diocese as Secretary of Priests, Thumpamon Diocese. He was ordained a Bishop in 1991 and was given charge of the newly formulated Sultan Battery Diocese. And is serving it with all vigour and enthusiasm. His spiritual strength has helped the diocese to grow in all aspects within a short span of time.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace is actively involved in many social activities. He is the President of a special school for mentally challenged children--Olivemala and Baselious Gregorios Mercy Home. He has so far extended helping hands to the poor and also runs a secret fund and educational fund for the economically weaker sections.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace has many published articles to his credit. He is known for his simplicity and sweet voice.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Basil Aramana, Pathanamthitta â€“ 689 645</p>
                        <p>Tel.: 0468-2222243 / 9495694429</p>
                        <p>Email: hgmarclemis@gmail.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links - Horizontal Below Main Content (desktop only in column) */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <SynodMembersSidebar />
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

export default HisGraceKuriakoseMarClemisPage;
