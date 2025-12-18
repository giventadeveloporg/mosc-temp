import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Pilgrim Centres',
  description: 'Explore the sacred pilgrim centres and historic churches of the Malankara Orthodox Syrian Church across Kerala.',
};

interface PilgrimCentre {
  id: number;
  name: string;
  location: string;
  description: string;
  fullDescription: string;
  image: string;
  history?: string;
}

const pilgrimCentres: PilgrimCentre[] = [
  {
    id: 1,
    name: 'Thiruvithamcode Arappally',
    location: 'Thiruvithamcode, Tamil Nadu',
    description: 'Thiruvithamcode Arappally ("Royal Church"; Tamil:திருவிதாங்கோடு அரப்பள்ளி; Malayalam:തിരുവിതാംകോട് അരപ്പള്ളി;), or Thomayar Kovil or St. Mary\'s Orthodox Church, is a church located in Thiruvithamcode.',
    fullDescription: 'Thiruvithamcode Arappally, also known as Thomayar Kovil or St. Mary\'s Orthodox Church, holds a special place in the hearts of believers. This historic church, located in Thiruvithamcode, is revered as a sacred pilgrim centre and attracts devotees from far and wide. The church stands as a testament to the enduring faith and rich heritage of the Malankara Orthodox Syrian Church community.',
    image: '/images/pilgrim-centres/thiruvithamcode.jpg',
  },
  {
    id: 2,
    name: 'Parumala Church',
    location: 'Parumala, Kerala',
    description: 'St. Peter\'s and St. Paul\'s Orthodox Church, Parumala (Parumala Pally) is a prominent parish church of the Malankara Orthodox Syrian Church.',
    fullDescription: 'St. Peter\'s and St. Paul\'s Orthodox Church, commonly known as Parumala Church, is one of the most significant pilgrim centres in Kerala. The church is the final resting place of Saint Gregorios of Parumala (Geevarghese Mar Gregorios), the first canonized saint of the Malankara Orthodox Syrian Church. Thousands of pilgrims visit this sacred site annually to seek the intercession of this beloved saint. The church complex includes the tomb shrine and a museum showcasing the life and relics of Saint Gregorios.',
    image: '/images/pilgrim-centres/parumala.jpg',
    history: 'The Old Parumala Church dates back to ancient times and has been a center of Orthodox faith for generations.',
  },
  {
    id: 3,
    name: 'St. Mary\'s Orthodox Syrian Church',
    location: 'Niranam, Kerala',
    description: 'Niranam Church has a rich history of being the symbol of Christian faith in Kerala and a citadel of Orthodox Christianity since its inception in AD 54 by St Thomas.',
    fullDescription: 'Niranam Church, officially known as St. Mary\'s Orthodox Syrian Church (Niranam Valiyapally), is one of the seven churches established by St. Thomas the Apostle in AD 54. This ancient church stands as a living testament to the apostolic origins of Christianity in India. The church has been a stronghold of Orthodox faith and has played a pivotal role in preserving and propagating the traditions of the Malankara Orthodox Syrian Church through centuries.',
    image: '/images/pilgrim-centres/niranam.jpg',
  },
  {
    id: 4,
    name: 'Arthat St. Mary\'s Cathedral',
    location: 'Kunnamkulam, Kerala',
    description: 'The present Arthat St. Mary\'s Orthodox Syrian Church is believed to be the pioneer Christian Community founded by St.Thomas in the first century A.D. The prominence given to this church is evident from the fact that it is one of the seven churches established by the Apostle.',
    fullDescription: 'Arthat St. Mary\'s Cathedral in Kunnamkulam is revered as one of the seven and a half churches established by St. Thomas the Apostle in Kerala. The church has a glorious history spanning nearly two millennia and has been a beacon of Christian faith in the region. The present cathedral is an architectural marvel that beautifully blends traditional Kerala church architecture with modern elements, creating a sacred space that inspires devotion and awe.',
    image: '/images/pilgrim-centres/arthat.jpg',
  },
  {
    id: 5,
    name: 'Pampady Dayara',
    location: 'Pampady, Kerala',
    description: 'Pothenpuram dayara, Pampady dayara or Mar Kuriakose dayara as it is variously called, with the spirit of a saint inhabiting and inspiring it, is now well known, far outside the boundaries of Kerala.',
    fullDescription: 'Pampady Dayara (also known as Pothenpuram Dayara or Mar Kuriakose Dayara) is a sacred monastery that holds deep spiritual significance for Orthodox Christians. The monastery is associated with the venerable Mar Kuriakose Sahada, whose holy life and spiritual teachings continue to inspire believers. The dayara (monastery) serves as a center for spiritual retreats, prayer, and theological studies, maintaining the ancient monastic traditions of the Eastern Orthodox Church.',
    image: '/images/pilgrim-centres/pampady.jpg',
  },
  {
    id: 6,
    name: 'Puthuppally Church',
    location: 'Puthuppally, Kerala',
    description: 'This ancient church renowned all over the world as "PUTHUPPALLY PALLY" or "PUTHUPPALLY VALIYAPALLY" situated on the eastern bank of the rivulet Kodoorar and beside the Puthuppally - Changanacherry road.',
    fullDescription: 'Puthuppally Church (St. George Orthodox Church, Puthuppally) is an ancient and revered pilgrim centre known for its miraculous powers and deep spiritual heritage. Located on the banks of the Kodoorar rivulet, this church has been a center of faith and devotion for centuries. The annual feast celebrations attract thousands of pilgrims who come seeking blessings and spiritual solace. The church is renowned for its beautiful architecture and sacred traditions that have been preserved through generations.',
    image: '/images/pilgrim-centres/puthuppally.jpg',
  },
  {
    id: 7,
    name: 'Koonan Kurishu Pilgrim Centre',
    location: 'Mattancherry, Kerala',
    description: 'Mattancherry and Fort Cochin are two cities in Kerala where various civilizations of the world have created significant impact which led to cultural and religious synthesis.',
    fullDescription: 'The Koonan Kurishu (Bent Cross) Pilgrim Centre in Mattancherry commemorates one of the most significant events in the history of the Malankara Church - the Coonan Cross Oath of 1653. At this historic location, Thomas Christians gathered and took a solemn oath, asserting their independence and commitment to preserving their ancient faith traditions. The pilgrimage site includes a memorial cross and provides visitors with insights into this pivotal moment in church history through exhibits and displays.',
    image: '/images/pilgrim-centres/koonan-kurishu.jpg',
  },
  {
    id: 8,
    name: 'Old Seminary (Pazhaya Seminary)',
    location: 'Kottayam, Kerala',
    description: 'The Orthodox Theological Seminary Kottayam, popularly known as Old Seminary (Pazhaya Seminary) which completes 200 years of witness to true orthodoxy holds a unique place in the cultural history of Kerala.',
    fullDescription: 'The Old Seminary (Pazhaya Seminary) in Kottayam stands as a monument to theological education and Orthodox tradition in India. Established over 200 years ago, this venerable institution has been the training ground for generations of clergy and has played a crucial role in preserving and propagating Orthodox theology and practices. The seminary campus includes historic buildings, a library with rare manuscripts and books, and a chapel that has witnessed countless ordinations and spiritual formation. Today, it serves as both an active educational institution and a pilgrim destination for those interested in the intellectual and spiritual heritage of the Malankara Orthodox Church.',
    image: '/images/pilgrim-centres/old-seminary.jpg',
  },
  {
    id: 9,
    name: 'St. George Orthodox Church',
    location: 'Kadamattom, Kerala',
    description: 'The church of Kadamattom is an indelible and undeniable symbol in the annals of Christian spirituality in Indian history. Mar Abo and Fr. Paulo alias Kadamattathu Kathanar are the two luminaries associated with this church.',
    fullDescription: 'St. George Orthodox Church, Kadamattom, holds a place of honor in the spiritual landscape of Kerala. This historic church is intimately associated with the lives and ministries of two great spiritual leaders: Mar Abo, a Syrian missionary bishop who came to India in the 9th century, and Fr. Paulo (Kadamattathu Kathanar), a renowned priest and spiritual guide. The church serves as a repository of Orthodox Christian heritage and continues to be a center of vibrant faith and devotion. Pilgrims visit to pray at this sacred site and to draw inspiration from the legacy of these holy men.',
    image: '/images/pilgrim-centres/kadamattom.jpg',
  },
  {
    id: 10,
    name: 'Kottayam Cheriapally',
    location: 'Kottayam, Kerala',
    description: 'St. Mary\'s Orthodox Syrian Church commonly known as Kottayam Cheriyapally ("small church") is one of the oldest churches in Kerala, India. Built in 1579, the church is well preserved.',
    fullDescription: 'Kottayam Cheriapally (St. Mary\'s Orthodox Syrian Church) is a jewel of Kerala\'s ecclesiastical architecture and history. Built in 1579, this beautifully preserved church showcases the traditional Kerala style of church construction with its wooden architecture, sloping roofs, and intricate carvings. Despite its name meaning "small church," Cheriapally holds immense significance in the history of the Malankara Orthodox Church. The church walls and altar area feature ancient murals and decorations that provide a glimpse into the artistic and spiritual heritage of the community. It remains an active parish and a popular pilgrimage destination.',
    image: '/images/pilgrim-centres/cheriapally.jpg',
  },
  {
    id: 11,
    name: 'St. Mary\'s Orthodox Church',
    location: 'Kallooppara, Kerala',
    description: 'In the earlier days the Christian believers of Kallooppara had to depend on the \'Niranam Church\' for the holy mass, funeral ceremonies and other religious rites. The journey on Vallom was difficult and dangerous.',
    fullDescription: 'St. Mary\'s Orthodox Church, Kallooppara, has a fascinating history that speaks to the dedication and faith of the early Christian community in the region. Before this church was established, believers had to undertake the difficult and sometimes dangerous journey by boat (Vallom) to Niranam Church for worship and sacraments. The establishment of this parish church made it possible for the faithful to practice their religion locally. Today, the church stands as a testament to the growth and spread of Orthodox Christianity in Kerala and continues to serve a vibrant community of believers.',
    image: '/images/pilgrim-centres/kallooppara.jpg',
  },
  {
    id: 12,
    name: 'St. George Orthodox Church',
    location: 'Chandanapally, Kerala',
    description: 'St. George Orthodox Church, Chandanapally or Chandanapally Valiyapalli is one of the biggest churches in South India, located at a village named Chandanapally, Pathanamthitta District in Kerala state.',
    fullDescription: 'St. George Orthodox Church, Chandanapally (Chandanapally Valiyapalli) stands as one of the largest and most impressive church buildings in South India. This magnificent structure is not just notable for its size but also for its architectural beauty and the fervent faith of its community. The church has been a landmark in the Pathanamthitta district and serves as a mother church to several parishes in the region. The annual feast of St. George is celebrated with great solemnity and attracts thousands of pilgrims from across Kerala and beyond. The church complex includes facilities for pilgrims and hosts various spiritual and cultural activities throughout the year.',
    image: '/images/pilgrim-centres/chandanapally.jpg',
  },
];

