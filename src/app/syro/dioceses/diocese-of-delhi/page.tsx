import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DiocesesQuickLinksNav from '../DiocesesQuickLinksNav';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Delhi',
  description: 'Learn about the Diocese of Delhi of the Malankara Orthodox Syrian Church.',
};

const dioceseofdelhiPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Delhi" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/diocese-of-delhi.jpg"
                    alt="Diocese of Delhi"
                    width={500}
                    height={300}
                    className="rounded-lg shadow-syro-card w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of  Delhi
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Once the nucleus of the Orthodox Church in north India was formed in the capital of the country, the growth of parishes in adjacent centres was rapid and the establishment of the Diocese of Delhi followed in a few years. Outside Delhi, there are several parishes spread across the various States at Alwar, Gurgaon, Kherti Nagar, Bharatpur, Gwalior, Jhansi, Dholpur, Agra, Dehradun, Ambala, Hardwar, Bhatinda, Hanumangarh, Chandigarh, Ludhiana, Jallandhar, Jaipur, Kanpur, Udaipur, Bhilwara, Banswara, Chittorgarh, Dungarpur, Pratapgarh, Singrauli, Obra., Renukoot, Varanasi, Ajmer, Kota, Rawat Bhatta, Lucknow, Rae Bareli, Allahabad, Jodhpur, Bikaner, and Jaisalmer. New congregations have also been started at BITS Pilani, and Pali. Allahabad has also witnessed an amicable settlement with the CNI Church, and a vicar has been nominated for the church there.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Today, there are thirteen parishes in and around Delhi alone – Hauz Khas, Janakpuri, Tughlaqabad, Sarita Vihar, Mayur Vihar-I, Mayur Vihar-III, Rohini, Dwaraka, Dilshad Garden, Ghaziabad, Noida, Gurgaon and Faridabad. Overall, there are sixty one parishes including some congregations looked after by one Ramban and thirty six priests, spread over Uttar Pradesh, Rajasthan, Madhya Pradesh, Haryana, Delhi and United Arab Emirates.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      In 1975, the Delhi Diocese was constituted by the Holy Synod, along with the four other new dioceses of Madras, Bombay, Calcutta and America. The next year, Paulose Mar Gregorios took charge as the Metropolitan of Delhi. By 1985, the Diocesan headquarters moved to its own building, the Delhi Orthodox Centre in Tughlaqabad in South Delhi. An architecturally distinctive three-storey building, the centre was dedicated by Catholicos Baselios Mar Thoma Mathews I and inaugurated by the Vice-President of India, R Venkataraman, in November 1984. With the St. Thomas Chapel in the middle, the centre is the residence of the Metropolitan and houses, besides the secretariat of the Diocesan Council, a library, a publication unit, the People's Education Society, Sophia Society, Sarva Dharma Nilaya, Dhyan Mandir and Niti Santi Kendra, engaged in a variety of complementary activities. In 1991, the Diocese was strengthened by the arrival of Job Mar Philoxenos as the Assistant Metropolitan.1996 Paulose Mar Gregorios Metropolitan enters the heavenly Abode.2002 Job Mar Philoxenos is consecrated as the Metropoliton of Delhi Diocese on 26 December 2002.2011 Job Mar Philoxenos Metropolitan enters the heavenly Abode on 20 November 2011.2012 Youhanon Mar Demetrios is consecrated as new Metropolitan of the Delhi Diocese on 7 October 2012.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Address:  Delhi Orthodox Centre 2, Institutional Area Tughlakabad, New Delhi 110062
Phone : 011-29956417 / 29962799
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      E mail: delhiorthodoxdiocese@gmail.com
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
                    India Dioceses
                  </div>
                  <Link 
                      href="/syro/dioceses/diocese-of-chennai-diocese" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Madras
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-bangalore" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Bangalore
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-mumbai" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Bombay
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-calcutta" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Calcutta
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-delhi" 
                      className="block px-3 py-2 bg-syro-red text-white rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Delhi
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-ahmedabad" 
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

export default dioceseofdelhiPage;