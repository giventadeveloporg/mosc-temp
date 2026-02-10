import React from 'react';
import Image from 'next/image';

export default function SyroLiturgySection() {
  return (
    <section className="liturgy">
      <div className="container">
        <div className="section-title">
          <h6>Liturgical Calendar</h6>
        </div>
        <div className="liturgy-container">
          <div className="main-title">
            <h2>
              <span className="imp-color">Liturgical</span> <span>Calendar</span>
            </h2>
          </div>
        </div>
        <div className="liturgy-image position-relative mt-4">
          <Image
            src="/syro/assets/images/mosc_images/Liturgy Calendar.png"
            alt="Liturgical Calendar"
            width={900}
            height={600}
            className="lozad w-100"
            style={{ objectFit: 'contain', maxWidth: '100%', display: 'block' }}
            sizes="(max-width: 1024px) 100vw, 900px"
          />
        </div>
      </div>
    </section>
  );
}
