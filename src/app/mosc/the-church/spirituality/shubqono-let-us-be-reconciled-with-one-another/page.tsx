import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Shubqono â€“ Let us be Reconciled with One Another',
  description:
    'The Service of Reconciliation (Shubqono) at the threshold of Great Lent. The Church enters the season of penitence and mutual forgiveness.',
};

export default async function ShubqonoPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Shubqono â€“ Let us be Reconciled with One Another"
        breadcrumbFrom={breadcrumbFrom}
      />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-[280px] h-auto">
                    <Image
                      src="/images/church/spirituality.jpg"
                      alt="Shubqono â€“ Service of Reconciliation"
                      width={280}
                      height={180}
                      className="w-auto h-auto object-contain rounded-lg block mx-auto"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    SHUBQONO â€“ Let us be Reconciled with One Another
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Church, on this very afternoon of the &apos;Day of Forgiveness,&apos; has set
                    her journey into penitence. And so, kneeling and prostrating, her people look
                    ahead to Kymtho, the great feast of the Light. The service of reconciliation is
                    conducted on Monday, the first day of the Great Lent, at the end of third hour.
                    The Service of Reconciliation or shubqono, stands at the &apos;threshold of Great
                    Lent.&apos; The service marks the actual doorway into Lent, the threshold on the
                    other side of which stands the fullest measure of ascesis that the Church metes
                    out to the whole of her faithful throughout the world.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    As we stand at the threshold of the fast, we sing of him who stood before the
                    gates of Eden. As we make ready to enter in to this season of preparation, we
                    sing often:
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 my-6 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed italic">
                      O merciful and compassionate Lord, to You I cry aloud: I am fallen! Have mercy
                      on me! Your grace has shown forth, O Lord, it has shone forth and given light
                      to our souls. Behold, now is the accepted time; behold, now is the season of
                      repentance. Let us cast off the works of darkness and put on the armor of
                      light, that having sailed across the great sea of the Fast, we may reach the
                      third-day Resurrection of our Lord Jesus Christ, the Savior of our souls.
                    </p>
                  </div>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The scene painted by the hymns of the day is one of a great and terrible sorrow.
                    We lament the loss of so great a gift â€“ the gift to be children of God. Our sins
                    have forced us to be exiles from glory. We are in want. No more can we look upon
                    the Lord our God and Maker. As Great Lent begins, we are reminded in language
                    stronger and more direct than ever before of the gravity of our condition in sin.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    By the transgression of the will of God we threw aside the gift of grace and
                    blessings. However, we have a God who loves us and is abundant in His mercy.
                    &apos;I will not cast him out.&apos; God&apos;s words in this are already the
                    words of salvation. They are words of calling, of beckoning, of reconciliation.
                    But they are also words of directive: &apos;when he comes to me....&apos; God
                    does not take fallen man and, with a divine fiat that would mean little to the
                    long-term well being of humankind, magically place him back into glory from which
                    we ourselves have exiled. God knows that it is our heart that most desperately
                    needs to be healed, needs to be turned away from the desire for its own ends and
                    back to a desire for the heart of God Himself.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The arena of the virtues has been opened. Let all who wish to struggle for the
                    prize now enter, girding themselves for the noble contest of the Fast; for those
                    that strive lawfully are justly crowned. Taking up the armor of the Cross, let us
                    make war against the enemy. Let us have as our invisible rampart the Faith,
                    prayer as our breastplate, and as our helmet almsgiving; and as our sword let us
                    use fasting that cuts away all evil from our heart.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    And so, forgiveness. The first step in our journey through Lent must be this act
                    of mutual forgiveness, of reconciling ourselves to one another in the context
                    of the holy community in which we shall grow and advance together. If we set out
                    upon the season of inner repentance without beginning here, in an act of
                    fraternal repentance, then we will certainly find ourselves &apos;committing sin
                    while singing hymns with our tongues.&apos; The gate of Paradise will only be
                    more firmly shut. But if this moment of mutual forgiveness is embraced and made
                    real in our lives, then we shall be readily equipped both as individuals and as
                    a community to fight worthily the battle before us.
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center">
                      Ashwalan moryo aloho b&apos;tayboothok l&apos;hoosoyo d&apos;hawbai
                      w&apos;shoobqono dahtohai b&apos;hono yawmo qadisho d&apos;ithaw shooroyo
                      d&apos;soomoyeekh qadisho.
                    </p>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center mt-2 text-sm">
                      Make us worthy, O Lord God, by Your abundant grace, for the remission of sins
                      and the forgiveness of debts on this holy day, which is the beginning of Your
                      Holy Fast.
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
}
