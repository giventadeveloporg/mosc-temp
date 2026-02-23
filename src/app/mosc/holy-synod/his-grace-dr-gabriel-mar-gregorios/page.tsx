import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Dr. Gabriel Mar Gregorios Metropolitan',
  description: 'His Grace Dr. Gabriel Mar Gregorios, Metropolitan of Trivandrum Diocese. Scholar in Biblical studies, former professor at Orthodox Seminary, Kottayam.',
};

const HisGraceDrGabrielMarGregoriosPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Dr. Gabriel Mar Gregorios Metropolitan"
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
                        src="/images/holy-synod/mar-gregorios.jpg"
                        alt="H.G. Dr. Gabriel Mar Gregorios Metropolitan"
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
                      H.G. Dr. Gabriel Mar Gregorios Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace was born on 10 February 1948 to Mr CM John and Mrs Aleyamma John, Vadakethazhethil, Kanjickal. He did schooling at St Stephenâ€™s High School, Pathanapuram. He pursued his BA from Kerala University in English Literature. Subsequent to that, he joined the Serampore University and took his BD degree in 1974. He did his MTh from the Catholic University, Paris. His Grace pursued successfully a three-year Diploma Course in Biblical Hebrew, a two-year certificate course in Aramaic and advanced course in Biblical Greek at the Catholic University, Paris. His Grace also did Doctoral Research at the Lutheran School of Theology at Chicago on the topic â€œThe Glory of God in St Paulâ€ and took his PhD in New Testament from the Serampore University. He further did his Doctoral Research at the University of Cambridge. His Grace was ordained a deacon on 4 November 1969 by HH Mar Baselios Augen I. HH Baselios Mathews I ordained Dn Gabriel as priest on 8 January 1974. He distinctly served as vicar of many parishes such as Chenganachery, Jaipur, Dehuroad, Kuzhimattom, Mundakayam, Kanakappalam, Odanavattom Nellikunnam, and Pooyapally. He was a Professor at Orthodox Seminary, Kottayam. He was professed as a Monk on 7 August 2004 by HH Baselios Mathews II. The Malankara Syrian Christian Association met on 10 June 2004 at the Parumala Seminary, elected Fr Gabriel as a candidate to be ordained to the Episcopal Order and was ordained on 5 March 2005 by HH Baselios Mathews II. At present, His Grace is looking after the Trivandrum Diocese, which is very critical to the church in many ways.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Orthodox Church Centre, Ulloor, Trivandrum, Kerala â€“ 695 011</p>
                        <p>Tel.: 0471-2442509 / 2552509 | Fax: 0471-2442509 | Cell: 9447166857</p>
                        <p>E-mail: gabrielmargregorios@gmail.com</p>
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

export default HisGraceDrGabrielMarGregoriosPage;
