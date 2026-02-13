import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Ecclesiology',
  description:
    'Ecclesiology: the nature and purpose of the Church in Orthodox theology. Origin in Christ, images of the Church, the four marks, and kingdom-oriented ecclesiology.',
};

export default async function EcclesiologyPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Ecclesiology" breadcrumbFrom={breadcrumbFrom} />

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
                      alt="Ecclesiology - Nature and Purpose of the Church"
                      width={280}
                      height={180}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-8">
                    Too much compartmentalization like theology, spirituality, liturgy etc and further
                    divisions of theology into Christology, ecclesiology, pneumatology etc were alien
                    to the early Christian fathers and thus foreign to the Orthodox Ethos. Because of
                    the integral vision of the fathers, the theme of the church pervades all aspects
                    of the Orthodox theological and liturgical spiritual orientation. So a limited
                    and exclusive analysis of the Church is not an easy task. Added to that a long
                    historical continuity of the church and continuation of it to future even beyond
                    history and its oneness with Christ and its kingdom oriented existence in the
                    world etc leave an analysis of it a difficult task. However with the help of
                    some popular images and prayerful reflection we may be able to know a little bit
                    of the origin, nature and purpose of the Church (ecclesiology).
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    The word &apos;ecclesia&apos;
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Ecclesiology which deals with the nature and purpose of the Church comes from
                    &apos;ecclesia&apos;, the common Greek term used in New Testament to denote
                    Church. Though it appears only twice in the synoptic gospels (Mt 16:18; 18:17) it
                    is a common and repeated term in Acts and Pauline letters. Ecclesia comes from
                    the Greek verb &apos;kaleo&apos; which means I call. It indicates the fact that
                    Church is the assembly of those who responded to the call from God or to the good
                    news. In other words it is a community called out by God from the world for a
                    purpose. Ecclesia is the Greek equivalent of the Hebrew word qohal which is used
                    in Old Testament to describe the Jewish assembly gathered mainly for worshipping
                    God. By using the Greek equivalent of the Jewish assembly for indicating church,
                    the early Christian community was disclosing its self identity as the chosen
                    people of God or the New Israel which replaces the old Israel (I Pet 2: 9-10;
                    Tit 2:14) The early Christians thought of themselves as the children of God and
                    specially chosen and holy people of God.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Origin and foundation in Christ
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Even if Jesus has not founded a Church directly, in the ultimate analysis Jesus
                    Christ is the origin and foundation of the Church. The church was formed by those
                    who responded to God&apos;s call in Christ. After St. Peter&apos;s confession of
                    Jesus as the Son of God, Jesus says that He will build his church on this rock
                    meaning the faith just proclaimed by Peter. All those who imitate St. Peter and
                    make the same confession likewise inherit the same promise. It is on them, on all
                    believers that the church is built. Understanding the truth and response to it
                    in faith are essential for the building up of the church. Many of Christ&apos;s
                    words and deeds reveal His intention to found a church. Jesus gathered disciples
                    around himself so that later on they could assemble the people of God around
                    Himself. The last supper with the institution of the Eucharist was to help them
                    to continue a community life by being rooted in Him. Likewise the words to the
                    disciples reveal his intention that the community of disciples is to continue to
                    stay together (Lk 22:16, 30, 31). The risen Lord bestows powers on the disciples
                    for the continuation of his work in the world. The resurrection of the Lord and
                    Pentecost were two very significant events which contributed to the real birth of
                    the church.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Images of the Church
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    There are a lot of poetic images and figures of speech for the Church in
                    Orthodox liturgical texts, all derived directly or indirectly from the Bible.
                    This ranges from Noah&apos;s ark in the Book of Genesis to the bridal image of
                    the Church as New Jerusalem in the Book of Revelation. Ancient Christian fathers
                    have interpreted Noah&apos;s ark as a shadow of the Church. The ark of the
                    church is not a symbol of condemnation and destruction but a sign of salvation
                    and renewal of the whole creation. As Christ came not to judge people but to
                    save the world (John 12:47) the church has no right to judge people but is
                    responsible for the redemption of the whole world. Maternal image of the church
                    is also very important in the Orthodox tradition. Rev. Fr. Dr. K. M. George
                    describes it thus: &quot;The Church is personified as mother of the faithful and
                    bride of Christ, and the third person feminine pronoun &apos;she&apos;, rather
                    than the neuter &apos;it&apos;, is consistently applied to the Church in Orthodox
                    theology, hymnology and prayers. On many an occasion the Holy Virgin Mary stands
                    as a symbol of the Church (Rev. 12:1). In Orthodox iconography of Pentecost, for
                    instance, the Virgin Mary remains at the centre of the picture surrounded by the
                    Apostles. Obviously she symbolizes the Church. The newly baptized persons are
                    said to be born from the womb of the Mother Church.&quot; Three frequently used
                    images of the Church in liturgical texts and hymnology are body of Christ, living
                    temple and bride of Christ.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    1. The Church as the body of Christ
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The image of Body is a central metaphor in the Pauline writings (Rom 12: 4-5, I
                    Cor 12, Eph 4:12, Col 1: 24). It emphasizes both the close and intimate
                    connection of the Church to its head Christ and the fellowship of the members of
                    the Church. We are to relate to each other and enjoy harmony as limbs of the
                    same body. Only through compassion, humility, forgiveness and peacemaking in the
                    church we can maintain the harmony of the one body. Christ continues to be
                    present and visible in history through his body the church. So the Church is a
                    continuation of the incarnation of Christ. St. Paul describes the church as
                    Christ&apos;s pleroma who fills the universe in every respect (Eph 1:22, 23).
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    2. The Church as the living temple
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The church is not a dead material construction but a living organism. Christ
                    himself is the corner stone; the apostles and prophets are the foundation;
                    believers are living stones that add to the growth of the building. This image
                    also highlights the fellowship of the members in the church and the union of the
                    church with Christ, the foundation. On behalf of the whole creation worship is
                    offered to the Triune God in this living temple.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    3. The Church as the Bride of Christ
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    St. Paul uses the image of the marital bond between husband and wife to portray
                    the mystery of the deep communion between Christ and his bride the church. This
                    image gives us a vision of the ultimate oneness between Christ and his Church.
                    Christ is preparing the bride for the final presentation at the wedding.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Universal Ecclesiology and Eucharistic Ecclesiology
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Orthodox Tradition prefers to practice Eucharistic ecclesiology than universal
                    ecclesiology. Universal ecclesiology depicts the church as a single organic
                    whole including in itself all church units of any kind all over the world.
                    According to the Eucharistic ecclesiology which is more primitive one, each
                    local church was the church of God in all its fullness. Every local church
                    manifests all the fullness of the church of God and not just one part of it. The
                    Eucharist (Holy Qurbana) is where Christ dwells in the fullness of His body.
                    Eucharistic ecclesiology upholds conciliarity in the church. In fact no local
                    church with its presiding bishop has the right to exercise authority or power
                    over other local churches. But they live in fellowship and mutual support.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Four Marks of the Church
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Nicene – Constantinopolitan creed formulated by the first two ecumenical
                    Councils attaches four adjectives to the Church—Catholic, Apostolic, One, and
                    Holy. Catholicity, Apostolicity, Unity and Holiness have become the four
                    principal marks of the church.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    1. Catholicity
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The word &apos;Catholic&apos; comes from the Greek Kath&apos;olon which means
                    pertaining to the whole or holistic. Early Christian fathers used the word
                    Catholic more in a qualitative than in a quantitative sense. St. Cyril of
                    Jerusalem gives a comprehensive definition: &quot;The church is catholic
                    (&apos;universal&apos;) because it has spread all over the world and because it
                    imparts instruction in its fullness to all people regarding matters visible and
                    invisible, earthly and heavenly.&quot; Orthodox ecclesiology is based on the
                    notion that a local Christian community, gathered in the name of Christ,
                    presided over by the bishop, celebrating the eucharistic meal and witnessing
                    Christ is indeed the catholic church and the body of Christ.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    2. Apostolicity
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Apostolicity refers to the common witness of the apostles on which the church is
                    founded (Eph. 2:20). The apostles&apos; experience of God in Christ is
                    transmitted down through the generations in the church. Apostolic succession is
                    a continuity of the church not with an individual apostle but with the apostolic
                    college as a whole and the community of the church. Apostolicity also refers to
                    the mission of the church among the poor and the oppressed. The apostolic church
                    has been called upon to work for the good of all mankind.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    3. Unity of the church
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The unity of the church is a unity in faith and not an administrative unity. A
                    return to the faith of the apostles and the adherents of the undivided church is
                    necessary for a meaningful unity in the church. The fellowship and unity of the
                    Holy Trinity is the supreme model of unity for the church. Local Churches are in
                    communion with each other. Diversity in culture among the different sects in
                    different regions is permissible and healthy and it makes the unity of the
                    church richer.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    4. Holiness of the Church
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The church is holy because Christ, the holy head of the church has called us to
                    participate in his holiness through the church. Expression of holiness is love,
                    goodness and unceasing fight against dehumanizing structures and evil everywhere.
                    The Holy Spirit who dwells in the Church and guides it in all truth is the main
                    sanctifying grace of the church. Sins of the laymen or clergy who are members of
                    the church do not make the church sinful according to the orthodox tradition.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Special Ministry and Authority
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Through baptism all the members of the Church are initiated into and anointed for
                    the ministry of the kingdom of God. However Holy Spirit guides the community to
                    select and appoint special ministers such as bishops, priests and deacons to
                    serve the church. They are appointed to their respective offices by the whole
                    worshipping community through an ordination service in the context of Eucharistic
                    celebration. The bishop who is the sacramental presence of Christ in the
                    community together with the clergy play a significant role to lead the faithful
                    in the orthodox faith, worship, unity and witness. Church&apos;s authority and
                    identity is that of Christ. The church sees its authority in caring for humanity,
                    in emptying itself for others. The words like forgiveness, liberation, healing,
                    reconciliation, love, salvation etc should always replace the words like rule,
                    command, judgment, punishment, etc in the Church to reveal its true authority.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Kingdom Oriented Ecclesiology
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Kingdom of God is God&apos;s dream for the world. Liberation from personal and
                    social evil, peace and fellowship and union with God are important aspects of
                    the kingdom of God, the central message of Jesus Christ. The Church which is
                    Christ&apos;s body is the initial budding forth of the kingdom of God. Being the
                    sign and sacrament and instrument of the kingdom of God, the church is serving
                    the world. Compared to the Church, kingdom of God is a larger and more
                    comprehensive term and vision. It is a great privilege that God is giving
                    participation to Church in his dream for the world which is the kingdom of God
                    ministry.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Indian Perspective
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    As the Indian Christian theologian Felix Wilfred says the starting point for the
                    budding forth of Indian ecclesiology is the inner experience. Church is viewed
                    as the community of those who are awakened to the Divine mystery. Church is
                    defined as a community of Jesus-Bhaktas. Indian theologians use the model of
                    Indian religious bodies like Sabha, samaj, sangha to refer to this. Indian
                    Christian thinkers recommend a culturally founded ecclesiology. The poor are a
                    dispensable lot in India. The first thing expected of the church is a deep
                    sensitivity to people&apos;s movements and struggles and the burning questions
                    they raise. Local church is a community that lives Jesus&apos; vision of the
                    kingdom in dialogue with the life realities of the people, especially the
                    oppressed and the downtrodden. Indian theologians like M.M. Thomas, Michael
                    Amaladoss Felix Wilfred etc are of the opinion that &quot;An inculturation that
                    is not liberation-oriented can become church centered and not kingdom
                    centered.&quot;
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Conclusion
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The church is the continuation of the incarnation of Jesus Christ. In union with
                    Christ, the Church makes God visible to the world. As a mother it brings up its
                    children in the image and likeness of God. Third century Christian father Cyprian
                    of Carthage goes to the extent of saying that &quot;he (/she) can no longer have
                    God for his (/ her) Father, who has not the church for his (/her) mother.&quot;
                    Health of this mother is interconnected with the growth of its children and the
                    sound health of the world. So it is an important task of the members to
                    participate in the building up of the church done by God himself. It is the Holy
                    Spirit who is perfecting everything leads the church to perfection in its
                    essential marks and mission.
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center mb-4">
                      The church is the continuation of the incarnation of Jesus Christ. In union
                      with Christ, the Church makes God visible to the world. The Holy Spirit is the
                      secret inspiration of steadfastness to the apostolic faith, witness to Christ,
                      service to the poor and needy, and harmony of the Church.
                    </p>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center font-semibold">
                      Fr. Bijesh Philip, Principal, St. Thomas Orthodox Seminary, Nagpur
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

