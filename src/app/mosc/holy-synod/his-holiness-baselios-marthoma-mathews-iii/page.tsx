import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.H. Baselios Marthoma Mathews III, The Ninth Catholicos of the East in Malankara',
  description: 'His Holiness Baselios Marthoma Mathews III was enthroned as the Catholicos of the East & Malankara Metropolitan on 15 October 2021. The 92nd Primate on the Apostolic Throne of St. Thomas.',
};

const HisHolinessBaseliosMarthomaMathewsIiiPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.H. Baselios Marthoma Mathews III"
        breadcrumbFrom="holy-synod"
      />
      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                {/* Featured Image - Top */}
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-md h-[280px] rounded-lg overflow-hidden shadow-syro-card">
                    <Image
                      src="/images/holy-synod/hh-scaled.jpg"
                      alt="H.H. Baselios Marthoma Mathews III, The Ninth Catholicos of the East in Malankara"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 448px"
                      className="object-cover object-top"
                      style={{
                        objectPosition: 'center 15%'
                      }}
                      priority
                    />
                  </div>
                </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H.H. Baselios Marthoma Mathews III, The Ninth Catholicos of the East in Malankara
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Holiness Baselios Marthoma Mathews III was enthroned as the Catholicos of the East & Malankara Metropolitan (the Supreme Head of the Malankara Orthodox Syrian Church of India) on Friday, 15th October 2021. His Holiness is the 92nd Primate on the Apostolic Throne of St. Thomas.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Holiness was born on 12 February 1949 to Mr Cherian Anthrayos of Mattathil family, being a member of St Peters Church, Vazhoor. After his school education, he joined Kerala University and passed his BSc Chemistry. After his BSc, he joined Orthodox Seminary, Kottayam, and had his GST degree. His Holiness took his BD degree from the Serampore University and did his higher studies in Theology at Theological Academy, Leningrad, Russia. Thereupon he joined Oriental Institute, Rome, and took his MTh and PhD from there. His Holiness was ordained a deacon in 1976 and a priest in 1978 by HH Baselios Mathews I. His Holiness was escalated to the post of an Episcopa on 30 April 1991 at a function at Parumala, and metropolitan in 1993. He is a well-known teacher and a faculty member of the Orthodox Seminary, Kottayam. A philanthropist, he works relentlessly for the uplift of the poor, especially women. He has started many ventures to help give employment opportunities to women from the economically backward classes. His Holiness also served the Holy Episcopal Synod as its secretary.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Holiness has authored a few devotional and contemplative books in Malayalam.
                      </p>

                      <div className="mt-6 pt-6 border-t border-syro-table-border">
                        <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                          H.H. Baselios Marthoma Mathews III,
                        </p>
                        <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                          Catholicate Aramana
                        </p>
                        <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                          Devalokam P.O, Kottayam
                        </p>
                        <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                          Kerala, India
                        </p>
                        <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                          Tel: 04812578499,Â 04812578500
                        </p>
                        <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                          Email:Â catholicos@mosc.in
                        </p>
                        <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                          Facebook:Â https://www.facebook.com/CatholicosBaseliosMarthomaMathewsIII
                        </p>
                        <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                          Instagram:Â Â baseliosmarthomamathewslll
                        </p>
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
            <div className="space-y-6 lg:col-span-1">
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

export default HisHolinessBaseliosMarthomaMathewsIiiPage;
