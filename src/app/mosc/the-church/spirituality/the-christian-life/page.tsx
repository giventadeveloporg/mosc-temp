import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'The Christian Life',
  description:
    'The cultivation of the Christian life. Four introductory propositions, content and manner of the Christian lifeâ€”from mission vs. life, community, creation, and death/resurrection.',
};

export default async function TheChristianLifePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="The Christian Life" breadcrumbFrom={breadcrumbFrom} />

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-[280px] h-auto">
                    <Image
                      src="/images/church/spirituality.jpg"
                      alt="The Christian Life - Malankara Orthodox Church"
                      width={280}
                      height={180}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    The Cultivation of the Christian Life
                  </h2>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    I. Introduction
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Here I wish to draw attention to a problem rather than to solve it. The theme
                    assigned to me is &quot;The cultivation of the Christian life.&quot; May I first
                    make four introductory propositions before attempting to chart the content and
                    manner of cultivation of the Christian life.
                  </p>

                  <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-6 mb-2">
                    1. Mission vs. Life
                  </h4>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    My first proposition is that the giving of priority in Christian thought and
                    planning to the mission of the Church over the life of the Church is both
                    contrary to the Scriptures and harmful to humanity. In the last two hundred years
                    or so, there has been a growing tendency to exaggerate the evangelistic task of
                    the Church. The word &quot;mission&quot; is hard to find either in the New
                    Testament or in the Great Fathers and Doctors of the Church, or even in the
                    Reformers. Its currency in Christian parlance happens to coincide with the
                    mission of the West European powers to colonize and civilize the rest of the
                    world. The Greek word for mission &quot;Apostle&quot; is used a total of four
                    times in the whole New Testamentâ€”Acts 1:25, Romans 1:5, 1 Cor. 9:8, and Gal. 2:8.
                    In each case it refers specifically to the ministry of the Twelve or of St. Paul,
                    as distinct from the ministry of the whole Church. Being an Apostle was not
                    everybody&apos;s business in the New Testament church. St. Paul never exhorted
                    the Christians to whom he writes to become missionaries. The centrality of the
                    Cross and Resurrection could just as well have been taken for grantedâ€”yet he
                    dwells on these themes at some length. New Testament standards for a church are
                    always the depth of faith, the binding quality of love, the steadfastness of its
                    hope, the holiness of its life. An authentic mission can ensue only from an
                    authentic Christian life of the community. The over-emphasis on mission is
                    unscriptural and harmful.
                  </p>

                  <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-6 mb-2">
                    2. Community vs. Individualism
                  </h4>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    My second proposition is that the cultivation of the Christian life should be
                    considered first in terms of the life of the whole Church, and only secondarily
                    in terms of individual Christian lives. The development of individualism in
                    Christian spirituality has its roots in Egyptian Antonine monasticism and came
                    to full flowering in the medieval Roman Catholic piety of Belgium and Holland.
                    For St. Dionysius the Pseudo-Areopagite, spirituality was a matter of a community
                    assembled around the unapproachable holiness of God&apos;s Person. It was in the
                    Eucharistic adoration of the celestial and ecclesial community that the beatific
                    vision was to be found. No man or angel stood alone before God. The proper
                    approach is always to keep the person and community together, with the primacy
                    given to the community.
                  </p>

                  <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-6 mb-2">
                    3. Creation in Its Totality
                  </h4>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    My third proposition is that the cultivation of the Christian life should be
                    understood in the context of the sum total of creation, rather than in terms
                    only of the world of men. Nothing less than the whole created order, the
                    time-space universe in its entirety, can be the object of God&apos;s love and
                    redemptive activity. As St. Paul says in Romans 8:19-21: &quot;For the yearning
                    of the created order eagerly awaits the unveiling of the Sons of God... the
                    created order is to be freed from its enslavement to corruption into the freedom
                    of the glory of the children of God.&quot; Whatever heaven may be, it must
                    include a liberated and reconstituted material creation. Matter has been assumed
                    by the Logos and is therefore redeemed. The Church is like a tree planted on the
                    earthâ€”it has to have roots in the earth to draw nourishment, and leafy branches
                    open to the light of heaven. Both are equally essential to its life and growth.
                    The cultivation of the Christian life cannot neglect either the rootage in the
                    earth or the openness to light.
                  </p>

                  <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-6 mb-2">
                    4. Death, Resurrection, and the Last Judgment
                  </h4>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    My fourth proposition is that the cultivation of the Christian life has to be
                    conceived in terms of death, resurrection and the last judgment. Death is an
                    embarrassing subject for our modern civilization. Yet death is a fact to be
                    faced, and a power which has been conquered. We must all die. The concept of a
                    &quot;Responsible Society&quot; cannot deal with the problem of death. The gospel
                    is the gospel of victory over death, and in Christ there is more than new
                    social-political life. The cultivation of the Christian life has to face this
                    question if the Christian message is to be fully relevant.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-8 mb-4">
                    II. The Content and Manner of the Christian Life
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Christian life, coming from the grace and peace of God, is a life of faith in
                    Jesus Christ, where the Holy Spirit creates joyous freedom in the community of
                    suffering love, led by the transcendent hope of Resurrection and final victory,
                    and where wisdom and power are developed to the full for the manifestation of
                    God&apos;s glory.
                  </p>

                  <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-6 mb-2">
                    The Vocation of Man
                  </h4>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Man is made in the image of God. &quot;Jesus Christ is the eikon of the
                    invisible God, the first-born of all creation&quot; (Col. 1:15). Man&apos;s
                    vocation is to be in the image of God, as created. He is to be, in Jesus Christ,
                    the physical presence of God in the universe. The calling of the Church is to be
                    this icon, or physical presence of God within the created order. Any spirituality
                    oriented merely to the salvation of the soul, to political and social
                    responsibility, or to witness and service, would go wrong if it does not start
                    from this point. The being of the Church cannot be separated from its doing or
                    talking, but that being must be regarded as primary and basic.
                  </p>

                  <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-6 mb-2">
                    The Glory of Man
                  </h4>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The glory of God, as it manifests itself in man in history, is to be expressed in
                    basically the same way as Jesus Christ manifested it. &quot;Father, the hour has
                    come; glorify thy Son, that Thy Son may glorify Thee.&quot; What was this hour
                    of Jesus&apos; glory? The hour of the Cross! In manifesting through rejection and
                    revilement the love, the wisdom, and the power of God, Jesus glorified God on
                    earth. And our task is the same. To accept suffering, rejection and unpopularity,
                    infirmity and contempt, and in that context to acquire God&apos;s wisdom, to
                    develop God&apos;s healing and life-giving power, and to manifest God&apos;s
                    gracious love. The cultivation of the Christian life begins in the simple love,
                    joy and peace of the family.
                  </p>

                  <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-6 mb-2">
                    The Place of Prayer
                  </h4>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    If there is one thing that is clear about the mysterious private life of Jesus,
                    it is that he was a man of prayer. He could continue all night in prayer to
                    Godâ€”a feat acquired only by prolonged discipline and practice. Prayer is the
                    lost art of the Church. Modern man cannot pray. Truly to pray is to experience a
                    kind of death of the consciousness. Prayer is the means by which the image of
                    God is imprinted on the life of man, as individuals and in community. Prayer is
                    the secret of freedom, of wisdom, power and love. Prayer makes man authentically
                    man in the image of God.
                  </p>

                  <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-6 mb-2">
                    A Place to Stand
                  </h4>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Man stands upon the emptiness of creation. He has emerged out of the creative
                    evolution that is the ongoing process of this time-space cosmos. With the
                    emergence of the consciousness of man, a new principle has been brought into
                    play. Man is called upon to rise up, to take hold of that creative process, and
                    to mould it. To emancipate oneself from the bondage to the turbulent forces of
                    Creation, to reflect upon and understand these forces, and then to mould them in
                    accordance with the general purpose of Godâ€”this is the calling of man.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    (a) To be freed: Christ has conquered the turbulent forces of Creation. We need
                    no longer be afraid. The place to stand is the Body of our Risen Lord. To stand
                    in Him, to abide in Him, that is freedom. (b) To be Wise: It is in this stand in
                    Jesus Christ through the Holy Spirit that the word of wisdom is spoken to us in
                    the Scriptures. (c) To be Empowered: As we offer ourselves in the Eucharist, He
                    who sits on the throne gives himself to us in His Body and His Blood. (d) To
                    Live with Joy: We come back into the process of creative evolution, to live and
                    love and work, in joy and peace. (e) To Live with Eyes Open: We see the world
                    now in a new perspective. (f) To Live in Grace: By the joy of forgiveness we
                    transmit the joy of grace to others. (g) To Study and to Work: We enter into
                    science and technology with the same boldness with which we enter the presence
                    of God. (h) To Pray with Groaning and Agony: As we see God&apos;s purposes
                    being thwarted, we pray all the more earnestly.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    And God, who has willed that we should be His children and co-creators with Him,
                    when we have suffered for a while, will exalt us and crown the creation with
                    glory. All mankind, along with the material creation and the achievements of
                    man, must be crowned with honour and glory. When it bursts forth, we the chosen
                    community must stand with our fellowmen and the whole of the time-space cosmos,
                    to fall down before the throne and sing the praises of Him who sits on it.
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center mb-4">
                      The Christian life is a life of faith in Jesus Christ, where the Holy Spirit
                      creates joyous freedom in the community of suffering love, led by the
                      transcendent hope of Resurrection. The cultivation of the Christian life cannot
                      neglect either rootage in the earth or openness to the light of heaven.
                    </p>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center font-semibold">
                      H. G. Dr. Paulos Mar Gregorios Metropolitan
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

