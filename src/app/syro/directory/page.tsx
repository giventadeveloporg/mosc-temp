import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import QuickLinks from '../components/QuickLinks';
import SyroPageHero from '../components/SyroPageHero';
import SyroIntroCard from '../components/SyroIntroCard';
import SyroSectionTitle from '../components/SyroSectionTitle';

export const metadata: Metadata = {
  title: 'Directory | Malankara Orthodox Syrian Church',
  description: 'Malankara Orthodox Directory — Holy Synod, Dioceses, Parishes, Priests, Institutions, Church Dignitaries, Working Committee, Managing Committee, Spiritual Organisations, Pilgrim Centres, Seminaries.',
  keywords: ['MOSC Directory', 'Malankara Orthodox Directory', 'Parishes', 'Priests', 'Dioceses', 'Church Directory'],
};

type DirectorySection = {
  title: string;
  description: string;
  href?: string;
};

const sections: DirectorySection[] = [
  { title: 'The Holy Synod of Bishops', description: 'The Episcopal Synod with the Catholicos as its president is the apex body of all bishops. The authority of the synod is final and binding. It has exclusive rights and privileges in the matter of upholding the faith of the church, its discipline and order of Apostolic Succession. As regards temporal matters the church is guided by the Malankara Syrian Christian Association.', href: '/syro/holy-synod' },
  { title: 'Dioceses', description: 'The Diocese is the basic church body which comprises all the parishes of a determined geographical area. It is governed by the Diocesan Bishop with the assistance of Diocesan Council.', href: '/syro/dioceses' },
  { title: 'Parishes', description: 'The parish is a local community of the Church having at its head a duly appointed priest and consisting of Orthodox Christians who live in accordance with the teachings of the Orthodox Church, comply with the discipline and rules of the Church, and regularly support their parish. Being subordinate to the Diocesan Authority, it is a component part of the Diocese.' },
  { title: 'Priests', description: 'At the head of the parish is its Vicar. According to the teachings of the Church, he is the spiritual father and teacher of his flock and the celebrant of the liturgical worship established by the Church. He teaches and edifies the People of God entrusted to his spiritual care.' },
  { title: 'Institutions', description: 'The institutions of the Malankara Orthodox Church consists of different organizations such as hospitals, schools, monasteries, orphanages, convents, medical colleges etc. Some of these Institutions are directly administered by the church and some others have its own leadership team.', href: '/syro/institutions' },
  { title: 'Church Dignitaries', description: 'The Church dignitaries consists of the Priest trustee, Lay trustee and the Association Secretary. The Priest trustee and Lay trustee are elected in the Malankara Association. The Association Secretary is elected in the Managing Committee. The tenure of the office is five years.' },
  { title: 'Working Committee', description: 'It is a small body of members nominated by the Malankara Metropolitan. This body prepares the agenda for the Managing Committee and helps the Malankara Metropolitan in his administrative functions. The same body is also known as the Advisory Council.' },
  { title: 'The Managing Committee', description: 'The members of the Managing Committee are elected by the association, two priests and four lay people representing each Diocese are elected for a period of five years. Other than the elected members, a proportionate number of members are nominated to the Managing Committee by the Malankara Metropolitan.' },
  { title: 'Spiritual Organisations', description: 'Spiritual organisations include all types of organizations of the Church that offer spiritual guidance to the faithful. They also include religious or spiritual study groups and other organizations that teach or offer spiritual direction and advice to the members of the Church.', href: '/syro/spiritual-organizations' },
  { title: 'Pilgrim Centres', description: 'The major Pilgrim centres of Malankara Orthodox Church include historical churches such as Niranam St. Mary\'s Valiya Pally, Thiruvathamcode Arapally, which are instituted by the Apostle St. Thomas.', href: '/syro/pilgrim-centres' },
  { title: 'Seminaries', description: 'There are mainly two seminaries under Malankara Orthodox Church.', href: '/syro/theological-seminaries' },
];

export default function DirectoryPage() {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageHero
        title="Malankara Orthodox Directory"
        description="The comprehensive directory of the Malankara Orthodox Syrian Church — bishops, dioceses, parishes, priests, institutions, and church administration."
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SyroIntroCard>
            <div className="text-center">
              <p className="font-syro-primary text-xl text-syro-dark-gray leading-relaxed mb-4">
                Need to update your Directory information? Contact{' '}
                <a href="mailto:webmanager@mosc.in" className="text-syro-red font-medium hover:underline">webmanager@mosc.in</a>.
              </p>
              <a
                href="https://directory.mosc.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-syro-red text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300 border-r-4 border-[#be1929]"
              >
                Access Directory at directory.mosc.in
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </SyroIntroCard>

          <SyroSectionTitle>Directory Sections</SyroSectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {sections.map((section, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 p-8 flex flex-col h-full"
              >
                {section.href ? (
                  <Link href={section.href} className="block group">
                    <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-3 group-hover:text-syro-red transition-colors">
                      {section.title}
                    </h3>
                    <p className="font-syro-primary text-base text-syro-dark-gray leading-relaxed flex-1">
                      {section.description}
                    </p>
                    <span className="inline-flex items-center gap-2 mt-4 font-syro-primary text-syro-red font-semibold text-sm">
                      View more
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </Link>
                ) : (
                  <>
                    <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-3">
                      {section.title}
                    </h3>
                    <p className="font-syro-primary text-base text-syro-dark-gray leading-relaxed">
                      {section.description}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>

          <QuickLinks />
        </div>
      </section>
    </div>
  );
}
