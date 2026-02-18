import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Missiology',
  description:
    'The mission of the Church from an Orthodox perspective. Liturgy after liturgy, paradigm shifts in mission, and developing mission paradigms for the 21st century.',
};

export default async function MissiologyPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Missiology" breadcrumbFrom={breadcrumbFrom} />

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
                      alt="Missiology - Orthodox Perspectives on Mission"
                      width={280}
                      height={180}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    MISSION: The Orthodox Perspective
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Ion Bria, the famous Orthodox Theologian traces the theological foundations of
                    Orthodox Mission in his work &quot;Go Forth in Peace: Orthodox Perspectives on
                    Mission&quot;. According to Bria, &apos;The mission of the Church is based on
                    Christ&apos;s mission. A proper understanding of this mission requires, in the
                    first place, an application of Trinitarian theologyâ€¦. Trinitarian theology points
                    to the fact that the God is in God&apos;s own self a life of communion and that
                    God&apos;s involvement in history aims at drawing humanity and creation in general
                    in to this communion with God&apos;s very life.&apos; Regarding the aim of
                    Orthodox Mission, Ion Bria explicitly says, &apos;mission does not aim primarily
                    at the propagation or transmission of intellectual convictions, doctrines, moral
                    commands, etc., but at the transmission of the life of communion that exists in
                    God. The &quot;sending&quot; of mission is essentially the sending of the spirit
                    (Jn. 14:26), who manifests precisely the life of God as communion (I Cor.
                    13:3).&apos; The other foundations also include the centrality of Christ, the
                    incarnation, the Cross, the Resurrection, the work of Holy Spirit, Synergia: the
                    invitation of God to partake in the mission. And this includes a &apos;call to
                    Repentance and the obedience to the Will of God.&apos;
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-8">
                    The springboard of Orthodox mission is liturgy. That&apos;s why the Orthodox
                    mission is called <em>liturgy after liturgy</em>. &quot;Nothing reveals better
                    than the relation between the Church as fullness and the church as mission than
                    the Eucharist, the central act of the Church&apos;s <em>leitouragia</em>, the
                    sacrament of the Church itself.&quot; In the Eucharistic celebration there are
                    two complimentary movements, the movement of ascension and the movement of
                    return. The Eucharist begins as ascension toward the throne of God, toward the
                    Kingdom. The second movement begins a return to the world, when the celebrant
                    says &apos;Let depart in peace&apos; as he leaves the altar and leads the
                    congregation outside the church. &quot;The Eucharist is always the End, the
                    sacrament of the Parousia, and yet it is always the beginning, the starting
                    point: now the mission begins.&quot; &quot;Without this ascension into the
                    Kingdom we would have had nothing to witness to. Now having once more become
                    &apos;His people and His inheritance&apos;, we can do what Christ wants us to do:
                    &apos;you are witnesses of these things&apos; (Luke 24:8). The Eucharist,
                    transforming &apos;the Church into what it is,&apos; transforms it in to
                    mission.&quot; H.G. Geevarghese Mar Osthathiose in his paper &quot;Confessing
                    Christ Today through Liturgy as a Form and Experience of the fullness of
                    Salvation&quot; cites several examples of the interrelationship between Liturgy
                    and Mission.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-8">
                    &apos;We confess Christ today through the Liturgy in multifarious ways. There is
                    first of all the combination of the pulpit and the altar in Liturgical worship.
                    The sermon is a part and parcel of liturgical worship. The homilies of the
                    Fathers were mostly delivered in the liturgical context. Most of the Christian
                    preaching and teaching in the Orthodox Churches in the Soviet Union takes place
                    in the liturgical context today. Then, the transformed lives of the faithful who
                    partake of the mysteries regularly is an eloquent witness to the whole world
                    that Jesus Christ is still the great deifying force on earth. Though there are
                    exceptions, of course, regular communicants manifest their deified lives in the
                    so-called secular vocations of life and they sanctify everything they touch.
                    Thirdly, we confess Christ today to the non-Christians who attend the Liturgy
                    casually at first. Conversions still take place through the magnetic attraction
                    of the Eucharistic service. The casual visitor slowly becomes a regular
                    attendant and then studies the faith of the Church and asks for
                    baptism.&apos;
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Paradigm Changes in Missiology
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The concept of paradigm shift really started with the progress of scientific
                    knowledge. Paradigm is a concept developed by Thomas Kuhn in his book, The
                    Structure of Scientific Revolutions and it refers to certain basic assumptions
                    that a community takes for granted, and which create a particular vision of
                    reality within that community. David Bosch introduced the &apos;theory of
                    Paradigm shift&apos; into the missiological area. Hans Kung suggests that the
                    entire history of Christianity can be subdivided into six major paradigms: (1)
                    The apocalyptic paradigm of primitive Christianity, (2) The Hellenistic paradigm
                    of the patristic period, (3) The medieval Roman Catholic paradigm, (4) The
                    Protestant (Reformation) paradigm, (5) The modern Enlightenment paradigm, (6) The
                    emerging ecumenical paradigm. For the 21st century, missiologists Bevans and
                    Doidge recognize six essential components of God&apos;s mission: (1) Witness and
                    proclamation, (2) Liturgy, Prayer and Contemplation, (3) Commitment to Justice,
                    Peace and the Integrity of Creation, (4) The practice of inter religious
                    dialogue, (5) Efforts of inculturation, and (6) The ministry of reconciliation.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Developing Mission Paradigms
                  </h2>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    1. The Mission Paradigm of the Meal Table Sharing
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The caste hierarchy in India had succeeded in keeping Dalits always at the lowest
                    level. One important way of practicing God&apos;s mission is to encourage meal
                    table sharing. It has its origin in the work of Jesus Christ himself when he
                    lived among us. He moved with the poor and oppressed, the impure and the
                    condemned, and shared his meals with publicans and other sinners. Meal table
                    sharing in the present time proclaims that it is one way of expressing
                    God&apos;s love for all humanity, irrespective of the considerations of caste or
                    creed. Taken at a metaphorical level, meal table mission addresses the greatest
                    human need for understanding, reconciliation, healing and peace. The inherent
                    dignity of the human being is acknowledged and accepted when sharing meals with
                    outcasts and strangers.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    2. A Mission Paradigm for the Integrity of Creation
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The current eco-crisis presents the occasion for serious soul searching in
                    Christian theology. The church can urge people to look at the earth, not from
                    the point of view of a conqueror but from the point of view of the conquered,
                    subjugated and oppressed. The church&apos;s mission should involve teaching
                    people to adopt life-styles that use fewer of the world&apos;s resources.
                    Committed to recycling waste, driving automobiles less, using resources sparingly
                    and wiselyâ€”these are practices that Christians can cultivate and proclaim. In
                    third world countries such as India, the land of the tribals, Dalits and other
                    marginalized people are taken away from them in the name of progress. The
                    churches can join hands with these people arguing for the rights of the
                    displaced and the unfortunate. God&apos;s mission does not side with the powers
                    that rule: God&apos;s mission is fulfilled in standing for the oppressed.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    3. A Mission Paradigm for Eco-Justice
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Civilization lost its reverence and awe of nature as it progressed with science
                    and technology. Now science also stresses the interconnectedness of all life,
                    and ecologically, survival depends on biodiversity. The stress on eco-justice as
                    mission should encourage movements which take into account both people&apos;s
                    needs and nature&apos;s needs and should work for preserving the diversity of
                    life on earth.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    4. Mission Paradigm for Upholding the Rights of Women
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The consumerist culture prevalent in our society looks at woman as an object of
                    pleasure. The mission of the church should include attempts to give back their
                    voice to women, as a gesture of showing the church&apos;s solidarity with
                    women&apos;s suffering under patriarchy. God&apos;s justice embraces all
                    humankind, and so the church should denounce all discrimination against women.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    5. Mission Paradigm for Life as Companions in Solidarity with the Suffering
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The church should extend its mission activities to offer companionship to people
                    who are ostracized due to the contracting of disease like HIV/AIDS. Another area
                    of mission for church is the caring of the aged who do not have anyone to take
                    care of them. Juvenile delinquents also need to be restored to normal life and
                    churches should extend the gospel values of the Kingdom of God to include
                    services to such people.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    6. Mission Paradigm to Collaborate with Other Churches and Groups
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In situations such as unexpected natural calamities, Christian love should be
                    manifested through action for people who need help. Instead of working on their
                    own, the different churches can come together in the name of Christ to
                    collaborate with each other&apos;s relief groups. This can be a pattern for
                    community development works, and also for establishing peace in areas where
                    communal disharmony and violence break out. This sort of coming together will
                    promote ecumenism among the churches.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    7. Mission in Empowering the Powerless
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The church&apos;s mission should include empowerment of the powerless. Solidarity
                    with the poor means participating in their struggle for justice, and not just
                    offering charity from afar. There is a need for a radical change in the system
                    of exploitation which makes the rich richer and the poor poorer. The churches
                    should reconsider their idea of mission to include action and thought which will
                    support policies to eradicate poverty and suffering of the masses.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Mission in the 21st Century
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Mission in the 21st century should take in to account contemporary realities.
                    India is a country where people of different faiths reside. In such a multifaith
                    context, there is a great need for harmony among people of different religions.
                    Encouraging inter-religious dialogue will help people to know the commonalities
                    in all religions. Instead of fighting in the name of religions, it might help one
                    to love one&apos;s neighbour who is also God&apos;s child. The capitalist mode
                    of economy creates a situation where the rich become richer and the poor become
                    poorer. The church must stress the need to go back to a simple, frugal life as
                    against the flamboyant exhibitionism wealth tempts. The church&apos;s mission
                    should include propaganda against consumerism. Jesus Christ went in search of the
                    oppressed and marginalized, and the church&apos;s mission should also include
                    the empowerment of the powerless. Tribals, women and children all need the
                    special attention of the church.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The churches while pursuing mission work had, on many occasions, gone away from
                    God&apos;s mission. The conquest, colonizing and destroying of other cultures
                    were all done with a view to do mission in a militant manner. But God&apos;s
                    mission must be achieved by respecting each individual&apos;s intrinsic worth,
                    the right to freedom and independence, and respecting differences among peoples.
                    Seeing the divine in the midst of a plurality of experiences is the need of the
                    hour. God&apos;s mission has to be sought in new and varied ways by the churches
                    in the rapidly changing life situations we see in our own time. Rather than the
                    militant missions of yester years, it will be the peace-building, soothing,
                    sustaining activities of Christian mission that will be welcomed as the work of
                    God in the present communally torn Indian situation, and indeed throughout the
                    world.
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center mb-4">
                      The springboard of Orthodox mission is liturgy. That&apos;s why the Orthodox
                      mission is called <em>liturgy after liturgy</em>. The Eucharist,
                      transforming the Church into what it is, transforms it into mission. God&apos;s
                      mission must be achieved by respecting each individual&apos;s intrinsic worth
                      and the right to freedom and independence.
                    </p>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center font-semibold">
                      Fr. Thomas Varghese Chavadyil, Professor, Orthodox Theological Seminary, Kottayam
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

