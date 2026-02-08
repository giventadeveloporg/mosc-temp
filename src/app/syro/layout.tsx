import React from 'react';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import SyroHeader from './components/SyroHeader';
import SyroFooter from './components/SyroFooter';
import NavigationBreadcrumb from './components/NavigationBreadcrumb';
import ImageSlider from './components/ImageSlider';
import '@/styles/syro-malabar.css';

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

export default async function SyroLayout({ children }: SyroLayoutProps) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isSyroLanding = pathname === '/syro' || pathname === '/syro/';

  // Landing page: static HTML has its own header/footer; render only the iframe (children)
  if (isSyroLanding) {
    return <>{children}</>;
  }

  return (
    <div className="syro-layout min-h-screen bg-syro-bg-gray flex flex-col font-syro-primary">
      <SyroHeader />
      
      {/* Image Slider after navbar */}
      <ImageSlider />

      <main className="syro-main flex-1">
        <NavigationBreadcrumb />
        {children}
      </main>

      <SyroFooter />
    </div>
  );
}
