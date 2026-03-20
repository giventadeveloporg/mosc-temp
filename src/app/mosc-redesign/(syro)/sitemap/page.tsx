import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Sitemap',
  description: 'Complete sitemap of the Malankara Orthodox Syrian Church website.',
};

const SitemapPage = () => {
  const sitemapStructure = [
    {
      title: 'Main Sections',
      links: [
        { name: 'Home', href: '/mosc-old' },
        { name: 'The Catholicate', href: '/mosc-redesign/catholicate' },
        { name: 'Administration', href: '/mosc-redesign/administration' },
        { name: 'The Church', href: '/mosc-redesign/the-church' },
        { name: 'Holy Synod', href: '/mosc-redesign/holy-synod' },
        { name: 'Ecumenical', href: '/mosc-redesign/ecumenical' },
        { name: 'Dioceses', href: '/mosc-redesign/dioceses' },
        { name: 'Saints', href: '/mosc-redesign/saints' }
      ]
    },
    {
      title: 'Spiritual Resources',
      links: [
        { name: 'Liturgical Resources', href: '/mosc-redesign/liturgical-resources' },
        { name: 'Theological Writings', href: '/mosc-redesign/theological-writings' },
        { name: 'Patristic Fathers', href: '/mosc-redesign/patristic-fathers' },
        { name: 'Holy Bible', href: '/mosc-redesign/holy-bible' },
        { name: 'Sermons', href: '/mosc-redesign/sermons' },
        { name: 'Hymns', href: '/mosc-redesign/hymns' },
        { name: 'Prayers', href: '/mosc-redesign/prayers' },
        { name: 'Calendar', href: '/mosc-redesign/calendar' }
      ]
    },
    {
      title: 'Community Services',
      links: [
        { name: 'Spiritual Organisations', href: '/mosc-redesign/spiritual' },
        { name: 'Publications', href: '/mosc-redesign/publications' },
        { name: 'Institutions', href: '/mosc-redesign/institutions' },
        { name: 'Training', href: '/mosc-redesign/training' },
        { name: 'Theological Seminaries', href: '/mosc-redesign/theological' },
        { name: 'Lectionary', href: '/mosc-redesign/lectionary' },
        { name: 'Downloads', href: '/mosc-redesign/downloads' },
        { name: 'Gallery', href: '/mosc-redesign/gallery' }
      ]
    },
    {
      title: 'External Links',
      links: [
        { name: 'Directory', href: '/mosc-redesign/directory' },
        { name: 'Calendar', href: 'http://calendar.mosc.in/', external: true },
        { name: 'E-mail', href: 'https://accounts.google.com/ServiceLogin', external: true }
      ]
    }
  ];

  return (
    <div className="bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-lg flex items-center justify-center mx-auto mb-6 shadow-syro-card-hover">
              <span className="text-syro-red-foreground text-4xl font-bold" role="img" aria-label="Sitemap">🗺️</span>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              Website Sitemap
            </h1>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              Navigate through all sections and pages of the Malankara Orthodox Syrian Church website.
              Find information about our faith, history, administration, and spiritual resources.
            </p>
          </div>
        </div>
      </section>

      {/* Sitemap Structure */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sitemapStructure.map((section) => (
              <div key={section.title} className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6">
                <h2 className="font-syro-display font-semibold text-xl text-syro-blue mb-6">
                  {section.title}
                </h2>
                <nav className="space-y-3" role="navigation" aria-label={`${section.title} navigation`}>
                  {section.links.map((link) => (
                    <div key={link.name}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-syro-dark-gray hover:text-syro-red transition-all duration-300 text-sm"
                        >
                          {link.name}
                          <span className="ml-1" role="img" aria-label="External link">🔗</span>
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="block text-syro-dark-gray hover:text-syro-red transition-all duration-300 text-sm"
                        >
                          {link.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Search */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-4">
              Can't Find What You're Looking For?
            </h2>
            <p className="font-syro-primary text-lg text-syro-dark-gray mb-8 max-w-2xl mx-auto">
              Use our search functionality or contact us for assistance in finding specific information.
            </p>

            <div className="max-w-md mx-auto">
              <div className="flex space-x-4">
                <Link
                  href="/mosc-redesign/contact-info"
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-syro-red text-syro-red-foreground rounded-lg hover:bg-syro-red/90 transition-all duration-300"
                >
                  <span className="mr-2" role="img" aria-label="Contact">📞</span>
                  Contact Us
                </Link>
                <Link
                  href="/mosc-old"
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-all duration-300"
                >
                  <span className="mr-2" role="img" aria-label="Home">🏠</span>
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SitemapPage;














