import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Medical College | Institutions | MOSC',
  description: 'Malankara Medical Mission Hospital and Medical College, Kolencherry - providing quality medical education and healthcare services.',
};

export default function MedicalCollegePage() {
  return (
    <div className="min-h-screen bg-syro-bg-gray">
      {/* Breadcrumb */}
      <section className="bg-syro-bg-gray py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 font-syro-primary text-sm text-syro-dark-gray">
            <Link href="/mosc-old" className="hover:text-syro-red transition-all duration-300">MOSC</Link>
            <span>/</span>
            <Link href="/mosc/institutions" className="hover:text-syro-red transition-all duration-300">Institutions</Link>
            <span>/</span>
            <span className="text-syro-blue">Medical College</span>
          </nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative w-full h-80 lg:h-96 rounded-lg overflow-hidden shadow-syro-card-hover">
              <Image src="/images/institutions/med.jpg" alt="Medical College" fill className="object-cover" priority />
            </div>
            <div>
              <h1 className="font-syro-display font-semibold text-4xl lg:text-5xl text-syro-blue mb-4">Medical College</h1>
              <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
                Malankara Medical Mission Hospital and Medical College at Kolencherry, dedicated to excellence in medical education and compassionate healthcare delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-syro-card p-8">
            <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-6">
              Malankara Medical Mission Hospital
            </h2>
            <p className="font-syro-primary text-lg text-syro-blue mb-6">
              Kolencherry – 682 311
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-syro-bg-gray rounded-lg p-6 border-l-4 border-primary">
                <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-4">
                  Main Departments
                </h3>
                <div className="space-y-3 font-syro-primary text-syro-dark-gray">
                  <p className="flex justify-between">
                    <span className="font-medium">Hospital:</span>
                    <span>04843055 555</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Enquiry IP:</span>
                    <span>04843055 211</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Enquiry OP:</span>
                    <span>04843055 621</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Administration:</span>
                    <span>04843055 411</span>
                  </p>
                </div>
              </div>
              <div className="bg-syro-bg-gray rounded-lg p-6 border-l-4 border-primary">
                <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-4">
                  Educational Programs
                </h3>
                <div className="space-y-3 font-syro-primary text-syro-dark-gray">
                  <p className="flex justify-between">
                    <span className="font-medium">Medical College:</span>
                    <span>04843055 527</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Nursing College:</span>
                    <span>04843055 661</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">School Of Nursing:</span>
                    <span>04843055 367</span>
                  </p>
                </div>
              </div>
              <div className="bg-syro-bg-gray rounded-lg p-6 border-l-4 border-primary">
                <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-4">
                  Additional Services
                </h3>
                <div className="space-y-3 font-syro-primary text-syro-dark-gray">
                  <p className="flex justify-between">
                    <span className="font-medium">Health Package:</span>
                    <span>04843055 700</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Casualty PRO:</span>
                    <span>04843055 733</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Telephone Booking:</span>
                    <span>04843055 621</span>
                  </p>
                </div>
              </div>
              <div className="bg-syro-red/5 rounded-lg p-6 border-l-4 border-primary flex flex-col justify-center">
                <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-4">
                  Website
                </h3>
                <a 
                  href="http://moscmm.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-syro-red hover:underline font-syro-primary text-lg"
                >
                  moscmm.org
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <QuickLinks />

      {/* Navigation */}
      <section className="py-12 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Link href="/mosc/institutions" className="inline-flex items-center px-6 py-3 bg-syro-red text-white font-syro-primary font-medium rounded-lg hover:bg-syro-red/90 transition-all duration-300 shadow-syro-card">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Institutions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


