import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'What is Prayer?',
  description:
    'Prayer is communion with God. Learn what prayer is, why we pray, and how to pray—including posture, focus, gestures, and ejaculatory prayer for Orthodox Christians.',
};

const WhatIsPrayerPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-syro-card-hover border border-syro-table-border">
              <svg
                className="w-10 h-10 text-syro-red"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              What is Prayer?
            </h1>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              Prayer is like breathing. It is communion and communication with God—opening ourselves
              to Him and receiving His love. By living in this relationship we are transformed into
              the image of God.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-[280px] h-auto">
                    <Image
                      src="/images/church/spirituality.jpg"
                      alt="What is Prayer? - Malankara Orthodox Church"
                      width={280}
                      height={180}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    1. What is Prayer?
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Prayer is like breathing. Without breathing we cannot live. When we breathe, air
                    enters our lungs, cleanses the blood in our veins, relieves it of carbon dioxide
                    and supplies it with oxygen. If we do not breathe for a few minutes we die.
                    Where there is no prayer, sin accumulates and the proper functioning of the
                    spiritual life becomes obstructed. Prayer is communion or communication with
                    God—opening ourselves to Him and receiving His love. It is by living consciously
                    in this relationship of love that we can be transformed into the image of God. By
                    prayer we become more like God—more loving, more wise, more powerful, more kind
                    and good. In prayer we are cleansed of the accumulated impurities of our life and
                    supplied with power to live a good, kind and holy life. Prayer is not merely a
                    matter of asking God for things. The relationship is valuable in itself. It is not
                    what we get out of it that matters, but the fact that we are in communion with
                    our loving Heavenly Father.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-8 mb-4">
                    2. Why Pray?
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Bible says clearly that our Father knows what we need before we ask Him (Mt
                    6:8). But God wants us to know what is good for others as well as for ourselves.
                    Prayer is a way of training the will to desire the good, as well as of turning
                    our wills towards the highest concentration of all good, namely God. By prayer we
                    become like God. God is good and wills the good. We should also become like God
                    in willing and desiring what is good. God has made us partakers of His own divine
                    nature. He has called us to share in God&apos;s own glory and excellence (2 Pet
                    1:4). When we trust in God and live a life of discipline, prayer, worship,
                    virtue, knowledge, godliness, brotherly affection and love (2 Pet 1:5-8), we are
                    transformed into God&apos;s likeness and share in His divine power. God wants us
                    to have a part in the task of shaping this world through prayer and knowledge and
                    work. By prayer we do change reality. God has given us that power. In the
                    Lord&apos;s Prayer, all the first petitions are focused on God—His name, His
                    kingdom, His will. We pray that God&apos;s purposes may be established in the
                    lives of all people. In prayer, we are never alone—especially in group prayer, we
                    commemorate all those who are members of the Body of Christ.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-8 mb-4">
                    3. How to Pray?
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Prayer has to be learned. It is like swimming—a spiritual skill to be acquired by
                    constant practice. The first rule is not to give up. The second is to &quot;let
                    go,&quot; to relax and trust in God. The third is to keep up the practice, even
                    when we do not feel like it. The fourth rule is to develop the discipline of
                    prayer through fasting and self-control. The fifth rule is to use our whole body
                    and even material things in the service of prayer.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Posture and Focus
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In our Eastern tradition, the posture for prayer is standing, facing east, with
                    arms uplifted or folded in adoration. It is good to have a focal point—a cross
                    with two candles on each side, icons or pictures of Christ, of the Blessed Virgin
                    Mother and of the Saints. Eastern icons are to be preferred. The body must
                    pray—not merely the mind. Let your lips and mouth sing the praises of God.
                    Singing is better than saying your prayers, for in the very music certain human
                    attitudes and aspirations are expressed.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Gestures
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Use the gestures of prostration, bowing the head, making the sign of the cross,
                    and giving the kiss of peace. Folding the hands and bowing is a sign of adoration
                    and waiting for a blessing. Lifting up your hands with palms open can mean
                    petition, penitence, and intercession. Prostration is the sign of complete
                    surrender and submission. Making the sign of the cross reminds us that we have
                    been saved by the Cross of Christ. Giving the kiss of peace is the symbol of
                    mutual forgiveness and love.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Group Prayer and Personal Prayer
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    It is important to come into the presence of God regularly as a community—as a
                    family, as a youth group, as a local congregation. But community worship is not
                    enough by itself. In addition to group forms, we should master forms for personal
                    use. The most effective of these is ejaculatory prayer—one-sentence prayers we
                    can repeat wherever or whenever: &quot;Lord Jesus Christ, Son of God, be merciful
                    to me a sinner;&quot; &quot;O God, Thou art my God. I love Thee. I am Thine for
                    ever;&quot; &quot;Lord, have mercy, Lord, have mercy, Lord have mercy upon me.&quot;
                    The first is known as the Jesus Prayer. Personal prayer enriches group prayer;
                    common prayer enriches personal prayer. Neither should be neglected.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Scripture and Meditation
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    A seventh rule is that prayer should be nourished by the reading of the
                    scriptures and meditation. Discipline yourself to read a chapter of scripture
                    every day. Meditate on the meaning of the passage. Ask: &quot;What was God saying
                    to the people of that time? What does God say to me now?&quot; Systematic reading
                    and memorizing some passages will be found very helpful as life advances.
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center mb-4">
                      Prayer can never be isolated from the common worship of the Eucharist and from
                      continuous, active compassionate love for your fellowmen. Let us all pray:
                      &quot;Lord, Teach us to pray. Amen.&quot;
                    </p>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center font-semibold">
                      H. G. Dr. Paulos Mar Gregorios Metropolitan
                    </p>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center text-sm mt-2">
                      Written for Orthodox young people in India
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

export default WhatIsPrayerPage;
