'use client';

import React from 'react';
import Link from 'next/link';
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16 items-start">
          {/* Patriarch Image */}
          <div className="flex flex-col items-center justify-start">
            <div 
              className="w-48 h-48 lg:w-56 lg:h-56 rounded-full border-2 border-white p-1 flex items-center justify-center"
              style={{
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.4), 0 0 60px rgba(255, 255, 255, 0.2)',
                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))'
              }}
            >
              <div className="w-full h-full rounded-full overflow-hidden sacred-shadow-lg bg-muted flex items-center justify-center">
                <AppImage
                  src="/images/logos/Hero-Section-Image-MOSC.jpg"
                  alt="Malankara Orthodox Syrian Church emblem"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
            {/* Patriarch Name and Navigation Links */}
            <div className="mt-4 px-6 py-4 text-center">
              {/* Combined Title */}
              <div 
                className="leading-tight mb-3"
                style={{ 
                  lineHeight: '1.2', 
                  fontFamily: "'Lora', serif",
                  color: '#A83C25'
                }}
              >
                <span className="text-xl sm:text-2xl font-bold">
                  H.H. Baselios <span className="text-xl sm:text-2xl font-bold">Marthoma Mathews III</span>
                </span>
              </div>
              
              {/* Navigation Links with Pipe Separators */}
              <div className="flex items-center justify-center gap-1.5 text-sm sm:text-base font-body" style={{ color: '#72553E' }}>
                <Link
                  href="/mosc/holy-synod/his-holiness-baselios-marthoma-mathews-iii"
                  className="hover:underline transition-all duration-200"
                  style={{ color: '#72553E' }}
                >
                  Biography
                </Link>
                <span className="mx-1">|</span>
                <Link
                  href="/mosc/photo-gallery/reception-to-his-holiness-baselios-marthoma-mathews-iii"
                  className="hover:underline transition-all duration-200"
                  style={{ color: '#72553E' }}
                >
                  Photos
                </Link>
                <span className="mx-1">|</span>
                <Link
                  href="/mosc/speeches"
                  className="hover:underline transition-all duration-200"
                  style={{ color: '#72553E' }}
                >
                  Speeches
                </Link>
              </div>
            </div>
          </div>

          {/* Church Cross */}
          <div className="flex flex-col items-center justify-start">
            <div 
              className="w-48 h-48 lg:w-96 lg:h-96 rounded-full border-2 border-white p-1 flex items-center justify-center"
              style={{
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.4), 0 0 60px rgba(255, 255, 255, 0.2)',
                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))'
              }}
            >
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-transparent p-2">
                <AppImage
                  src="/images/logos/Current_Edits/MOSC-Center-Image.png"
                  alt="MOSC Hero Image"
                  className="w-full h-full object-contain scale-110"
                  style={{ background: 'transparent' }}
                />
              </div>
            </div>
            <h3 className="mt-4 font-heading font-medium text-lg text-foreground text-center">
            </h3>
          </div>

          {/* Christ Iconography */}
          <div className="flex flex-col items-center justify-start">
            <div 
              className="w-48 h-48 lg:w-56 lg:h-56 rounded-full border-2 border-white p-1 flex items-center justify-center"
              style={{
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.4), 0 0 60px rgba(255, 255, 255, 0.2)',
                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))'
              }}
            >
              <div className="w-full h-full rounded-full overflow-hidden flex flex-col items-center justify-center sacred-shadow-lg p-3 gap-1" style={{ background: 'transparent' }}>
                <AppImage
                  src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                  alt="MOSC Logo"
                  className="w-full h-40 object-contain relative top-[-5px]"
                  style={{ background: 'transparent' }}
                />
                <AppImage
                  src="/images/logos/Current_Edits/MOSC-Text-only.png"
                  alt="MOSC Text"
                  className="w-40 h-auto max-h-[40%] object-contain relative top-[-20px]"
                  style={{ background: 'transparent' }}
                />
              </div>
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