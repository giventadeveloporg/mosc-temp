import React from 'react';
import Link from 'next/link';
import Icon from './ui/Icon';

const ExploreOurChurchSection = () => {
  const exploreCards = [
    { title: 'About Our Church', icon: 'church', description: 'Discover the rich history, beliefs, and spiritual life of the Malankara Orthodox Syrian Church, tracing back to St. Thomas the Apostle.', href: '/syro/the-church' },
    { title: 'Services & Worship', icon: 'calendar', description: 'Learn about our Holy Qurbana, daily prayers, and spiritual liturgical services that form the heart of our worship.', href: '/syro/the-church' },
    { title: 'Clergy & Leadership', icon: 'people', description: 'Meet our spiritual leaders, bishops, and clergy who guide our diocesan governance and pastoral care.', href: '/syro/holy-synod' },
    { title: 'Contact & Location', icon: 'map', description: 'Find church locations, contact information, and directions to connect with our local parishes and communities.', href: '/syro/contact-info' }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-syro-display font-semibold text-syro-h3 text-syro-blue mb-4">
            Explore Our Church
          </h2>
          <p className="font-syro-primary text-syro-body text-syro-dark-gray max-w-3xl mx-auto">
            Discover more about our rich community services, and how you can be part of our spiritual journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {exploreCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group bg-syro-bg-gray rounded-lg shadow-syro-card p-6 hover:shadow-syro-card-hover transition-all duration-300"
            >
              <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-syro-red/20 transition-all duration-300">
                <Icon name={card.icon} size={32} className="text-syro-red" />
              </div>
              <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3 text-center">
                {card.title}
              </h3>
              <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4 text-center">
                {card.description}
              </p>
              <div className="text-center">
                <span className="inline-flex items-center text-syro-red hover:text-syro-red/80 font-medium transition-all duration-300">
                  Learn More
                  <Icon name="arrow-right" size={16} className="ml-1 group-hover:translate-x-1 transition-all duration-300" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreOurChurchSection;
