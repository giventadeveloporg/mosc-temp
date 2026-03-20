'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { MOSC_REDESIGN_NAV_LINKS, MOSC_REDESIGN_QUICK_LINKS } from './navConfig';

export default function MoscRedesignHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 shadow-md border-b-2 border-burgundy/40">
      {/* Row 1: Logo + Church Name */}
      <div className="bg-parchment-deep border-b border-burgundy/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-2">
          <div className="flex items-center justify-between">
            <Link href="/mosc-redesign" className="flex items-center gap-3 group">
              <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                <Image
                  src="https://www.mosc-temp.com/images/logos/Current_Edits/New%20Edit/Mosc_Header_Logo9.png"
                  alt="Malankara Orthodox Syrian Church official logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-burgundy-dark font-bold text-lg md:text-xl leading-tight tracking-wide">
                Malankara Orthodox Syrian Church
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-burgundy/80 hover:text-burgundy p-2"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Main Nav */}
      <div className="bg-burgundy-dark hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
          <nav className="flex items-center gap-0 justify-end">
            {MOSC_REDESIGN_NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="relative text-white/95 hover:text-warmGold font-medium text-[11px] px-3 py-2 transition-all duration-200 whitespace-nowrap group overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-sm" />
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-parchment-deep border-t border-burgundy/20 py-2">
          <div className="max-w-7xl mx-auto px-4">
            {MOSC_REDESIGN_NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block text-burgundy-dark hover:text-burgundy text-xs py-2 px-2 hover:bg-burgundy/10 rounded transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Row 3: Quick Links Bar */}
      <div className="bg-burgundy overflow-x-auto border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-16">
          <div className="flex items-center gap-0 min-w-max justify-end ml-auto">
            {MOSC_REDESIGN_QUICK_LINKS.map((ql) => (
              <Link
                key={ql.label}
                href={ql.href}
                className="relative text-parchment-light font-semibold text-[10px] px-3 py-2 whitespace-nowrap border-r border-white/10 last:border-r-0 group overflow-hidden transition-colors duration-200 hover:text-warmGold"
              >
                <span className="absolute inset-0 bg-warmBrown scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-bottom" />
                <span className="relative z-10">{ql.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
