import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DiocesesQuickLinksNav from '../DiocesesQuickLinksNav';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of South West America',
  description: 'Learn about the Diocese of South West America of the Malankara Orthodox Syrian Church.',
};

const dioceseofsouthwestamericaPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of South West America" breadcrumbFrom="dioceses" />

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                {/* Featured Image */}
                <div className="mb-8">
                  <Image
                    src="/images/dioceses/southwest_america_diocese.jpg"
                    alt="Diocese of South West America"
                    width={500}
                    height={300}
                    className="rounded-lg shadow-syro-card w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of South West America
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Diocese was formed by order number 145/2009 signed by the then Catholicos of the Apostolic Throne of St. Thomas and Malankara Metropolitan, His Holiness Baselios Mar Thoma Didymos I on April 1, 2009. The head quarteres of the Diocese is in Houston, Texas.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Diocese is constituted of the parishes located in the southern and western states of the United States of America and the western provinces of Canada. The head of the Diocese is the Diocesan Metropolitan also known as the Diocesan Bishop, canonically elected, installed, and recognized by order of the Catholicos.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Diocese is governed according to Holy Tradition, practices, and the Constitution of the Malankara Orthodox Syrian Church adopted in 1934 and subsequent amendments, (hereafter the Constitution). The Diocese is not an independent church in matters of ecclesiastical discipline or faith, but a part of the Malankara Orthodox Syrian Church and always will remain as such, unless otherwise decided by the Malankara Orthodox Syrian Church.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The purpose of the Diocese is to function as the Central Administrative Body of the individual parishes within its functional jurisdiction and to provide leadership to bring administrative and functional consistency, spiritual harmony, ecclesiastical spread and discipline among the faithful members of the Malankara Orthodox Syrian Church of the Diocese.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Diocese may engage in various religious, educational, charitable, social, and mission activities allowed to any religious charitable organizations in the United States of America and Canada under applicable law.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      By virtue of his office, the Diocesan Metropolitan is the chief administrative officer of the Diocese. All decisions and actions of any diocesan committee, official body or organization shall be executed with the approval of the Diocesan Metropolitan.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Subject to the Constitution, the decisions of the Diocesan Assembly should be executed by the Diocesan Council with the approval of the Diocesan Metropolitan.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      In accordance with Section 3(c) Article 65 of the Constitution, matters concerning faith, order and discipline shall, subject to the decisions of the Holy Episcopal Synod, be under the control of the Diocesan Metropolitan.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Mailing Address:
3101 Hopkins Rd Beasley, TX 77417, USA
E-mail:Â dswadiocesanoffice@gmail.com
Phone: 281.403.0670 Fax: 281.459.0814
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Website:Â www.ds-wa.org
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
                    International Dioceses
                  </div>
                  <Link 
                      href="/syro/dioceses/northeast-america" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Northeast America
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-south-west-america" 
                      className="block px-3 py-2 bg-syro-red text-white rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of South West America
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-uk-europe-and-africa" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of UK Europe and Africa
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

export default dioceseofsouthwestamericaPage;