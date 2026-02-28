import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Sacraments',
  description:
    'The sacraments (mysteries) in the Malankara Orthodox Syrian Church: Baptism, Chrismation, Holy Qurbana, and the other mysteries.',
};

export default async function SacramentsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Sacraments" breadcrumbFrom={breadcrumbFrom} />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                      src="/images/church/liturgy-worship.jpg"
                      alt="Sacraments"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    Sacraments
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Church celebrates the mysteries (sacraments) as visible signs of God&apos;s
                    grace, through which the Holy Spirit sanctifies the faithful. The Malankara
                    Orthodox Syrian Church recognizes the same sacramental life as the one holy
                    catholic and apostolic Church: Baptism, Chrismation (Confirmation), Holy
                    Qurbana (Eucharist), Repentance (Confession), Holy Orders, Marriage, and the
                    Anointing of the Sick.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-6 mb-3">
                    Baptism and Chrismation
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    By Baptism we are united to the death and resurrection of Christ and become
                    members of His Body. Chrismation follows Baptism and bestows the gift of the
                    Holy Spirit, sealing the baptized as members of the Church. Both are normally
                    administered together, even for infants, in the Orthodox tradition.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-6 mb-3">
                    Holy Qurbana and the Other Mysteries
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Holy Qurbana is the summit of the sacramental life. Repentance (Confession)
                    restores the sinner to communion; Holy Orders perpetuate the apostolic ministry;
                    Marriage sanctifies the union of husband and wife; and the Anointing of the Sick
                    brings healing and forgiveness. Through the sacraments, the Church becomes the
                    place where heaven and earth meet and where we receive the life of the Kingdom.
                  </p>
                </div>

                <div className="mt-10 hidden lg:block">
                  <QuickLinks />
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <TheChurchSidebar />
            </div>
          </div>
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
}
