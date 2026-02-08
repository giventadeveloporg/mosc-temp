import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';

export const metadata = {
  title: 'H.H. Baselios Augen I, The Fourth Catholicos of the East in Malankara (1964–1975)',
  description: 'Biography of His Holiness Baselios Augen I, the fourth Catholicos of the East in Malankara.',
};

const catholicosLinks = [
  { name: 'The Catholicate Overview', href: '/syro/catholicate/catholicate' },
  { name: 'H.H. Baselios Paulos I', period: '1912–1913', description: 'The First Catholicos of the East in Malankara', href: '/syro/catholicate/his-holiness-baselios-paulos-i-1st-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Geevarghese I', period: '1925–1928', description: 'The Second Catholicos of the East in Malankara', href: '/syro/catholicate/his-holiness-baselios-geevarghese-i-second-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Geevarghese II', period: '1929–1964', description: 'The Third Catholicos of the East in Malankara', href: '/syro/catholicate/his-holiness-baselios-geevarghese-ii-third-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Augen I', period: '1964–1975', description: 'The Fourth Catholicos of the East in Malankara', href: '/syro/catholicate/his-holiness-baselios-oughen-i-the-fourth-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Marthoma Mathews I', period: '1975–1991', description: 'The Fifth Catholicos of the East in Malankara', href: '/syro/catholicate/his-holiness-baselios-marthoma-mathews-i-fifth-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Marthoma Mathews II', period: '1991–2005', description: 'The Sixth Catholicos of the East in Malankara', href: '/syro/catholicate/his-holiness-baselios-marthoma-mathews-ii-sixth-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Marthoma Didymos I', period: '2005-2010', description: 'The Seventh Catholicos of the East in Malankara', href: '/syro/catholicate/his-holiness-baselios-marthoma-didymos-i-seventh-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Marthoma Paulose II', period: '2010–2021', description: 'The Eighth Catholicos of the East in Malankara', href: '/syro/catholicate/h-h-baselios-marthoma-paulose-ii' },
];

const BaseliosAugenIPage = () => {
  return (
    <div className="bg-syro-bg-gray text-syro-blue">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-lg flex items-center justify-center mx-auto mb-6 shadow-syro-card-hover">
              <span className="text-syro-red-foreground text-4xl font-bold" role="img" aria-label="Crown">👑</span>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              H.H. Baselios Augen I
            </h1>
            <p className="font-syro-primary text-lg text-syro-red mb-2 font-medium">
              The Fourth Catholicos of the East in Malankara
            </p>
            <p className="font-syro-primary text-lg text-syro-dark-gray">
              1964–1975
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <div className="mb-8">
                  <Image
                    src="/images/catholicate/augen.jpg"
                    alt="H.H. Baselios Augen I, The Fourth Catholicos of the East in Malankara"
                    width={500}
                    height={300}
                    className="rounded-lg shadow-syro-card mb-6"
                    priority
                  />
                </div>
                <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
                  <div>
                    <h2 className="font-syro-display font-semibold text-2xl text-syro-red mb-4">
                      Biography
                    </h2>
                    <p>
                      His Holiness was born on 26 June 1884 at Perumbavoor , Vengola, to Abraham Kathanar of Chettakulathukara family. He was ordained as deacon by Kadavil Paulose Mar Athanasios and in 1908 at Jerusalem he was elevated to the monastic order of Ramban. He was consecrated as Metropolitan Oughen Mar Timotheos on 15 May 1927 at Jerusalem. He was appointed as the fourth Metropolitan of Kandanad. He has left his imprint in several offices that he held during his life. He was principal of the Orthodox Theological Seminary, and the Metropolitan of Kandanad and Thumpamon dioseses. On 17 May 1962, when the Malankara Association met at Niranam, he was chosen as the Catholicate of the East. It was on 22 May 1964 at M.D. Seminary, Kottayam that he was installed formally as the fourth Catholicos. As he was very old, he relinquished his position as Malankara Metropolitan to his successor on 24 September 1975. Having achieved expectional scholarship in Malayalam and Syriac languages, he translated into Malayalam the 'Pemkisa Namaskaram' 'Prumiyonukal', ' Valiya    Nombilae Namaskaram', 'Pattamkoda Shushrusha Kramangal' and 'Pallikoodasha Kramangal'. He also composed the 'Hood- omakal' for 'Holy Synods' and the 'State after death'. He passed away on 8 December 1975 at Develokam Aramana and was laid to rest near the Aramana Chapel. His Anniversary: 8 December.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Links - Horizontal Below Main Content (same as holy-synod) - desktop only in column */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6">
                <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                  Catholicate History
                </h3>
                <div className="space-y-3">
                  {catholicosLinks.map((catholicos, index) => (
                    <Link
                      key={catholicos.name}
                      href={catholicos.href}
                      className={`block p-3 rounded-lg hover:bg-syro-bg-gray/50 transition-all duration-300 group ${index === 4 ? 'bg-syro-red/5 border border-primary/20' : ''}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-syro-red/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-syro-red/20 transition-all duration-300">
                          <span className="text-sm text-syro-red" role="img" aria-label="Catholicos">👑</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-syro-display font-medium text-sm text-syro-blue group-hover:text-syro-red transition-all duration-300">
                            {catholicos.name}
                          </h4>
                          {catholicos.period && (
                            <p className="font-syro-primary text-xs text-syro-red font-medium">{catholicos.period}</p>
                          )}
                          {catholicos.description && (
                            <p className="font-syro-primary text-xs text-syro-dark-gray">{catholicos.description}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Facts */}
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6">
                <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                  Quick Facts
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-syro-blue">Born:</span>
                    <p className="text-sm text-syro-dark-gray">26 June 1884</p>
                  </div>
                  <div>
                    <span className="font-medium text-syro-blue">Consecrated as Bishop:</span>
                    <p className="text-sm text-syro-dark-gray">15 May 1927 (Jerusalem)</p>
                  </div>
                  <div>
                    <span className="font-medium text-syro-blue">Reign:</span>
                    <p className="text-sm text-syro-dark-gray">1964–1975</p>
                  </div>
                  <div>
                    <span className="font-medium text-syro-blue">Passed Away:</span>
                    <p className="text-sm text-syro-dark-gray">8 December 1975</p>
                  </div>
                  <div>
                    <span className="font-medium text-syro-blue">Resting Place:</span>
                    <p className="text-sm text-syro-dark-gray">Near Aramana Chapel, Devalokam</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Quick Links - mobile only: just above footer */}
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
};

export default BaseliosAugenIPage;
