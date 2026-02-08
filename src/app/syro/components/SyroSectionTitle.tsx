import React from 'react';

/**
 * Section title with left red accent bar — design system.
 * 24px, font-weight 300, color #798daf, 7px left border #dc3545 (syro-red).
 */
export default function SyroSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
      {children}
    </h2>
  );
}
