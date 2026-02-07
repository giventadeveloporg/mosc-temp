import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';

export const metadata = {
  title: 'The Parish General Body',
  description: 'Every parish is within the framework of the church constitution. The Parish General Body comprises eligible members who discuss and decide parish matters and elect the managing committee, secretary, and lay trustee.',
};
const ParishGeneralBodyPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-lg flex items-center justify-center mx-auto mb-6 shadow-syro-card-hover">
              <span className="text-syro-red-foreground text-4xl font-bold" role="img" aria-label="Parish General Body">👨‍👩‍👧‍👦</span>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              The Parish General Body
            </h1>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              The general assembly of all parish members for decision-making.
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
                    src="/images/administration/parish-general-body.jpg"
                    alt="The Parish General Body"
                    width={1200}
                    height={720}
                    className="rounded-lg shadow-syro-card w-1/2 h-auto"
                    sizes="(min-width: 1024px) 37.5vw, 50vw"
                    quality={90}
                    priority
                  />
                </div>

                {/* Content - from mosc.in/administration/the-parish-general-body/ */}
                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Every parish is within the framework of the church constitution. It is neither outside the umbrella of the constitution nor an independent entity.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                    Each Parish has a general body. The membership is confined to all male and female members above the age of 21 and who have made their annual confession and communion, and who are not defaulters in the parish dues for more than six months. All matters related to the parish are discussed and decided by this body. This general body elects the &apos;church managing committee&apos;, &apos;the secretary&apos;, and the &apos;lay trustee&apos;. The parish managing committee, the trustee and the secretary are elected every year.
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
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    The Parish Managing Committee
                  </Link>
                  <Link 
                    href="/syro/administration/the-parish-general-body" 
                    className="block px-3 py-2 bg-syro-red text-white rounded-md font-syro-primary text-sm transition-all duration-300"
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

export default ParishGeneralBodyPage;
