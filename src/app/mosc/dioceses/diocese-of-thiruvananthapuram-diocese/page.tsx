import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DiocesesQuickLinksNav from '../DiocesesQuickLinksNav';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Thiruvananthapuram',
  description: 'Learn about the Diocese of Thiruvananthapuram of the Malankara Orthodox Syrian Church.',
};

const dioceseofthiruvananthapuramdiocesePage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Thiruvananthapuram" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/diocese-of-thiruvananthapuram-diocese.jpg"
                    alt="Diocese of Thiruvananthapuram"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Thiruvananthapuram
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      On1978, February 20th, Malankara Syrian Christian managing committee recommended a division in Kollam diocese. According to Committee's recommendation, On1979, January 1st, Kollam diocese was divided into two, namely Kollam diocese and Thiruvananthapuram(Trivandrum) diocese. After the position, Trivandrum diocese was given 94 churches and now the churches and chapels include 106 numbers. From 1986 onwards, the orthodox Center at Ulloor has served as the bishop house.
In 2010 a new diocese in the name of Kottarakkara Punalur Diocese was created after dividing the Thiruvananthapuram Diocese. The are 46 parishes in the diocese after the division.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Charitable and educational activities
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Charitable and Educational Society of the Thiruvananthapuram Orthodox Diocese is a registered society established in 1991 for starting and managing institutions of higher education in Thiruvananthapuram. The Society is sponsored by Thiruvananthapuram Diocese of Malankara Orthodox Church. H.G. Geevarghese Mar Dioscoros was the founder President of the Society. H. H. Baselios Mar Thoma Paulose II, the Catholicose of the East, is the patron of the Society. The metropolitan of the Thiruvananthapuram Orthodox Diocese, H. G. Dr. Gabriel Mar Gregorios, is the present president of the Society. The society runs Mar Dioscorus College of Pharmacy (MDCP), Sreekariyam.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Mailing Address: Orthodox church centre, Ulloor
Medical college P.O
Trivandrum -695011/
V M D M Centre, Edamulakkal P.O, Anchal
Ph - 0475 2273493 ,Email:gabrielmargregorios@gmail.com Web:http://www.tvmdiocese.org/
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      As youngest son to Kunjupappi and Achamma of Thevarvelil family in Kozhencherry was born Geevarghese Mar Dioscorus on 12 October 1926. He did his intermediate education from Madurai American college in 1948 and soon after joined Madras Christian College. After graduating in 1950, he did his Masters in Sociology from Bombay School of Economics. He was serving as the Secretary of the Co- operative Bank in Kozhenchery. While undergoing Officers Training Course in Reserve Bank of India he had the divine call to join the Ministry of God. He resigned from Reserve Bank and joined Orthodox Theological Seminary at Kottayam for studies in Divinity.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      He was ordained as a deacon in April 1963, and as priest in 1964 by His Holiness GeevargheseÂ Catholicose II. In 1966 he went to Jerusalem for further studies. In 1970 he founded The Holy Trinity Ashram at Ranni and started to reside there. Very soon in 1973 he became the Diocesan Secretary ofÂ Thumpamon Diocese. On 16 may 1977 the Malankara Association that met at Mavelikkara elected him for the Episcopal order. He was consecrated as Episcopa Geevarghese Mar Dioscorus by His Holiness Baselios Mar Thoma Mathews I, Catholicos of the East on 15 may 1978 at Pazhani Church. On 28Â February 1981 he was consecrated as a Metropolitan in the Pazhaya Seminary Chapel.Â He became the First Metropolitan of the newly formed Thiruvananthapuram Diocese.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      His Grace always conformed to the laws and wishes of God, devout and pious with all endeavours on a divine prospective. Being the first Metropolitan of Thiruvananthapuram Diocese, His Grace was fully responsible for the growth of the Orthodox Church in Thiruvananthapuram and establishing various institutes in Thiruvananthapuram for the poor and the destitudes like schools,convents and welfare centres. Ranny Holy Trinity Ashram, Ulloor Orthodox Church Centre, Edamulaikal V.M.D.M Centre, Sreekariyam Handicapped Children's welfare Centre, Thiruvananthapuram Holy Trinity School and Convent are all the fruits of his endeavours.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      He died on 23rd July 1999 and was interred in Holy TrinityÂ Ashram, Ranny.
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
                      className="block px-3 py-2 bg-syro-red text-white rounded-md font-syro-primary text-sm transition-all duration-300"
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

export default dioceseofthiruvananthapuramdiocesePage;