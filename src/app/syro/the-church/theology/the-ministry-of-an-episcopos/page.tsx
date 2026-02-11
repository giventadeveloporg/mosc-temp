import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'The Ministry of an Episcopos',
  description:
    'The meaning, functions, and role of the bishop (episcopos) in the Malankara Orthodox Church. Orthodox ecclesiology, Eucharistic presidency, and apostolic succession.',
};

const TheMinistryOfAnEpiscoposPage = () => {
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              The Ministry of an Episcopos
            </h1>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              The meaning, functions, and role of the bishop in the Malankara Orthodox Church.
              Orthodox ecclesiology, Eucharistic presidency, and apostolic succession.
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
                      src="/images/church/theology.jpg"
                      alt="The Ministry of an Episcopos - Malankara Orthodox Church"
                      width={280}
                      height={180}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The consecration of seven new bishops seems to become an epoch-making event in the
                    modern history of the Malankara Orthodox Church. Not only was the process by which
                    they were selected unique but also was the systematic training, which they have
                    received prior to the consecration excellent. The event gets a new attraction due
                    to a third factor, i.e. change of leadership in the Church; six of the senior
                    bishops have entered their eternal rest during the last two years and the new
                    group of bishops will make 25% of the Holy Episcopal Synod. At this juncture it
                    is important to examine the meaning of the post of the bishop and its various
                    functions and features.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-8 mb-4">
                    Meaning of the Word Episcopos
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The word episkopos was used at first in Greek literature for one who kept a watch
                    over a country or a people or even a treaty or an agreement. Later on it became
                    the title for the official who was sent from Athens, the capital of Greek Empire,
                    to its dependant states. The word was used in the Septuagint, the Greek version
                    of the Old Testament, for overseers, officers and governors (2 Chr 24:11; Neh
                    11:9; 12:42). The verb episkeptomai was used for God&apos;s &quot;loving
                    supervision and solicitous care for the land of Israel&quot; in Deut. 11:12. The
                    Qumran Community used an equivalent term mebaqqer for its leader (1QS 6:12, 20).
                    This one was an expert in Law and was entrusted with the leadership over the
                    community; he could make its final decisions, take disciplinary actions against
                    its members and control its fund. He was considered as a fatherly figure in the
                    Damascus Document: &quot;He shall love them as a father loves his children, and
                    shall carry them in all their distress like a shepherd his sheep. He shall loosen
                    all the fetters which bind them&quot; (CD 13:9).
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The New Testament uses the term episkopos five times only: a) 1 Pet 2:25
                    describes Jesus Christ as the &quot;guardian&quot; (episkopos) of the souls of
                    the believers along with his role as their &quot;shepherd&quot; (poimen). b) The
                    above two roles of Christ (episcopos and poimen) are ascribed to the elders of
                    Ephesus in Paul&apos;s speech to them in the Acts 20:28. This has an Old
                    Testament background; when Joshua was elected Moses prayed to God to give Israel
                    a &quot;leader&quot; and &quot;shepherd&quot;. c) In the opening sentence of
                    Paul&apos;s Epistle to the Philippians he addresses the &quot;bishops&quot;
                    (episcopoi) along with the &quot;deacons&quot; (diakonoi). d) In 1 Tim 3:1 we
                    read about the qualities of an episcopos of the early Church, which include
                    sensibility, dignity, hospitality, scholarship, gentle behaviour, management
                    skills etc. e) In his letter to Titus St. Paul says that &quot;a bishop
                    (episkopos), is God&apos;s steward&quot; and he must be &quot;blameless,
                    hospitable, lover of goodness, master of himself, upright, holy and
                    self-controlled&quot; and he must not be arrogant, quick-tempered, violent,
                    drunkard or greedy (Tit 1:7-8). He must &quot;hold firm to the sure word as
                    taught, so that he may be able to give instruction in sound doctrine and also to
                    confute those who contradict it&quot; (Tit 1:9).
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-8 mb-4">
                    Functions of a Bishop
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Professor Karl Christian Felmy, a retired Lutheran Pastor of Germany and an expert
                    in history and theology of the Orthodox Church, made a sarcastic comment once
                    during a discussion: &quot;the problem of the Roman Catholic Church is that it
                    has got only one bishop, while that of the Protestants is that they have no
                    bishops at all, and that of the Orthodox Church is that it has got many
                    bishops&quot;. This remark makes clear the basis of Orthodox ecclesiology. As
                    per the Orthodox understanding all bishops are equal in their status and the
                    Patriarch or the Catholicos is called &quot;the first among the equals&quot;
                    (primus inter pares).
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    We can say that Orthodox Church is episcopocentric, because everything depends
                    upon the bishop and nothing can be done without him. But what actually is this
                    &quot;everything&quot;? Does it include all sacramental functions of a parish
                    like baptism, marriage and funeral? None of the Orthodox Churches has got the
                    practice of our Church; one or more bishops attending the sacraments of a parish.
                    Every day they have to travel at least hundred kilometres just to lead the
                    funerals and weddings. Even though our bishops are suffocated with this hectic
                    schedule, they are helpless, because it has become a custom especially in central
                    Travancore to invite a bishop for personal functions. People consider the
                    position of the bishops as a ceremonial one and they do not understand more than
                    that about him. Does the above &quot;everything&quot; mean that the bishop
                    should be consulted before each and every instance in the decision making process
                    of a parish? This has become a practice in our Church since the dioceses have
                    become small in their geographical area and since communication became easier.
                    The parish priests have got the freedom and discretion to take decisions as per
                    the constitution and canons and customs of our Church. Bishops can be approached
                    only when things become &quot;exceptional&quot;. What then are the duties of a
                    bishop?
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    President of the Eucharist
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    According to Orthodox ecclesiology the bishop is the President of the Eucharist.
                    Ignatius of Antioch says: &quot;you should regard the Eucharist as valid which
                    is celebrated either by the bishop, or by someone he authorizes. Where the bishop
                    is present, there let the congregation gather, just as where Jesus Christ is,
                    there is the Catholic Church&quot; (Smyrn. 8:1-2). The priests are just
                    &quot;vicars&quot; of a bishop. However, this Eucharistic function of the bishop
                    has been changed later. Zizoulas, himself being a bishop of the Greek Orthodox
                    Church and an authority on the topic says: &quot;the Eucharist, from being the
                    business of the episcopate par excellence, was later (it remains to be seen when)
                    largely transformed into the principal task of the parish and the presbyter.
                    While the bishop, from being par excellence the &apos;president&apos; of the
                    Eucharist was largely transformed into an administrator and a co-ordinator of the
                    life of the parishes&quot; (Eucharist Bishop Church, HCOP, Brookline 2001, p.
                    23).
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Sacramental Presence and Model Life
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Eucharistic function of the bishop should not be considered as less important
                    to other duties of a bishop. On the one hand the bishop is the sacramental
                    presence of Jesus Christ within the Church. But on the other hand he unites all
                    the people. That is why we say there cannot be more than one bishop within a
                    local Church. Since the bishops represent Christ they have to possess a model
                    life. Paulose Gregorios says: &quot;On the analogy of both the consecration of
                    Holy Chrism, and also the consecrated Chrism itself being sacraments, the
                    consecration of a bishop as well as the consecrated bishop is a sacrament&quot;
                    (Glory and Burden, ISPCK/MGF, Delhi 2006, p. 95). We have already seen the list
                    of qualities, which St. Paul expected from a bishop (1 Tim 3:1ff; Tit 1:7-9). St.
                    John Chrysostom says: &quot;The offences of the insignificant, even if made
                    public, harm no one seriously. But those who are set upon the pinnacle of this
                    honour not only catch every eye; more than that, however trifling their
                    offences, these little things seem great to others, since everyone measures sin,
                    not by the size of the offence, but by the standing of the sinner&quot; (On the
                    Priesthood, SVSP 1984, p. 85-6).
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Authority for Ordination
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    What distinguishes a bishop from a priest is his authority for ordination. It is
                    his prerogative as a successor of the Apostles. Laying on of hands was originated
                    in the rabbinic schools of Judaism. A candidate was ordained as a rabbi once he
                    completed his training in interpreting the Torah. Early Church adopted this as a
                    sign for handing over priestly authority. However, by ordaining somebody the
                    bishop is transferring not just his authority for teaching, which was the
                    practice of Jewish rabbis, but also the gift of the Holy Spirit. The ordained
                    gets the divine charisma, which will be used for the edification of the Church.
                    The deacon gets the charisma of service while the priest gets the charisma of
                    forgiveness of sins and that of the authority for presiding over the sacraments.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Teaching
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Teaching can be considered as the unique function of a bishop. Even though the
                    New Testament did not make a distinction between a priest (presbuteros) and a
                    bishop (episkopos) in this regard, later on the bishop became the final authority
                    for teaching. He is the one who declares a final word about a disputed matter of
                    faith. He will decide what is &quot;orthodox&quot; and what a &quot;heretical&quot;
                    teaching is. He does this not as an individual but as the member of the Holy
                    Episcopal Synod. For this he needs a lot of time for learning the faith of the
                    Church and for examining the writings of the Holy Fathers. However, most of our
                    bishops do not get enough time for reading and reflecting because of their
                    pre-occupations with ordinary functions like a wedding or funeral. The
                    administrative duties can also become a hindrance for their study and meditation.
                    Some bishops are exhausted by attending committees after committees.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Therefore the Church as a whole has to rethink about the rank as well as
                    functions of an episcopos. He is different from a priest and a deacon not simply
                    in the vestments but in his identity. This should be widely understood and
                    respected. &quot;Seven&quot; is a sabbatical number and it was considered as a
                    number of perfection in the Bible. Let the consecration of the seven new bishops
                    put a milestone in the history of Malankara Church. Once the whole Church
                    acknowledge not only their apostolic succession but also their apostolic
                    authority things will be quite different. Let each one do his own duty; the
                    priests should perform all parish duties and the committees should fulfil their
                    responsibilities. Let the bishops stand at the top as Jesus Christ is the head of
                    the Church.
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center mb-4">
                      The bishop is the President of the Eucharist, the sacramental presence of
                      Christ, and the final authority for teaching. He is different from priest and
                      deacon not simply in vestments but in identity. Let the bishops stand at the
                      top as Jesus Christ is the head of the Church.
                    </p>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center font-semibold">
                      Fr. Dr. Reji Mathew, OTS Kottayam
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

export default TheMinistryOfAnEpiscoposPage;
