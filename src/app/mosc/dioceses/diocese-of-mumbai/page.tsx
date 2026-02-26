import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DiocesesQuickLinksNav from '../DiocesesQuickLinksNav';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Bombay',
  description: 'Learn about the Diocese of Bombay of the Malankara Orthodox Syrian Church.',
};

const dioceseofmumbaiPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Bombay" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/diocese-of-mumbai.jpg"
                    alt="Diocese of Bombay"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Bombay
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Diocese of Bombay was carved out of the outside Kerala diocese of the Malankara Orthodox Syrian Church in the year 1976.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      His grace Dr. Thomas Mar Makarios was the first Metropolitan with the headquarters as St.Mary's Church, Dadar. The diocese made rapid strides during the tenure if His grace Late Lamented Dr. Philipose Mar Theophilus who took over from Mar Makarios who moved to then newly formed Diocese in the year 1979. Mar Theophilus initially established his headquarters near St. Gregorios Church ,Chembur before moving out in the year 1988 to the present headquarters at the orthodox church centre, Vashi, Navi Mumbai.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Today the Diocese had grown to be a giant among the rest of the dioceses in many ways and more than 70 churches, schools, clinics, hostels etc are efficiently managed by about 50 sincere and dedicated priests along with the lay representatives opportunely
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Address: Â Orthodox Church Centre, Dr. Mar Theophilius marg, Sector 10- A, Vashi, Juhu Nagar, Â New Mumbai- 400703
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Ph: 02227801427,27669850
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Email: bombayaramana@gmail.com
                    </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:col-span-1">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6 mb-6">
                <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
                  Dioceses
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/mosc/dioceses" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300 hidden"
                  >
                    Dioceses Overview
                  </Link>
                  <div className="border-t border-syro-table-border my-2"></div>
                  <div className="px-3 py-2 text-xs font-semibold text-syro-dark-gray uppercase tracking-wide">
                    India Dioceses
                  </div>
                  <Link 
                      href="/mosc/dioceses/diocese-of-chennai-diocese" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Madras
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-bangalore" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Bangalore
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-mumbai" 
                      className="block px-3 py-2 bg-syro-red text-white rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Bombay
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-calcutta" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Calcutta
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-delhi" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Delhi
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-ahmedabad" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Ahmedabad
                    </Link>
                </nav>
              </div>

              {/* Quick Links - desktop only in sidebar */}
              <div className="hidden lg:block">
                <DiocesesQuickLinksNav />
              </div>
            </div>
          </div>
          {/* Quick Links - mobile only: just above footer */}
          <div className="mt-8 lg:hidden">
            <DiocesesQuickLinksNav />
          </div>
        </div>
      </section>
    </div>
  );
};

export default dioceseofmumbaiPage;