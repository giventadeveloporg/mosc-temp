import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SAINTS_SIDEBAR_LINKS } from '../saintsSidebarLinks';

export const metadata = {
  title: 'The Apostles',
  description: 'The twelve apostles of Jesus Christ and their missionary work',
};

const currentSlug = '/mosc/saints/the-apostles';

export default function TheApostlesPage() {
  return (
    <div className="bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-lg flex items-center justify-center mx-auto mb-6 shadow-syro-card-hover">
              <span className="text-syro-red-foreground text-4xl font-bold" role="img" aria-label="Saint">👥</span>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              The Apostles
            </h1>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              The twelve apostles of Jesus Christ and their missionary work
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
                {/* Featured Image */}
                <div className="mb-8">
                  <Image
                    src="/images/saints/the-apostles.jpg"
                    alt="The Apostles"
                    width={500}
                    height={300}
                    className="rounded-lg shadow-syro-card w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    The Apostles
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The word Apostle (apostolos) designates a person with a particular mission. In the very strict biblical meaning it denotes only the twelve Apostles. In the Gospel narratives the Twelve Apostles are described as having been commisioned to preach the Gospel to the world, regardless of whether Jew or Gentile. Although the Apostles are portrayed as having been Galilean Jews, and 10 of their names are Aramaic and the rest are Greek. The Church considers St Paul in the same status because of his direct experience with Jesus Christ and zeal for the propagation of the Gospel. According to the tradition, all the Apostles, except St John, are suffered martyrdom.
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
                  {SAINTS_SIDEBAR_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-3 py-2 rounded-md font-syro-primary text-sm transition-all duration-300 ${
                        link.href === currentSlug
                          ? 'bg-syro-red text-syro-red-foreground'
                          : 'text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
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
}