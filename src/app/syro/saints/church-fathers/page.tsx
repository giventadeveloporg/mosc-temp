import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Church Fathers',
  description: 'The early church fathers and their theological contributions',
};

export default async function ChurchFathersPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'saints' ? 'saints' : 'home';
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Church Fathers" breadcrumbFrom={breadcrumbFrom} />
      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                {/* Featured Image */}
                <div className="mb-8">
                  <Image
                    src="/images/saints/church-fathers.jpg"
                    alt="Church Fathers"
                    width={500}
                    height={300}
                    className="rounded-lg shadow-syro-card w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Early Church Fathers
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      &nbsp;
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Church Fathers during 4th and 5th Centuries
The fourth and fifth centuries may be regarded as the greatest centuries as far as the defense of faith is concerned. There were many heresies attacked the Church and the Church strongly defended its true faith through her faithful believers. The heroic children of the Church fought against the opponents of the Church through their teachings and literary works. We can say, without any doubt, these significant personalities are really heroes, the champions of Orthodoxy. The Church cherishes them in her heart as sources and models for Spirit inspired life.
                    </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6 mb-6">
                <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
                  Saints Categories
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/syro/saints" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Saints Overview
                  </Link>
                  <div className="border-t border-syro-table-border my-2"></div>
                  <Link 
                      href="/syro/saints/the-apostles" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      The Apostles
                    </Link>
                  <Link 
                      href="/syro/saints/st-mary-mother-of-god" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      St. Mary Mother of God
                    </Link>
                  <Link 
                      href="/syro/saints/church-fathers" 
                      className="block px-3 py-2 bg-syro-red text-white rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Church Fathers
                    </Link>
                  <Link 
                      href="/syro/saints/indian-saints" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Indian Saints
                    </Link>
                </nav>
              </div>

              {/* Quick Links */}
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6">
                <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
                  Quick Links
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/syro/the-church" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    The Church
                  </Link>
                  <Link 
                    href="/syro/holy-synod" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Holy Synod
                  </Link>
                  <Link 
                    href="/syro/dioceses" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Dioceses
                  </Link>
                  <Link 
                    href="/syro/ecumenical" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Ecumenical Relations
                  </Link>
                  <Link 
                    href="/syro/institutions" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Institutions
                  </Link>
                  <Link 
                    href="/syro/training" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Training
                  </Link>
                  <Link 
                    href="/syro/publications" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Publications
                  </Link>
                  <Link 
                    href="/syro/spiritual" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Spiritual Organisations
                  </Link>
                  <Link 
                    href="/syro/theological" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Theological Seminaries
                  </Link>
                  <Link 
                    href="/syro/lectionary" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Lectionary
                  </Link>
                  <Link 
                    href="/syro/gallery" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Gallery
                  </Link>
                  <Link 
                    href="/syro/contact-info" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Contact Info
                  </Link>
                  <Link 
                    href="/syro/faqs" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    FAQs
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
