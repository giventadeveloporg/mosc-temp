import React from 'react';
import Image from 'next/image';

/**
 * Matches static syromalabar-locations section: "Worldwide Locations" heading and map image.
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
          <div className="location-map">
            <Image
              src="/syro/assets/images/mosc_images/Worldwide_Location.png"
              alt="Worldwide Locations"
              width={1200}
              height={600}
              className="w-100"
              style={{ width: '100%', height: 'auto' }}
              sizes="(max-width: 1024px) 100vw, 1200px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
