import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Kandanad West',
  description: 'Learn about the Diocese of Kandanad West of the Malankara Orthodox Syrian Church.',
};

const dioceseofkandanadwestPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Kandanad West" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/diocese-of-kandanad-west.jpg"
                    alt="Diocese of Kandanad West"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Kandanad West
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      In 1876 Malankara Orthodox Church was divided as 7 Dioceses by mulanthuruthy synod. Among that seven one diocese was Kandanad Diocese, at that time the parishes of Â Kandanad Diocese spread in Kottayam , Idukki and Ernakulam District.
The first Metropolitan of this diocese was H.G Paulose mar Ivanios (murimattathil bava). Later First Catholicos of Malankara Orthodox Church, who belongs to Kolenchery St. Peter's and St. Paul's orthodox church.
Followed by him this diocese was governed by the following Metropoltans.
H.G Yuyakim Mar Ivanios
H.G Augen Mar Thimothios
H.G Paulose Mar Philoxenos
H.G Joseph Mar Pachomiose
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

export default dioceseofkandanadwestPage;