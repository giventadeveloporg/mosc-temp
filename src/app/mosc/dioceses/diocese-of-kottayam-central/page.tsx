import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DiocesesQuickLinksNav from '../DiocesesQuickLinksNav';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Kottayam Central',
  description: 'Learn about the Diocese of Kottayam Central of the Malankara Orthodox Syrian Church.',
};

const dioceseofkottayamcentralPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Kottayam Central" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/diocese-of-kottayam-central.jpg"
                    alt="Diocese of Kottayam Central"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Kottayam Central
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Diocese of Kottayam Central came into existence vide Kalpana No. 110/82 dated April 21,.1982 of His Holiness Moran Mar Baselios Marthoma Mathews I, Catholicose of the East & Malankara Metropolitan. The new Diocese was carved out of the Dioceses of Kottayam.The Head Quarters of Kottayam Central Diocese is at Devalokam Aramana.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Catholicose of the East & Malankara Metropolitan isÂ  the diocesan metropolitan of Kottayam Central Diocese
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Address: Â Catholicate Aramana, Devalokam P.O, Â Muttambalam Via, Kottayam- 686004
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Phone: 0481-2578499, 2578500
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
                    Kerala Dioceses
                  </div>
                  <Link 
                      href="/mosc/dioceses/diocese-of-thiruvananthapuram-diocese" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Thiruvananthapuram
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-kollam" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Kollam
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-kottarakara-punalur" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Kottarakara â€“ Punalur
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-adoor-kadampanadu" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Adoor â€“ Kadampanadu
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-thumpamon" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Thumpamon
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-mavelikara" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Mavelikara
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-chengannur" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Chengannur
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-niranam" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Niranam
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-nilackal" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Nilackal
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-kottayam" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Kottayam
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-kottayam-central" 
                      className="block px-3 py-2 bg-syro-red text-white rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Kottayam Central
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-idukki" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Idukki
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-kandanad-east" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Kandanad East
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-kandanad-west" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Kandanad West
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-ankamaly" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Ankamaly
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-kochi" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Kochi
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-thrissur" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Thrissur
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-kunnamkulam" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Kunnamkulam
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-malabar" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Malabar
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-sulthan-bathery-diocese" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Sulthan Bathery
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-brahamavar" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Brahamavar
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

export default dioceseofkottayamcentralPage;