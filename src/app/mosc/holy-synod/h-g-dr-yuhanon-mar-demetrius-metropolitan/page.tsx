import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Dr. Youhanon Mar Demetrios Metropolitan',
  description: 'His Grace Dr. Youhanon Mar Demetrios, Metropolitan of Delhi Diocese. Professor, Orthodox Theological Seminary; General Secretary, Orthodox Vaidika Sangham; Co-Secretary, Orthodoxâ€“Catholic Church Dialogue.',
};

const HGDrYuhanonMarDemetriusMetropolitanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Dr. Youhanon Mar Demetrios Metropolitan"
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
                        src="/images/holy-synod/del.jpg"
                        alt="H.G. Dr. Youhanon Mar Demetrios Metropolitan"
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
                      H.G. Dr. Youhanon Mar Demetrios Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace was born on 18 December 1952 as the son of Palamoottil Mathews and Mercy. His home parish is St. Thomas Orthodox Cathedral, Kollam Diocese. After completing formal education, His Grace received his M.R.E. from Gordon-Conwell Theological Seminary in South Hamilton, Massachusetts, and his Ph.D. from Fordham University. He is well versed in Malayalam, Greek, and Syriac. His Grace has held several key positions in the Church: Professor at the Orthodox Theological Seminary, Kottayam; Secretary, Ecumenical Relations Committee; General Secretary, Orthodox Vaidika Sangham; Co-Secretary, Orthodoxâ€“Catholic Church Dialogue; Delegate, W.C.C. Commission on Education and Ecumenical Formation; Representative of the Church at many international conferences; Registrar, F.F.R.R.C.; Dean of Doctoral Studies. He was elected as Metropolitan candidate on 17 February at the Malankara Association held at Sasthamkotta, and was consecrated as Metropolitan on 12 May 2010 at Mar Elia Cathedral, Kottayam. His Grace is serving the Delhi Diocese as its Metropolitan.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Delhi Orthodox Centre, 2 Institutional Area, Tughlakabad, New Delhi 110 062</p>
                        <p>Mobile: 9810791894</p>
                        <p>Email: mar.demetrios@gmail.com</p>
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

export default HGDrYuhanonMarDemetriusMetropolitanPage;
