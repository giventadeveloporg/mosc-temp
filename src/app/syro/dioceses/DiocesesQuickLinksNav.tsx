import Link from 'next/link';

/**
 * Shared Quick Links nav for diocese pages.
 * Used in sidebar (desktop) and below content (mobile) so the section appears just above the footer on mobile.
 */
export default function DiocesesQuickLinksNav() {
  const linkClass =
    'block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300';
  const links = [
    { href: '/syro/holy-synod', label: 'Holy Synod' },
    { href: '/syro/ecumenical', label: 'Ecumenical Relations' },
    { href: '/syro/institutions', label: 'Institutions' },
    { href: '/syro/training', label: 'Training' },
    { href: '/syro/publications', label: 'Publications' },
    { href: '/syro/spiritual', label: 'Spiritual Organisations' },
    { href: '/syro/theological', label: 'Theological Seminaries' },
    { href: '/syro/lectionary', label: 'Lectionary' },
    { href: '/syro/gallery', label: 'Gallery' },
    { href: '/syro/contact-info', label: 'Contact Info' },
    { href: '/syro/faqs', label: 'FAQs' },
  ];
  return (
    <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6">
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">Quick Links</h3>
      <nav className="space-y-2">
        {links.map(({ href, label }) => (
          <Link key={href} href={href} className={linkClass}>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
