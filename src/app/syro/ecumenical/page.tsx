import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLinks from '../components/QuickLinks';
import SyroPageHero from '../components/SyroPageHero';
import SyroIntroCard from '../components/SyroIntroCard';
import SyroSectionTitle from '../components/SyroSectionTitle';

export const metadata = {
  title: 'Ecumenical',
  description:
    'Department of Ecumenical Relations of the Malankara Orthodox Syrian Church. Fraternal relations, Orthodox Churches, Catholic dialogue, and ecumenical ventures.',
};

const ECUMENICAL_ARTICLES = [
  { title: 'Department of Ecumenical Relations', excerpt: 'The Department of Ecumenical Relations caters onto the fraternal relations of the Church. The Church, being a founding member of the World Council of Churches, extends its warmth and...', image: '/images/mosc/ecumenical/Untitled-1-300x176.jpg', href: '/syro/ecumenical/world-council-of-churches' },
  { title: 'The Relation between Orthodox Churches', excerpt: 'The Malankara Orthodox Church has always tried to cooperate with the communities which encircled her absorbing the imitable things from them. From the very inception, she also cooperated with the...', image: '/images/mosc/ecumenical/all.jpg', href: '/syro/ecumenical/orthodox-churches' },
  { title: 'Relationship with the Catholic Churches', excerpt: 'Pro Oriente, the Catholic organization was the inspiration behind the initiation of unofficial dialogues with the Catholic Church. The dialogues began in 1971 helped to correct many misunderstanding in both...', image: '/images/mosc/ecumenical/rome.jpg', href: '/syro/ecumenical/catholic-church' },
  { title: 'In Egypt with the Message of Fraternity', excerpt: "His Holiness Baselios Marthoma Paulose II attended the enthronement service of Pope Tawadros II, the Supreme head of the Coptic Orthodox Church at St. Mark's Cathedral, Cairo on 18th March,...", image: '/images/mosc/ecumenical/eg.jpg', href: '/syro/ecumenical/in-egypt-with-the-message-of-fraternity' },
  { title: 'The Shepherd of the Indian Church in Ethiopia', excerpt: 'Abune Mathias, the 63rd Ichege of the See of St. Tekle Haymanot and the 6th Patriarch Catholicos of Ethiopia was enthroned on 3rd March 2013 amidst prayers of millions of...', image: '/images/mosc/ecumenical/et.jpg', href: '/syro/ecumenical/the-shepherd-of-the-indian-church-in-ethiopia' },
  { title: 'The Confluence of Love in Vatican', excerpt: 'The epoch making meeting between His Holiness Baselios Marthoma Paulose II, the Supreme Head of the Malankara Orthodox Church and His Holiness Pope Francis, the Supreme Head of the Catholic...', image: '/images/mosc/ecumenical/rome.jpg', href: '/syro/ecumenical/the-confluence-of-love-in-vatican' },
  { title: 'The Fraternity at Vienna', excerpt: 'His Holiness the Catholicos visited Vienna on 3rd September 2013 as the special invitee of Pro-Oriente. Pro-Oriente is the fellowship of all the Churches which use Syriac as the sacramental...', image: '/images/mosc/ecumenical/vienna.jpg', href: '/syro/ecumenical/the-fraternity-at-vienna' },
  { title: 'The relevant portions of the speech of His Holiness Baselios Marthoma Paulose II at the meeting with His Holiness Pope Francis at Vatican', excerpt: 'Your Holiness, most Venerable Brother in Christ, Praising the Triune God, let me humbly greet Your Holiness in the name of the Bishops. Clergy and the Faithful of the Malankara...', image: '/images/mosc/ecumenical/rm.jpg', href: '/syro/ecumenical/catholicos-speech-vatican' },
  { title: 'Relevant portions of the speech by His Holiness Pope Francis at the meeting with His Holiness Baselios Marthoma Paulose II at Vatican', excerpt: 'Your Holiness , It is a joy for me to meet Your Holiness and the distinguished delegation of the Malankara Orthodox Syrian Church. Through you, I greet a Church that...', image: '/images/mosc/ecumenical/rm1.jpg', href: '/syro/ecumenical/pope-francis-speech-vatican' },
  { title: 'The Successor of St. Thomas in Europe', excerpt: 'A grand reception was accorded to His Holiness Baselios Marthoma Paulose II by the U. K. Europe Africa Diocese and the Lambeth Palace of the Anglican Church jointly on 9th...', image: null, href: '/syro/ecumenical/the-successor-of-st-thomas-in-europe' },
  { title: 'Co-operation with the Protestant Churches', excerpt: 'It is a fact that there is no healthy and lively talks between the Orthodox and CSI, Marthoma Churches. However, the Malankara Church has strong relations and cooperation with these...', image: null, href: '/syro/ecumenical/co-operation-with-the-protestant-churches' },
  { title: 'Ecumenical ventures in modern times', excerpt: 'His Holiness Baselios Marthoma Paulose II is also very keen to encourage ecumenical relations. Various ecclesiastical visits during a short span of time have paid rich dividends. A delegation led...', image: null, href: '/syro/ecumenical/ecumenical-ventures-in-modern-times' },
];

const EcumenicalPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageHero
        title="Ecumenical"
        description="Department of Ecumenical Relations — fraternal relations of the Church and engagement with Christian communities worldwide."
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SyroIntroCard>
            <div className="text-center">
              <h2 className="font-syro-display text-[2.2rem] font-bold text-syro-blue mb-5">
                Department of Ecumenical Relations
              </h2>
              <p className="font-syro-primary text-xl text-syro-dark-gray leading-relaxed">
                The Department of Ecumenical Relations caters to the fraternal relations of the Church.
                The Church, being a founding member of the World Council of Churches, extends its warmth
                and cooperation to Christian communities worldwide.
              </p>
            </div>
          </SyroIntroCard>

          <SyroSectionTitle>Ecumenical Relations &amp; Dialogue</SyroSectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {ECUMENICAL_ARTICLES.map((article, index) => (
              <Link
                key={index}
                href={article.href}
                className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 p-0 overflow-hidden flex flex-col h-full group"
              >
                <div className="relative w-full h-48 bg-syro-bg-gray/50">
                  {article.image ? (
                    <Image src={article.image} alt="" fill className="object-contain object-center group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-syro-red/10">
                      <span className="text-4xl text-syro-red/40" role="img" aria-hidden>⛪</span>
                    </div>
                  )}
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-3 group-hover:text-syro-red transition-colors line-clamp-3">
                    {article.title}
                  </h3>
                  <p className="font-syro-primary text-base text-syro-dark-gray flex-1 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-2 mt-4 font-syro-primary text-syro-red font-semibold text-sm">
                    Read More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <QuickLinks />
        </div>
      </section>
    </div>
  );
};

export default EcumenicalPage;
