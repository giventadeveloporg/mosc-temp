import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Malankara Orthodox Syrian Church',
    default: 'Malankara Orthodox Syrian Church',
  },
  description:
    'Malankara Orthodox Syrian Church — redesigned experience. Subpages use the Syro site shell.',
};

export default function MoscRedesignLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${dmSans.variable} ${dmSans.className} min-h-screen bg-parchment font-dm-sans text-warmGray-dark antialiased`}
    >
      {children}
    </div>
  );
}
