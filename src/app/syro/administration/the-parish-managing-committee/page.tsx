import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';

export const metadata = {
  title: 'The Parish Managing Committee',
  description: 'The local administrative body responsible for individual parish management.',
};
// test
const ParishManagingCommitteePage = () => {
  return (
    <div className="bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-lg flex items-center justify-center mx-auto mb-6 shadow-syro-card-hover">
              <span className="text-syro-red-foreground text-4xl font-bold" role="img" aria-label="Parish Managing Committee">⛪</span>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              The Parish Managing Committee
            </h1>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              The local administrative body responsible for individual parish management.
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
                {/* Featured Image - half size, centered */}
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/administration/parish-managing-committee.jpg"
                    alt="The Parish Managing Committee"
                    width={1200}
                    height={720}
                    className="rounded-lg shadow-syro-card w-1/2 h-auto object-contain"
                    sizes="(min-width: 1024px) 37.5vw, 50vw"
                    quality={90}
                    priority
                  />
                </div>

                {/* Content - from mosc.in/administration/the-parish-managing-committee/ */}
                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                    The members of the Parish Managing Committee excluding the priests will be elected by the Parish Assembly and their term of office will be one year. Every Parish Managing Committee will have a minimum of 5 and a maximum of 15 members excluding the Priests. The Parish Assembly will decide the required number of members within these limits. In the event of any vacancy arising in the Parish Managing Committee, the remaining members of the committee may fill up such vacancy by co-option from the members of the Parish Assembly. If in any circumstances special to any Parish, it is found necessary to extend the term of the Parish Managing Committee, the Parish Assembly may with the special permission of the Diocesan Metropolitan extend the term of office of that Parish Managing Committee to a period for three years.
                  </p>
                </div>
              </div>

              {/* Quick Links - Horizontal Below Main Content (same as holy-synod) - desktop only in column */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6 mb-6">
                <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
                  Administration Structure
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/syro/administration/administration" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    The Constitution of the Malankara Orthodox Church
                  </Link>
                  <Link 
                    href="/syro/administration/he-canon-law-of-the-malankara-orthodox-church" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    The Canon Law of the Malankara Orthodox Church
                  </Link>
                  <Link 
                    href="/syro/administration/the-holy-episcopal-synod" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    The Holy Episcopal Synod
                  </Link>
                  <Link 
                    href="/syro/administration/malankara-association" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Malankara Association
                  </Link>
                  <Link 
                    href="/syro/administration/the-managing-committee" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    The Managing Committee
                  </Link>
                  <Link 
                    href="/syro/administration/the-working-committee" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    The Working Committee
                  </Link>
                  <Link 
                    href="/syro/administration/the-diocesan-general-body" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    The Diocesan General Body
                  </Link>
                  <Link 
                    href="/syro/administration/the-parish-managing-committee" 
                    className="block px-3 py-2 bg-syro-red text-white rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    The Parish Managing Committee
                  </Link>
                  <Link 
                    href="/syro/administration/the-parish-general-body" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    The Parish General Body
                  </Link>
                </nav>
              </div>
            </div>
          </div>
          {/* Quick Links - mobile only: just above footer */}
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ParishManagingCommitteePage;
