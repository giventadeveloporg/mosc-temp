import Link from 'next/link';
import { SPIRITUAL_ORGANIZATIONS_NAV } from './organizations-data';

interface SpiritualOrganizationsSidebarProps {
  /** Current page href (e.g. /mosc/spiritual-organizations/ecological-commission) to highlight in nav */
  currentHref: string;
}

/**
 * Sidebar nav listing all spiritual organizations, matching the style of
 * "The Church" sidebar on /mosc/the-church/the-holy-myron.
 */
export default function SpiritualOrganizationsSidebar({ currentHref }: SpiritualOrganizationsSidebarProps) {
  return (
    <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6 sticky top-8">
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
        Spiritual Organizations
      </h3>
      <nav className="space-y-2">
        <Link
          href="/syro/spiritual-organizations"
          className={`block px-3 py-2 rounded-md font-syro-primary text-sm transition-all duration-300 ${
            currentHref === '/mosc/spiritual-organizations'
              ? 'bg-syro-red text-white'
              : 'text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray'
          }`}
        >
          All Spiritual Organizations
        </Link>
        {SPIRITUAL_ORGANIZATIONS_NAV.map((org) => (
          <Link
            key={org.href}
            href={org.href}
            className={`block px-3 py-2 rounded-md font-syro-primary text-sm transition-all duration-300 ${
              currentHref === org.href
                ? 'bg-syro-red text-white'
                : 'text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray'
            }`}
          >
            {org.title}
          </Link>
        ))}
      </nav>
    </div>
  );
}
