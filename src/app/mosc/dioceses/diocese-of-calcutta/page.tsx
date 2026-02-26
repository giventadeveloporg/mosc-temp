import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DiocesesQuickLinksNav from '../DiocesesQuickLinksNav';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Calcutta',
  description: 'Learn about the Diocese of Calcutta of the Malankara Orthodox Syrian Church.',
};

const dioceseofcalcuttaPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Calcutta" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/culcutta_diocese.jpg"
                    alt="Diocese of Calcutta"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Calcutta
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Dioceses in the history of the Malankara Orthodox Syrian Church, were formed for the first time in 1876 consequent to the Mulanthuruthy Synod. H.H.Patriarch Mar Peter III divided the Malankara Church into seven Dioceses. In 1938, Diocese for outside Kerala (Bahya Kerala Bhadrasanam) was formed and in 1976 the outside Kerala Diocese was divided into three, namely Bombay, Madras and Delhi dioceses as per the Catholicos Order No.58/76. The present Calcutta Diocese was included in Madras Diocese and late lamented Dr. Stephanos Mar Theodosius was the first Diocesan Metropolitan.
The area of Madras Diocese jurisdiction were the states of Andra Pradesh, Assam, Bihar, Parts of M.P. (East of Rewa, Jabalpur, Trunk Road), Tamil Nadu(excluding Coimbatore, Cunnoor, Gudalloor, Sherwani, Vaalpara, Mettupalayam, Erode and Tirupattoor), West Bengal, Union Territory of Andaman and Nicobar Islands and outside India- Malasia and Singapore.
Re-Organisation in 1979
On 30th October 1978 the Managing Committee in its meeting decided to further reorganized the three outside Kerala Dioceses comprising Bombay, Delhi and Madras into Five in view of their big geographical structure. The Episcopal Synod also approved the proposed reorganisation. The newly formed dioceses are America, Calcutta and Trivandrum. These changes came into effect from 1stJanuary 1979 as per order dated 8th December 1978.
The area under the Juridiction of the Calcutta Diocese is as follows:-
In India:-States of Assam, Bihar, Madhya Pradesh, Manipur, Meghalaya, Nagaland, Orissa, Tripura, West Bengal, Mizoram, Arunachal Pradhesh and Nagpur in Maharashtra.
Outside India :-Ahamadi, Kuwait, Muscat and Salalah.
As a result of the re-organisation of the outside Kerala dioceses, when the Calcutta Diocese was formed on 1st January 1979 H.G.Dr. Stephanos Mar Theodosius was made its Shepherd and Tirumeni continud to lead it from Glory to Gloryuntil he wascalled to the heavenly abode on 5th Nov. 2007 and H.H. Catholicose took the charge of the diocese and nominated H.G.Geevarghese Mar Coorilos of Bombay diocese to assist Catholicose in the administration. H.G. Dr. Joseph Mar Dionysius took over the Metropolitan of Calcutta Diocese on March 2009.
Re-Organisation in 2009
In2009 it was decided to further reorganize the outside Kerala Dioceses into Nine. The newly formed dioceses were Bangalore , Ahmedabad, Brahmavar and North East America and South west America, UK- Europe & Africa . The parishes and Institutions in the Malwa region of Madhya Pradesh and the Parishes in Muscat , Sohar and Salala in the Gulf Region were taken away from Calcutta Diocese and added to the newly formed Ahmedabad Diocese.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      St.Thomas Asram, Kailash Nagar, Near Industrial Estate, Bhilai, Durg Dist.Chattisgarh-490001
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Phone No: 0788-2285309
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      E-mail : calcuttadiocese@gmail.com
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Website : www.calcuttadiocese.org
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
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Bombay
                    </Link>
                  <Link 
                      href="/mosc/dioceses/diocese-of-calcutta" 
                      className="block px-3 py-2 bg-syro-red text-white rounded-md font-syro-primary text-sm transition-all duration-300"
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

export default dioceseofcalcuttaPage;