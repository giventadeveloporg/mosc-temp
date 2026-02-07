import React from 'react';
import QuickLinks from '../../components/QuickLinks';
import SpiritualOrganizationsSidebar from '../SpiritualOrganizationsSidebar';

export const metadata = {
  title: "St. Paul's & St.Thomas Suvishesha Sangam National Association for Mission Studies | MOSC",
  description: "St. Paul's & St.Thomas Suvishesha Sangam National Association for Mission Studies. President H.G. Dr. Yuhanon Mar Thevodoros Metropolitan. Office: St.Paul's M.T.C, Mavelikara. Ph: 0479 2302473, 2342709.",
};

const StPaulsStThomasSuvisheshaSangamNationalAssociationForMissionStudiesPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-lg flex items-center justify-center mx-auto mb-6 shadow-syro-card-hover">
              <span className="text-syro-red-foreground text-4xl font-bold" role="img" aria-label="St. Paul's & St.Thomas Suvishesha Sangam National Association for Mission Studies">✟</span>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              St. Paul&apos;s & St.Thomas Suvishesha Sangam National Association for Mission Studies
            </h1>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              President and office contact for the St. Paul&apos;s & St.Thomas Suvishesha Sangam National Association for Mission Studies.
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
                    President
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    H.G. Dr. Yuhanon Mar Thevodoros Metropolitan
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
                    Office Address
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    St.Paul&apos;s M.T.C , Mavelikara
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Ph: 0479 2302473, 2342709
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Email:{' '}
                    <a href="mailto:stpaulsmtc@yahoo.com" className="text-syro-red hover:underline">
                      stpaulsmtc@yahoo.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <SpiritualOrganizationsSidebar currentHref="/mosc/spiritual-organizations/st-pauls-st-thomas-suvishesha-sangam-national-association-for-mission-studies" />
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default StPaulsStThomasSuvisheshaSangamNationalAssociationForMissionStudiesPage;