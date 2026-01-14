'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Icon from './ui/Icon';

const MOSCHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    { name: 'THE CATHOLICATE', href: '/mosc/catholicate' },
    { name: 'ADMINISTRATION', href: '/mosc/administration' },
    { name: 'THE CHURCH', href: '/mosc/the-church' },
    { name: 'HOLY SYNOD', href: '/mosc/holy-synod' },
    { name: 'ECUMENICAL', href: '/mosc/ecumenical' },
    { name: 'DIOCESES', href: '/mosc/dioceses' },
    { name: 'SAINTS', href: '/mosc/saints' },
  ];

  const quickLinks: Array<{ name: string; href: string; external?: boolean }> = [
    { name: 'Spiritual Organisations', href: '/mosc/spiritual-organizations' },
    { name: 'Publications', href: '/mosc/publications' },
    { name: 'Institutions', href: '/mosc/institutions' },
    { name: 'Directory', href: '/mosc/directory' },
    { name: 'Training', href: '/mosc/training' },
    { name: 'Theological Seminaries', href: '/mosc/theological-seminaries' },
    { name: 'Lectionary', href: '/mosc/lectionary' },
    { name: 'Downloads', href: '/mosc/downloads' },
    { name: 'Calendar', href: '/mosc/calendar' },
    { name: 'Gallery', href: '/mosc/gallery' },
  ];

  const isActive = (href: string) => {
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <header className="bg-card border-b border-border overflow-hidden">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-0 pt-0">
        <div className="flex items-center justify-between py-0 -mb-3 -mt-2">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/mosc" className="flex items-center space-x-2 group" style={{ background: 'transparent' }}>
              <div className="w-36 h-[92px] sm:w-42 sm:h-[112px] md:w-52 md:h-[140px] lg:w-72 lg:h-[192px] rounded-lg flex items-center justify-center group-hover:reverent-hover reverent-transition overflow-hidden" style={{ background: 'transparent' }}>
                <Image
                  src="/images/logos/Current_Edits/MOSC-Header-Logo1.png"
                  alt="MOSC Logo"
                  width={288}
                  height={192}
                  className="w-full h-full object-contain"
                  priority
                  style={{ background: 'transparent' }}
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1" role="navigation" aria-label="Main navigation">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg reverent-transition ${isActive(item.href)
                  ? 'bg-primary text-white'
                  : 'text-foreground hover:bg-muted hover:text-foreground'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-muted reverent-transition flex items-center justify-center"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Icon name="menu" size={18} className="text-foreground" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border py-2">
            <nav className="space-y-1" role="navigation" aria-label="Mobile navigation">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-1.5 text-xs font-medium rounded-lg reverent-transition ${isActive(item.href)
                    ? 'bg-primary text-white'
                    : 'text-foreground hover:bg-muted'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Quick Links Bar */}
      <div className="bg-muted/50 border-t border-border -mt-5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <span className="font-medium text-foreground">Quick Links:</span>
            {quickLinks.map((link, index) => (
              <React.Fragment key={link.name}>
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary reverent-transition"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary reverent-transition"
                  >
                    {link.name}
                  </Link>
                )}
                {index < quickLinks.length - 1 && (
                  <span className="text-muted-foreground/50">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default MOSCHeader;
