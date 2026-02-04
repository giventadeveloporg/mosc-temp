import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Directory | Malankara Orthodox Syrian Church',
  description: 'Malankara Orthodox Directory — Holy Synod, Dioceses, Parishes, Priests, Institutions, Church Dignitaries, Working Committee, Managing Committee, Spiritual Organisations, Pilgrim Centres, Seminaries.',
  keywords: ['MOSC Directory', 'Malankara Orthodox Directory', 'Parishes', 'Priests', 'Dioceses', 'Church Directory'],
};

type DirectorySection = {
  title: string;
  description: string;
  href?: string;
  external?: boolean;
};

export default function DirectoryPage() {
  // Content of from https://directory.mosc.in/
  const sections: DirectorySection[] = [
    {
      title: 'The Holy Synod of Bishops',
      description: 'The Episcopal Synod with the Catholicos as its president is the apex body of all bishops. The authority of the synod is final and binding. It has exclusive rights and privileges in the matter of upholding the faith of the church, its discipline and order of Apostolic Succession. As regards temporal matters the church is guided by the Malankara Syrian Christian Association.',
      href: '/mosc/holy-synod',
    },
    {
      title: 'Dioceses',
      description: 'The Diocese is the basic church body which comprises all the parishes of a determined geographical area. It is governed by the Diocesan Bishop with the assistance of Diocesan Council.',
      href: '/mosc/dioceses',
    },
    {
      title: 'Parishes',
      description: 'The parish is a local community of the Church having at its head a duly appointed priest and consisting of Orthodox Christians who live in accordance with the teachings of the Orthodox Church, comply with the discipline and rules of the Church, and regularly support their parish. Being subordinate to the Diocesan Authority, it is a component part of the Diocese.',
    },
    {
      title: 'Priests',
      description: 'At the head of the parish is its Vicar. According to the teachings of the Church, he is the spiritual father and teacher of his flock and the celebrant of the liturgical worship established by the Church. He teaches and edifies the People of God entrusted to his spiritual care.',
    },
    {
      title: 'Institutions',
      description: 'The institutions of the Malankara Orthodox Church consists of different organizations such as hospitals, schools, monasteries, orphanages, convents, medical colleges etc. Some of these Institutions are directly administered by the church and some others have its own leadership team.',
      href: '/mosc/institutions',
    },
    {
      title: 'Church Dignitaries',
      description: 'The Church dignitaries consists of the Priest trustee, Lay trustee and the Association Secretary. The Priest trustee and Lay trustee are elected in the Malankara Association. The Association Secretary is elected in the Managing Committee. The tenure of the office is five years.',
    },
    {
      title: 'Working Committee',
      description: 'It is a small body of members nominated by the Malankara Metropolitan. This body prepares the agenda for the Managing Committee and helps the Malankara Metropolitan in his administrative functions. The same body is also known as the Advisory Council.',
    },
    {
      title: 'The Managing Committee',
      description: 'The members of the Managing Committee are elected by the association, two priests and four lay people representing each Diocese are elected for a period of five years. Other than the elected members, a proportionate number of members are nominated to the Managing Committee by the Malankara Metropolitan.',
    },
    {
      title: 'Spiritual Organisations',
      description: 'Spiritual organisations include all types of organizations of the Church that offer spiritual guidance to the faithful. They also include religious or spiritual study groups and other organizations that teach or offer spiritual direction and advice to the members of the Church.',
      href: '/mosc/spiritual-organizations',
    },
    {
      title: 'Pilgrim Centres',
      description: `The major Pilgrim centres of Malankara Orthodox Church include historical churches such as Niranam St. Mary's Valiya Pally, Thiruvathamcode Arapally, which are instituted by the Apostle St. Thomas.`,
      href: '/mosc/pilgrim-centres',
    },
    {
      title: 'Seminaries',
      description: 'There are mainly two seminaries under Malankara Orthodox Church.',
      href: '/mosc/theological-seminaries',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center sacred-shadow">
                <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">
              Malankara Orthodox Directory
            </h1>
            <p className="font-body text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              The comprehensive directory of the Malankara Orthodox Syrian Church — bishops, dioceses, parishes, priests, institutions, and church administration.
            </p>
            <a
              href="https://directory.mosc.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-primary text-white font-body font-semibold text-lg rounded-lg hover:bg-primary/90 reverent-transition sacred-shadow hover:sacred-shadow-lg"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Access Directory at directory.mosc.in
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Directory Sections - content from directory.mosc.in */}
      <section className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <div key={index} className="bg-muted/20 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary hover:sacred-shadow reverent-transition">
                {section.href ? (
                  <Link href={section.href} className="block group">
                    <h2 className="font-heading font-semibold text-2xl text-foreground mb-3 group-hover:text-primary reverent-transition">
                      {section.title}
                    </h2>
                    <p className="font-body text-muted-foreground leading-relaxed">
                      {section.description}
                    </p>
                    <span className="inline-flex items-center font-body text-primary font-medium mt-3 group-hover:gap-2 reverent-transition">
                      View more
                      <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                ) : (
                  <>
                    <h2 className="font-heading font-semibold text-2xl text-foreground mb-3">
                      {section.title}
                    </h2>
                    <p className="font-body text-muted-foreground leading-relaxed">
                      {section.description}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Update directory info / Login */}
      <section className="py-12 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-body text-muted-foreground mb-4">
            Need to update your Directory information?
          </p>
          <a
            href="mailto:webmanager@mosc.in"
            className="font-body text-primary font-medium hover:underline"
          >
            Email webmanager@mosc.in
          </a>
          <p className="font-body text-sm text-muted-foreground mt-6">
            Login only for admin
          </p>
        </div>
      </section>

      {/* Official links - mosc.in & catholicatenews.in */}
      <section className="py-12 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <a
              href="https://mosc.in"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-muted/20 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary hover:sacred-shadow reverent-transition text-center group"
            >
              <span className="font-heading font-semibold text-lg text-foreground group-hover:text-primary reverent-transition block">
                mosc.in
              </span>
              <span className="font-body text-sm text-muted-foreground block mt-1">
                The Malankara Orthodox Syrian Church
              </span>
            </a>
            <a
              href="https://catholicatenews.in"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-muted/20 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary hover:sacred-shadow reverent-transition text-center group"
            >
              <span className="font-heading font-semibold text-lg text-foreground group-hover:text-primary reverent-transition block">
                catholicatenews.in
              </span>
              <span className="font-body text-sm text-muted-foreground block mt-1">
                The official news portal of the Indian Orthodox Church
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Address Info - from directory.mosc.in */}
      <section className="py-16 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-semibold text-2xl text-foreground mb-6 text-center">
            Address Info
          </h2>
          <div className="bg-card rounded-lg sacred-shadow p-8 border-l-4 border-primary">
            <p className="font-body text-foreground font-medium mb-2">
              Malankara Orthodox Church
            </p>
            <p className="font-body text-muted-foreground">
              Catholicate Palace,<br />
              Devalokam,<br />
              Kottayam - 686 004
            </p>
            <p className="font-body text-muted-foreground mt-4">
              <span className="font-medium text-foreground">Phone:</span> 0481 2578500, 0481 2578499
            </p>
          </div>
        </div>
      </section>

      {/* Related internal links */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-8 text-center">
            Related Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/mosc/dioceses"
              className="bg-muted/20 rounded-lg p-6 sacred-shadow-sm hover:sacred-shadow reverent-transition text-center group border-l-4 border-primary"
            >
              <h3 className="font-heading font-medium text-lg text-foreground mb-2 group-hover:text-primary reverent-transition">
                Dioceses
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                View all dioceses and their information
              </p>
            </Link>
            <Link
              href="/mosc/institutions"
              className="bg-muted/20 rounded-lg p-6 sacred-shadow-sm hover:sacred-shadow reverent-transition text-center group border-l-4 border-primary"
            >
              <h3 className="font-heading font-medium text-lg text-foreground mb-2 group-hover:text-primary reverent-transition">
                Institutions
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                Schools, hospitals, monasteries, and more
              </p>
            </Link>
            <Link
              href="/mosc/spiritual-organizations"
              className="bg-muted/20 rounded-lg p-6 sacred-shadow-sm hover:sacred-shadow reverent-transition text-center group border-l-4 border-primary"
            >
              <h3 className="font-heading font-medium text-lg text-foreground mb-2 group-hover:text-primary reverent-transition">
                Spiritual Organisations
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                Organisations offering spiritual guidance
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <section className="py-8 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-body text-sm text-muted-foreground">
            © {new Date().getFullYear()} Malankara Orthodox Directory. All Rights Reserved. Created by: ipsr solutions ltd.
          </p>
        </div>
      </section>
    </div>
  );
}
