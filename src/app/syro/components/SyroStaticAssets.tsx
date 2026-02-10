'use client';

import { useEffect } from 'react';

/**
 * Injects static page CSS and font links into document head so /syro matches index.html styling.
 * Mounted only inside Syro layout.
 */
export default function SyroStaticAssets() {
  useEffect(() => {
    const base = '/syro/assets';
    const links: { href: string; rel: string; crossOrigin?: string }[] = [
      { href: `${base}/css/bootstrap.min.css`, rel: 'stylesheet' },
      { href: `${base}/css/swiper-bundle.min.css`, rel: 'stylesheet' },
      { href: `${base}/css/tiny-slider.css`, rel: 'stylesheet' },
      { href: `${base}/fonts/fontawesome/css/all.min.css`, rel: 'stylesheet' },
      { href: `${base}/css/style.css`, rel: 'stylesheet' },
      { href: `${base}/css/style-inner.css`, rel: 'stylesheet' },
      { href: `${base}/css/design-system-override.css`, rel: 'stylesheet' },
      {
        href: 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400&family=Playfair+Display:wght@400;600;700;800&family=Anek+Malayalam:wght@100;200;300;400;500;600;700;800&display=swap',
        rel: 'stylesheet',
      },
    ];
    const preconnect = [
      { href: 'https://fonts.googleapis.com', rel: 'preconnect' },
      { href: 'https://fonts.gstatic.com', rel: 'preconnect', crossOrigin: '' },
    ];
    const toRemove: HTMLLinkElement[] = [];
    preconnect.forEach(({ href, rel, crossOrigin }) => {
      const existing = document.querySelector(`head link[href="${href}"]`);
      if (existing) return;
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      if (crossOrigin !== undefined) link.setAttribute('crossorigin', crossOrigin);
      document.head.appendChild(link);
      toRemove.push(link);
    });
    links.forEach(({ href, rel }) => {
      const existing = document.querySelector(`head link[href="${href}"]`);
      if (existing) return;
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      link.setAttribute('data-syro-static', 'true');
      document.head.appendChild(link);
      toRemove.push(link);
    });
    return () => {
      toRemove.forEach((el) => el.remove());
    };
  }, []);
  return null;
}
