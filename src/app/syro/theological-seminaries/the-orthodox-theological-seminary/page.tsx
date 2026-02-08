import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';

export const metadata = {
  title: 'The Orthodox Theological Seminary (Old Seminary) | MOSC',
  description: 'The first Orthodox Christian school of theology in Asia, the Orthodox Seminary, was founded in 1815 at Kottayam, in the state of Kerala (ancient Malabar) by Ram...',
};

const TheOrthodoxTheologicalSeminaryPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-lg flex items-center justify-center mx-auto mb-6 shadow-syro-card-hover">
              <span className="text-syro-red-foreground text-4xl font-bold" role="img" aria-label="The Orthodox Theological Seminary (Old Seminary)">📚</span>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              The Orthodox Theological Seminary (Old Seminary)
            </h1>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              The first Orthodox Christian school of theology in Asia, the Orthodox Seminary, was founded in 1815 at Kottayam, in the state of Kerala (ancient Malabar) by Ramban Ittoop, a priest-monk of the Malankara Orthodox Syrian Church.
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
                  About Orthodox Theological Seminary
                </h2>
                <div className="space-y-4 font-syro-primary text-syro-dark-gray leading-relaxed">
                  <p>The first Orthodox Christian school of theology in Asia, the Orthodox Seminary, was founded in 1815 at Kottayam, in the state of Kerala (ancient Malabar) by Ramban Ittoop, a priest-monk of the Malankara Orthodox Syrian Church. The learned monk from Kunnamkulam was carrying out with singular courage a major decision of the church made at Kandanadu in 1809 to start two schools of theology (Padithaveedu), one in the North and the other in the South of Kerala.</p>
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
                      <p className="font-syro-primary text-syro-dark-gray text-sm">Orthodox Theological Seminary</p>
                      <p className="font-syro-primary text-syro-dark-gray text-sm">P. B. No. 98, Kottayam – 686 001</p>
                      <p className="font-syro-primary text-syro-dark-gray text-sm">Kerala, India</p>
                    </div>
                  </div>


                    <div className="flex items-start space-x-3">
                      <span className="text-syro-red text-xl" role="img" aria-label="Phone">📞</span>
                      <div>
                        <h4 className="font-syro-display font-medium text-syro-blue">Phone</h4>
                        <p className="font-syro-primary text-syro-dark-gray text-sm">2566526, 2568083, 2568500</p>
                        <p className="font-syro-primary text-syro-dark-gray text-sm">Principal: 2568046</p>
                        <p className="font-syro-primary text-syro-dark-gray text-sm">Fax: 91-0481-2302571</p>
                      </div>
                    </div>


                  <div className="space-y-3">

                    <div className="flex items-start space-x-3">
                      <span className="text-syro-red text-xl" role="img" aria-label="Email">✉️</span>
                      <div>
                        <h4 className="font-syro-display font-medium text-syro-blue">Office</h4>
                        <a href="mailto:info@ots.edu.in" className="font-syro-primary text-syro-red hover:text-syro-red/80 text-sm transition-all duration-300">info@ots.edu.in</a>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-syro-red text-xl" role="img" aria-label="Email">✉️</span>
                      <div>
                        <h4 className="font-syro-display font-medium text-syro-blue">Principal</h4>
                        <a href="mailto:principal@ots.edu.in" className="font-syro-primary text-syro-red hover:text-syro-red/80 text-sm transition-all duration-300">principal@ots.edu.in</a>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-syro-red text-xl" role="img" aria-label="Email">✉️</span>
                      <div>
                        <h4 className="font-syro-display font-medium text-syro-blue">Webmaster</h4>
                        <a href="mailto:admin@ots.edu.in" className="font-syro-primary text-syro-red hover:text-syro-red/80 text-sm transition-all duration-300">admin@ots.edu.in</a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="text-syro-red text-xl" role="img" aria-label="Website">🌐</span>
                    <div>
                      <h4 className="font-syro-display font-medium text-syro-blue">Website</h4>
                      <a 
                        href="http://www.ots.edu.in" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-syro-primary text-syro-red hover:text-syro-red/80 text-sm transition-all duration-300"
                      >
                        www.ots.edu.in
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
                    href="/syro/theological-seminaries" 
                    className="block text-syro-red hover:text-syro-red/80 font-medium transition-all duration-300"
                  >
                    ← All Theological Seminaries
                  </Link>
                  <Link 
                    href="/syro/institutions" 
                    className="block text-syro-red hover:text-syro-red/80 font-medium transition-all duration-300"
                  >
                    Church Institutions
                  </Link>
                  <Link 
                    href="/syro/training" 
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
              href="/syro/theological-seminaries"
              className="inline-flex items-center justify-center px-6 py-3 bg-syro-red text-syro-red-foreground rounded-lg hover:bg-syro-red/90 transition-all duration-300"
            >
              Explore All Seminaries
            </Link>
            <Link
              href="/mosc"
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

export default TheOrthodoxTheologicalSeminaryPage;