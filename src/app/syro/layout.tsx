import React from 'react';
import { Metadata } from 'next';
import SyroHeader from './components/SyroHeader';
import SyroQuickLinksBar from './components/SyroQuickLinksBar';
import SyroFooter from './components/SyroFooter';
import SyroStaticAssets from './components/SyroStaticAssets';
import '@/styles/syro-malabar.css';
import '@/styles/syro-news-articles.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Syro-Malabar Church',
    default: 'Syro-Malabar Church',
  },
  description: 'Official website of the Syro-Malabar Church - Saint Thomas Christian Community',
  keywords: ['Syro-Malabar Church', 'Catholic Christianity', 'Saint Thomas', 'Indian Catholic Church'],
  openGraph: {
    title: 'Syro-Malabar Church',
    description: 'Official website of the Syro-Malabar Church - Saint Thomas Christian Community',
    type: 'website',
  },
};

interface SyroLayoutProps {
  children: React.ReactNode;
}

export default function SyroLayout({ children }: SyroLayoutProps) {
  return (
    <div className="syro-layout min-h-screen flex flex-col">
      <SyroStaticAssets />
      <SyroHeader />
      <SyroQuickLinksBar />

      <main id="mainContent" className="syro-main flex-1">
        {children}
      </main>

      <SyroFooter />
    </div>
  );
}
