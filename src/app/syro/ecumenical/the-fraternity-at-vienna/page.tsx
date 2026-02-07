import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';

export const metadata = {
  title: 'The Fraternity at Vienna',
  description:
    'His Holiness the Catholicos visited Vienna on 3rd September 2013 as the special invitee of Pro-Oriente. Ecumenical relations of the Malankara Orthodox Syrian Church.',
};

const TheFraternityAtViennaPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-lg flex items-center justify-center mx-auto mb-6 shadow-syro-card-hover">
              <span
                className="text-syro-red-foreground text-4xl font-bold"
                role="img"
                aria-label="Vienna"
              >
                🤝
              </span>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              The Fraternity at Vienna
            </h1>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              Catholicos&apos;s visit as special invitee of Pro-Oriente — 3rd September 2013
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
                  <Image
                    src="/images/mosc/ecumenical/vienna.jpg"
                    alt="Ecumenical meeting in Vienna"
                    width={600}
                    height={360}
                    className="rounded-lg w-full h-auto object-contain max-w-full"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    His Holiness the Catholicos visited Vienna on 3rd September 2013 as the special
                    invitee of Pro-Oriente. Pro-Oriente is the fellowship of all the Churches which
                    use Syriac as the sacramental language. From the very inception of the
                    organization, Malankara Orthodox Church has played a decisive role to this day
                    in Pro Oriente.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Cardinal Christoph Schonborn, the Arch Bishop of Vienna received His Holiness
                    the Catholicos. An ecumenical meeting was organized at his official residence in
                    honour of the Catholicos. Franz Scharl, the Auxiliary Bishop of Vienna and the
                    office bearers of Pro-Oriente attended the meeting. The meeting discussed many
                    important measures to strengthen the relationship among Syrian Churches and to
                    foster co-operations among them.
                  </p>
                </div>
              </div>

              {/* Quick Links - Horizontal Below Main Content (desktop only in column) */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6 mb-6">
                <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
                  Ecumenical Relations
                </h3>
                <nav className="space-y-2">
                  <Link
                    href="/syro/ecumenical"
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Ecumenical Overview
                  </Link>
                  <Link
                    href="/syro/ecumenical/world-council-of-churches"
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    World Council of Churches
                  </Link>
                  <Link
                    href="/syro/ecumenical/orthodox-churches"
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Orthodox Churches
                  </Link>
                  <Link
                    href="/syro/ecumenical/catholic-church"
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Catholic Church
                  </Link>
                  <Link
                    href="/syro/ecumenical/protestant-churches"
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Protestant Churches
                  </Link>
                  <Link
                    href="/syro/ecumenical/oriental-orthodox"
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Oriental Orthodox
                  </Link>
                  <Link
                    href="/syro/ecumenical/in-egypt-with-the-message-of-fraternity"
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    In Egypt with the Message of Fraternity
                  </Link>
                  <Link
                    href="/syro/ecumenical/the-shepherd-of-the-indian-church-in-ethiopia"
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    The Shepherd of the Indian Church in Ethiopia
                  </Link>
                  <Link
                    href="/syro/ecumenical/the-confluence-of-love-in-vatican"
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    The Confluence of Love in Vatican
                  </Link>
                  <Link
                    href="/syro/ecumenical/the-fraternity-at-vienna"
                    className="block px-3 py-2 bg-syro-red text-syro-red-foreground rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    The Fraternity at Vienna
                  </Link>
                  <Link
                    href="/syro/ecumenical/catholicos-speech-vatican"
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Catholicos Speech at Vatican
                  </Link>
                  <Link
                    href="/syro/ecumenical/pope-francis-speech-vatican"
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Pope Francis Speech at Vatican
                  </Link>
                  <Link
                    href="/syro/ecumenical/the-successor-of-st-thomas-in-europe"
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    The Successor of St. Thomas in Europe
                  </Link>
                  <Link
                    href="/syro/ecumenical/co-operation-with-the-protestant-churches"
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Co-operation with the Protestant Churches
                  </Link>
                  <Link
                    href="/syro/ecumenical/ecumenical-ventures-in-modern-times"
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Ecumenical ventures in modern times
                  </Link>
                  <Link
                    href="/syro/ecumenical/interfaith-dialogue"
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Interfaith Dialogue
                  </Link>
                </nav>
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

export default TheFraternityAtViennaPage;
