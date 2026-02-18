import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Theology of Dialogue',
  description:
    'Christian dialogue with people of other faiths. Theological considerations, spirit and attitudes, and lessons from experience. From the Orthodox Tradition.',
};

export default async function TheologyOfDialoguePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Theology of Dialogue" breadcrumbFrom={breadcrumbFrom} />

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-[280px] h-auto">
                    <Image
                      src="/images/church/theology.jpg"
                      alt="Theology of Dialogue - Malankara Orthodox Church"
                      width={280}
                      height={180}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    Dialogue with World Religions
                  </h2>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Introduction
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    This paper seeks only to attempt a preliminary answer to three simple questions
                    related to Christians engaging in dialogue with people of other faiths and
                    religions:
                  </p>
                  <ol className="list-decimal list-inside font-syro-primary text-syro-dark-gray space-y-2 mb-6">
                    <li>What theological and practical considerations lead us to undertake dialogue with people of other faiths and religions?</li>
                    <li>In what spirit, with what attitudes and expectations, should we as Christians enter into dialogue with people of other faiths and religions?</li>
                    <li>What important lessons can be learned from the experience so far in dialogue with people of other faiths and religions?</li>
                  </ol>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In answering these questions, we should take into account the problems created by
                    (a) Theological difference between Christians, and (b) Sociological and cultural
                    differences between various situations. This paper has been written from the
                    theological background of the Orthodox Tradition, but with some sympathy and
                    understanding for the Protestant and Roman Catholic Traditions as well. The
                    background of the writer of this paper is one of a Christian minority amidst a
                    preponderant Hindu majority, and a Muslim minority that is at least five times as
                    large as the total Christian community, not to mention the Sikhs who are almost
                    as numerous as the Christians, and various other smaller minorities like Buddhists,
                    Jews, Parsis, and Jains. But an effort will be made here to look at the issue of
                    dialogue with people of other religions from the perspective of post-Christendom
                    Europe and America.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-8 mb-4">
                    I. Theological Considerations
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The tone for the western Christian approach to unbelievers was, perhaps, set by
                    Augustine of Hippo. When Nectarius of Calama wrote to him about the contradiction
                    between Augustine&apos;s assertion that man can do good deeds only through the
                    grace of God in Christ, and the common experience that unbelieving pagans
                    sometimes do show forth some splendid virtues, Augustine&apos;s reply to Nectarius
                    was simply that the virtues of the pagans were but splendid vices. If we were to
                    say the same thing about the many instances of unbelievers in our secular society
                    sometimes putting Christians to shame by their superior spirit of unselfishness
                    and self-sacrifice, we would be regarded as bigoted and narrow-minded. We cannot
                    write off a Gandhi or a Marx or a Lenin as simply pagans with splendid vices.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Augustine&apos;s loyalty to the doctrine of an exclusive grace that comes to
                    Christians alone for the doing of good deeds goes both against our experience
                    and the spirit of our age. But a similar exclusivism and bigotry was more
                    recently manifested by reputable modern Protestant theologians like Karl Barth
                    and Hendrik Kraemer. Ever since Tambaram 1938, Protestant Christians who want to
                    engage in dialogue with people of other faiths have found themselves inhibited
                    by the contention that God&apos;s revelation comes only to Christians, and that
                    others are so totally in error that there is no point in talking to them.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    I do not know of any respectable Roman Catholic theologians who have revived
                    Augustinian intolerance in so virulent a form. Theologians like Karl Rahner,
                    with a broad-minded Existentialist, neo-Thomist orientation, have been quite
                    open to the possibility that other religions can be a positive factor in the
                    understanding of divine revelation. At Jerusalem 1930 the issue was raised; at
                    Tambaram, India, 1938, the battle was joined between the Anglo-Americans under
                    the leadership of the Anglican Richey Hogg identifying the enemy as secularism,
                    and the continental theologians under the leadership of the Dutch Reformed
                    Hendrik Kraemer locating the enemy as these other religions.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Whatever theological or other reasons we as Christians may have for engaging in
                    dialogue with people of other faiths, we should be explicit and honest about
                    them. If we are engaging in dialogue with the secret intention of converting
                    them, as many religious people in Islam, Judaism, Buddhism and Hinduism suspect,
                    then our partner is bound to be wary and our dialogue inauthentic.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Basic Theological Position
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The basic theological position may be set forth thus: Christ is the first-born of
                    Creation, the head of all created reality. He loves not only all men, but also
                    all that is created. I am united to Christ in Baptism and Chrismation. My mind
                    is the mind of Christ. Therefore my love is non-exclusive and open to the whole
                    creation. Nothing is alien or threatening. Love and compassion for the whole
                    creation is the characteristic of Christ. The Church as His body shares in this
                    love and compassion in faithfulness, integrity and openness with sympathetic
                    understanding. This is sufficient and compelling reason for me to engage in
                    dialogue with people of other faiths. It is love in Christ that sends me to
                    dialogue.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Additional arguments include: (a) If dialogue with &quot;secular&quot; man is
                    justified on the ground that he is my neighbour, then &quot;religious&quot; man
                    is also equally my neighbour. (b) Theology must understand humanity in its
                    fullness; the vast majority belongs to other religions. (c) What God does in
                    history cannot be confined to Christians alone; the great religions have been
                    profoundly affected by exposure to Christ. (d) As one exposes oneself to people
                    of other religions, one&apos;s understanding of Christianity itself can be
                    changed. (e) The Christian Church is an instrument of God for bringing humanity
                    together in unity, creativity and righteousness. Roman Catholic theology has
                    moved from the &quot;proportion of truth&quot; approach to &quot;the universal
                    salvific will of God.&quot; The position of this paper is that it is not
                    necessary to raise and resolve these questions before engaging in dialogue.
                    Christian love is a sufficient and compelling basis for entering into dialogue.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-8 mb-4">
                    II. Spirit, Attitudes and Expectations
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The spirit in which one approaches people of other faiths is decisive for the
                    outcome. Dialogue cannot be an alternative for mission or evangelism. In
                    religious dialogue, two or more human beings meet each other with mutual trust
                    and openness, each respecting the convictions of the other; the object is to
                    understand each other in their varying religious traditions, and to be mutually
                    helped in one&apos;s own grasp of the truth. In evangelization, the baptised
                    believer speaks on behalf of Christ and His Church to declare the good news.
                    Evangelisation is a charismaâ€”a gift of the Spirit. Dialogue and evangelisation
                    are both tasks of the Church. The Church does not use dialogue as a means of
                    evangelisation. In engaging in dialogue with people of other religions, the
                    Christian keeps in mind the following principles:
                  </p>
                  <ol className="list-decimal list-inside font-syro-primary text-syro-dark-gray space-y-3 mb-6">
                    <li>One does not hide one&apos;s own faith; one is not ashamed to confess one&apos;s faith when called upon to do so in dialogue.</li>
                    <li>One does not use dialogue as a means of persuading one&apos;s non-Christian partner to become a Christian.</li>
                    <li>One does not approach dialogue with any sense of superiority.</li>
                    <li>One is genuinely interested in the life, faith, and aspiration of one&apos;s dialogue partner.</li>
                    <li>At those points where one has to be critical, one expresses the criticism with love, respect and courtesy.</li>
                    <li>In dialogue one accepts the possibility that one&apos;s own views may be radically changed by the dialogue.</li>
                    <li>In preparation for dialogue, one should make a study of the religious scriptures, customs, ritual writings, practices, etc.</li>
                    <li>Dialogue cannot be a single act; it is a process of living together in openness.</li>
                    <li>Dialogue may lead to practical consequencesâ€”perhaps to work together, perhaps to issue joint statements.</li>
                    <li>Dialogue begun should not be broken abruptly.</li>
                  </ol>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-8 mb-4">
                    III. Lessons from Past Experience
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    <strong>Bilateral vs. multilateral dialogue:</strong> Bilateral dialogue is
                    always easier to handle than multilateral dialogue. When representatives of two
                    religions speak to each other, it may be possible to agree on many points. When
                    several different religions are present, the task becomes difficult. Experience
                    shows that bilateral dialogues should be more frequent, whereas multilateral
                    religious dialogue should be a comparatively rare phenomenon.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    <strong>Three levels of communication:</strong> The deepest levels of
                    communication between religions take place at the level of spirituality and
                    worship. There are three basic levels: (1) Dialogue on common social or economic
                    problems and about common projects and practical collaboration; (2) Dialogue on
                    the theoretical or theological aspects of religion; (3) Dialogue in which the
                    above two are transcended into the realm of entering into each other&apos;s
                    spiritual experience and group worship. The level of skill and preparation
                    required is higher as one moves from (1) to (2) to (3). The point of view that
                    encounter at the level of spirituality is more rewarding than theoretical
                    dialogue was ably put forward by Ambassador Jacques Albert Cuttat, and practised
                    by Swami Abhishiktananda, Murray Rogers, and Fr. Bede Griffiths among others.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    <strong>Who profits from dialogue:</strong> Not everyone profits from it the
                    same way. People who are emotionally and spiritually secure, who have a genuine
                    desire to &quot;fuse their horizons&quot; with people of other religions and
                    cultures, are best suited to dialogue. Recent converts and those whose faith is
                    still precarious may suffer from exposure to dialogue. It is important for the
                    Churches to prepare people who are spiritually deep, emotionally mature, strong
                    and secure in faith, and endowed with the spirit of compassion and openness.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    <strong>Special skills for special situations:</strong> Dialogue requires
                    special skills in certain situations. For example, dialogue between western
                    Christians and certain radical groups would be exceedingly difficult. Yet a
                    carefully planned dialogue may help to ease tension even between Jews and Muslims.
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center mb-4">
                      It is love in Christ that sends me to dialogue. Christian love is a sufficient
                      and compelling basis for entering into dialogue. The Church does not use
                      dialogue as a means of evangelisation, but maintains integrity and honesty in
                      both.
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

