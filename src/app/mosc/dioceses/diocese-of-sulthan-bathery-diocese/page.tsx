import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DiocesesQuickLinksNav from '../DiocesesQuickLinksNav';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Sulthan Bathery',
  description: 'Learn about the Diocese of Sulthan Bathery of the Malankara Orthodox Syrian Church.',
};

const dioceseofsulthanbatherydiocesePage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Sulthan Bathery" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/sulthan_bathery_diocese.jpg"
                    alt="Diocese of Sulthan Bathery"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Sulthan Bathery
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      In 1986,the diocese of Sultan Bathery is formed by organising all the churchesÂ  from the District of Wayanad, some of the churches from the Nilagiri District of Tamilnadu and some other churches in Kannur District which were formerly the part of Malabar Diocese.During its initial days the diocese was directly under the administration of the then catholicos His Holiness Baselius ....Fr.Mathai Nooranal was given the charge as the administrator .
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      In 1991 H.G.Kuriakose mar Clemis Metropolitan took its charge as the First metropolitan of Bathery Diocese.The Head Quarters of the dioceses is Situated near Kozhikodu-Â  Mysore national Highway,300 metres away from Sulthan Bathery Town.Â Presently, there are 48 churches under the Diocese.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Address: Â Nirmalagiri Aramana, Poomala, S. Bathery P.O, Wayanad- 673592
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Ph: 04936 220969
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Email: Â nirmalagiribathery@hotmail.com
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
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
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
                      className="block px-3 py-2 bg-syro-red text-white rounded-md font-syro-primary text-sm transition-all duration-300"
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

export default dioceseofsulthanbatherydiocesePage;