import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: '20th Century',
  description:
    '20th-century history: division into Orthodox and Jacobites, establishment of the Catholicate in 1912, and the Malankara Orthodox Church.',
};

export default async function TwentiethCenturyPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="20th Century" breadcrumbFrom={breadcrumbFrom} />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-[280px] h-auto">
                    <Image
                      src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                      alt="Church History â€“ 20th Century"
                      width={280}
                      height={180}
                      className="w-auto h-auto object-contain rounded-lg block mx-auto"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    20th Century
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Following the Synod of Mulanthuruthy and the Royal Court judgement of 1889, the
                    Orthodox were in a divided condition: the reform party formed the Mar Thoma
                    Syrian Church; those who adhered to the Patriarch and West Syrian traditions
                    formed the Jacobite (Orthodox) Syrian Church. Disputes over the exercise of
                    Patriarchal authority led to further division in the 20th century into
                    Orthodox and Jacobites. The Orthodox section established the office of the
                    Catholicos, declaring that the Patriarch possesses only spiritual authority over
                    them while in temporal and administrative matters they are free. In 1934 the
                    Orthodox framed a constitution and united the office of Malankara Metropolitan
                    with that of the Catholicos. Litigations from 1913 to 1958 ended in favour of
                    the Orthodox; a truce was reached in 1958. From 1972 the patriarchal side
                    resumed conflict; Supreme Court verdicts from 1995 onward have not produced a
                    full amicable solution, and the two sections continueâ€”one under the Patriarch
                    and one under the Catholicos.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Dionysius VI and the Establishment of the Catholicate (1912)
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    After the death of Dionysius V, his successor Dionysius VI (Vattasseril
                    Dionysius the Great) became Malankara Metropolitan. Patriarch Abdulla II
                    visited Kerala and sought to stabilize patriarchal jurisdiction over the
                    Indian Church. The Association at Kottayam (November 1909) rejected his demand
                    for a registered deed and for consecrating bishops. The Patriarch excommunicated
                    Dionysius VI (June 1911). Dionysius and his adherents decided to establish the
                    Catholicate to defend the independence of the Indian Church. Abdul Messiah, the
                    predecessor of Abdulla II, was invited; he came to Kerala and established the
                    Catholicate in September 1912. The Orthodox division declared their freedom.
                    The first Catholicos was Moran Mar Baselios Paulose I (1912â€“14); subsequent
                    Catholicoses were elevated by the Synod of the Indian Orthodox bishops,
                    showing the autocephalous and autonomous status of the Indian Church. The
                    Catholicate now represents the supreme head of the Malankara Orthodox Syrian
                    Church, independent in church administration.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Catholicoses and Recent History
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Catholicos Geevarghese II (1929â€“64) served for 35 years. During his time the
                    Church introduced a constitution, won the final legal victory in 1958, and
                    associated with the World Council of Churches. In 1962 the headquarters of the
                    Catholicos was shifted to Devalokam, Kottayam. Catholicos Augen I (1964â€“75)
                    was a great Malayalam and Syriac scholar. From August 1974 all relation with
                    the Patriarch broke down again over the Patriarchâ€™s denial of the Throne of St.
                    Thomas and the autonomy of the Church under the Catholicos. The Orthodox section
                    of the Church continues as the Malankara Orthodox Syrian Churchâ€”independent and
                    autonomous under the Catholicos.
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
