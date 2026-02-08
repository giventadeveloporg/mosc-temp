import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import SpiritualOrganizationsSidebar from '../SpiritualOrganizationsSidebar';

export const metadata = {
  title: 'Divyabodhanam (Theological Education Programme for the Laity) | MOSC',
  description: 'The Divyabodhanam is a theological training programme for laity in the Church, founded in 1984. It educates in basic Orthodoxy, equips people to face contemporary challenges with a Christian mind, encourages lay leaders in spiritual organizations, and helps Christian parents and families nurture the next generation.',
};

const DivyabodhanamTheologicalEducationProgrammeForTheLaityPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-lg flex items-center justify-center mx-auto mb-6 shadow-syro-card-hover">
              <span className="text-syro-red-foreground text-4xl font-bold" role="img" aria-label="Divyabodhanam">🎓</span>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              Divyabodhanam (Theological Education Programme for the Laity)
            </h1>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              The Divyabodhanam is a theological training programme for laity in the Church. It was founded in 1984 by the late HH Baselius Marthoma Mathews I by the initiative of the late Metropolitan Dr. Paulose Mar Gregorios.
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
                <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
                  <p>
                    The Divyabodhanam is a theological training programme for laity in the Church. It was founded in 1984 by the late HH Baselius Marthoma Mathews I by the initiative of the late Metropolitan Dr. Paulose Mar Gregorios.
                  </p>
                  <p>
                    Divyabodhanam aims to educate people in basic Orthodoxy—its faith and practices, by training people to build up a true Christian life-pattern in the midst of its challenges. It equips people to face the contemporary challenges, ideologies and problems of the time and to respond with a Christian mind filled with deep faith and complete trust in God. It also encourages lay leaders to work in the spiritual organizations of the Church at parish and diocesan levels. It helps Christian parents and families, by which the growing generation shall be properly cared for and nurtured in a true Christian way.
                  </p>
                </div>

                {/* Office Bearers */}
                <div className="mt-10 space-y-6">
                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
                    President
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    H. G. Dr. Yakoob Mar Irenaios Metropolitan
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
                    Director
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Fr. Dr. T. J. Joshua
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
                    Joint Director
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Fr. C. C. Cherian
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
                    Principal, Old Theological Seminary, Kottayam
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Fr. Dr. Reji Mathew
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
                    Registrar
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Fr. Mathews John Manayil
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
                    Central Organizer
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Prof. Dr. Cherian Thomas
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
                    Co-ordinator
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Fr. Dr. Varghese P. Varghese
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
                    Office Address
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Orthodox Seminary, PB. No. 98, Kottayam- 686001
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Ph: +91 6282761354
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Email:{' '}
                    <a href="mailto:divyabodhanamots@gmail.com" className="text-syro-red hover:underline">
                      divyabodhanamots@gmail.com
                    </a>
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Website:{' '}
                    <a
                      href="https://www.divyabodhanam.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-syro-red hover:underline"
                    >
                      www.divyabodhanam.org
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <SpiritualOrganizationsSidebar currentHref="/mosc/spiritual-organizations/divyabodhanam-theological-education-programme-for-the-laity" />
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default DivyabodhanamTheologicalEducationProgrammeForTheLaityPage;