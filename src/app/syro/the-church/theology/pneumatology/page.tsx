import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Pneumatology',
  description:
    'Theology concerning the Holy Spirit. The doctrine of the Holy Spirit in the Old and New Testament, co-equal with the Father and the Son in the Holy Trinity.',
};

export default async function PneumatologyPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Pneumatology" breadcrumbFrom={breadcrumbFrom} />

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-[280px] h-auto">
                    <Image
                      src="/images/church/theology.jpg"
                      alt="Pneumatology - Theology concerning the Holy Spirit"
                      width={280}
                      height={180}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    Theology concerning the Holy Spirit
                  </h2>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Introduction
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    God is Father, Son and Holy Spirit. The Trinitarian formula of Baptism introduced
                    by Jesus Christ (Mt 28:19) reveals the co-equality, co-essentiality, co-divinity
                    of Father, Son and Holy Spirit. The Baptism of Christ manifested the mystery of
                    this Holy Trinity (Mt 3:13-17) but even before that event numerous Old Testament
                    references pointed to the Trinity (Gen 1:26, 18:1-16, Is 6:1-4). They all suggest
                    one God in three persons, the Father, Son and the Holy Spirit. Thus in the
                    Scripture there are three who are recognized as God and this three are so
                    described that we are compelled to conceive of them as distinct persons. This
                    tri-personality of the divine nature is not merely economic and temporal but is
                    immanent and eternal. It is not tritheism; for while there are three persons,
                    there is but one essence. Thus the term &apos;Trinity&apos; is not a metaphysical
                    one—it is only a designation of four facts: (1) The Father is God; (2) the Son
                    is God; (3) the Spirit is God; (4) there is but one God. Our concern here is to
                    describe the Doctrine of the Holy Spirit.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    1. The term &apos;Holy Spirit&apos;
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    &apos;Ruah&apos; is Hebrew and &apos;Pneuma&apos; in Greek signify the same:
                    &apos;breath&apos; or &apos;wind&apos;—that which is living but immaterial. Spirit
                    is used in three ways in Scripture: (1) The Holy Spirit is one of the three
                    persons of the Trinity (Jn 4:24; 20:22); (2) The angels are called spirit (Ps
                    104:4); (3) The human spirit possesses the intuitive ability to know and
                    experience God (Rom 8:16; 1 Cor 2:10-12). The word &apos;Holy&apos; literally
                    means &apos;set apart or separated unto God&apos;: hence blessed, righteous or
                    sinless. The word therefore refers primarily to God as the source of holiness.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    2. The Holy Spirit in the Old Testament
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In the earliest understanding of Spirit (Ruah) there was little or no distinction
                    between natural and supernatural. God breathed spirit into man and man became a
                    living soul (Gen 2:7). This indicates spirit as a divine and mysterious vital
                    power, in the ecstatic behavior of prophets or charismatic leaders under
                    God&apos;s authority. Primarily the spirit and the soul in man were identically
                    understood (Ex 15:8, 10; 2 Sam 22:16; Ps 18:15; Is 40:7). Later a distinction
                    between spirit and soul emerged in which spirit (Ruah) in man retains its
                    immediate connection with God denoting the &apos;higher&apos; or God-ward
                    direction of man&apos;s existence (e.g. Ezr 1:1, 5; Ps 51:12; Ezek 11:19),
                    whereas the soul (nepesh) tends to stand for the &apos;lower&apos; aspects of
                    man&apos;s consciousness, the seat of his intellect, will power, emotions and
                    appetites. This may be the way prepared for the Pauline distinctions between the
                    physical and the spiritual (1 Cor 15:44-46). Possession of the spirit of God was
                    conceived later as permanent and capable of being passed on (Num 11:17; Dt 34:9;
                    2 Ki 2:9, 15). For example, anointing of the king was thought of as anointing by
                    the spirit (1 Sam 16:13; Ps 89:20; Is 11:2, 61:1). In the exilic and post-exilic
                    period the role of divine spirit as inspirer of prophecy was reasserted (Jer 1:23;
                    Is 59:21; Ezek 2:2, 3:1-4, 22-24). The sense that God is present personally
                    through His Spirit began to emerge through the works of the prophets (Neh 9:20,
                    30; Zech 7:12) and in artistic skills and craftsmanship of Bezalel (Ex 28:3,
                    31:3, 35:31) and others, as well as the work of creation (Gen 1:2; Job 26:13; Ps
                    33:6; 104:30) and the Spirit&apos;s cosmic presence (Ps 139:7). This led to the
                    conclusion that the spirit of the holy and good God is God&apos;s Spirit or Holy
                    Spirit (Ps 51:13; Is 63:10; Neh 9:20; Ps 143:10). The Spirit in the work of
                    eschatological dimension creating a new man was a later development (Is 35:15;
                    44:3; 42:1; 61:1; Ezek 36:26, 37; Jer 31:31-34).
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Thus in the Old Testament the notions of the &apos;spirit&apos; as an instrument
                    of divine action in nature (Gen 1:2) and in the human hearts (Ex 36:1; Dt 34:9;
                    Jdg 14:6), to communicating the divine love and truth through prophets and
                    theocratic kings (Is 61:1; Ps 51:11), aimed mainly at moral purity and holiness
                    (Is 11:2; 42:1). It also prefigured the Messianic age in future with a large
                    extension of the spirit&apos;s activities and power (Jer 31:31; Ezek 36:26)
                    manifesting through intellectual capacities. The devout men receive spiritual
                    understanding (Eccl 39:6), wisdom and religious knowledge (Wisdom 7:7; 9:17).
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    3. Holy Spirit in the New Testament
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Old Testament teaching on the Holy Spirit finds further development in the
                    New Testament. The common symbolic representations of the Holy Spirit in the Old
                    Testament are given a new meaning in the New Testament. The recognized
                    indications of the Holy Spirit in the Scriptures are: Dew (Hos 14:5), Fire (Mt
                    3:11), Water (Jn 3:5; 7:38), Wind (Song 4:16), Oil (Ps 45:7; Mt 25:34), Rain (Hos
                    6:3), Dove (Mt 3:16), Voice (Mt 10:20; Acts 2:3), and Seal (Eph 1:13, 14; 4:20).
                    The main titles through which the Holy Spirit is made known are: Paraclete (Jn
                    14:26), Holy Spirit (Lk 11:13), Breath of Almighty (Job 33:4; Ezek 37:9), Eternal
                    Spirit (Heb 9:14), Good Spirit (Eph 4:30; Gen 1:2), Father&apos;s Spirit (Mt
                    10:20), Christ&apos;s Spirit (Rom 8:9), Son&apos;s Spirit (Gal 4:6), Spirit of
                    Promise (Rom 8:2), Spirit of Grace (Zech 12:10; Heb 10:29), Spirit of Prophecy
                    (Rev 19:10), Spirit of Wisdom (Is 11:2; Eph 1:17), Spirit of Truth (Jn 14:16;
                    15:26), Spirit of Holiness (Rom 1:5), Spirit of Revelation (Eph 1:17), Spirit of
                    Judgment (Ps 4:3; 26:8), Power of the Highest (Lk 1:35), Spirit of Yahweh (Ps
                    61:1; 11:2; Acts 5:9), Lord (2 Thes 3:5), Spirit (Mt 4:1). The Spirit understood
                    principally as the spirit of prophecy, and having been active in the past
                    inspiring prophets, is poured out as the Divine Person of the Holy Trinity
                    through the life and mission of Jesus Christ revealed in the New Age.
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center mb-4">
                      God is Father, Son and Holy Spirit. The Trinitarian formula of Baptism reveals
                      the co-equality, co-essentiality, and co-divinity of the three persons. While
                      there are three persons, there is but one essence. The Holy Spirit is one of
                      the three persons of the Trinity, made known as Paraclete, Spirit of Truth,
                      and Spirit of Holiness.
                    </p>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center font-semibold">
                      H.G. Dr. Mathews Mar Severios Metropolitan
                    </p>
                  </div>
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
};

