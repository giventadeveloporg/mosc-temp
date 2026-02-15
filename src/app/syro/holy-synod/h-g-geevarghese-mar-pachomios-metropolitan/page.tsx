import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Geevarghese Mar Pachomios Metropolitan',
  description: 'His Grace Geevarghese Mar Pachomios, Metropolitan of Malabar diocese. M.Th. (Paurasthya Vidyapeedam); ordained Metropolitan 2022.',
};

const HGGeevargheseMarPachomiosMetropolitanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Geevarghese Mar Pachomios Metropolitan"
        breadcrumbFrom="home"
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
                        src="/images/holy-synod/Geevarghese-Mar-Pachomios-300x193-1.jpg"
                        alt="H.G. Geevarghese Mar Pachomios Metropolitan"
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
                      H.G. Geevarghese Mar Pachomios Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        Born in Kochuparambil house as the son of Mr. K.M. Elias and Lt. Mrs. Omana on 6 March 1973, H. G. Geevarghese Mar Pachomios Metropolitan belongs to the parish of St. George Church, Mannathoor under the diocese of East Kandanad. His Grace completed his school education from Government High School, Mannathoor. He pursued higher education at St. Peters College, Kolencherry and Symbiosis Law college, Pune. Further, he joined Kottayam Old Seminary and completed BD (2003-08) and M.Th from Paurasthya Vidyapeedam, Vadavathoor (2019–21). He was ordained sub-deaconship by H.G. Dr. Thomas Mar Athanasios Metropolitan at St. Thomas Cathedral, Muvattupuzha on 31 January 2001. He was ordained deacon on 30 October 2009, and priesthood on 11 December, and became Ramban on 14 December. H. G. was chosen as a Metropolitan in the Malankara Syrian Christian Association held at Kolencherry on 25 February 2022. He was ordained as a Metropolitan by the name ‘Mar Pachomios’ by H.H. Baselios Mar Thoma Mathews III Catholicos at St. Mary’s Cathedral, Pazhanji on 28 July 2022. H.G. has taken charge of Malabar diocese as Metropolitan since 3 November 2022.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Mount Hermon Aramana, Chathamangalam, N.I.T. Campus P.O., Kozhikode – 673 601</p>
                        <p>Mobile: +91 9961932356</p>
                        <p>Email: geevarghesemarpachomios@gmail.com, hermonaramana@gmail.com</p>
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

export default HGGeevargheseMarPachomiosMetropolitanPage;
