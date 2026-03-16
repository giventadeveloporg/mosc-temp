import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Idukki',
  description: 'Learn about the Diocese of Idukki of the Malankara Orthodox Syrian Church.',
};

const dioceseofidukkiPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Idukki" breadcrumbFrom="dioceses" />

      {/* Main Content */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {/* Featured Image - centered, contained (administration style) */}
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/dioceses/diocese-of-idukki.jpg"
                    alt="Diocese of Idukki"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Idukki
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Until 1982, the present churches of the Idukki diocese were the part of kottayam diocese. In 1982 the churches in the eastern part of kottayam diocese were took and formed the Idukki Diocese. The first metropolitan of idukki diocese was the late lamented His Grace Mathews Mar Barnabas metropolitan. His Grace Mathews mar Barnabas metropolitan took all initiatives and bought land and constructed aramana and also started idukki orthodox medical center hospitalÂ  in concern to the social commitment of the diocese to the society.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      In 1992 when His Grace Mathews Mar Barnabas took the charge of American diocese the then metropolitans were H.G. Mathews mar severios, late lamented Paulose mar Pachomios, H.G. Abraham mar severios, H.G. Augen mar Dionysius, H.G. paulose mar milithios (H.H. Baselios marthoma paulose II). During the period of late lamented Augen mar Dionysios the Idukki diocese achieved a major stream of growth. Presently there are 30 churches and more than 2000 families in Idukki diocese.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Address: Â Gedseemon Aramana, Chakkupallom, Kumily-686509
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Ph: 04868-282248, 282504
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Email- idukkidiocese@yahoo.co.in
                    </p>
                </div>
              </div>
              {/* Quick Links - below content (desktop, same as administration) */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:col-span-1">
              <DiocesesSidebar />
            </div>
          </div>
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
};

export default dioceseofidukkiPage;