import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SyroPageBanner from '../components/SyroPageBanner';

export const metadata = {
  title: 'Theological Seminaries | MOSC',
  description: 'Theological seminaries of the Malankara Orthodox Syrian Church providing theological education and training for clergy and laity.',
  keywords: ['Theological Seminaries', 'Orthodox Theology', 'MOSC Education', 'Seminary Training'],
};

const TheologicalSeminariesPage = () => {
  const seminaries = [
    {
      slug: 'the-orthodox-theological-seminary',
      title: 'The Orthodox Theological Seminary',
      subtitle: 'Old Seminary, Kottayam',
      description: 'The first Orthodox Christian school of theology in Asia, founded in 1815 at Kottayam by Ramban Ittoop, a priest-monk of the Malankara Orthodox Syrian Church.',
      image: '/images/theological/sem-300x176.jpg',
      location: 'Kottayam, Kerala',
      established: '1815'
    },
    {
      slug: 'st-thomas-orthodox-theological-seminary-nagpur',
      title: 'St. Thomas Orthodox Theological Seminary',
      subtitle: 'STOTS, Nagpur',
      description: 'A growing centre of the Orthodox Church in Central and North India, creating a new vision about the mission of the Church in a multi-lingual and multi-religious context.',
      image: '/images/theological/nag-300x176.jpg',
      location: 'Nagpur, India',
      established: 'Modern Era'
    }
  ];

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="Theological Seminaries" breadcrumbFrom="home" />

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-4">
              Centers of Learning and Formation
            </h2>
            <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
              Our theological seminaries have been serving the Church for generations, preparing clergy and lay leaders with deep theological knowledge, spiritual formation, and pastoral skills to serve God's people with wisdom and compassion.
            </p>
          </div>

          {/* Seminaries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {seminaries.map((seminary) => (
              <Link
                key={seminary.slug}
                href={`/mosc/theological-seminaries/${seminary.slug}`}
                className="group"
              >
                <div className="bg-syro-bg-gray rounded-lg shadow-syro-card overflow-hidden h-full reverent-hover group-hover:shadow-xl transition-all duration-300">
                  {/* Image */}
                  <div className="relative w-full aspect-[300/176] bg-syro-bg-gray">
                    <Image
                      src={seminary.image}
                      alt={seminary.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="p-8">
                  {/* Content */}
                  <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-2 group-hover:text-syro-red transition-all duration-300">
                    {seminary.title}
                  </h3>
                  <p className="font-syro-primary text-sm text-syro-red mb-3">
                    {seminary.subtitle}
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    {seminary.description}
                  </p>

                  {/* Meta Information */}
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-syro-table-border">
                    <div className="flex items-center space-x-2">
                      <span className="text-syro-red" role="img" aria-label="Location">📍</span>
                      <span className="font-syro-primary text-sm text-syro-dark-gray">{seminary.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-syro-red" role="img" aria-label="Established">📅</span>
                      <span className="font-syro-primary text-sm text-syro-dark-gray">Est. {seminary.established}</span>
                    </div>
                  </div>

                  {/* Read More Link */}
                  <div className="mt-6">
                    <span className="syro-read-more-btn font-syro-primary">
                      Learn More
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TheologicalSeminariesPage;

