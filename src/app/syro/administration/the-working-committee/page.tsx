import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';

export const metadata = {
  title: 'The Working Committee',
  description: 'The operational committee that implements church policies and decisions.',
};
// test
const WorkingCommitteePage = () => {
  return (
    <div className="bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-lg flex items-center justify-center mx-auto mb-6 shadow-syro-card-hover">
              <span className="text-syro-red-foreground text-4xl font-bold" role="img" aria-label="Working Committee">🔧</span>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              The Working Committee
            </h1>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              The operational committee that implements church policies and decisions.
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
                    src="/images/administration/working-committee.jpg"
                    alt="The Working Committee"
                    width={1200}
                    height={720}
                    className="rounded-lg shadow-syro-card w-1/2 h-auto"
                    sizes="(min-width: 1024px) 37.5vw, 50vw"
                    quality={90}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    It is a small body of members nominated by the Malankara Metropolitan. This body prepares the agenda 
                    for the Managing Committee and helps the Malankara Metropolitan in his administrative functions. 
                    The same body is also known as the Advisory Council.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Association Managing Committee shall have a Working Committee consisting of not more than ten members 
                    and that body shall execute matters as decided by the Managing Committee. In case of urgent necessity the 
                    Working Committee may act on behalf the Managing Committee in anticipation of its approval. All matters 
                    so done shall be reported to the Managing Committee and its approval obtained. The President of the 
                    Working Committee shall be the Malankara Metropolitan. A Prelate elected by the Malankara Episcopal Synod, 
                    the Community Trustees and the Association Secretary shall be members of the Working Committee. The 
                    remaining members shall be appointed by the Malankara Metropolitan in consultation with them. Members 
                    of the Working Committee who are not already members of the Managing Committee, so long as they continue 
                    to be members of the Working Committee shall be members of the Managing Committee.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Working Committee referred to in Section 87 shall also be the Consultative Committee of the Malankara 
                    Metropolitan. The Association Secretary shall also be the Secretary of the Malankara Metropolitan's 
                    Consultative Committee. The Malankara Metropolitan may have an Assistant. If such an Assistant is not 
                    elected by the Association, he may be nominated by the Malankara Metropolitan. The Assistant shall be 
                    ex-officio member of the Managing Committee and the Working Committee.
                  </p>

                  {/* Current Members */}
                  <div className="bg-syro-bg-gray rounded-lg p-6">
                    <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                      Working Committee Members
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4">
                        <p className="font-syro-primary text-syro-dark-gray">
                          <strong>H. H. Baselios Marthoma Mathews III Catholicos</strong>
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="font-syro-primary text-syro-dark-gray">
                          <strong>H. G. Dr. Yuhanon Mar Chrisostomos Metropolitan</strong>
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="font-syro-primary text-syro-dark-gray">
                          <strong>Fr. Dr. Thomas Varghese Amayil (Priest Trustee)</strong>
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="font-syro-primary text-syro-dark-gray">
                          <strong>Shri. Ronny Varghese Abraham (Lay Trustee)</strong>
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="font-syro-primary text-syro-dark-gray">
                          <strong>Adv. Biju Oommen (Association Secretary)</strong>
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="font-syro-primary text-syro-dark-gray">
                          <strong>Fr. Dr. K. L Mathew Vaidyan Cor Episcopa</strong>
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="font-syro-primary text-syro-dark-gray">
                          <strong>Fr. Jacob Kurian Chemmanam</strong>
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="font-syro-primary text-syro-dark-gray">
                          <strong>Dr. C. K. Mathew IAS (Retd)</strong>
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="font-syro-primary text-syro-dark-gray">
                          <strong>Dr. T. Tiju IRS</strong>
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="font-syro-primary text-syro-dark-gray">
                          <strong>Shri. Jacob Mathew</strong>
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="font-syro-primary text-syro-dark-gray">
                          <strong>Shri. M. C. Sunny</strong>
                        </p>
                      </div>
                    </div>
                  </div>
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
                    className="block px-3 py-2 bg-syro-red text-white rounded-md font-syro-primary text-sm transition-all duration-300"
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

export default WorkingCommitteePage;
