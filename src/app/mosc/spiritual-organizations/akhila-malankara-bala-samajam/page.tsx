import React from 'react';
import QuickLinks from '../../components/QuickLinks';
import SpiritualOrganizationsSidebar from '../SpiritualOrganizationsSidebar';

export const metadata = {
  title: 'Akhila Malankara Balasamajam | MOSC',
  description: 'Akhila Malankara Balasamajam is the student portion of the Malankara Orthodox Syrian Church. President H.G.Dr. Joseph Mar Dionysius Metropolitan. Central office: St Thomas Aramana, Ranni.',
};

const AkhilaMalankaraBalaSamajamPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <section className="py-16 bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-lg flex items-center justify-center mx-auto mb-6 shadow-syro-card-hover">
              <span className="text-syro-red-foreground text-4xl font-bold" role="img" aria-label="Akhila Malankara Balasamajam">📚</span>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              Akhila Malankara Balasamajam
            </h1>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              AKHILA MALANKARA BALASAMAJAM is the student portion of the Malankara Orthodox Syrian Church. Balasamajam aims at the integrated personal development of the youth in the Church. The main objectives are worship, study and virtuous life among all the boys and girls inside the Church. The Balasamajam was organized on an all Malankara basis in 1982.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-8">
                <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
                  <p>
                    Through this programme, an all round development of personality of the children is accomplished as they are encouraged to study the Holy Bible, the tradition and history of the Church along with their academic studies. The life history of Saints of the church presented before them develops in them a spiritual and moral life aiming the service for the society. The Samajam through its activities encourages the children to participate regularly in the Sunday Schools and Church services. Every child between the age of 5 and 15 years are supposed to be its members.
                  </p>
                  <p>
                    <strong className="text-syro-blue">Central level:</strong> Balasamajam is led in the central level by a Metropolitan as its President and Priests as its Vice-president and General Secretary. Two joint secretaries are also there to support the general secretary (one male and one female). There is a treasurer also who is elected from the central committee. The central committee is constituted with the general secretary and joint secretary of each diocese.
                  </p>
                  <p>
                    <strong className="text-syro-blue">Diocese level:</strong> Every diocese contain the same pattern as President (the diocesan bishop) Vice president (priest who is selected by the bishop), general secretary and joint secretary. An executive committee is also there.
                  </p>
                  <p>
                    <strong className="text-syro-blue">Church level:</strong> Each parish has its own unit led by the Priest as the President. Vice president, General secretary and a joint secretary for leading the church programmes.
                  </p>
                  <p>
                    Programmes include annual meets, annual camps, Bible study classes, competitions, pilgrimages, tours, humanitarian services and educational counselling at Central, Diocesan and parish levels. Funds comprise financial contributions, grants and assistance from various parishes.
                  </p>
                </div>

                <div className="mt-10 space-y-6">
                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
                    Present Office Bearers at Central Level
                  </h3>

                  <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-6">President</h4>
                  <p className="font-syro-primary text-syro-dark-gray">
                    H.G.Dr. Joseph Mar Dionysius Metropolitan
                  </p>

                  <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-6">Vice President</h4>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Rev. Fr. Cherian Jacob
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Ph: 9446600912
                  </p>

                  <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-6">General Secretary</h4>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Fr. jim M. George
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Ph: 9961595167
                  </p>

                  <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-6">Central Office</h4>
                  <p className="font-syro-primary text-syro-dark-gray">
                    St Thomas Aramana, Pazhavangadi, Ranni. 689673.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Email:{' '}
                    <a href="mailto:orthodoxbalasamajam@gmail.com" className="text-syro-red hover:underline">
                      orthodoxbalasamajam@gmail.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <SpiritualOrganizationsSidebar currentHref="/mosc/spiritual-organizations/akhila-malankara-bala-samajam" />
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default AkhilaMalankaraBalaSamajamPage;
