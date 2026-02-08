import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';

export const metadata = {
  title: 'The Holy Episcopal Synod',
  description: 'The highest governing body consisting of all bishops of the church.',
};
// test
const HolyEpiscopalSynodPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-lg flex items-center justify-center mx-auto mb-6 shadow-syro-card-hover">
              <span className="text-syro-red-foreground text-4xl font-bold" role="img" aria-label="Holy Episcopal Synod">👥</span>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              The Holy Episcopal Synod
            </h1>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              The highest governing body consisting of all bishops of the church.
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
                    src="/images/administration/holy-episcopal-synod.jpg"
                    alt="The Holy Episcopal Synod"
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
                    The Episcopal Synod with the Catholicos as its president is the apex body of all bishops. The authority 
                    of the synod is final and binding. It has exclusive rights and privileges in the matter of upholding the 
                    faith of the church, its discipline and order of Apostolic Succession. As regards temporal matters the 
                    church is guided by the Malankara Syrian Christian Association.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The bishops lead the diocese assigned to them by the synod. Presently there are 31 bishops including 
                    H. H, The Catholicos.
                  </p>

                  <div className="bg-syro-bg-gray rounded-lg p-6 mb-6">
                    <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                      Constitution Sections 102-109
                    </h3>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                      Section 102 to 109 of The constitution of Malankara Orthodox church deals about the Episcopal Synod. 
                      It is as follows:
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <span className="font-syro-display font-semibold text-syro-red">102.</span>
                        <p className="font-syro-primary text-syro-dark-gray">There shall be an Episcopal Synod in Malankara.</p>
                      </div>

                      <div className="flex items-start space-x-3">
                        <span className="font-syro-display font-semibold text-syro-red">103.</span>
                        <p className="font-syro-primary text-syro-dark-gray">
                          All Prelates in Malankara Orthodox Syrian Church who have been duly approved as per the constitution 
                          shall be members of this Synod.
                        </p>
                      </div>

                      <div className="flex items-start space-x-3">
                        <span className="font-syro-display font-semibold text-syro-red">104.</span>
                        <p className="font-syro-primary text-syro-dark-gray">The Catholicos shall be the President of the Synod.</p>
                      </div>

                      <div className="flex items-start space-x-3">
                        <span className="font-syro-display font-semibold text-syro-red">105.</span>
                        <p className="font-syro-primary text-syro-dark-gray">
                          The Catholicos shall convene the Synod and preside over the Synod.
                        </p>
                      </div>

                      <div className="flex items-start space-x-3">
                        <span className="font-syro-display font-semibold text-syro-red">106.</span>
                        <p className="font-syro-primary text-syro-dark-gray">
                          When there is no Catholicos or if there is any accusation against the Catholicos and the Catholicos 
                          does not convene the Synod for considering such accusation, the Senior Metropolitan shall convene 
                          the Synod and preside over the Synod.
                        </p>
                      </div>

                      <div className="flex items-start space-x-3">
                        <span className="font-syro-display font-semibold text-syro-red">107.</span>
                        <p className="font-syro-primary text-syro-dark-gray">
                          The Episcopal Synod shall have the authority to decide matters concerning faith, order and discipline. 
                          When the Synod shall meet for this purpose the Synod may select such persons as the Synod may deem 
                          needed for consultation.
                        </p>
                      </div>

                      <div className="flex items-start space-x-3">
                        <span className="font-syro-display font-semibold text-syro-red">108.</span>
                        <p className="font-syro-primary text-syro-dark-gray">
                          No one shall have the right to alter the faith of the Church. But in case there may arise any dispute 
                          as to what is faith, the Episcopal synod above said may decide the matter and the final decision about 
                          this shall vest with the Ecumenical Synod.
                        </p>
                      </div>

                      <div className="flex items-start space-x-3">
                        <span className="font-syro-display font-semibold text-syro-red">109.</span>
                        <p className="font-syro-primary text-syro-dark-gray">
                          The Episcopal Synod may in consultation with the Association Managing committee appoint sub-committees 
                          for the purpose of Theological Education, Mission Work, Sunday school and similar matters.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-syro-red/10 rounded-lg p-6">
                    <Link 
                      href="/syro/holysynod" 
                      className="inline-flex items-center px-4 py-2 bg-syro-red text-white rounded-md font-syro-primary font-medium transition-all duration-300 hover:bg-syro-red/90"
                    >
                      View all Episcopal Synod Members
                    </Link>
                  </div>
                </div>
              </div>

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
                    className="block px-3 py-2 bg-syro-red text-white rounded-md font-syro-primary text-sm transition-all duration-300"
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

export default HolyEpiscopalSynodPage;
