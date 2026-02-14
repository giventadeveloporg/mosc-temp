import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Apostolic Origin',
  description:
    'The apostolic origin of the St. Thomas Christians: traditions, the tomb at Mylapur, East Syrian and Graeco-Roman testimony, and the Acts of Judas Thomas.',
};

export default async function ApostolicOriginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Apostolic Origin" breadcrumbFrom={breadcrumbFrom} />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-[280px] h-auto">
                    <Image
                      src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                      alt="Apostolic Origin – St. Thomas Christians"
                      width={280}
                      height={180}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    St. Thomas Christians Origin
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Church of the St. Thomas Christians is an ancient Christian Church and an
                    apostolic Church originated out of the evangelical endeavours of St. Thomas. The
                    traditions current among the St. Thomas Christians hold that St. Thomas, one
                    among the twelve apostles, after visiting Socotra came to Muzris (Kodungallore)
                    in about AD 52. He preached to the Jewish colony and made converts, established
                    Christian communities at seven places—Maliankara, Palayur, Paravur, Gokamangalam,
                    Niranam, Chayal, and Kollam—and appointed leaders from the leading families
                    Kalli, Kaliankal, Shankarapuri and Pakalomattam. From Kerala he proceeded to the
                    eastern parts of South India and then to Malacca and China. Returning to India,
                    he was martyred and buried at Mylapur (St. Thomas Mount) in AD 72.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Tomb of St. Thomas at Mylapur
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In almost every century from the 3rd to the 16th we have testimony to the
                    existence of the St. Thomas tomb in India. The 3rd-century Syrian writing the
                    Acts of Apostle Judas Thomas (Acta Thoma) says that the apostle worked in India
                    and met death on the top of a hill in the kingdom of Mazdai; a part of his bones
                    was taken to Edessa by a Syrian merchant called Khabin. St. Ephrem (4th century)
                    composed hymns on St. Thomas&apos;s mission in India, martyrdom, and removal of
                    bones to Edessa. Gregory of Tours (AD 594), Marco Polo (1293), and the
                    Portuguese from 1517 onwards attest to the tomb at Mylapur. The St. Thomas
                    Christians were unanimous that the apostle suffered martyrdom and was buried at
                    Mylapur.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Tradition of the East Syrian Church
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    It is the constant tradition of the Eastern Church that the Apostle Thomas
                    evangelized India. The earliest detailed account from Syrian Christianity is the
                    book The Acts of Judas Thomas, written in Syriac by an Edessan Syrian Christian
                    around AD 200. The Teaching of the Apostles (AD 250) states: &quot;India and
                    all its countries and those bordering on it, even to the farthest Sea, received
                    the Apostle&apos;s Hand of Priesthood from Judas Thomas.&quot; St. Ephrem
                    and the East Syrian liturgical tradition consistently associate St. Thomas with
                    India.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Tradition of the Graeco-Roman Christianity
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Among the Fathers and writers of the Graeco-Roman world, Gregory of Nazianzus,
                    Ambrose, Jerome (4th century), Gregory of Tours, Isidore of Seville, and Cosmos
                    the Alexandrine traveler hold that St. Thomas preached in India and established
                    the Church there. The liturgical traditions of the Roman, Byzantine, and
                    Alexandrine churches also associate the martyrdom of St. Thomas with India
                    (Calamina/Mylapur).
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Conclusion
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The age-old consciousness of the church of St. Thomas Christians—that their
                    origin as Christians is from the mission of St. Thomas the Apostle in India—stands
                    sufficiently justified by the living community and its traditions, the tomb at
                    Mylapur, the witness of the East Syrian and universal Church, and the judgment
                    of historians.
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
