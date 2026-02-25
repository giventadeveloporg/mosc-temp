import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata: Metadata = {
  title: 'Malankara Sabha Magazine (Masika) | Publications | MOSC',
  description: 'The official monthly magazine of the Malankara Orthodox Syrian Church, published since 1946 from the Catholicate Palace of Devalokam. Subscribe and contact the editorial board.',
};

export default function MalankaraSabhaMagazinePage() {
  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="Malankara Sabha Magazine (Masika)" breadcrumbFrom="publications" />

      {/* Hero Section with Image */}
      <section className="relative bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative w-full h-auto rounded-lg overflow-hidden flex items-center justify-center bg-syro-bg-gray/20">
              <Image
                src="/images/publications/mal.jpg"
                alt="Malankara Sabha Magazine (Masika)"
                width={800}
                height={600}
                className="w-full h-auto object-contain"
                style={{
                  backgroundColor: 'transparent',
                  borderRadius: '0.5rem',
                }}
                priority
              />
            </div>
            <div>
              <h1 className="font-syro-display font-semibold text-4xl lg:text-5xl text-syro-blue mb-4">
                Malankara Sabha Magazine (Masika)
              </h1>
              <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed mb-4">
                On August 8th 1946, due to the dedicated conviction and enthusiasm of H.H. Baselius Geevarghese II Catholicos of Blessed memory, the Magazine was published from the Catholicate Palace of Devalokam.
              </p>
              <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
                Very Rev. M.C. Kuriakose Ramban of Blessed memory was the first chief editor. From January 1968 to February 1969 &quot;Malankara Sabha&quot; was published as a biweekly. At present, this is a monthly published Magazine and it is the official organ of the Indian Orthodox Church.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Board */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-6">
            Editorial Board
          </h2>
          <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed mb-6">
            The editorial board appointed by the Holy Episcopal Synod of the Church oversees the administration and growth of the Magazine. At present, the editorial board includes H.G Dr Yuhanon Mar Diascoros Metropolitan (President), Fr Zachariah Thomas Puthupally (Chief Editor), Fr. Thomas Raju Karuvatta (Managing -Editor), Fr.Alex Thomas Nazhoorimattathil ( Sub- Editor)
          </p>
          <div className="bg-syro-bg-gray rounded-lg p-6">
            <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
              Editorial Board Members
            </h3>
            <ul className="space-y-2 font-syro-primary text-lg text-syro-dark-gray">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Fr dr Bijesh Philip</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Fr. Thomas Varghese chavadiyil</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Adv Biju Oommen</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Dr Thomas Kuruvila</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Alexin George IPoS</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Merlin T Mathew</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Subscribe & Contact */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-6">
            Subscribe and Contact
          </h2>
          <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed mb-6">
            The magazine is published on the 10th of every month. In order to subscribe for the magazine and for other information, contact:
          </p>
          <div className="bg-white rounded-lg shadow-syro-card p-8 border-l-4 border-syro-red">
            <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
              The Managing Editor
            </h3>
            <div className="space-y-2 font-syro-primary text-lg text-syro-blue">
              <p><strong>Malankara Sabha Monthly</strong></p>
              <p>Devalokam P.O</p>
              <p>Kottayam – 686 038</p>
              <p><strong>Tel.:</strong> 0481-2573234</p>
              <div className="mt-6 pt-4 border-t border-syro-table-border">
                <p className="mb-2"><strong>Email:</strong></p>
                <p>
                  <a
                    href="mailto:malankarasabha1946@gmail.com"
                    className="text-syro-red hover:underline transition-all duration-300"
                  >
                    malankarasabha1946@gmail.com
                  </a>
                </p>
                <p>
                  <a
                    href="mailto:sabhamasika@yahoo.com"
                    className="text-syro-red hover:underline transition-all duration-300"
                  >
                    sabhamasika@yahoo.com
                  </a>
                </p>
              </div>
              <div className="mt-4">
                <p className="mb-2"><strong>Website:</strong></p>
                <a
                  href="http://www.malankarasabhaonline.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-syro-red hover:underline transition-all duration-300"
                >
                  www.malankarasabhaonline.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Publications */}
      <section className="py-12 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Link
              href="/mosc/publications"
              className="inline-flex items-center px-6 py-3 bg-syro-red text-white font-syro-primary font-medium rounded-lg hover:bg-syro-red/90 transition-all duration-300 shadow-syro-card"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Publications
            </Link>
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
}
