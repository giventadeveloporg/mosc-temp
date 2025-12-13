import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'H.H. Baselios Marthoma Mathews III, The Ninth Catholicos of the East in Malankara',
  description: 'Biography and information about H.H. Baselios Marthoma Mathews III, The Ninth Catholicos of the East in Malankara.',
};

const HisHolinessBaseliosMarthomaMathewsIiiPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Catholicos">👑</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              H.H. Baselios Marthoma Mathews III
            </h1>
            <p className="font-body text-lg text-primary max-w-3xl mx-auto leading-relaxed">
              The Ninth Catholicos of the East in Malankara
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                {/* Featured Image */}
                <div className="mb-8">
                  <Image
                    src="/images/holy-synod/hh-scaled.jpg"
                    alt="H.H. Baselios Marthoma Mathews III, The Ninth Catholicos of the East in Malankara"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto object-contain"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">
                    Biography
                  </h2>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    His Holiness Baselios Marthoma Mathews III was enthroned as the Catholicos of the East & Malankara Metropolitan (the Supreme Head of the Malankara Orthodox Syrian Church of India) on Friday, 15th October 2021. His Holiness is the 92nd Primate on the Apostolic Throne of St. Thomas.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    His Holiness was born on 12 February 1949 to Mr Cherian Anthrayos of Mattathil family, being a member of St Peters Church, Vazhoor. After his school education, he joined Kerala University and passed his BSc Chemistry. After his BSc, he joined Orthodox Seminary, Kottayam, and had his GST degree. His Holiness took his BD degree from the Serampore University and did his higher studies in Theology at Theological Academy, Leningrad, Russia. Thereupon he joined Oriental Institute, Rome, and took his MTh and PhD from there. His Holiness was ordained a deacon in 1976 and a priest in 1978 by HH Baselios Mathews I. His Holiness was escalated to the post of an Episcopa on 30 April 1991 at a function at Parumala, and metropolitan in 1993. He is a well-known teacher and a faculty member of the Orthodox Seminary, Kottayam. A philanthropist, he works relentlessly for the uplift of the poor, especially women. He has started many ventures to help give employment opportunities to women from the economically backward classes. His Holiness was also served the Holy Episcopal Synod as its secretary.
                  </p>

                  <div className="mt-8 pt-6 border-t border-border">
                    <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                      Contact Information
                    </h3>
                    <p className="font-body text-muted-foreground leading-relaxed mb-2">
                      H.H. Baselios Marthoma Mathews III,
                    </p>
                    <p className="font-body text-muted-foreground leading-relaxed mb-2">
                      Catholicate Aramana
                    </p>
                    <p className="font-body text-muted-foreground leading-relaxed mb-2">
                      Devalokam P.O, Kottayam
                    </p>
                    <p className="font-body text-muted-foreground leading-relaxed mb-2">
                      Kerala, India
                    </p>
                    <p className="font-body text-muted-foreground leading-relaxed mb-2">
                      Tel: 04812578499, 04812578500
                    </p>
                    <p className="font-body text-muted-foreground leading-relaxed mb-2">
                      Email: catholicos@mosc.in
                    </p>
                    <p className="font-body text-muted-foreground leading-relaxed mb-2">
                      Facebook: https://www.facebook.com/CatholicosBaseliosMarthomaMathewsIII
                    </p>
                    <p className="font-body text-muted-foreground leading-relaxed mb-2">
                      Instagram:  baseliosmarthomamathewslll
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-background rounded-lg sacred-shadow p-6 mb-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                  Holy Synod
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/mosc/holy-synod" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Holy Synod Overview
                  </Link>
                  <Link 
                    href="/mosc/holy-synod/his-holiness-baselios-marthoma-mathews-iii" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    His Holiness the Catholicos
                  </Link>
                </nav>
              </div>

              {/* Quick Links */}
              <div className="bg-background rounded-lg sacred-shadow p-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                  Quick Links
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/mosc/downloads/kalpana" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Kalpana
                  </Link>
                  <Link 
                    href="/mosc/downloads" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Downloads
                  </Link>
                  <Link 
                    href="/mosc/institutions" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Institutions
                  </Link>
                  <Link 
                    href="/mosc/training" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Training
                  </Link>
                  <Link 
                    href="/mosc/publications" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Publications
                  </Link>
                  <Link 
                    href="/mosc/spiritual" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Spiritual Organisations
                  </Link>
                  <Link 
                    href="/mosc/theological" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Theological Seminaries
                  </Link>
                  <Link 
                    href="/mosc/lectionary" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Lectionary
                  </Link>
                  <Link 
                    href="/mosc/photo-gallery" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Gallery
                  </Link>
                  <Link 
                    href="/mosc/contact-info" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Contact Info
                  </Link>
                  <Link 
                    href="/mosc/faqs" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    FAQs
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HisHolinessBaseliosMarthomaMathewsIiiPage;
