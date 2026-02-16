'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface EcumenicalItem {
  name: string;
  href: string;
}

const ecumenicalItems: EcumenicalItem[] = [
  { name: 'Ecumenical Overview', href: '/syro/ecumenical' },
  { name: 'Department of Ecumenical Relations', href: '/syro/ecumenical/world-council-of-churches' },
  { name: 'The Relation between Orthodox Churches', href: '/syro/ecumenical/orthodox-churches' },
  { name: 'Relationship with the Catholic Churches', href: '/syro/ecumenical/catholic-church' },
  { name: 'In Egypt with the Message of Fraternity', href: '/syro/ecumenical/in-egypt-with-the-message-of-fraternity' },
  { name: 'The Shepherd of the Indian Church in Ethiopia', href: '/syro/ecumenical/the-shepherd-of-the-indian-church-in-ethiopia' },
  { name: 'The Confluence of Love in Vatican', href: '/syro/ecumenical/the-confluence-of-love-in-vatican' },
  { name: 'The Fraternity at Vienna', href: '/syro/ecumenical/the-fraternity-at-vienna' },
  { name: 'The relevant portions of the speech of His Holiness Baselios Marthoma Paulose II at the meeting with His Holiness Pope Francis at Vatican', href: '/syro/ecumenical/catholicos-speech-vatican' },
  { name: 'Relevant portions of the speech by His Holiness Pope Francis at the meeting with His Holiness Baselios Marthoma Paulose II at Vatican', href: '/syro/ecumenical/pope-francis-speech-vatican' },
  { name: 'The Successor of St. Thomas in Europe', href: '/syro/ecumenical/the-successor-of-st-thomas-in-europe' },
  { name: 'Co-operation with the Protestant Churches', href: '/syro/ecumenical/co-operation-with-the-protestant-churches' },
  { name: 'Ecumenical ventures in modern times', href: '/syro/ecumenical/ecumenical-ventures-in-modern-times' },
  { name: 'Protestant Churches', href: '/syro/ecumenical/protestant-churches' },
  { name: 'Oriental Orthodox', href: '/syro/ecumenical/oriental-orthodox' },
  { name: 'Interfaith Dialogue', href: '/syro/ecumenical/interfaith-dialogue' },
];

export default function EcumenicalSidebar() {
  const pathname = usePathname();

  return (
    <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6 mb-6">
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
        Ecumenical Relations
      </h3>
      <nav className="space-y-1">
        {ecumenicalItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md font-syro-primary text-sm transition-all duration-300 border ${
                isActive
                  ? 'bg-syro-red text-white border-syro-red'
                  : 'text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray border-syro-table-border'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
