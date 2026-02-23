import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Before 1653',
  description:
    'The Thomas Christians before 1653: contact with Roman Catholicism during Portuguese colonialism. The Synod of Udayamperoor and the Coonen Cross Oath.',
};

export default async function Before1653Page({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Before 1653" breadcrumbFrom={breadcrumbFrom} />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-[280px] h-auto">
                    <Image
                      src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                      alt="Church History â€“ Before 1653"
                      width={280}
                      height={180}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    The Thomas Christians Before 1653 in Contact with the Roman Catholics During the
                    Portuguese Colonialism
                  </h2>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Introduction
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    With the arrival of the Portuguese in the 16th century in South India, the
                    ancient church of St. Thomas for the first time began to undergo the decisive
                    effect of the Portuguese colonial era coupled with the adverse effects of Roman
                    Catholicism. As a result, it was forced to succumb under Rome through the
                    Portuguese. Five well-planned maneuvers were used to force this church finally
                    to obey Rome: bringing the church of Thomas under the administrative control of
                    the Portuguese; subjecting it to thorough latinization by establishing two clergy
                    training institutes; forcefully terminating all contacts with the East Syrian
                    Church; forcing the whole Church through a representative assembly to go under
                    Rome; and imposing the direct rule of the Roman Catholic regime while destroying
                    the precious indigenous heritage of the Church of St. Thomas.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Contact of the Thomas Christians with the Portuguese
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Thomas Christians as a whole reacted against Roman Catholicism in 1653
                    through the famous Coonan Cross Oath. Although the event was a great success,
                    the Church of St. Thomas could not continue for long in its determination. As
                    pressures from the Roman Catholic side continued, the leadership became subject
                    to division. A group once again rejoined Roman Catholicism and stood against the
                    aspirations of the people who stood for freedom from Rome; the latter group
                    later became the Orthodox Church of India.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    When the Portuguese landed in India, they met the Christians of St. Thomas and
                    felt satisfied that their old dream of discovering India and Eastern Christians
                    had been fulfilled. The Thomas Christians on their part experienced a spontaneous
                    joy at the arrival of powerful Christians from the West and desired Portuguese
                    help to strengthen their privileged existence in India. When Vasco da Gama
                    arrived at Cochin on his second voyage (1502), a delegation of Thomas Christians
                    went to meet him and implored protection. The cordial relation thus established
                    continued for two decades. However, when the Portuguese penetrated into the
                    interiors of Kerala and into the churches of the St. Thomas Christians, they
                    realized that these Christians were neither subject to Rome nor similar in
                    church traditions. They found that these Christians were followers of the East
                    Syrian Church, that Eastern bishops looked after them, and that the Patriarch
                    in Babylon was considered their ecclesiastical head. Since the Pope had granted
                    the Portuguese crown sovereign rights over eastern lands under their sway, the
                    Portuguese thought that by right the Thomas Christians should be under their
                    control, and they worked among the St. Thomas Christians for one and a half
                    centuries to achieve this aim.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The East Syrian Bishops and Encounters with the Portuguese
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    When the Portuguese came, the Church of St. Thomas was following the traditions
                    of the East Syrian Church. There were about a dozen bishops from that Church
                    among the St. Thomas Christians in the 16th century. From a letter of five East
                    Syrian bishops to their Patriarch in Babylon (1504), it is known that there were
                    in Malabar about thirty thousand families of St. Thomas Christians; new churches
                    were being built, and they were prosperous and living in peace. Mar Jacob, the
                    last among these East Syrian bishops, lived and led the Church of St. Thomas
                    till his death in 1552. After his death the Roman Catholics intensified their
                    efforts to subdue the Church of St. Thomas and to prevent any fresh arrivals of
                    bishops from Babylon.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Synod of Udayamperoor
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Immediately after the death of Bishop Mar Abraham, the St. Thomas Christians were
                    forced to meet in the infamous Synod of Udayamperoor (1599), which declared that
                    they were under Rome from then on. The major architects behind the convocation,
                    deliberation, framing and execution of the synod&apos;s decrees were the
                    Jesuits of the Vaipikotta Seminary. The convoker, presider, and judge was the
                    Roman Catholic Archbishop Dom Alexios Menezis of Goa. The synod was held for
                    eight days. The synodal decrees were aimed at the total transformation of the
                    church of St. Thomas into Roman Catholic faith, polity and discipline. It
                    decreed that the Supreme Head of the church of St. Thomas was the Pope of Rome;
                    the Patriarch of Babylon was condemned as a heretic and contact with him declared
                    perilous. The norms of the Council of Trent were enforced; priests were to be
                    celibate by compulsion; the Malabar church was divided into parishes with a
                    parish priest directly appointed by Portuguese authorities. All Syriac books
                    were to be handed over for burning so that no memory of East Syrian connections
                    remained.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Coonen Cross Oath and After
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Under the leadership of the Archdeacon, the Thomas Christians reacted by asking
                    for the release of Ahatalla, who had been made captive by the Portuguese at
                    Mylapore. When all appeals failed and news spread that he had been drowned by the
                    Portuguese, tension mounted. At the Coonen Cross Oath on Friday, January 3,
                    1653, at Mattanchery near Kochi, the Thomas Christians declared that &quot;till
                    the end neither the Thomas Christians nor their generations would obey the
                    church of Rome or the Portuguese or Jesuits, but only obey their Archdeacon
                    Thomas.&quot; All historians agree that after the Oath practically the whole
                    body of the Thomas Christians joined together against Roman Catholic supremacy.
                    Archdeacon Thomas was later elevated to the status of bishop with the title Mar
                    Thoma by the laying on of hands of twelve leading priests at Allangad on May 22,
                    1653, with the unanimous consent of the whole Church. Despite efforts by Rome and
                    the Portuguese to regain control, about half of the people did not yield and
                    maintained their Eastern character and ecclesiastical freedomâ€”the tradition that
                    continues today in the Malankara Orthodox Syrian Church.
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
