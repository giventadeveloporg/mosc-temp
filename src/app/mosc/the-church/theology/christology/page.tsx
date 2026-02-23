import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Christology',
  description:
    'The Christology of the Malankara Orthodox Syrian Church: the one incarnate nature of God the Word, the mystery of the Incarnation, and the Church\'s confession of faith.',
};

export default async function ChristologyPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Christology" breadcrumbFrom={breadcrumbFrom} />

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-[280px] h-auto">
                    <Image
                      src="/images/church/theology.jpg"
                      alt="Christology - Malankara Orthodox Syrian Church"
                      width={280}
                      height={180}
                      className="w-auto h-auto object-contain rounded-lg block mx-auto"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-8">
                    The Malankara Orthodox Syrian Church (Indian Orthodox Church) belongs to the group of Churches called Oriental Orthodox Churches or Non-Chalcedonian Churches. The other members of this family are the Coptic, Ethiopic, Syrian, Armenian and Eritrean Churches. Together with the Roman Catholic Church and the Byzantine Churches they comprised the One Church for four centuries until the division arose on account of the Council of Chalcedon in 451 A.D. which insisted that Christ had the two natures of humanity and divinity in and after the union. Here we try to describe in brief the Christology of the Malankara Orthodox Syrian Church.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Mystery of Incarnation
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Faith in the Mystery of the Incarnation of God, together with the Mystery of the Holy Trinity, is the very basis for the existence of the Malankara Holy, Catholic, Apostolic and Orthodox Church. Mystery of Incarnation means the mystery of the descending of God the Son who is one of the Trinity from heaven and taking up flesh and rational soul from the Holy Virgin Mary. God the Son the second Person of the Trinity became man and He accepted the incarnate state as a dispensation for the salvation of the world. This dispensation is God&apos;s action in which the Son accepted a second birth from a human mother, in addition to his eternal generation from the Father. However, God the Son incarnate does not mean either that the universe was deprived of His divine care during His life time on earth, or that His providence was administered during that time from His Incarnate personal centre. In order to become incarnate, God the Son accepted on Himself a self-limitation. The Malankara Church believes that each one of the three persons of the Holy Trinity has the power to do every possible thing. But it is to the Person of the Son (Word/Logos) that the union with humanity (flesh with rational soul) is convenient. The property of filiation is constant to Word (the Son). Being Son, eternally generated from the Father, He again became the Son from a human mother. The Son of God became the Son of man, and thus He became one united (incarnate) nature of God the Word. This is the mystery of God becoming man and man becoming God: &quot;The Word became flesh and dwelt among us&quot; (Jn. 1:14).
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    The One Incarnate Nature of God the Word
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Jesus Christ is One Incarnate (united) Nature of God the Wordâ€”this is the christological formula of the Malankara Church. The Church believes that this one united nature is composed of Godhead and manhood in their perfection. According to the Church, in the one Christ the two natures continued without confusion or mixture on the one hand, and without separation or division on the other. The Church professes: We believe that one of the Persons of the Holy Trinity came down from heaven although He did not cease to dwell in the bosom of the Father; that He dwelt in the womb of the Virgin, and was incarnate of the Holy Ghost and of the Virgin Mary, and was made man, while still continuing to be God, and was united to the flesh of the same substance as ours and endowed with a rational and living soul. There are two natures in our Lord: the divinity and the humanity. The union of His divinity with His humanity is transcendent and ineffable by the Word without admixture, without confusion, without transformation or conversion, without change, and without mixture. Although preserving the distinctiveness of the nature in one Son, one is Christ, one is ousia, one is hypostasis, one is person, one is will, one is Power, and one is operation.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Ousia here is the one individuated ousia. It is hypostasis and the hypostasis is in its nature. The nature is one incarnate nature or one united nature and it is synonymous with the one composite hypostasis. The one nature or hypostasis of God the Word after the union became one person. The word &apos;nature&apos; (physis), when it is used with reference to Christ means only hypostasis, or a concrete being. For the Church, this meaning is crucial, because physis, if it is taken in the sense of hypostasis, is capable of conserving the idea that Jesus Christ lived a concrete human life on earth.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Christological affirmations of the Malankara Church include: (i) The oneness in the nature, will and authority of the Father and Son; (ii) The uniqueness of the Sonship of Jesus Christ; (iii) The manhood is perfect and it has all natural properties and faculties without any reduction, change or confusion; (iv) The real and simultaneous union of the Divine with the soul and body without confusion, transformation and separation; (v) Jesus Christ suffered and died only in His manhood and in His Godhead He was living; (vi) After the Resurrection, Christ rendered the real body and it was not a phantom.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    1. One Nature Incarnated
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The one incarnate nature of God the Word is itself a result of the union of two natures which are irreducibly, invisibly, and really united in the one Christ. For the Church, to know Christ in two natures will lead one to think of the duality of the Son. The Church affirms that the manhood of Christ is real, but it does not exist in Christ in a state of independence or separation from the Godhead. The centre is always the hypostasis of the Word. It is the nature of the Logos incarnate to be human.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    2. If the Hypostasis is One, Nature is also One
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    This is an affirmation against the Chalcedonian definition of two natures and one hypostasis. According to our Church, one cannot demonstrate a nature deprived of hypostasis and it is argued that if Christ exists in two natures, it is necessary that there may be two hypostases also. Therefore, as we believe, the Chalcedonians are mistaken in their claim that there is one hypostasis and two natures after the union.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    3. If Person is One, then Nature and Hypostasis are also One
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    This is the argument of our Church against the Nestorian christological formula. For the Nestorians, Jesus Christ is one person, in two natures and two hypostases. Our Church cannot agree with this definition. According to us, if Jesus Christ is one person, He should also be one nature and one hypostasis. The Church believes that the union of God the Word with the manhood is real and is hypostatic and natural, and it is free from confusion and mixture.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    4. One from Two
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The one incarnate nature of God the Word is composed of two natures. Jesus Christ is composed of the two natures of Godhead and manhood, which are united in him in the same way as the body and the soul are united in every man. God the Word is one hypostasis. He united to Himself hypostatically the flesh endowed with a rational and intelligent soul, which was assumed from Mary. Thus He is one double nature and one composite hypostasis.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    5. One Composite Hypostasis and One United / Incarnate Nature
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The union of Godhead and manhood in Jesus Christ is not a union of two natures understood as abstract realities, but of God the Son with the manhood that became individuated in the union. Though the manhood was not a self-subsistent hypostasis over against God the Son, it is hypostatic in the union. Therefore the one hypostasis or one nature in Jesus Christ is not simple, but it is composite hypostasis and united nature. God the Word, before the flesh, is one only nature and a simple hypostasis, but after the flesh, it is no more simple, but a united nature and composite hypostasis.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    6. With and Without Change and Conversion
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In the union, the divine hypostasis and the human hypostasis remain what they were in their particular nature, without corruption nor confusion, without change nor conversion. The saying, &apos;the incarnate Word suffered death on the cross&apos; does not indicate that the divinity suffered passion and death. However, because of His union with the flesh, the Malankara Church rightfully refers to the death of Christ, the incarnate Word.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    7. Without Mixture and Confusion
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The concepts of without mixture and without confusion are absolutely fundamental to our Christology. The divine nature is neither a body nor an accident and consequently it is beyond all substantial changes. Therefore, the mixing of it with the body or the accidents is impossible.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    8. The Impassible, Immortal and Incorruptible Body after the Resurrection
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The manhood of Christ was our manhood in reality, perfection and integrity; although it was itself untouched by sin, it was involved in the effects of the corporate sin of mankind; and that it gained the impassibility and immortality only by the Resurrection, through a life of complete obedience, suffering and death. The body of our Lord gained the divine properties such as impassability, incorruptibility, immortality only after His Resurrection. Jesus Christ was not a mere man, but God the Son united with man (God-man). He continues to be that God-man after His Resurrection also.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    9. Mary is the Mother of God
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The title of Mary as the Mother of God (yoldat Aloho) is central to the Christology of the Church. God the Word was born of her, not in the sense that the divinity of the Word took the beginning of its existence from her, but that the Word of God Himself, Who was born of the Father from all eternity, in these later days for our salvation&apos;s sake made the flesh without change and mixture, and born of her. The holy Virgin did not bring forth a mere man, but a true God, not God simply, but God Incarnate. At the very moment of conception, the Word took of the holy Virgin the flesh animated by a rational soul, and was united to Him naturally and hypostatically. Thus, having been conceived and brought forth a God incarnate, the Son, and Christ, and Lord, Mary became the mother of God.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Malankara Church does not withhold the titles mother of man (Anthroptokos) and mother of Christ (Christotokos) from Mary. The title Mother of God, however, is the excellent one because it proves the Incarnation of God the Word.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Conclusion
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Malankara Church always affirms one important christological formula that our Lord Jesus Christ is the &quot;One Incarnate nature of God the Word&quot;. The one nature of which the Church speaks is the one which includes the fullness of the Godhead and manhood. The one nature is incarnated, and therefore it is one united nature. This united nature is one person. The incarnate nature is one because the coming together, without confusion, of two natures in the unity, namely of the one person, is indicative of the concurrence of both of them. Thus Jesus Christ is one united-nature. This does not imply any reduction and division of nature but only the affirmation of unity which the convergence of the two natures effected.
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center">
                      The Malankara Orthodox Syrian Church confesses our Lord Jesus Christ as the One Incarnate nature of God the Wordâ€”perfect God and perfect man, one person, without confusion, without separation.
                    </p>
                  </div>
                </div>

                <div className="mt-10 hidden lg:block">
                  <QuickLinks />
                </div>
              </div>
            </div>

            {/* Sidebar - The Church (all subpages, like mosc.in) */}
            <div className="space-y-6 lg:col-span-1">
              <TheChurchSidebar />
            </div>
          </div>
          {/* Quick Links - mobile only */}
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
};

