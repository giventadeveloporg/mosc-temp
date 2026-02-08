import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Home',
  description: 'Syro-Malabar Church - Saint Thomas Christian Community. Explore our heritage, spiritual resources, and community.',
};

/**
 * Syro landing: static HTML from syromalamar-temp (index.html + assets) with design system applied.
 * Served at /syro as the default home; layout omits SyroHeader/Footer for this route so the static page is full-view.
 * Top link bar points to Next.js sub-pages (Catholicate, Administration, Holy Synod).
 */
export default function SyroLandingPage() {
  return (
    <div className="flex flex-col h-screen w-full">
      {/* Next.js links to sub-pages - no HTML file references */}
      <nav className="flex-shrink-0 flex items-center justify-center gap-6 px-4 py-3 bg-syro-bg-gray border-b border-syro-table-border">
        <Link
          href="/syro/catholicate"
          className="font-syro-primary font-semibold text-syro-blue hover:text-syro-red transition-colors"
        >
          Catholicate
        </Link>
        <Link
          href="/syro/administration"
          className="font-syro-primary font-semibold text-syro-blue hover:text-syro-red transition-colors"
        >
          Administration
        </Link>
        <Link
          href="/syro/holy-synod"
          className="font-syro-primary font-semibold text-syro-blue hover:text-syro-red transition-colors"
        >
          Holy Synod
        </Link>
      </nav>
      <iframe
        src="/syro/index.html"
        title="Syro-Malabar Church"
        className="flex-1 w-full border-0 block min-h-0"
        style={{ border: 'none' }}
      />
    </div>
  );
}