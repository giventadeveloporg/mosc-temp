import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DiocesesQuickLinksNav from '../DiocesesQuickLinksNav';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Kollam',
  description: 'Learn about the Diocese of Kollam of the Malankara Orthodox Syrian Church.',
};

const dioceseofkollamPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Kollam" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/kollam diocese.jpg"
                    alt="Diocese of Kollam"
                    width={500}
                    height={300}
                    className="rounded-lg shadow-syro-card w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese  of  Kollam
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      St Thomas, the Apostle of Jesus Christ , is the Father of Christianity in India , landed at Maliankara in Kerala founded seven churches at Maliankara, Palayur, Kottakavu, Niranam, Nilakkel, Chayal and Kollam.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      In AD 1876, Patriach Moran Mar Ignatius Pathros- III came here and a historical synod was convened at Mulanthuruthy. Later six new dioceses were formed in Malankara.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Diocese of Kollam was one among the six new dioceses formed with a vast area from Thiruvithamcode to Mavelikara.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Dionysius-V , the then Malankara Metropolitan was the first Bishop of Kollam diocese and he headed the diocese from 1876 to (---?) Geevarghese Mar Gregorious of Parumala was the second Bishop of Kollam Diocese till 1902. Again from 1902 to 1909 , Dionysius -V became the Bishop of Kollam.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Vattasseril Geevarghese Mar Dionysius , the then Malankara Metropolitan became the third Bishop of Kollam diocese upto 1912. From 1912 onwards Geevarghese Mar Gregorious later known as Baselious Geevarghese II , the then Catholicos of Malankara adorned the position of Bishop of Kollam diocese till 1938. He adorned the position of the Catholicos of Malankara sabha and also the Bishop of Kollam from 1934 to 1938.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      From 1938 onwards , the diocese was under the leadership of Alexious Mar Thevedosius. From 1953 to 1966 Mathews Mar Coorilos served as the Assistant Bishop of Kollam along with Alexious Mar Thevedosius.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Mathews Mar Coorilos became the Bishop of Kollam in 1966 and served the diocese till he became the Catholicos of the East . In 1991 when Mathews Mar Coorilos became the Supreme Head of Malankara Sabha, Mathews Mar Epiphanios ,who was the Assistant Bishop of Kollam became the Bishop of Kollam and served the diocese till 2009.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      In 1979 , the diocese of Kollam was bifurcated to Trivandrum and Kollam Diocese (------?) churches went to Trivandrum diocese. Again in 1985 four churches detached from Kollam diocese and included in Chengannur diocese.Â Â  In 2002 , from Kollam diocese twenty seven churches detached and formed the new Mavelikara diocese. In 2010Â Â  a rearrangement of churches of Kollam and Trivandrum dioceses resulted in the formation of Adoor- Kadampanad and Kottarakara â€“Punalur dioceses .
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The first headquarters ofÂ Â  Kollam Diocese was Kottapuram Seminary during the reign of Geevarghese Mar Gregorious of Parumala and Kundara Seminary was the headquarters of Kollam Diocese during the reign of Geevarghese Mar Gregorious who later known as Baselious Geevarghese II .
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Mathews Mar Coorilous later known as Baselious Marthoma Mathews -II ,the Catholicos of the East,Â  established the present headquarters at Cross Junction, Kollam Â .
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      From 2009 April 1st , onwards H.G. Zachariah Mar Anthonios became the Metropolitan of Kollam Diocese. At present sixty five churches under the Diocese of Kollam. H.G Zachariah Mar Anthonios renovated and dedicated the Kollam Aramana during 2013-15.The Kollam diocese has two diocesan centers - Mar Epiphnios Centre ,Kottarakara and Sooranad. The diocese also has St. Thomas Boys Home, Sasthamkotta and Mar Baselious Santhi Bhavan, Thalavoor as Charitable institutions.
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
                      className="block px-3 py-2 bg-syro-red text-white rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Kollam
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-kottarakara-punalur" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Kottarakara â€“ Punalur
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-adoor-kadampanadu" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Adoor â€“ Kadampanadu
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

export default dioceseofkollamPage;