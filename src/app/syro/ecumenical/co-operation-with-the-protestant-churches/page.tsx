import React from 'react';
import QuickLinks from '../../components/QuickLinks';
import EcumenicalSidebar from '../../components/EcumenicalSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Co-operation with the Protestant Churches',
  description:
    'Relations and cooperation between the Malankara Orthodox Church and CSI, Marthoma, and Lutheran Churches. FFRRC and theological education. Ecumenical relations of the Malankara Orthodox Syrian Church.',
};

const CoOperationWithProtestantChurchesPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Co-operation with the Protestant Churches" breadcrumbFrom="ecumenical" />

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <div className="prose prose-lg max-w-none">
                  <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-6">
                    <p>
                      It is a fact that there is no healthy and lively talks between the Orthodox
                      and CSI, Marthoma Churches. However, the Malankara Church has strong
                      relations and cooperation with these churches as they share many things in
                      common.
                    </p>

                    <p>
                      These three Churches cooperate in the theological education. FFRRC
                      (Federated Faculty for Research in Religion and Culture), the theological
                      organization has helped to foster the relation among these Churches.
                    </p>

                    <p>
                      Though we had certain dialogues with the Lutheran Church in the past, it is
                      not very lively in recent years.
                    </p>

                    <p>
                      Ecumenical ventures in modern times: His Holiness Baselios Marthoma Paulose
                      II is also very keen to encourage ecumenical relations. Various ecclesiastical
                      visits during a short span of time have paid rich dividends.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Links - Horizontal Below Main Content (desktop only in column) */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <EcumenicalSidebar />
            </div>
          </div>
          {/* Quick Links - mobile only: just above footer */}
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CoOperationWithProtestantChurchesPage;
