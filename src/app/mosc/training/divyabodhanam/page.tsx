import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import QuickLinks from '../../components/QuickLinks';

export const metadata: Metadata = {
  title: 'Divyabodhanam | Training | MOSC',
  description: 'Divyabodhanam - Theological Education Programme for the Laity of the Malankara Orthodox Syrian Church, inaugurated in 1984.',
};

export default function DivyabodhanamPage() {
  return (
    <div className="min-h-screen bg-syro-bg-gray">
      {/* Breadcrumb */}
      <section className="bg-syro-bg-gray py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 font-syro-primary text-sm text-syro-dark-gray">
            <Link href="/mosc-old" className="hover:text-syro-red transition-all duration-300">MOSC</Link>
            <span>/</span>
            <Link href="/mosc/training" className="hover:text-syro-red transition-all duration-300">Training</Link>
            <span>/</span>
            <span className="text-syro-blue">Divyabodhanam</span>
          </nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative w-full h-80 lg:h-96 rounded-lg overflow-hidden shadow-syro-card-hover">
              <Image src="/images/training/dvm.jpg" alt="Divyabodhanam" fill className="object-cover" priority />
            </div>
            <div>
              <h1 className="font-syro-display font-semibold text-4xl lg:text-5xl text-syro-blue mb-4">
                Divyabodhanam
              </h1>
              <p className="font-syro-display text-2xl text-syro-red mb-4 italic">
                Theological Education Programme for the Laity
              </p>
              <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
                A comprehensive theological education program equipping lay members with deep knowledge of Orthodox faith and tradition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-6">
            A Visionary Initiative
          </h2>
          <div className="space-y-6 font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
            <p>
              A novel step in the field of theological studies of Malankara Orthodox Syrian Church was officially inaugurated in <strong>1984 July 28</strong> as a laymen training course of the church. The seedling of the concept of this project was sown by the world renowned theologian, philosopher, thinker and spokesperson of eastern spirituality, <strong>Late Lamented Paulose Mar Gregorios Metropolitan</strong>. The steadfast growth of this project shows the foresightedness of the Metropolitan.
            </p>
            <div className="bg-syro-red/5 rounded-lg p-6 border-l-4 border-primary">
              <p className="font-medium text-syro-blue">
                H.H. Baselious Marthoma Didymus I Catholicos announced the study course as a spiritual movement through the Kalpana No: 138/2009.
              </p>
            </div>
            <p>
              The Divyabodhanam family considers this proclamation as a recognition for the outstanding service rendered to the church. The leadership and effective influence of the professors of the Seminary is the service that we value the most in the proficiency and prospering nature of the course.
            </p>
          </div>
        </div>
      </section>

      {/* Program Features */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-8 text-center">
            What You Will Learn
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-syro-card-sm">
              <div className="w-12 h-12 bg-syro-red/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3">
                Orthodox Theology
              </h3>
              <p className="font-syro-primary text-syro-dark-gray">
                Systematic study of Orthodox Christian doctrine and tradition
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-syro-card-sm">
              <div className="w-12 h-12 bg-syro-red/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3">
                Biblical Studies
              </h3>
              <p className="font-syro-primary text-syro-dark-gray">
                In-depth exploration of Holy Scripture and biblical interpretation
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-syro-card-sm">
              <div className="w-12 h-12 bg-syro-red/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3">
                Church History
              </h3>
              <p className="font-syro-primary text-syro-dark-gray">
                Understanding the development of the Orthodox Church through the ages
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-syro-card-sm">
              <div className="w-12 h-12 bg-syro-red/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3">
                Liturgical Life
              </h3>
              <p className="font-syro-primary text-syro-dark-gray">
                Deep dive into Orthodox worship and sacramental life
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8 border-l-4 border-primary">
            <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
              Contact Address
            </h3>
            <div className="space-y-3 font-syro-primary text-syro-dark-gray">
              <p className="font-medium text-syro-blue text-lg">The Registrar</p>
              <p>Divyabodhanam Central Office</p>
              <p>Orthodox Theological Seminary</p>
              <p>P.B. No. 98, Kottayam – 686001</p>
              <p className="pt-3">
                <span className="font-medium text-syro-blue">Phone:</span> 0481 2568083
              </p>
              <p>
                <span className="font-medium text-syro-blue">Email:</span>{' '}
                <a href="mailto:divyabodhanamots@gmail.com" className="text-syro-red hover:underline">
                  divyabodhanamots@gmail.com
                </a>
              </p>
              <p>
                <span className="font-medium text-syro-blue">Website:</span>{' '}
                <a href="http://www.divyabodhanam.org/" target="_blank" rel="noopener noreferrer" className="text-syro-red hover:underline">
                  www.divyabodhanam.org
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <QuickLinks />

      {/* Navigation */}
      <section className="py-12 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Link href="/mosc/training" className="inline-flex items-center px-6 py-3 bg-syro-red text-syro-red-foreground font-syro-primary font-medium rounded-lg hover:bg-syro-red/90 transition-all duration-300 shadow-syro-card">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Training Programs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}




