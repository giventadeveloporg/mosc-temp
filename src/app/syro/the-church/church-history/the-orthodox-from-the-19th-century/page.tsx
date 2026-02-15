import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'The Orthodox from the 19th Century',
  description:
    '19th-century history: British residents, the Seminary, CMS mission of help, origins of the Jacobite and Mar Thoma churches, and the Synod of Mulanthuruthy.',
};

export default async function Orthodox19thCenturyPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="The Orthodox from the 19th Century"
        breadcrumbFrom={breadcrumbFrom}
      />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-[280px] h-auto">
                    <Image
                      src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                      alt="Church History – 19th Century"
                      width={280}
                      height={180}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    The Orthodox from the 19th Century
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    By the dawn of the 19th century the British had established themselves in India;
                    Kerala came under their sway. Residents Col. Colin Macaulay and Col. John Munro,
                    Anglican Christians of evangelical persuasion, befriended both Roman and
                    Orthodox communities and departed from the Portuguese and Dutch policy of
                    oppressing or ignoring the Orthodox. A Trust Fund was instituted with the East
                    India Company; Munro helped found the Seminary at Kottayam (1815)—now the
                    Orthodox Theological Seminary—and promoted a “Mission of Help” by the Church
                    Missionary Society (CMS) in collaboration with the Orthodox Church.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The CMS Mission and Its End
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    CMS missionaries arrived between 1816 and 1818 and were well received. They
                    taught at the Seminary, translated the Bible into Malayalam, and established
                    schools. A section in the Church, however, appealed to the West Syrian Patriarch
                    to send a bishop and take control. Patriarch sent Mar Athanasius (1825); the
                    resident refused to accept him as bishop instead of the Indian bishops and
                    asked him to leave. The pro-patriarchal party blamed the missionaries for their
                    failure. When Bishop Daniel Wilson of Calcutta proposed a six-point programme in
                    1835, the Church at Mavelikara (January 1836) rejected it, declaring: “We are
                    Jacobite Syrians subject to the patriarch of Antioch… We cannot permit the
                    same.” Thus ended the CMS collaboration after twenty years. The missionaries
                    claimed most assets; a reform movement within the Church led to divisions and
                    eventually to the Mar Thoma Church and the Jacobite Syrian Church.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Synod of Mulanthuruthy (1876)
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Patriarch Peter IV came to Kerala in 1875, dethroned Mar Athanasius (the reform
                    party leader), and convened a synod at Mulanthuruthy in June 1876. The Synod
                    decided to adhere closely to West Syrian doctrinal, liturgical and disciplinary
                    norms and to accept the Patriarch’s jurisdictional claims. The Patriarch then
                    consecrated six bishops on his own authority. The outcomes were momentous: the
                    faith, liturgy, episcopacy and administration of the Orthodox in India were
                    aligned with the West Syrian Church. Litigation between the party under
                    Dionysius V and the reform party (Mar Athanasius / Thomas Athanasius) continued
                    till 1889, when the reform party yielded and formed themselves as the Mar Thoma
                    Syrian Church. The section under Dionysius V came to be called the Jacobite
                    Church in India under the West Syrian Patriarch.
                  </p>
                </div>

                <div className="mt-10 hidden lg:block">
                  <QuickLinks />
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
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
