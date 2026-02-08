import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DiocesesQuickLinksNav from '../DiocesesQuickLinksNav';

export const metadata = {
  title: 'Diocese of Kottarakara – Punalur',
  description: 'Learn about the Diocese of Kottarakara – Punalur of the Malankara Orthodox Syrian Church.',
};

const dioceseofkottarakarapunalurPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-lg flex items-center justify-center mx-auto mb-6 shadow-syro-card-hover">
              <span className="text-syro-red-foreground text-4xl font-bold" role="img" aria-label="Diocese">⛪</span>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              Diocese of Kottarakara – Punalur
            </h1>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              Kerala Diocese of the Malankara Orthodox Syrian Church
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                {/* Featured Image */}
                <div className="mb-8">
                  <Image
                    src="/images/dioceses/diocese-of-kottarakara-punalur.jpg"
                    alt="Diocese of Kottarakara – Punalur"
                    width={500}
                    height={300}
                    className="rounded-lg shadow-syro-card w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Kottarakara &#8211; Punalur
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Kottarakkara Punalur Diocese is one of the 30 dioceses of the Malankara Orthodox Syrian Church. The diocese was created after dividing the then existed Thiruvananthapuram Diocese and Kollam Diocese on 15 August 2010. The new diocese was inagurated on 23 January 2011. H.G. Yuhanon Mar Thevodoros was installed the first Metropolitan of the diocese.Kottarakkara Kottappuram Seminary is the Bishop house of the Diocese
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Address: - Kottapuram Seminary, Pulamon, Kottarakara.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Phone: 0474- 2652755, 9446664270
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Email: kottappuramseminary@gmail.com
                    </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6 mb-6">
                <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
                  Dioceses
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/syro/dioceses" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Dioceses Overview
                  </Link>
                  <div className="border-t border-syro-table-border my-2"></div>
                  <div className="px-3 py-2 text-xs font-semibold text-syro-dark-gray uppercase tracking-wide">
                    Kerala Dioceses
                  </div>
                  <Link 
                      href="/syro/dioceses/diocese-of-thiruvananthapuram-diocese" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Thiruvananthapuram
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-kollam" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Kollam
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-kottarakara-punalur" 
                      className="block px-3 py-2 bg-syro-red text-syro-red-foreground rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Kottarakara – Punalur
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-adoor-kadampanadu" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Adoor – Kadampanadu
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-thumpamon" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Thumpamon
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-mavelikara" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Mavelikara
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-chengannur" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Chengannur
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-niranam" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Niranam
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-nilackal" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Nilackal
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-kottayam" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Kottayam
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-kottayam-central" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Kottayam Central
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-idukki" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Idukki
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-kandanad-east" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Kandanad East
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-kandanad-west" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Kandanad West
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-ankamaly" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Ankamaly
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-kochi" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Kochi
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-thrissur" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Thrissur
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-kunnamkulam" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Kunnamkulam
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-malabar" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Malabar
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-sulthan-bathery-diocese" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Sulthan Bathery
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-brahamavar" 
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

export default dioceseofkottarakarapunalurPage;