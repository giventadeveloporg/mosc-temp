import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DiocesesQuickLinksNav from '../DiocesesQuickLinksNav';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Northeast America',
  description: 'Learn about the Diocese of Northeast America of the Malankara Orthodox Syrian Church.',
};

const northeastamericaPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Northeast America" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/northeast_america_diocese.jpg"
                    alt="Diocese of Northeast America"
                    width={500}
                    height={300}
                    className="rounded-lg shadow-syro-card w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of  Northeast America
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      History
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The history of the Malankara Orthodox Syrian Church of the East in the U.S.A. begins approximately in the mid 20th century. During this period, a number of prominent priests and laity came to the U.S.A. for higher studies and training. We do not have much information about the people who came over during that time period, but we do know that His Grace Mathews Mar Coorilos Metropolitan (late H.H. Moran Mar Baselius Mar Thoma Mathews II) stayed at the General Theological Seminary in 1963 and returned to India in 1964. Mar Coorilos celebrated Holy Qurbana occasionally during his stay here.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Beginning 
In 1965, the United States' legislation passed a new bill which cleared the way for thousands of professionally qualified individuals to make their way to America. Many Malankara Orthodox Christians, who were in search of a better life for themselves and their families, came to the United States during this time.
After 1970, the Malankara Orthodox Church gradually began to take root in many of the major US cities. Many of the new congregations were faced with uncertainties regarding the fate of the Church in America. As time passed, the growing number of clergy and laity proved that the Malankara Orthodox Church would be a permanent body in the United States. The question of ecclesiastical authority and how this body should be structured was a chief point of concern among the clergy and other church officials.  Despite the hardships taking place within the Church, "pioneer" priests worked hard to establish parishes in order to serve the needs of the growing number of Malankara immigrants to the United States.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The year 1976 was a very important year for the Church, especially here in America. The Holy Synod decided to establish more dioceses to better administer the flock in various parts of the world. At this time, the numerous churches in America were placed under the authority of the Metropolitan of the Bombay Diocese, Thomas Mar Makarios, who had spent time in America as a student.  Under the leadership of Mar Makarios, the Holy Synod made a momentous decision and granted the parishes in America their own Diocese, creating the American Diocese. Mar Makarios was given authority of the American Diocese and the enthronement of the newly elected Metropolitan Mar Makarios was held at the Cathedral Church of St. John the Divine in Manhattan, under the authority of the Catholicos of the East and Malankara Metropolitan, Baselius Mar Thoma Mathews I, on July 14, 1979.  The enthronement was well attended by many leaders of the Orthodox Churches, as well as representatives from various other denominations. Notable during this time was the grand celebration of Saint Thomas Day by parishioners and church leaders across the nation at Union Theological Seminary, NY.  During the tenure of Mar Makarios as Metropolitan, the Diocese saw growth in a dramatic fashion and the number of parishes grew to almost fifty strong. Along with this, the dedicated service of the priests in America added to the unity, prosperity and growth of the Diocese.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      In 1991, the Diocese came under the direct control of a Malankara Metropolitan who was assisted by Mathews Mar Barnabas, our present Metropolitan. For one year, the Diocese continued in this manner, until control came under the full authority of Mathews Mar Barnabas.  The enthronement ceremony was held in March 1993 on a grand scale at St. Mary's West Sayville under the authority of the Catholicos of the East, Baselius Mar Thoma Mathews II, and was attended by representatives from across the Diocese.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Under the leadership of Mar Barnabas, the Diocese has grown both spiritually and physically. Most notable of all Mar Barnabus' accomplishments is the development of spiritual organizations, such as MGOCSM and Sunday School. He gave both organizations a national structure and administration.  In 2002, Zacharias Mar Nicholovos, a young, talented leader and orator joined the Diocese as the assistant to Mar Barnabas. With his assistance, the Diocese has grown even further.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Today
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Today, the Northeast American Diocese can boast of more than fifty parishes, with more than forty priests, 14 deacons and seminarians. The hard work and prayers of all our Hierarchs, Priests, and laity have led to the Diocese's strong foundation, and have provided for us a secure future and outlook for the next generation of Indian Orthodox Christians in the Northeast American Diocese.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Mailing Address:
Indian Orthodox Church Centre, 2158 route 106, mutton Town, New York-11791
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Ph:  2153421500
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Email:  neamdio@neamericandiocese.org , northeastamericandiocese@gmail.com
Web: www.neamericandiocese.org
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
                      className="block px-3 py-2 bg-syro-red text-white rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Diocese of Northeast America
                    </Link>
                  <Link 
                      href="/syro/dioceses/diocese-of-south-west-america" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
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

export default northeastamericaPage;