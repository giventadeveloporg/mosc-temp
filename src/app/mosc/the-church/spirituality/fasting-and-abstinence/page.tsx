import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Fasting and Abstinence',
  description:
    'Fasting in the Malankara Orthodox Syrian tradition. The Fast before Nativity, Ninevites, Great Fast, Apostles\' Fast, and other traditional fasts observed by the Church.',
};

export default async function FastingAndAbstinencePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Fasting and Abstinence" breadcrumbFrom={breadcrumbFrom} />

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-[280px] h-auto">
                    <Image
                      src="/images/church/spirituality.jpg"
                      alt="Fasting and Abstinence - Malankara Orthodox Church"
                      width={280}
                      height={180}
                      className="w-auto h-auto object-contain rounded-lg block mx-auto"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    Fasting in the Malankara Orthodox Syrian Tradition
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    It is widely known that the Orthodox Churches give much importance to fasting,
                    following the example of Jesus Christ and of the apostolic community. The noun
                    fasting means non-eating and non-feeding. But every non-eater is by no means a
                    faster, and everyone who is an eater and restrains himself by an interior
                    dedication from nourishment because of heavenly things is a faster.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In our materialistic society we learn to identify ourselves through
                    self-indulgence and we tend to see fasting only as a time of deprivation and
                    penance. But this is not at all the view of the Orthodox Church. For the Fathers,
                    fasting is the feast of the soul and good fasts are like medicine which cures our
                    soul and mind, and, along with other virtuous works, it leads us to eternal life.
                    According to Mar Aprem (4th century), fasting is a great weapon against the evil
                    one. Through fasting Christ defeated Satan and has given us this weapon to
                    overcome the evil. For Philoxenus of Maboug (6th century), fasting and abstinence
                    are the two virtuous weapons for cultivating the field of Christian life.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The primary teaching of our Church on fasting: &quot;Fasting must be undertaken
                    voluntarily and it must be of divine dispensation.&quot; Fast is of free will and
                    it is the voluntary fast which is accessible and permanent. Fasting becomes
                    highly acceptable when it is joined with humility of heart, charity towards all
                    men and continuous prayers. Fasting is the root by which all the fruits of
                    sanctity are sustained; on this same root grows purity, delights virginity and
                    rejoices patience. Fasting dispels immodesty, controls the lust and offers the
                    body as a holy temple of God.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Fast before the Nativity of our Lord
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    A traditional fast observed with great enthusiasm. In the Syrian tradition it
                    lasted forty days to glorify and give thanks to God the Father for giving His
                    unique Son for the salvation of the world. At present, in the Malankara Church,
                    this fast lasts for 25 days, from the first of December till Christmas day, and
                    all the faithful are bound to observe it with great vigour.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Fast of Ninevites
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    One of the most strictly observed fasts in the Syrian Church tradition. This fast
                    lasts for three days beginning on the Monday of the third week before the Great
                    Lent. The origin was to commemorate a miraculous cessation of plague in the
                    region of Beth-gammae. It is commonly known as Moonnunoimbu (three days fast) in
                    the Malankara Church, and also as the fast of Jonah since it commemorates the
                    conversion of Nineveh through the preaching of the prophet Jonah. It is a time
                    for penitential practice for the whole Church.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Great Fast
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Observed to actively participate in the Resurrection of Christ through a life of
                    passion and suffering. The Church prescribes forty days of fast in seven weeks,
                    ending on Friday (Nalpatham Velly) before the passion week. The fast is completed
                    only with Easter and is therefore also called fifty days Lent (Anpathu Noimbu).
                    On the Monday beginning the Lent, there is a special service of reconciliation
                    (Subukono) so that the faithful enter into the season of fast having reconciled
                    with all. The Church recommends the faithful to be content with one meal a day
                    and avoid all delicious food.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Apostles&apos; Fast
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Apostles, following the example of Jesus Christ, fasted after Pentecost and
                    before the feast of Epiphany (Denha). After the Ascension, the apostles began to
                    keep this fast. At present, in the Malankara Church, this fast is reduced to 13
                    days corresponding to the 12 apostles and St. Paul (June 16â€“29). It is observed
                    to become aware of the responsibility of the faithful in the Church and
                    missionary activities.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Fast before the Migration of Virgin Mary the Mother of God
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    One of the traditional fasts observed in all Eastern Churches. This fast starts
                    from the first day of August and ends with the Sunoyo feast on the fifteenth day.
                    It is a time for the faithful to prepare themselves for their death, for the
                    death of the Mother of God is a desirable and exemplary death for all.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Fast of Wednesdays and Fridays
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Besides the aforesaid fasts, the Church fasts on Wednesdays and Fridays
                    throughout the year, except any solemn feast falling on these days and the fifty
                    days after Easter. Wednesday commemorates the day the Jews plotted to crucify
                    Jesus Christ; Friday commemorates His passion, crucifixion and death for the
                    whole world.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Fast before the Nativity of St. Mary
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    An eight-day fast (Ettu Noimbu) observed only by the Syrian Christians in India,
                    beginning from the first day of September. It seems to have originated in
                    connection with the Islamic invasion and the fall of Kodungallur. The Christians
                    vowed to observe a fast so that God might protect their women from the hands of
                    invaders. It is not considered an obligatory fast and hence is not in the
                    canonical list of the Church.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Fast before the Feast of Pentecost
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Observed only in the Malankara Church. It begins from the day of Ascension and
                    ends with the feast of Pentecost. The Church regards it as a preparatory time
                    for the empowering of the Holy Spirit on the day of Pentecost.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Some Special Notes
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Saturdays and Sundays are the days of the Lord and of joy; therefore it is
                    prohibited to fast on these days (except Holy Saturday) except for the motive of
                    fasting before the reception of Holy Qurbana. Believers who prepare to receive
                    the sacraments must observe fasting as per the recommendation of the Church.
                    Holy Qurbana is not conducted on fast days (especially the Great Fast and
                    Nineveh Fast) except on Saturdays, Sundays, mid-day lent, fortieth Friday of the
                    Great Lent, and on the feast day of Annunciation. Celebration of marriage is
                    prohibited during these fasts; baptism is permitted in case of extreme necessity.
                    The feasts of martyrs, saints and departed are celebrated only on Sundays and
                    Saturdays. The married are asked to refrain from conjugal relations during the
                    fasting season.
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center mb-4">
                      Fasting is the feast of the soul and a weapon against the evil one. Through
                      fasting Christ defeated Satan and has given us this weapon. Fasting must be
                      undertaken voluntarily and joined with humility, charity and continuous prayer.
                    </p>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center font-semibold">
                      Malankara Orthodox Syrian Church
                    </p>
                  </div>
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
};

