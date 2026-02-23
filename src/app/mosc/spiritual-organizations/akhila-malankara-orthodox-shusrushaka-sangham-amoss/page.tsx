import React from 'react';
import QuickLinks from '../../components/QuickLinks';
import SpiritualOrganizationsSidebar from '../SpiritualOrganizationsSidebar';

export const metadata = {
  title: 'Akhila Malankara Orthodox Shusrushaka Sangham (AMOSS) | MOSC',
  description: 'AMOSS gives instructions to altar boys for uniformity in worship, trains attendants in church tradition and ritual. President H. G. Dr. Yuhanon Mar Thevodoros Metropolitan.',
};

const AkhilaMalankaraOrthodoxShusrushakaSanghamAmossPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <section className="py-16 bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-lg flex items-center justify-center mx-auto mb-6 shadow-syro-card-hover">
              <span className="text-syro-red-foreground text-4xl font-bold" role="img" aria-label="AMOSS">⛪</span>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              Akhila Malankara Orthodox Shusrushaka Sangham (AMOSS)
            </h1>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              AMOSS is a movement working to give instructions to the altar boys of all parishes in the Malankara Church for uniformity in worship and to serve systematically.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
                  <p>
                    AMOSS objectives: (1) To give instructions to the altar boys of all parishes in the Malankara Church to make uniformity in the worship of the church and to serve systematically. (2) To mould people who have God&apos;s grace, dedication, who follow spiritual & sacramental life, and who have worldly experience to reside as servants in the sacramental service of the holy church. (3) To train attendants to practice the holy church&apos;s tradition and ritual service without any alteration and to perform it timely with all its meaning and value and to ordain and make them members of the church&apos;s serving community. The training to these altar boys is given under the supervision of &quot;SRUTI&quot; in the Kottayam Theological Seminary.
                  </p>
                  <p>
                    The activities under AMOSS are: Periodical training programmes at the diocese and zonal levels. Annual conferences aiming in the upliftment and encouragement of youngsters as the altar boys. AMOSS have units in almost all parishes.
                  </p>
                </div>

                <div className="mt-10 space-y-6">
                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
                    President
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    H. G. Dr. Yuhanon Mar Thevodoros Metropolitan
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
                    Vice President
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Fr. Jose Thomas Poovathumkal
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Ph: 9447231131
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
                    General Secretary
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Biju V. Panthaplave
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Ph: 9447558620
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
                    Treasurer
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Roy M. Muthoottu
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Ph: 9847032251
                  </p>
                </div>
              </div>
            </div>

            <SpiritualOrganizationsSidebar currentHref="/mosc/spiritual-organizations/akhila-malankara-orthodox-shusrushaka-sangham-amoss" />
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default AkhilaMalankaraOrthodoxShusrushakaSanghamAmossPage;
