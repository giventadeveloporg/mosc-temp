import React from 'react';
import QuickLinks from '../../components/QuickLinks';
import SpiritualOrganizationsSidebar from '../SpiritualOrganizationsSidebar';

export const metadata = {
  title: 'Malankara Orthodox Baskiyoma Association | MOSC',
  description: 'Malankara Orthodox Baskiyoma Association. President H. G. Dr. Mathews Mar Thimothios Metropolitan. Vice Presidents Fr. Solu Koshy Raju, Smt. Jessy Varghese. Secretary Rachel P Jose.',
};

const MalankaraOrthodoxBaskiyomaAssociationPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-lg flex items-center justify-center mx-auto mb-6 shadow-syro-card-hover">
              <span className="text-syro-red-foreground text-4xl font-bold" role="img" aria-label="Malankara Orthodox Baskiyoma Association">👥</span>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              Malankara Orthodox Baskiyoma Association
            </h1>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              Office bearers of the Malankara Orthodox Baskiyoma Association.
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
                {/* Office Bearers */}
                <div className="space-y-6">
                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
                    President
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    H. G. Dr. Mathews Mar Thimothios Metropolitan
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
                    Vice Presidents
                  </h3>
                  <div className="font-syro-primary text-syro-dark-gray space-y-2">
                    <p>Fr. Solu Koshy Raju</p>
                    <p>Smt. Jessy Varghese</p>
                  </div>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
                    Secretary
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Rachel P Jose
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Ph: +91 9497675787
                  </p>
                </div>
              </div>
            </div>

            <SpiritualOrganizationsSidebar currentHref="/mosc/spiritual-organizations/malankara-orthodox-baskiyoma-association" />
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default MalankaraOrthodoxBaskiyomaAssociationPage;