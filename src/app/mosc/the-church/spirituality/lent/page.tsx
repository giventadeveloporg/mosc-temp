import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Lent',
  description:
    'Lent: A stone jar for our renewal and growth. Preparation for the Resurrection, spiritual warfare, and the St. Thomas Christian Lenten heritage in Kerala.',
};

export default async function LentPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Lent" breadcrumbFrom={breadcrumbFrom} />

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
                      alt="Lent - Malankara Orthodox Church"
                      width={280}
                      height={180}
                      className="w-auto h-auto object-contain rounded-lg block mx-auto"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    Lent: A Stone Jar for Our Renewal and Growth
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Church is helping us to progress in our spiritual life in the rhythm of its
                    fasts and feasts. All important feasts in the Church are preceded by short or
                    long fasting. Thus the mystery of true happiness is revealed. But the secular
                    world attempts to draw our attention just to matters of fun only without ample
                    preparation for having lasting joy. That is why after the excitement of material
                    achievements, boredom and frustration dance in human minds. Lenten preparation
                    for the feasts is a preparation for the heavenly joy which is growing and
                    lasting. Through the Great Lent we are progressing towards the festival of the
                    Resurrection of Christ, the feast of feasts.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In the ancient Christian community, Great Lent started as a preparation for the
                    baptism of the aspirants of Christianity on Easter day. These catechumens were
                    trained during the Great Lent by the spiritual instruction of the bishop and
                    their own fasting. Gradually all believers in the Church participated in this
                    Lent and renewed their baptismal grace. Today we commemorate Christ&apos;s
                    fasting before His public ministry and His blessed passion during this Lent, and
                    make use of it for fifty days for our complete spiritual renewal.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Stone Jar at Cana
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    There are many spiritual exercises which help us to grow in Christ: Holy
                    sacraments like baptism, confession, Qurbana; fasting and Lents; prayers;
                    meditations; teaching and preaching in the Church. These can be compared to the
                    stone jars into which water was poured according to the instruction of our Lord
                    at the wedding in Cana (Jn 2:7). By being in those stone jars, water could meet
                    its Creator and He could transform it to tasty wine. The stone jar prepared a
                    ground for the transformation. But the source of that change was God only.
                    Likewise we are supposed to be poured into Lent for being transformed by God.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Lent as Training for Simple Life
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Lent is a training for simple life. During Lents we avoid certain times of meal
                    and certain types of meal. Ancient Christian practice was to have just one time
                    of mealâ€”a purely vegetarian supperâ€”during the Great Lent. Fasting and
                    vegetarianism during Lent are an invitation to overcome the enslaving power of
                    consumerist culture which is based on greed. In the midst of prosperity and
                    over-consumption we are trained to enjoy the beauty of a simple life based on
                    need. During Lent we limit our life to extremely necessary things and minimum
                    needs with regard to food, media like TV, internet, and the use of technology in
                    general. Lent gives us a wonderful experience of simple life. This freedom from
                    the grip of over-luxurious life and enslaving consumerist culture makes us
                    sensitive to the basic needs of the poor and the suffering and to share with
                    them our resources. As Isaiah says: &quot;Is it not this, the fast that I have
                    chosen? To loose the bands of wickedness, to undo the heavy burdens, and to let
                    the oppressed go free... to deal your bread to the hungry... when you see the
                    naked, that you cover him?&quot; (Is 58:6-7).
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Lent as Spiritual Warfare
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Lent is a powerful weapon for our unseen spiritual warfare. The proper
                    orientation of our fight is not against other people but against evil within us
                    and evil in society. God helps us to conquer passions like hatred, avarice,
                    jealousy, greed, lust etc. through Lent. Jesus Christ went through a long
                    fasting and immediately after that we see Him saying a bold NO to the evil
                    force who brought temptations. Till the last breath there will be temptations
                    and spiritual warfare in the lives of all, and those who make use of Lent as a
                    spiritual weapon will be victorious. The prayers of the Great Lent highlight
                    Moses, Elijah and Jesus as the great champions of fastingâ€”they observed fasting
                    for forty days and it was these three who are seen in unusually bright light on
                    the Transfiguration mount. Through fasting we humble ourselves and surrender
                    fully to God who empowers us to face all challenges and sinful tendencies.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Nourishment of Our Inner Being
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Lent is a time when we cooperate with God for the nourishment of our inner being.
                    The abstinences during Lent indicate the shift of focusâ€”we give extra care to
                    the nourishment of our spirit. During Lent we give more time for Bible reading,
                    meditation and prayer so that our spirit is purified and enriched by God, the
                    life-giving food of our inner life. Then the Holy Spirit who resides in our
                    spirit can smoothly guide us. Good deeds and words will flow from the inner
                    springboard which is purified and strengthened by Christ. &quot;Blessed are the
                    pure in heart, for they shall see God&quot; (Mt 5:8).
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    St. Thomas Christian Lenten Heritage
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    European missionaries were astonished to see the rigorous Lenten practices of
                    the St. Thomas Christian community of Kerala in the 16th century. The letters
                    sent by these missionaries from Kerala to their mother congregations in Europe
                    reveal many things about the Lent in those days. St. Thomas Christians used to
                    have fasting till evening and they used to go to their churches for daily
                    prayers during the Great Lent. Most of them even avoided coffee and chewing
                    Vettila during this time. According to the study of Dr. James Aerthayil CMI in
                    his book <em>The Spiritual Heritage of the St. Thomas Christians</em>, St.
                    Thomas Christians used to have almost 225 days of fasting a year. In spite of
                    leading a simple agrarian life, our forefathers and foremothers took Lents and
                    thus their spiritual growth seriously. This may open our eyes to see the greater
                    need of Lent today in our more complex and challenging situation. May the Holy
                    Spirit help us to use this stone jar as a cocoon for our holistic rejuvenation.
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center mb-4">
                      Lent is a stone jar into which we are poured for being transformed by God. It
                      is a training for simple life, a weapon for spiritual warfare, and a time for
                      the nourishment of our inner being. May the Holy Spirit help us to use it for
                      our holistic rejuvenation.
                    </p>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center font-semibold">
                      Fr. Dr. Bijesh Philip, Principal, St. Thomas Orthodox Seminary, Nagpur
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

