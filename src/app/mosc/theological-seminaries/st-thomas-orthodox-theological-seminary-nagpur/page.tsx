import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';

export const metadata = {
  title: 'St. Thomas Orthodox Theological Seminary, Nagpur (STOTS) | MOSC',
  description: 'The St.Thomas Seminary is gradually growing as a centre of the Orthodox Church in Central and North India. Not only does it cater the needs of the diaspora popu...',
};

const StThomasOrthodoxTheologicalSeminaryNagpurPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-lg flex items-center justify-center mx-auto mb-6 shadow-syro-card-hover">
              <span className="text-syro-red-foreground text-4xl font-bold" role="img" aria-label="St. Thomas Orthodox Theological Seminary, Nagpur (STOTS)">⛪</span>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              St. Thomas Orthodox Theological Seminary, Nagpur (STOTS)
            </h1>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              The St.Thomas Seminary is gradually growing as a centre of the Orthodox Church in Central and North India. Not only does it cater the needs of the diaspora population meaningfully but also does it create a new vision about the mission of the Church in a multi-lingual and multi-religious context.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                  About St. Thomas Seminary, Nagpur
                </h2>
                <div className="space-y-4 font-syro-primary text-syro-dark-gray leading-relaxed">
                  <p>Introduction</p>
                  <p>The St.Thomas Seminary is gradually growing as a centre of the Orthodox Church in Central and North India. Not only does it cater the needs of the diaspora population meaningfully but also does it create a new vision about the mission of the Church in a multi-lingual and multi-religious context. Moreover, the Seminary offers a stage for fruitful dialogues of Christian theologians with people of other faith affirmations. In future, women of the Orthodox Church, who wish to study theology and to reflect to the challenges of the world will find it as a place, where their ideas will be influencing the theology of the Church.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6">
                <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-syro-red text-xl" role="img" aria-label="Location">📍</span>
                    <div>
                      <h4 className="font-syro-display font-medium text-syro-blue">Address</h4>
                      <p className="font-syro-primary text-syro-dark-gray text-sm">St. Thomas Orthodox Theological Seminary</p>
                      <p className="font-syro-primary text-syro-dark-gray text-sm">Brahmani P.O., Kalmeshwar 441 501</p>
                      <p className="font-syro-primary text-syro-dark-gray text-sm">Nagpur, India</p>
                    </div>
                  </div>


                    <div className="flex items-start space-x-3">
                      <span className="text-syro-red text-xl" role="img" aria-label="Phone">📞</span>
                      <div>
                        <h4 className="font-syro-display font-medium text-syro-blue">Phone</h4>
                        <p className="font-syro-primary text-syro-dark-gray text-sm">07118-271696 (office), 271994 (principal), 271991 (hostel)</p>
                      </div>
                    </div>


                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <span className="text-syro-red text-xl" role="img" aria-label="Email">✉️</span>
                      <div>
                        <h4 className="font-syro-display font-medium text-syro-blue">Email</h4>
                        <a href="mailto:nagpurseminary@rediffmail.com" className="font-syro-primary text-syro-red hover:text-syro-red/80 text-sm transition-all duration-300">nagpurseminary@rediffmail.com</a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="text-syro-red text-xl" role="img" aria-label="Website">🌐</span>
                    <div>
                      <h4 className="font-syro-display font-medium text-syro-blue">Website</h4>
                      <a 
                        href="http://www.orthodoxseminarynagpur.in" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-syro-primary text-syro-red hover:text-syro-red/80 text-sm transition-all duration-300"
                      >
                        www.orthodoxseminarynagpur.in
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6">
                <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                  Related Pages
                </h3>
                <div className="space-y-3">
                  <Link 
                    href="/mosc/theological-seminaries" 
                    className="block text-syro-red hover:text-syro-red/80 font-medium transition-all duration-300"
                  >
                    ← All Theological Seminaries
                  </Link>
                  <Link 
                    href="/mosc/institutions" 
                    className="block text-syro-red hover:text-syro-red/80 font-medium transition-all duration-300"
                  >
                    Church Institutions
                  </Link>
                  <Link 
                    href="/mosc/training" 
                    className="block text-syro-red hover:text-syro-red/80 font-medium transition-all duration-300"
                  >
                    Training Programs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <QuickLinks />

      {/* Call to Action */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-4">
            Interested in Theological Education?
          </h2>
          <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto mb-8">
            Learn more about theological programs and admission requirements at our seminaries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/mosc/theological-seminaries"
              className="inline-flex items-center justify-center px-6 py-3 bg-syro-red text-syro-red-foreground rounded-lg hover:bg-syro-red/90 transition-all duration-300"
            >
              Explore All Seminaries
            </Link>
            <Link
              href="/mosc-old"
              className="inline-flex items-center justify-center px-6 py-3 bg-syro-bg-gray text-syro-blue border border-syro-table-border rounded-lg hover:bg-syro-bg-gray transition-all duration-300"
            >
              Learn About MOSC
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StThomasOrthodoxTheologicalSeminaryNagpurPage;