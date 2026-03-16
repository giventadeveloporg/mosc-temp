import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Nilackal',
  description: 'Learn about the Diocese of Nilackal of the Malankara Orthodox Syrian Church.',
};

const dioceseofnilackalPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Nilackal" breadcrumbFrom="dioceses" />

      {/* Main Content */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {/* Featured Image - centered, contained (administration style) */}
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/dioceses/diocese-of-nilackal.jpg"
                    alt="Diocese of Nilackal"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Nilackal
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Diocese of Nilackal came in to being on August 15, 2010 under the order issued by H.H Baselios Mar Thoma Didymos I, The Catholicos cum MalankaraÂ  Metropolitan. H.G.Dr Joshua Mar Nicodimos is the Ist Metropolitan of the Diocese.
The name Nilackal is associated with the Christian Community founded by St.Thomas, the Apostle of India during the Ist century itself. Comprising the revenue Â  Â  districts of Pathanamthitta andÂ  Kottayam, the newly formed diocese consist of 39 Â  Â  parishes ranging from 13 to 200 families. The parishes are dividedÂ  in to 5 ecclesiastical districts namely Ayroor, Vayalathala, Ranni, Nilackal & Kanakappalam. The total families of the diocese is 2953.
All the spiritual organizations of Malankara Orthodox Church and the movements like Ecology Commission, Sushrushaka Sangam, Lehari Virudha Sangam, Dasamsadayaka Sangam,Â  INAMS are also performing at its best.
The Diocese purchased a building of about 12000 Sq.feet in Ranni Town andÂ  made it the head quarters of the diocese with the name St.Thomas Aramana. Many majorÂ  projects like construction of a Convention Centre at Catholicate Centre Ranni, Completion of the Catholicate Centre at Angamoozhi, Nilackal, beginning of St.Gregorios Mission Centre at Vellayil, Ayroor and starting of anÂ  Education Institution are under serious consideration. The new diocese also made initiative in various charitable activities by supporting the poor and the needy of the diocese as well as the society around.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Address: Nilackal Orthodox diocesan Centre, Â St.Thomas Aramana, Pazhavangadi P.O, Ranni, Pathanamthitta- 689673
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Phone: 04735- 224477
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Email: nilackaldiocese@gmail.com
                    </p>
                </div>
              </div>
              {/* Quick Links - below content (desktop, same as administration) */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:col-span-1">
              <DiocesesSidebar />
            </div>
          </div>
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
};

export default dioceseofnilackalPage;