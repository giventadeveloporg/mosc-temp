import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'After 1653 as an Independent Church',
  description:
    'The Orthodox Thomas Christians after 1653 till the end of the 18th century: Mar Thoma bishops, West Syrian connection, and the struggle for freedom.',
};

export default async function After1653Page({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="After 1653 as an Independent Church"
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
                      alt="Church History – After 1653"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    The Orthodox Thomas Christians After 1653 Till the End of the 18th Century
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Thomas Christians who had freed themselves in 1653 from enforced submission
                    under Rome stood for a time together under their leader Mar Thoma, elevated by
                    the community to the status and function of bishop. The Portuguese–Roman
                    Catholics did not accept defeat and tried repeatedly to resubject the Thomas
                    Christians. Those who stood with Mar Thoma, even after a larger section defected
                    to Rome, strengthened their stand as an independent church—the Orthodox Church
                    of India today. From 1663 the Dutch replaced the Portuguese; the Dutch did not
                    persecute the Orthodox but largely ignored them, while the Roman side enjoyed
                    political support.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Orthodox Church Under Mar Thoma Bishops
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    From 1653 till 1816 the Orthodox Church was led by eight bishops with the
                    common name Mar Thoma. They were indigenous leaders from the Pakalomattam
                    family, archdeacons by heredity and tradition, and “the Gate of All India.”
                    They were deadly against Roman Catholic supremacy and allowed no compromise on
                    church autonomy. Mar Thoma I (1653–1673) fulfilled the Coonen Cross Oath’s aim,
                    sought confirmation of his episcopal office from the West Syrian bishop Mar
                    Gregorios (1665), and thus began a new relationship with West Syrian
                    Christianity that in time made this section Orthodox and part of the Oriental
                    Orthodox family. Mar Thoma I is esteemed as the “greatest soldier” and founder
                    of the Malankara Orthodox Church.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    West Syrianization
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The West Syrian bishops who came from 1665 gradually introduced their church
                    traditions. Mar Thoma V and VI refused to submit to the Patriarch’s jurisdictional
                    claims; when the Patriarch sent bishops in 1751 to reconsecrate Mar Thoma V under
                    the Patriarch with the title Dionysius, he refused. A rival metropolitan was
                    consecrated against him, but Mar Thoma V did not yield. Mar Thoma VI later
                    underwent a confirmation ceremony (1772) and was given the Episcopal title
                    Dionysius—he is known as Dionysius the Great. The residence of the Orthodox
                    bishop moved from Angamaly to Kandanad and later to Kottayam (1816).
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Strength of the Orthodox
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Orthodox were estimated at about 50,000 in the 18th century. By the
                    beginning of the 19th century, Richard Kerr and Claudius Buchanan reported
                    between 30,000 and 80,000 faithful and about 55 churches. Many churches were
                    in decay; some were shared with the Romo-Thomas Christians. Despite divisions,
                    a common community consciousness among the Thomas Christians could not be
                    fully broken—marriages between the sections and shared cultural and church
                    heritage continued.
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
