'use client';

import React from 'react';
import AppImage from './AppImage';
import AppIcon from './AppIcon';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-background to-muted min-h-[600px] flex items-center py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Church Logo */}
        <div className="mb-12">
          <div>
            <p className="font-caption text-lg text-muted-foreground">
              Saint Thomas Christian Community
            </p>
          </div>
        </div>

        {/* Three Circular Images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16 items-center">
          {/* Patriarch Image */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-full overflow-hidden sacred-shadow-lg bg-muted flex items-center justify-center">
              <AppImage
                src="/images/logos/Hero-Section-Image-MOSC.jpg"
                alt="Malankara Orthodox Syrian Church emblem"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <h3 className="mt-4 font-heading font-medium text-lg text-foreground text-center">
            </h3>
          </div>

          {/* Church Cross */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-48 h-48 lg:w-96 lg:h-96 overflow-hidden flex items-center justify-center bg-transparent p-2">
              <AppImage
                src="/images/logos/MOSC-cross-image.png"
                alt="MOSC Hero Image"
                className="w-full h-full object-contain scale-110"
                style={{ background: 'transparent' }}
              />
            </div>
            <h3 className="mt-4 font-heading font-medium text-lg text-foreground text-center">
            </h3>
          </div>

          {/* Christ Iconography */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-48 h-48 lg:w-56 lg:h-56 overflow-hidden flex items-center justify-center sacred-shadow-lg rounded-full p-3" style={{ background: 'transparent' }}>
              <AppImage
                src="/images/logos/Current_Edits/Mosc_logo_jan2026.png"
                alt="MOSC Logo"
                className="w-full h-full object-contain"
                style={{ background: 'transparent' }}
              />
            </div>
            <h3 className="mt-4 font-heading font-medium text-lg text-foreground text-center">
            </h3>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="font-heading font-semibold text-2xl lg:text-3xl text-foreground mb-6">
            Welcome to Our Sacred Community
          </h2>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            The Malankara Orthodox Syrian Church traces its origins to the Apostolic ministry of St. Thomas in India.
            We are a community rooted in ancient traditions, committed to preserving the faith handed down through generations
            while serving our members with love, compassion, and spiritual guidance.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;