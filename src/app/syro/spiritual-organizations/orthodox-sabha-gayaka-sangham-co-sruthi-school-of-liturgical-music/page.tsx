import React from 'react';
import QuickLinks from '../../components/QuickLinks';
import SpiritualOrganizationsSidebar from '../SpiritualOrganizationsSidebar';

export const metadata = {
  title: 'Orthodox Sabha Gayaka Sangham C/o Sruthi School of Liturgical Music | MOSC',
  description: 'Orthodox Sabha Gayaka Sangham C/o Sruthi School of Liturgical Music. Director H. G. Dr. Zacharias Mar Aprem Metropolitan. Contact: sruthischoolofmusic89@rediffmail.com.',
};

const OrthodoxSabhaGayakaSanghamCoSruthiSchoolOfLiturgicalMusicPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-lg flex items-center justify-center mx-auto mb-6 shadow-syro-card-hover">
              <span className="text-syro-red-foreground text-4xl font-bold" role="img" aria-label="Orthodox Sabha Gayaka Sangham C/o Sruthi School of Liturgical Music">🎵</span>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              Orthodox Sabha Gayaka Sangham C/o Sruthi School of Liturgical Music
            </h1>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              Director and contact for the Orthodox Sabha Gayaka Sangham, Sruthi School of Liturgical Music.
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
                {/* Office Bearers / Contact */}
                <div className="space-y-6">
                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
                    Director
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    H. G. Dr. Zacharias Mar Aprem Metropolitan
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
                    Email
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    <a href="mailto:sruthischoolofmusic89@rediffmail.com" className="text-syro-red hover:underline">
                      sruthischoolofmusic89@rediffmail.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <SpiritualOrganizationsSidebar currentHref="/mosc/spiritual-organizations/orthodox-sabha-gayaka-sangham-co-sruthi-school-of-liturgical-music" />
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default OrthodoxSabhaGayakaSanghamCoSruthiSchoolOfLiturgicalMusicPage;