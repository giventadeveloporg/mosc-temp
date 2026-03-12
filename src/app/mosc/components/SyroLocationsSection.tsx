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
              <div className="syro-locations-map-wrap">
                {/* Image map so hover over pin areas shows cursor: pointer (coordinates for 1200×600 image) */}
                <map name="diocese-locations-map">
                  <area shape="circle" coords="220,200,45" href="#" aria-label="North America" className="syro-map-pin-area" />
                  <area shape="circle" coords="560,180,45" href="#" aria-label="Europe" className="syro-map-pin-area" />
                  <area shape="circle" coords="400,360,45" href="#" aria-label="South America" className="syro-map-pin-area" />
                  <area shape="circle" coords="600,400,45" href="#" aria-label="Africa" className="syro-map-pin-area" />
                  <area shape="circle" coords="820,300,45" href="#" aria-label="India" className="syro-map-pin-area" />
                </map>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/dioceses/mosc-diocese-map%20(2).jpg"
                  alt="Worldwide Locations"
                  width={1200}
                  height={600}
                  className="syro-locations-map-img"
                  style={{ width: '100%', height: 'auto' }}
                  useMap="#diocese-locations-map"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
