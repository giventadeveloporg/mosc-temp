import React from 'react';
import QuickLinks from '../../components/QuickLinks';
import SpiritualOrganizationsSidebar from '../SpiritualOrganizationsSidebar';

export const metadata = {
  title: 'NAVAJYOTHI MOMS CHARITABLE SOCIETY | MOSC',
  description: 'Navajyothi MOMS Charitable Society is for poor, self-employed women workers. Established 2009. Patron H.H. Baselious Marthoma Mathews III. President H.G Dr. Yuhanon Mar Diascoros Metropolitan.',
};

const NavajyothiMomsCharitableSocietyPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <section className="py-16 bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-lg flex items-center justify-center mx-auto mb-6 shadow-syro-card-hover">
              <span className="text-syro-red-foreground text-4xl font-bold" role="img" aria-label="Navajyothi MOMS">🌺</span>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              NAVAJYOTHI MOMS CHARITABLE SOCIETY
            </h1>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              The Navajyothi MOMS Charitable Society is an organization for poor, self-employed women workers in the community. Established in 2009, it is a registered charitable organization owned by Malankara Orthodox Syrian Church. Registered under the Travancore-Cochin Literary, Scientific and Charitable Societies Registration Act, 1955 with IT Exemption under Section 12AA and 80G.
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
                    <strong className="text-syro-blue">Mission:</strong> We aim at women development and poverty alleviation through agriculture, self-employment, micro credit, micro- small -medium enterprises (MSME), product distribution, waste management and training programmes. We also lay special emphasis on the welfare of widows, differently abled young women and single women. The main goal is to organize women for full employment, whereby they obtain work security, income security, food security and social security.
                  </p>
                  <p>
                    Activities include food processing by SHGs, training for skill development, promotion of agriculture, SHG activities (candle making, LED bulb assembling, stitching, confectionary, catering, poultry, goat rearing, farming), and charitable support for cancer patients, kidney patients and economically deprived students. There are more than 200 active women Self Help Groups (SHGs) in 14 districts of Kerala.
                  </p>
                </div>

                <div className="mt-10 space-y-6">
                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
                    Patron
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    H.H. Baselious Marthoma Mathews III
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
                    Office Bearers
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    <strong className="text-syro-blue">President:</strong> H.G Dr. Yuhanon Mar Diascoros Metropolitan
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    <strong className="text-syro-blue">Vice President:</strong> Fr. Boby Peter (7034707077)
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    <strong className="text-syro-blue">Exe. Director:</strong> Rev. Fr. Thomas Paul Ramban (9496455952)
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    <strong className="text-syro-blue">Director:</strong> Dr. Siby Tharakan (7025067695)
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    <strong className="text-syro-blue">General Secretary:</strong> Mrs. Santhamma Varghese (9496156939)
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    <strong className="text-syro-blue">Treasurer:</strong> Mrs. Ritha Varghese (9495116016)
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    <strong className="text-syro-blue">Joint Secretary:</strong> Mrs. Mini Sivaji (9400603188)
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
                    Address
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    NAVAJYOTHI MOMS CHARITABLE SOCIETY<br />
                    Catholicate Office, Devalokam, Kottayam, Kerala, PIN: 686004
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Phone: +917025067695
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Email:{' '}
                    <a href="mailto:navajyothimoms@yahoo.com" className="text-syro-red hover:underline">
                      navajyothimoms@yahoo.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <SpiritualOrganizationsSidebar currentHref="/mosc/spiritual-organizations/navajyothi-moms-charitable-society" />
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default NavajyothiMomsCharitableSocietyPage;