export default function PilgrimCentresPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center sacred-shadow-lg">
                <svg className="w-12 h-12 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>

            {/* Heading */}
            <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-6">
              Pilgrim Centres
            </h1>

            {/* Description */}
            <p className="font-body text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Explore the sacred pilgrim centres and historic churches of the Malankara Orthodox Syrian Church. 
              These holy places have been sanctified by centuries of prayer, devotion, and the witness of saints and martyrs.
            </p>
          </div>
        </div>
      </section>

      {/* Pilgrim Centres Grid */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              Sacred Sites of Faith
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
              Visit these hallowed places where the faithful have gathered for generations to worship, 
              pray, and experience the grace of God.
            </p>
          </div>

          {/* Grid of Pilgrim Centres */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pilgrimCentres.map((centre) => (
              <div
                key={centre.id}
                className="bg-card rounded-lg sacred-shadow hover:sacred-shadow-lg reverent-transition group overflow-hidden"
              >
                {/* Image Container */}
                <div className="relative w-full h-auto aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                  <div className="relative w-full h-full flex items-center justify-center p-8">
                    {/* Placeholder Icon */}
                    <div className="text-center">
                      <svg className="w-20 h-20 text-primary/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="font-caption text-xs text-primary/60 font-medium uppercase tracking-wider">
                        {centre.name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Location */}
                  <div className="flex items-center space-x-2 mb-3">
                    <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-caption text-xs text-primary font-medium uppercase tracking-wider">
                      {centre.location}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="font-heading font-semibold text-xl text-foreground mb-3 group-hover:text-primary reverent-transition">
                    {centre.name}
                  </h3>

                  {/* Description */}
                  <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                    {centre.description}
                  </p>

                  {/* Full Description (Expandable) */}
                  <details className="group/details">
                    <summary className="font-body text-sm text-primary font-medium cursor-pointer hover:text-accent reverent-transition flex items-center space-x-1 list-none">
                      <span>Read More</span>
                      <svg className="w-4 h-4 group-open/details:rotate-180 reverent-transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="font-body text-sm text-muted-foreground leading-relaxed">
                        {centre.fullDescription}
                      </p>
                      {centre.history && (
                        <p className="font-body text-sm text-muted-foreground leading-relaxed mt-3">
                          {centre.history}
                        </p>
                      )}
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-card rounded-lg sacred-shadow p-8 lg:p-12">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center sacred-shadow">
                <svg className="w-10 h-10 text-success-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>

            <h2 className="font-heading font-semibold text-2xl lg:text-3xl text-foreground mb-4">
              Plan Your Pilgrimage
            </h2>
            <p className="font-body text-lg text-muted-foreground mb-8 leading-relaxed">
              These sacred sites welcome pilgrims throughout the year. Whether you seek spiritual renewal, 
              historical insights, or simply wish to experience the beauty of our Orthodox tradition, 
              we invite you to visit these holy places.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/mosc/contact-info"
                className="inline-flex items-center justify-center space-x-2 bg-primary text-primary-foreground rounded-md py-3 px-6 font-body font-medium hover:bg-primary/90 reverent-transition sacred-shadow"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Contact Us</span>
              </a>

              <a
                href="/mosc"
                className="inline-flex items-center justify-center space-x-2 bg-secondary text-secondary-foreground rounded-md py-3 px-6 font-body font-medium hover:bg-secondary/90 reverent-transition sacred-shadow"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Home</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

