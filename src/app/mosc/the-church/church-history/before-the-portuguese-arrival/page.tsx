import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Before the Portuguese Arrival',
  description:
    'The Thomas Christians before the Portuguese arrival: their close connection with East Syrian Christianity, travelers’ records, migrations, and Persian sources.',
};

export default async function BeforePortugueseArrivalPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Before the Portuguese Arrival"
        breadcrumbFrom={breadcrumbFrom}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                      src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                      alt="Church History – Before the Portuguese Arrival"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    The Thomas Christians Before the Portuguese Arrival
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    With regard to the status of the Indian St. Thomas Christians before the
                    Portuguese arrival, it is admitted unanimously by all classical historians that
                    it was in close connection with East Syrian Christianity. The expansion of
                    Christianity in the East, especially in India, was not the work of Hellenist
                    Christian missionaries from Antioch or from the Roman Empire; it was the work of
                    Jewish Christian missionaries such as Adai in Edessa, Aggai and Mari in Persia,
                    and Thomas in India. The Christian churches thus formed were ecclesiastically
                    independent of Antioch or any other centre in the West.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Travelers&apos; Record
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The first substantial mention of the church of St. Thomas in modern India is
                    made by Western travelers of the late Middle Ages: Marco Polo (1298), John of
                    Monte Corvino (1293), Friar Odoric (1325), John de Maringolly (1349), and Nicolo
                    Conti (c. 1440). All mention a church or shrine of St. Thomas in India at
                    Mylapur. The first unquestionable historical evidence of an Indian church and
                    its relation with the East Syrian church is from Cosmos the Alexandrine traveler
                    (520–530), who mentions in his Christian Topography well-organized Christian
                    churches in Ceylon, Malabar, Calliana, and Socotra with bishops appointed from
                    Persia.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Migration of East Syrians to Kerala
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    There were at least two important waves of immigration of Persian Christians to
                    India: one in the 4th century and the other in the 9th. The tradition about the
                    first is that 72 families of Persian Christians under the leadership of a
                    merchant Thomas, including deacons, priests and a bishop, migrated and settled
                    at Kodungalloor; Cheraman Perumal, the King of Malabar, invested them with
                    royal privileges inscribed on copper plates. The second migration is dated to
                    AD 823; the tradition claims that Christian immigrants led by Mar Sapor and Mar
                    Prot rebuilt the town of Quilon in AD 825, from which date the Malayalam era is
                    reckoned. Five copper plates still in existence record grants made to the
                    Christians in Quilon by the kings. Five carved stone Crosses (St. Thomas Crosses)
                    discovered in South India, dated to the 7th or 8th century, are Persian Crosses
                    and testify to the connection between the Indian church and the Persian church.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Witness of Persian Sources
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Chronicle of Seert (7th century) mentions that Dudi, bishop of Basra,
                    left his see between AD 295–300 and went to India where he evangelized many
                    people. At the beginning of the 5th century (410) the bishopric of Rewardashir
                    was elevated to a Metropolitanate and given jurisdiction over relations with
                    India. Patriarch Ishoyahb II (628–43) appointed a Metropolitan for India
                    separately. Patriarch Timothy I (779–823) in his letters attests to the Indian
                    church under the East Syrian Patriarchate. A lectionary composed at
                    Crangannore in 1301 refers to the compiler as deacon Zachariah and to Mar Jacob
                    as the leader of the Holy Indian church occupying the See of the Apostle St.
                    Thomas.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Possible Conclusions
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    By and large Christianity in India till 1599 belonged to the East Syrian
                    church. Its supreme head was the Catholicos-Patriarch of Babylon. India had
                    bishops and enjoyed Metropolitan status; the bishops were always East Syrian.
                    The church of India never had a native ecclesiastical language—Syriac was its
                    liturgical tongue. The Thomas Christians enjoyed a sound social status and lived
                    an appreciable indigenous lifestyle in harmony with non-Christian communities,
                    but in church matters they were followers of the East Syrian Church and its
                    characteristics.
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
