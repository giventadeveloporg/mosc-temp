import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Deification',
  description:
    'Deification (theosis) as the goal of spirituality. Becoming like God through communion with Christ, the process of becoming, and the virtues to be imbibed.',
};

export default async function DeificationPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Deification" breadcrumbFrom={breadcrumbFrom} />

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
                      alt="Deification - Malankara Orthodox Church"
                      width={280}
                      height={180}
                      className="w-auto h-auto object-contain rounded-lg block mx-auto"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    Deification as the Goal of Spirituality
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In normal circumstances all travels and constructions start with a clear picture
                    of destination or end in mind. What is the supreme goal in our spiritual journey
                    or formation of life? The Church who brings us up with great love and care gives
                    also a clear picture about the major goal of spiritual progress which is nothing
                    but deification or theosis. As St. Irenaeus wrote in the second century, God the
                    Father uses his two handsâ€”namely Christ and Holy Spiritâ€”to reconstruct human
                    beings in the Church in His image. Lives of the saints are articles which
                    illustrate the beauty of the progress in this reconstruction or deification.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Greek word &quot;theos&quot; means God. Theosis means becoming like God (or
                    becoming God) or deification. It means acquiring the qualities of God. Human
                    beings, created in God&apos;s image, by having communion with the Source and
                    Perfecter of life, are supposed to progress in this process till the end of
                    their life and even in the life after life. This theme taught by the Orthodox
                    churches all over the world of all ages seems to be in tune with Indian spirituality
                    also.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Imitation of Stars and that of God
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    It is quite natural for a child to imitate its parents. In the passing of time
                    one may be trying to imitate friends, film stars, sports stars, priests,
                    thirumenis, teachers or other dignitaries. But to lead our human creation to its
                    fullness, we need to look to God as a yardstick and ideal model. The ultimate
                    ideal figure for our imitation is the most perfect God only. To put it more
                    concretely, theosis is becoming like Christ, the absolutely unique icon of God
                    in history. He is not merely the object of our imitation but also the subject or
                    facilitator of this dynamic process of deification. Teachers of the Orthodox
                    Churches of all ages and all places highlight theosis or deification as the
                    existential necessity of all human beings.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Theosis rather than Theoria
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In the western tradition it seems that the intuitive vision of God (theoria) is
                    the highest goal of Christian life. Almost all fathers of the eastern tradition
                    agree that God is incomprehensible in His essence and He cannot be seen as He is.
                    But the creation can participate in His creative energies. So their emphasis is
                    on Theosis rather than theoria. St. Athanasius wrote in the 4th century with
                    regard to incarnation: &quot;He became man that we might become divine&quot; (On
                    Incarnation 54). Fathers like St. Irenaeus, Origen, St. Basil the Great, St.
                    Gregory Nazianzen, St. Gregory of Nyssa, St. Ephrem, St. Cyril of Alexandria,
                    Pseudo-Dionysius etc. were the great exponents of this theme. Gregory Nazianzen
                    puts it rightly: &quot;Man has been created in the image of God and is therefore
                    expected to become similar to God... God is to the intellect what the Sun is to
                    material nature. A purified soul alone can acquire knowledge of God.&quot;
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Key scriptural passages for deification: (1) &quot;Let us make man in our image,
                    after our likeness&quot; (Gen 1:26); (2) &quot;Be perfect as your heavenly
                    Father is perfect&quot; (Matt 5:48); (3) &quot;Become partakers of divine
                    nature&quot; (2 Pet 1:4); (4) &quot;We all, with unveiled face, beholding the
                    glory of the Lord, are being changed into his likeness from one degree of glory
                    to another&quot; (2 Cor 3:18); (5) &quot;The fruit of the Spirit is love, joy,
                    peace, patience, kindness, goodness, faithfulness, gentleness, self-control&quot;
                    (Gal 5:22).
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Process of &quot;Becoming&quot;
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    &quot;Be&quot; or &quot;become&quot; is a very significant word in these passages.
                    Humans are supposed to progress in the process of becoming like God. Jesus
                    Christ is the one who manifested God most perfectly and showed the fullness of
                    humanity in history. So to be like God means to be like Christ, the perfect
                    image of God. By acquiring the qualities of God as reflected in the life of
                    Christ we can be perfect. The Church highlights the life of Christ in her feasts,
                    fasts, sacramentsâ€”especially in the Holy Qurbanaâ€”and calls for a constant
                    communion with Him. Becoming like Christ is salvation.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Virtues of God to be Imbibed
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    There are communicable and incommunicable attributes in God. Some virtues which
                    humans can acquire:
                  </p>
                  <ol className="list-decimal list-inside font-syro-primary text-syro-dark-gray space-y-3 mb-6">
                    <li><strong>God is forgiveness.</strong> Christ advises to become like God who &quot;is kind to the ungrateful and the selfish&quot; (Lk 6:35). This is the means to human perfection, happiness and peace.</li>
                    <li><strong>God is wider ecumenism.</strong> God&apos;s concern and compassion encompasses the entire creation. By being rooted in one tradition we can be open to all churches and to people belonging to other religions.</li>
                    <li><strong>God is compassion to the least and the suffering.</strong> We become like God by taking a stand for the victims of injustice, the marginalized, the exploited and the suffering.</li>
                    <li><strong>God is community.</strong> The Holy Trinity is a perfect fellowship. Being created in the image of the Holy Trinity, human beings will not become perfect without being in solidarity with others.</li>
                    <li><strong>God is freedom.</strong> Deification is a process of liberation from passions like hatred, lust, pride, jealousy which block self-actualization.</li>
                  </ol>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Deification as Humanisation
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Becoming like God does not mean suppressing our humanity. Deification refers to
                    the fulfillment of the human potentiality divinely deposited in human creation.
                    As H. G. Paulose Mar Gregorios writes, based on Gregory of Nyssa: &quot;The very
                    nature of humanity is to be like God, for that is what it means to be created in
                    the image of God. The more humanity becomes like God, the more it becomes itself.
                    Divinization is humanization. Theosis is anthropesis.&quot;
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Theosis and the Golden Rule
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    &quot;Whatever you want people to do to you, do also to them&quot; (Matt 7:12;
                    Lk 6:31). This Golden Rule is a key to understand theosis and fullness of life.
                    It appears in all great religious and ethical traditionsâ€”Confucius, Hinduism,
                    Buddhism, Jainism, Islam, Rabbi Hillelâ€”and can become a foundation of a Global
                    Ethic.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Synergy for Theosis
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Deification is possible mainly by a synergy or co-operation between God and human
                    being. &quot;Abide in me, I will abide in you&quot; (Jn 15:4). God gives the
                    necessary grace or Spirit through the sacraments and spiritual exercises. Those
                    who are in Christ need to grow in Him by making use of confession, Holy Qurbana,
                    prayer, silence, meditation of Scripture, and exposure to the weak and suffering.
                    This is not &quot;Marjara Nyaya&quot; but &quot;Markada Nyaya&quot;â€”as the child
                    monkey holds on to the mother, in this process God and human beings cooperate.
                    God uses the Church as the most efficient agent for the deification of His children.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Eternal Progress in Deification
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    St. Gregory of Nyssa works out his doctrine of theosis as an infinite process
                    which he calls Epektasis. Human goodness is a continual progression towards an
                    infinite God. &quot;Become greater through daily increase... For this is truly
                    perfection: never to stop growing toward what is better and never placing any
                    limit on perfection.&quot; Perfection is an ongoing progress. Even in the eternal
                    abode it is not a static experience but an infinite advance.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Conclusion
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    &quot;Be perfect as your heavenly Father is perfect.&quot; Setting this ladder
                    of a supreme goal in life, Christ liberates our mind from low and petty goals.
                    The ultimate goal is nothing but deification or Theosis. Continuously we have to
                    progress in the process of becoming like God. He has given the potentiality for
                    it in our being and the Holy Spirit to proceed in this dynamism. &quot;Save
                    yourself, and thousands around you will be saved&quot;â€”St. Seraphim of Sarov.
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center mb-4">
                      Theosis is becoming like Christ, the perfect icon of God. He became man that
                      we might become divine. Deification is humanizationâ€”the more humanity becomes
                      like God, the more it becomes itself.
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

