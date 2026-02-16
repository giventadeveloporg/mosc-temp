import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Yakob Mar Elias Metropolitan',
  description: 'His Grace Yakob Mar Elias, Metropolitan of Brahmavar Diocese. Director, St. Basil Bible School; Vice President, Orthodox Christian Youth Movement; Secretary, Kottayam Diocese.',
};

const HGYakoobMarEliasMetropolitanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Yakob Mar Elias Metropolitan"
        breadcrumbFrom="holy-synod"
      />
      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Featured Portrait - Left Side - Large Display */}
                  <div className="flex-shrink-0 flex justify-center md:justify-start">
                    <div className="relative w-72 h-[28rem] md:w-80 md:h-[32rem] lg:w-96 lg:h-[36rem] rounded-lg overflow-hidden shadow-syro-card-hover">
                      <Image
                        src="/images/holy-synod/mar-eliyas.jpg"
                        alt="H.G. Yakob Mar Elias Metropolitan"
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
                      H.G. Yakob Mar Elias Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace was born on 24 February 1953 as the son of Chackaleth Viruthiyath Kizhakkethil Mathai and Mariamma. He is a member of St. Elias Orthodox Church, Budhanoor, Chengannoor Diocese. After taking his Master&apos;s degree from Kerala University, he joined the Orthodox Theological Seminary, Kottayam, for theological studies. From the Orthodox Theological Seminary, Kottayam, he received the Graduate Degree in Sacred Theology (GST) and the Bachelor of Divinity (B.D.) from the Senate of Serampore University. His Grace has held several key positions in the Church: Manager, Mar Elia Chapel, Sasthamkotta; Director, St. Basil Bible School; Vice President, Orthodox Christian Youth Movement; Secretary, Kottayam Diocese; Member, Ecumenical Relations Committee; Member, Mission Training Centre, Mavelikkara; Member, Orthodox Bible Preparation Committee; Member, Malankara Sabha Editorial Board; Member, Oriental and Anglican Forum. He was elected as Metropolitan candidate on 17 February at the Malankara Association held at Sasthamkotta, and was consecrated as Metropolitan on 12 May 2010 at Mar Elia Cathedral, Kottayam. His Grace is serving the Brahmavar Diocese as its Metropolitan.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Mount Horeb Bishop&apos;s House, Balikashram Road, Kankanady, Mangalore – 575 002, Karnataka, India</p>
                        <p>Tel: 0824-2013157 | Mobile: 09483530018</p>
                        <p>Email: metropolitanelias@yahoo.com</p>
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

export default HGYakoobMarEliasMetropolitanPage;
