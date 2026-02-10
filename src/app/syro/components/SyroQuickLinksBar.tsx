'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const QUICK_LINKS = [
  { name: 'Spiritual Organisations', href: '/syro/spiritual-organizations' },
  { name: 'Publications', href: '/syro/publications' },
  { name: 'Institutions', href: '/syro/institutions' },
  { name: 'Directory', href: '/syro/directory' },
  { name: 'Training', href: '/syro/training' },
  { name: 'Theological Seminaries', href: '/syro/theological-seminaries' },
  { name: 'Lectionary', href: '/syro/lectionary' },
  { name: 'Downloads', href: '/syro/downloads' },
  { name: 'Calendar', href: '/syro/calendar' },
  { name: 'Gallery', href: '/syro/gallery' },
];

export default function SyroQuickLinksBar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname?.startsWith(href) ?? false;

  return (
    <div className="syro-quicklinks-bar" role="navigation" aria-label="Quick links">
      <div className="container">
        <div className="syro-quicklinks-inner d-flex flex-nowrap align-items-center justify-content-center py-2">
          <span className="syro-quicklinks-label text-uppercase fw-semibold me-2 flex-shrink-0">Quick Links</span>
          <span className="syro-quicklinks-sep me-2 flex-shrink-0" aria-hidden="true" />
          <ul className="list-unstyled d-flex flex-nowrap align-items-center mb-0 flex-shrink-0">
            {QUICK_LINKS.map((link, index) => (
              <li key={link.href} className="d-flex align-items-center">
                <Link
                  href={link.href}
                  className={`syro-quicklink ${isActive(link.href) ? 'active' : ''}`}
                >
                  {link.name}
                </Link>
                {index < QUICK_LINKS.length - 1 && (
                  <span className="syro-quicklinks-bullet mx-1" aria-hidden="true">
                    •
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
