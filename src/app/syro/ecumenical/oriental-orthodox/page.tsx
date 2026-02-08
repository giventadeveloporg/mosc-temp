import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';

export const metadata = {
  title: 'Oriental Orthodox',
  description: 'Learn about the oriental orthodox relations of the Malankara Orthodox Syrian Church.',
};

const orientalorthodoxPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-lg flex items-center justify-center mx-auto mb-6 shadow-syro-card-hover">
              <span className="text-syro-red-foreground text-4xl font-bold" role="img" aria-label="Oriental Orthodox">🤝</span>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              Oriental Orthodox
            </h1>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              Unity within the Oriental Orthodox family
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                {/* Featured Image */}
                <div className="mb-8">
                  <Image
                    src="/images/ecumenical/oriental-orthodox.jpg"
                    alt="Oriental Orthodox"
                    width={500}
                    height={300}
                    className="rounded-lg shadow-syro-card w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    The Relation between Orthodox Churches
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Malankara Orthodox Church has always tried to cooperate with the communities which encircled her absorbing the imitable things from them. From the very inception, she also cooperated with the ecumenical movement formed to foster love and fellowship among the Christian Churches of the world. Malankara Church was one of the founder members of the World Council of Churches formed in 1948. There are many milestones in its long history which deserve special mention. The Church has conducted many dialogues and consultations consequently many agreements with the CSI, Marthoma Churches and Roman Catholic, Lutheran and Byzantine Orthodox Churches have been arrived at. Besides this, many prelates and ecclesiastical delegates from various Churches have visited Malankara and in turn His Holiness The Catholicos and official delegates have received their hospitalities as well.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The relation with the other Orthodox Churches has been galvanized by faithful dialogues and mutual visits. To strengthen our relations with the Oriental orthodox Churches we are partakers in dialogues and cooperative initiatives though all belong to the Orthodox family. Consequent on the unofficial consultations with the Byzantine Orthodox Churches in 1969, both these family of Churches have come closer and the dialogues have progressed to the official level. Things have come to a stage where both families acknowledge that there are no theological impediments for a union between them. The list of the prelates and the holy fathers from Oriental and Byzantine Orthodox Churches who visited Malankara is rather too long. The list includes the Armenian Orthodox Church heads Vazgen, Karekin, Aram, the Ethiopian Patriarch Abune Paulose, the Romanian Patriarchs Justinian, Theoktis, the Ecumenical PatriarchBartholomew, the Patriarch of Russian Orthodox Church Pimen I, the Patriarch of the Georgian Orthodox Church .
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
                    className="block px-3 py-2 bg-syro-red text-syro-red-foreground rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Oriental Orthodox
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

export default orientalorthodoxPage;