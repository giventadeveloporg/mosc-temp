import React from 'react';

/**
 * Worldwide Locations section: heading + panel styled like syromalabarchurch.in
 * (dark blue gradient, left text block with orange-red accent, map, CTA).
 */
export default function SyroLocationsSection() {
  return (
    <section className="syromalabar-locations">
      <div className="container">
        <div className="section-title">
          <h6>Our Presence</h6>
        </div>
        <div className="location-container">
          <div className="main-title">
            <h2>
              <span>Malankara Orthodox Syrian Church</span>
              <br />
              <span>Worldwide</span>
              <span className="imp-color"> Locations</span>
            </h2>
          </div>
          {/* Panel below heading: blue gradient, left text block, map, CTA (match syromalabarchurch.in) */}
          <div className="syro-locations-panel">
            <div className="syro-locations-panel-inner">
              <div className="syro-locations-text-block">
                <div className="syro-locations-accent-bar" aria-hidden />
                <div className="syro-locations-text-content">
                  <h3 className="syro-locations-panel-title">Places Where We Are Situated</h3>
                  <p className="syro-locations-panel-desc">Our Church is Situated Around The World</p>
                </div>
              </div>
              <div className="syro-locations-map-wrap syro-img-map-container">
                {/* Overlay pins like syro-malabar-church index.html: div#eparchy_countries with positioned divs and tooltip spans */}
                <div id="syro-eparchy-countries" className="syro-eparchy-countries">
                  <div className="south-west-america position-absolute" role="button" tabIndex={0} aria-label="South West America">
                    <span className="syro-country-tooltips" title="South West America" />
                  </div>
                  <div className="north-east-america position-absolute" role="button" tabIndex={0} aria-label="North East America">
                    <span className="syro-country-tooltips" title="North East America" />
                  </div>
                  <div className="uk position-absolute" role="button" tabIndex={0} aria-label="UK">
                    <span className="syro-country-tooltips" title="UK" />
                  </div>
                  <div className="africa position-absolute" role="button" tabIndex={0} aria-label="Africa">
                    <span className="syro-country-tooltips" title="Africa" />
                  </div>
                  <div className="india position-absolute" role="button" tabIndex={0} aria-label="India">
                    <span className="syro-country-tooltips" title="India" />
                  </div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/dioceses/mosc-diocese-map%20(2).jpg"
                  alt="Worldwide Locations"
                  width={1200}
                  height={600}
                  className="syro-locations-map-img"
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
