import React from 'react';
import QuickLinks from '../../components/QuickLinks';
import SpiritualOrganizationsSidebar from '../SpiritualOrganizationsSidebar';

export const metadata = {
  title: 'The Servants of the Cross | MOSC',
  description: 'The Servants of the Cross. President H. G. Geevarghese Mar Coorilos Metropolitan. General Secretary Fr. Somu K. Samuel. Office: Carmel Dayara, Kandanad.',
};

const TheServantsOfTheCrossPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-lg flex items-center justify-center mx-auto mb-6 shadow-syro-card-hover">
              <span className="text-syro-red-foreground text-4xl font-bold" role="img" aria-label="The Servants of the Cross">✝️</span>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              The Servants of the Cross
            </h1>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              Office bearers and contact for The Servants of the Cross.
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
                <div className="space-y-6">
                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
                    President
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    H. G. Geevarghese Mar Coorilos Metropolitan
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
                    General Secretary
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Fr. Somu K. Samuel
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Ph: +91 9447933220
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
                    Office Address
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Carmel Dayara. Kandanad
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Ph: 0484 2792159
                  </p>
                </div>
              </div>
            </div>

            <SpiritualOrganizationsSidebar currentHref="/mosc/spiritual-organizations/the-servants-of-the-cross" />
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default TheServantsOfTheCrossPage;
