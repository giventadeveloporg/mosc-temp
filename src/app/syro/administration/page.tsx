import React from 'react';
import QuickLinks from '../components/QuickLinks';

export const metadata = {
  title: 'Administration',
  description:
    'Administration of the Malankara Orthodox Church — Constitution, Canon Law, Holy Episcopal Synod, Malankara Association, Managing Committee, and parish-level structures.',
};

const adminCards = [
  {
    title: 'The Constitution of the Malankara Orthodox Church',
    excerpt:
      'The church had no written constitution until 1934, but was governed by consensus, traditions and precedence. It was the vision of Mor Dionysius, Vattasseril to have a clearly defined uniform...',
    href: 'https://mosc.in/administration/administration/',
  },
  {
    title: 'The Canon Law of the Malankara Orthodox Church',
    excerpt:
      'The Canon Law accepted and followed by the Orthodox church of Malankara was collected and codified by Mar Gregorios Bar Hebraeus, Catholicos of Edessa (AD. 1226-1286) in the thirteenth century....',
    href: 'https://mosc.in/administration/he-canon-law-of-the-malankara-orthodox-church/',
  },
  {
    title: 'The Holy Episcopal Synod',
    excerpt:
      'The Episcopal Synod with the Catholicos as its president is the apex body of all bishops. The authority of the synod is final and binding. It has exclusive rights and...',
    href: 'https://mosc.in/administration/the-holy-episcopal-synod/',
  },
  {
    title: 'Malankara Association',
    excerpt:
      'It was in the Mulamthuruthy synod summoned by the patriarch peter III in 1876 that resolved to have an elected body called the Malankara Syria Christian Association to manage and...',
    href: 'https://mosc.in/administration/malankara-association/',
  },
  {
    title: 'The Managing Committee',
    excerpt:
      'In the Mulamthuruthy synod which formulated the Malankara association had laid down the provision for the managing committee, a smaller body to look into the financial and other administrative matters....',
    href: 'https://mosc.in/administration/the-managing-committee/',
  },
  {
    title: 'The Working Committee',
    excerpt:
      'It is a small body of members nominated by the Malankara Metropolitan. This body prepares the agenda for the Managing Committee and helps the Malankara Metropolitan in his administrative functions....',
    href: 'https://mosc.in/administration/the-working-committee/',
  },
  {
    title: 'The Diocesan General Body',
    excerpt:
      'Every diocese will have a Diocesan Assembly. The Diocesan bishop presides over the meetings. All matters related to the Diocese is discussed and decided in the General body assembly including...',
    href: 'https://mosc.in/administration/the-diocesan-general-body/',
  },
  {
    title: 'The Parish Managing Committee',
    excerpt:
      'The members of the Parish Managing Committee excluding the priests will be elected by the Parish Assembly and their term of office will be one year. Every Parish Managing Committee...',
    href: 'https://mosc.in/administration/the-parish-managing-committee/',
  },
  {
    title: 'The Parish General Body',
    excerpt:
      'Every parish is within the frame work of the church constitution. It is neither outside the umbrella of the constitution nor an independent entity. Each Parish has a general body....',
    href: 'https://mosc.in/administration/the-parish-general-body/',
  },
];

const AdministrationPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray min-h-[280px] flex items-center py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full border-2 border-syro-red/20 bg-syro-red/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              Administration
            </h1>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              Governance and structure of the Malankara Orthodox Syrian Church at the central, diocesan, and parish levels.
            </p>
          </div>
        </div>
      </section>

      {/* Content - matches HTML structure and style */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Intro card (HTML .admin-intro-card) */}
          <div className="bg-white p-10 rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] mb-16">
            <h2 className="font-syro-display text-[2.2rem] font-bold text-syro-blue mb-5">
              Administration
            </h2>
            <p className="font-syro-primary text-xl text-syro-dark-gray leading-relaxed">
              The Malankara Orthodox Syrian Church is administered according to its Constitution, Canon Law, and the structures of the Holy Episcopal Synod, Malankara Association, Managing Committee, Working Committee, and bodies at diocesan and parish levels.
            </p>
          </div>

          {/* Section title - left red bar (HTML .admin-section-title) */}
          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            Constitution & Structure
          </h3>

          {/* Cards grid - no images (HTML .admin-card) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {adminCards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 p-8 flex flex-col h-full"
              >
                <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug">
                  {card.title}
                </h3>
                <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed">
                  {card.excerpt}
                </p>
                <a
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-syro-red text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300 mt-auto w-fit"
                >
                  <span>Read More</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            ))}
          </div>

          <QuickLinks />
        </div>
      </section>
    </div>
  );
};

export default AdministrationPage;
