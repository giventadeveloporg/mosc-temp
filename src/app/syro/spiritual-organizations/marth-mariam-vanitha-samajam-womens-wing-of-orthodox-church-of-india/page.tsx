import React from 'react';
import QuickLinks from '../../components/QuickLinks';
import SpiritualOrganizationsSidebar from '../SpiritualOrganizationsSidebar';

export const metadata = {
  title: "Marth Mariam Vanitha Samajam (Women's Wing of Orthodox Church of India) | MOSC",
  description: "Marth Mariam Vanitha Samajam is the Women's wing of the Malankara Orthodox Church of India, founded in 1928. President H. G. Dr. Yuhanon Mar Diascoros Metropolitan.",
};

const MarthMariamVanithaSamajamPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <section className="py-16 bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-lg flex items-center justify-center mx-auto mb-6 shadow-syro-card-hover">
              <span className="text-syro-red-foreground text-4xl font-bold" role="img" aria-label="Marth Mariam Vanitha Samajam">👩</span>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
              Marth Mariam Vanitha Samajam (Women&apos;s Wing of Orthodox Church of India)
            </h1>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              Marth Mariam Vanitha Samajam is the Women&apos;s wing of the Malankara Orthodox Church of India. It is one of the major spiritual organizations of the church combining all the female members, spread throughout the world in all the 30 Dioceses. The organization was founded in 1928 aimed at the spiritual progress of women.
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
                    The founders named it &quot;Marth Mariam Samajam&quot; after the Blessed Virgin Mary whom they accepted as their interceding saint. It was started under the patronage of the Late Very Rev. M.C. Kuriakose Ramban and with the leadership of K.M. Annamma and co-workers. <strong className="text-syro-blue">Motto:</strong> Prarthikkuka, Pravarthikkuka, Prakasikkuka.
                  </p>
                  <p>
                    There is a central committee with all the 30 Dioceses of the church. The Diocesan Metropolitan is the President of diocesan committee. Retreats, Bible Classes, Competitions etc are held on Parish, Group, Diocese & Akhila Malankara levels. There is a Leadership Training Camp held annually. The Samajam conducts theological training (Divyabodhanam), social awareness, and various welfare projects including &quot;Snehasparsam&quot; (marriage aid, sick aid, education aid, housing for widows), and publishes the trimagazine &quot;Vanitha Deepthi&quot;. Marth Mariam Vanitha Samajam Kendra Mandiram is at Kanjikuzhy Kottayam.
                  </p>
                </div>

                <div className="mt-10 space-y-6">
                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
                    Office Bearers
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    <strong className="text-syro-blue">President:</strong> H. G. Dr. Yuhanon Mar Diascoros Metropolitan
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    <strong className="text-syro-blue">Vice President:</strong> Fr. Philip Tharakan Thevalakara – 9633519075, 9447061819
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    <strong className="text-syro-blue">General Secretary:</strong> Prof. Mary Mathew – 9447145064
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    <strong className="text-syro-blue">Treasurer:</strong> Alice Koshy +91 8369582238
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    <strong className="text-syro-blue">Office Secretary:</strong> Molly Varghese – 9961742164
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
                    Head Quarters
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Marth Mariam Vanitha Samajam Central Office<br />
                    Muttambalam P.O. Kanjikuzhy, Kottayam 4<br />
                    Kerala State, India
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Phone: 0481-2571840
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray">
                    Email:{' '}
                    <a href="mailto:momsglobal@yahoo.in" className="text-syro-red hover:underline">
                      momsglobal@yahoo.in
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <SpiritualOrganizationsSidebar currentHref="/mosc/spiritual-organizations/marth-mariam-vanitha-samajam-womens-wing-of-orthodox-church-of-india" />
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default MarthMariamVanithaSamajamPage;
