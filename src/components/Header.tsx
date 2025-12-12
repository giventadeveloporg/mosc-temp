'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ChevronDown, X, Menu, LogOut } from 'lucide-react';
import { useAuth, useClerk, useUser } from '@clerk/nextjs';
import { useTenantSettings } from '@/components/TenantSettingsProvider';

const navItems = [
  {
    name: 'Home',
    href: '/',
    active: false
  },
  {
    name: 'About',
    href: '/#about-us',
    active: false,
    dropdown: [] // Will be populated dynamically based on tenant settings
  },
  {
    name: 'Events',
    href: '/events',
    active: false
  },
  {
    name: 'Features',
    href: '#',
    active: false,
    dropdown: [
      { name: 'Polls', href: '/polls' },
      { name: 'Focus Groups', href: '/focus-groups' },
      { name: 'Profile', href: '/profile', requiresAuth: true },
      { name: 'Membership', href: '/membership' }
    ]
  },
  {
    name: 'Calendar',
    href: '/calendar',
    active: false
  },
  {
    name: 'Gallery',
    href: '/gallery',
    active: false
  },
  {
    name: 'Contact',
    href: '/#contact',
    active: false
  }
];

// Admin submenu items
const adminSubmenuItems = [
  { name: 'Admin Home', href: '/admin' },
  { name: 'Manage Users', href: '/admin/manage-usage' },
  { name: 'Manage Events', href: '/admin/manage-events' },
  { name: 'Event Analytics', href: '/admin/events/dashboard' },
  { name: 'Registrations', href: '/admin/events/registrations' },
  { name: 'Poll Management', href: '/admin/polls' },
  { name: 'Focus Groups', href: '/admin/focus-groups' },
  {
    name: 'Membership',
    href: '#',
    dropdown: [
      { name: 'Plans', href: '/admin/membership/plans' },
      { name: 'Subscriptions', href: '/admin/membership/subscriptions' }
    ]
  },
  { name: 'Promotion Emails', href: '/admin/promotion-emails' },
  { name: 'Test Stripe', href: '/admin/test-stripe' },
  { name: 'Media Management', href: '/admin/media' },
  { name: 'Executive Committee', href: '/admin/executive-committee' },
  { name: 'Event Sponsors', href: '/admin/event-sponsors' }
];

const ORG_NAME = "Adwiise";

type HeaderProps = {
  hideMenuItems?: boolean;
  variant?: 'charity' | 'default';
  isTenantAdmin?: boolean;
};

const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  console.log('[Header] handleSmoothScroll called with:', href);

  // Handle both '#section' and '/#section' formats
  if (!href.startsWith('#') && !href.startsWith('/#')) return;

  e.preventDefault();
  console.log('[Header] Preventing default and handling hash navigation');

  // Extract the hash part (handle both '#section' and '/#section')
  const hashPart = href.startsWith('/#') ? href.substring(1) : href; // '/#team-section' -> '#team-section'
  const targetId = hashPart.substring(1); // '#team-section' -> 'team-section'

  // If we're not on the home page, navigate there first
  if (typeof window !== 'undefined' && window.location.pathname !== '/') {
    console.log('[Header] Not on home page, navigating to:', `/${hashPart}`);
    // Show loading indicator for team section navigation
    if (targetId === 'team-section') {
      showNavigationLoading();
    }
    // Navigate to home page with hash
    window.location.href = `/${hashPart}`;
    return;
  }

  // If we're on the home page, update the URL hash and scroll
  console.log('[Header] On home page, updating hash to:', hashPart);

  // Show loading indicator for team section
  if (targetId === 'team-section') {
    showNavigationLoading();
  }

  // Update the URL hash
  window.history.pushState(null, '', hashPart);

  // Wait for element to exist before scrolling (especially important for dynamically loaded sections)
  const headerHeight = 80;
  const maxWaitTime = 10000; // 10 seconds max wait
  const pollInterval = 100; // Check every 100ms
  const startTime = Date.now();

  const waitForElementAndScroll = () => {
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      // Element exists, scroll to it
      const targetPosition = targetElement.offsetTop - headerHeight - 20;
      window.scrollTo({ top: Math.max(0, targetPosition), behavior: 'smooth' });
      hideNavigationLoading();
      console.log('[Header] Successfully scrolled to:', targetId);
      return true;
    }

    // Element doesn't exist yet
    const elapsed = Date.now() - startTime;
    if (elapsed < maxWaitTime) {
      // Keep waiting
      setTimeout(waitForElementAndScroll, pollInterval);
      return false;
    } else {
      // Timeout reached
      console.warn('[Header] Timeout waiting for element:', targetId);
      hideNavigationLoading();
      return false;
    }
  };

  // Start waiting for element
  waitForElementAndScroll();

  // Also trigger a hashchange event to let the page component handle the scrolling
  window.dispatchEvent(new HashChangeEvent('hashchange'));
};

// Loading indicator functions
let loadingIndicator: HTMLElement | null = null;

const showNavigationLoading = () => {
  if (typeof window === 'undefined') return;
  
  // Remove existing indicator if any
  hideNavigationLoading();

  // Create loading indicator
  loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'navigation-loading-indicator';
  loadingIndicator.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(4px);
  `;

  // Create spinner
  const spinner = document.createElement('div');
  spinner.style.cssText = `
    width: 48px;
    height: 48px;
    border: 4px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;

  // Add keyframes if not already present
  if (!document.getElementById('navigation-loading-styles')) {
    const style = document.createElement('style');
    style.id = 'navigation-loading-styles';
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  // Create text
  const text = document.createElement('div');
  text.textContent = 'Loading team section...';
  text.style.cssText = `
    margin-top: 16px;
    font-size: 16px;
    font-weight: 500;
    color: #3b82f6;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  loadingIndicator.appendChild(spinner);
  loadingIndicator.appendChild(text);
  document.body.appendChild(loadingIndicator);
};

const hideNavigationLoading = () => {
  if (loadingIndicator && loadingIndicator.parentNode) {
    loadingIndicator.parentNode.removeChild(loadingIndicator);
    loadingIndicator = null;
  }
};

export default function Header({ hideMenuItems = false, variant = 'charity', isTenantAdmin }: HeaderProps) {
  const pathname = usePathname();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { settings, showTeamSection, loading: settingsLoading } = useTenantSettings();
  const [isAdmin, setIsAdmin] = useState(!!isTenantAdmin);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [openMobileDropdowns, setOpenMobileDropdowns] = useState<Record<string, boolean>>({});

  // CRITICAL: Check for sign-out flag IMMEDIATELY on mount, before Clerk loads
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const clerkSignedOut = urlParams.get('clerk_signout');

    if (clerkSignedOut === 'true') {
      console.log('[Header] Detected clerk_signout=true flag');

      // Clear all Clerk-related items from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('clerk') || key.includes('__clerk')) {
          localStorage.removeItem(key);
        }
      });

      // Remove flag from URL and reload
      urlParams.delete('clerk_signout');
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.location.replace(newUrl);
    }
  }, []);

  // Debug: Log auth state changes
  useEffect(() => {
    console.log('[Header] Auth state:', {
      isLoaded,
      userId,
      userName: user?.firstName,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'server'
    });
  }, [isLoaded, userId, user]);

  // Prefer server-verified tenant admin flag when provided; otherwise fall back to Clerk metadata
  useEffect(() => {
    if (typeof isTenantAdmin === 'boolean') {
      setIsAdmin(isTenantAdmin);
      return;
    }
    if (isLoaded && user) {
      const publicRole = user.publicMetadata?.role as string;
      const orgRole = user.organizationMemberships?.[0]?.role;
      const isAdminUser =
        publicRole === 'admin' ||
        publicRole === 'administrator' ||
        orgRole === 'admin' ||
        orgRole === 'org:admin';
      setIsAdmin(isAdminUser);
    } else {
      setIsAdmin(false);
    }
  }, [isLoaded, user, isTenantAdmin]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    console.log('[Header] Sign out button clicked');
    setIsSigningOut(true);

    // Broadcast sign-out to other tabs
    localStorage.setItem('clerk_signout_broadcast', Date.now().toString());

    // For satellite domains, redirect to primary domain's sign-out URL
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const satelliteDomain = process.env.NEXT_PUBLIC_CLERK_DOMAIN || 'mosc-temp.com';
    const isSatellite = hostname.includes('mosc-temp.com') || hostname.includes(satelliteDomain.replace('www.', ''));

    if (isSatellite) {
      console.log('[Header] Satellite domain detected, redirecting to primary domain sign-out...');

      // Get primary domain from environment variable
      const primaryDomain = process.env.NEXT_PUBLIC_PRIMARY_DOMAIN || 'www.event-site-manager.com';

      // Redirect to primary domain's dedicated sign-out page
      const primarySignOutUrl = `https://${primaryDomain}/auth/signout-redirect`;
      const returnUrl = encodeURIComponent(window.location.origin);

      window.location.href = `${primarySignOutUrl}?redirect_url=${returnUrl}`;
      return;
    }

    // Primary domain: normal sign out
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('[Header] Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const headerHeight = 80;

    const scrollToHashWithOffset = (behavior: ScrollBehavior = 'smooth') => {
      const hash = window.location.hash;
      if (!hash || (window.location.pathname !== '/' && window.location.pathname !== '/charity-theme')) return;
      const targetId = hash.replace('#', '');
      
      // Show loading indicator for team section
      if (targetId === 'team-section') {
        showNavigationLoading();
      }

      // Wait for element to exist before scrolling (especially important for dynamically loaded sections)
      const maxWaitTime = 10000; // 10 seconds max wait
      const pollInterval = 100; // Check every 100ms
      const startTime = Date.now();

      const waitForElementAndScroll = () => {
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          // Element exists, scroll to it
          const targetPosition = targetElement.offsetTop - headerHeight - 20;
          window.scrollTo({ top: Math.max(0, targetPosition), behavior });
          hideNavigationLoading();
          console.log('[Header useEffect] Successfully scrolled to:', targetId);
          return;
        }

        // Element doesn't exist yet
        const elapsed = Date.now() - startTime;
        if (elapsed < maxWaitTime) {
          // Keep waiting
          setTimeout(waitForElementAndScroll, pollInterval);
        } else {
          // Timeout reached
          console.warn('[Header useEffect] Timeout waiting for element:', targetId);
          hideNavigationLoading();
        }
      };

      // Start waiting for element
      waitForElementAndScroll();
    };

    if ((window.location.pathname === '/' || window.location.pathname === '/charity-theme') && window.location.hash) {
      requestAnimationFrame(() => scrollToHashWithOffset('auto'));
      const timeout = setTimeout(() => scrollToHashWithOffset('auto'), 300);
      return () => clearTimeout(timeout);
    }

    const onHashChange = () => scrollToHashWithOffset('smooth');
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      hideNavigationLoading();
    };
  }, [pathname]);

  // Build About dropdown dynamically based on tenant settings
  // Only show Team when settings are loaded AND showTeamSection is explicitly true
  const aboutDropdown = [
    { name: 'About Us', href: '/#about-us' }
  ];
  // Only add Team if:
  // 1. Settings are loaded (not loading)
  // 2. Settings exist (not null)
  // 3. showTeamSection is explicitly true
  if (!settingsLoading && settings && showTeamSection) {
    aboutDropdown.push({ name: 'Team', href: '/#team-section' });
  }

  // Update nav items with dynamic About dropdown
  // About always has a dropdown now (at minimum "About Us")
  const navItemsWithDropdown = navItems.map(item => {
    if (item.name === 'About') {
      return {
        ...item,
        dropdown: aboutDropdown
      };
    }
    return item;
  });

  // Update active state based on current route
  const updatedNavItems = navItemsWithDropdown.map(item => ({
    ...item,
    active: item.href === pathname || (item.href === '/' && (pathname === '/charity-theme' || pathname === '/'))
  }));

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left side - Unite India Text Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="text-left">
                  <div className="text-xl font-bold text-purple-600 leading-snug">
                    Unite India
                  </div>
                  <div className="text-[10px] font-medium text-purple-500 uppercase tracking-wider">
                    A NONPROFIT CORPORATION
                  </div>
                </div>
              </Link>
            </div>

            {/* Center - Desktop Navigation and Right Side Combined */}
            <div className="hidden lg:flex items-center space-x-1 ml-4">
              {/* Navigation Menu Items */}
              {!hideMenuItems && (
                <nav className="flex items-center space-x-1" role="navigation" aria-label="Main navigation">
                  {updatedNavItems.map((item) => {
                    const hasDropdown = item.dropdown && Array.isArray(item.dropdown) && item.dropdown.length > 0;
                    const isAboutActive = hasDropdown && item.name === 'About' && item.dropdown.some(
                      (subItem: any) => subItem.href === pathname ||
                        (subItem.href === '/#about-us' && typeof window !== 'undefined' && window.location.hash === '#about-us') ||
                        (subItem.href === '/#team-section' && typeof window !== 'undefined' && window.location.hash === '#team-section')
                    );
                    const isFeaturesActive = hasDropdown && item.name === 'Features' && item.dropdown.some(
                      (subItem: any) => subItem.href === pathname ||
                        (subItem.href === '/profile' && pathname === '/profile') ||
                        (subItem.href === '/membership' && pathname?.startsWith('/membership'))
                    );

                    return (
                      <div key={item.name} className="relative group">
                        {hasDropdown ? (
                          <>
                            <div
                              className={`
                                relative flex items-center space-x-1 font-inter
                                text-base lg:text-base font-medium tracking-wide
                                px-3 py-2 mx-1
                                transition-all duration-300 ease-in-out
                                focus:outline-none cursor-pointer
                                ${(item.name === 'About' && isAboutActive) || (item.name === 'Features' && isFeaturesActive)
                                  ? 'text-blue-400 font-semibold border-b-2 border-blue-400'
                                  : 'text-blue-400 font-medium hover:text-blue-500 hover:font-semibold border-b-2 border-transparent hover:border-blue-400'
                                }
                              `}
                            >
                              <span className="tracking-[0.025em]">{item.name}</span>
                              <ChevronDown
                                size={16}
                                className="text-blue-400 transition-transform duration-300 group-hover:rotate-180"
                                aria-hidden="true"
                              />
                            </div>
                            {/* Dropdown Menu */}
                            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                              <div className="py-3">
                                {item.dropdown.map((subItem: any) => {
                                  // Skip Profile if user is not authenticated
                                  if (subItem.requiresAuth && !userId) return null;

                                  // Skip Membership if membership subscription is not enabled
                                  if (subItem.href === '/membership' && !settings?.isMembershipSubscriptionEnabled) return null;

                                  const isSubItemActive = subItem.href === pathname ||
                                    (subItem.href === '/membership' && pathname?.startsWith('/membership')) ||
                                    (subItem.href === '/#about-us' && typeof window !== 'undefined' && window.location.hash === '#about-us') ||
                                    (subItem.href === '/#team-section' && typeof window !== 'undefined' && window.location.hash === '#team-section');

                                  return (
                                    <Link
                                      key={subItem.name}
                                      href={subItem.href}
                                      onClick={(e) => {
                                        // Handle smooth scroll for hash links
                                        if (subItem.href.startsWith('/#')) {
                                          handleSmoothScroll(e, subItem.href);
                                        }
                                      }}
                                      className={`
                                        block px-4 py-2 mx-1 rounded-lg
                                        text-sm font-medium tracking-[0.025em]
                                        focus:outline-none
                                        transition-all duration-300 ease-in-out
                                        ${isSubItemActive
                                          ? 'text-blue-500 font-semibold bg-blue-50'
                                          : 'text-blue-400 hover:text-blue-500 hover:font-semibold hover:bg-blue-50'
                                        }
                                      `}
                                      role="menuitem"
                                      aria-label={`Navigate to ${subItem.name}`}
                                    >
                                      {subItem.name}
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        ) : (
                          <Link
                            href={item.href}
                            className={`
                              relative flex items-center space-x-1 font-inter
                              text-base lg:text-base font-medium tracking-wide
                              px-3 py-2 mx-1
                              transition-all duration-300 ease-in-out
                              focus:outline-none
                              ${item.active
                                ? 'text-blue-400 font-semibold border-b-2 border-blue-400'
                                : 'text-blue-400 font-medium hover:text-blue-500 hover:font-semibold border-b-2 border-transparent hover:border-blue-400'
                              }
                            `}
                            onClick={(e) => handleSmoothScroll(e, item.href)}
                            aria-label={`Navigate to ${item.name}`}
                            aria-current={item.active ? 'page' : undefined}
                          >
                            <span className="tracking-[0.025em]">{item.name}</span>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </nav>
              )}

              {/* Auth and Admin Menu Items */}
              <div className="flex items-center space-x-1">
                {!userId ? (
                  <>
                    <Link
                      href="/sign-in"
                      className={`
                        relative flex items-center font-inter
                        text-base font-medium tracking-wide
                        px-3 py-2 mx-1
                        transition-all duration-300 ease-in-out
                        focus:outline-none
                        text-blue-400 font-medium hover:text-blue-500 hover:font-semibold border-b-2 border-transparent hover:border-blue-400
                      `}
                    >
                      <span className="tracking-[0.025em]">Sign In</span>
                    </Link>
                    <Link
                      href="/sign-up"
                      className={`
                        relative flex items-center font-inter
                        text-base font-medium tracking-wide
                        px-3 py-2 mx-1
                        transition-all duration-300 ease-in-out
                        focus:outline-none
                        text-blue-400 font-medium hover:text-blue-500 hover:font-semibold border-b-2 border-transparent hover:border-blue-400
                      `}
                    >
                      <span className="tracking-[0.025em]">Sign Up</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className={`
                        relative flex items-center space-x-1 font-inter
                        text-base font-medium tracking-wide
                        px-3 py-2 mx-1
                        transition-all duration-300 ease-in-out
                        focus:outline-none
                        ${isSigningOut
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-blue-400 font-medium hover:text-blue-500 hover:font-semibold border-b-2 border-transparent hover:border-blue-400'
                        }
                      `}
                      aria-label="Sign out"
                    >
                      <LogOut size={16} aria-hidden="true" />
                      <span className="tracking-[0.025em]">
                        {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                      </span>
                    </button>

                    {/* Admin Menu with Submenu */}
                    {isAdmin && (
                      <div className="relative group">
                        <Link
                          href="/admin"
                          className={`
                            relative flex items-center space-x-1 font-inter
                            text-base font-medium tracking-wide
                            px-3 py-2 mx-1
                            transition-all duration-300 ease-in-out
                            focus:outline-none
                            ${pathname?.startsWith("/admin")
                              ? 'text-blue-400 font-semibold border-b-2 border-blue-400'
                              : 'text-blue-400 font-medium hover:text-blue-500 hover:font-semibold border-b-2 border-transparent hover:border-blue-400'
                            }
                          `}
                        >
                          <span className="tracking-[0.025em]">Admin</span>
                          <ChevronDown
                            size={16}
                            className="text-blue-400 transition-transform duration-300 group-hover:rotate-180"
                            aria-hidden="true"
                          />
                        </Link>

                        {/* Admin Submenu */}
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                          <div className="py-3">
                            {adminSubmenuItems.map(subItem => {
                              const hasDropdown = subItem.dropdown && Array.isArray(subItem.dropdown);
                              const isMembershipActive = hasDropdown && subItem.dropdown.some(
                                (subSubItem: any) => pathname?.startsWith(subSubItem.href)
                              );

                              if (hasDropdown) {
                                return (
                                  <div key={subItem.name} className="relative group/membership">
                                    <div
                                      className={`
                                        block px-4 py-2 mx-1 rounded-lg
                                        text-sm font-medium tracking-[0.025em]
                                        focus:outline-none
                                        transition-all duration-300 ease-in-out
                                        flex items-center justify-between
                                        ${isMembershipActive
                                          ? 'text-blue-500 font-semibold bg-blue-50'
                                          : 'text-blue-400 hover:text-blue-500 hover:font-semibold hover:bg-blue-50'
                                        }
                                      `}
                                    >
                                      <span>{subItem.name}</span>
                                      <ChevronDown
                                        size={14}
                                        className="text-blue-400 transition-transform duration-300 group-hover/membership:rotate-180"
                                        aria-hidden="true"
                                      />
                                    </div>
                                    {/* Membership Submenu */}
                                    <div className="absolute top-0 left-full ml-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover/membership:opacity-100 group-hover/membership:visible transition-all duration-300 transform translate-x-2 group-hover/membership:translate-x-0 z-50">
                                      <div className="py-2">
                                        {subItem.dropdown.map((subSubItem: any) => {
                                          const isSubSubItemActive = pathname?.startsWith(subSubItem.href);
                                          return (
                                            <Link
                                              key={subSubItem.name}
                                              href={subSubItem.href}
                                              className={`
                                                block px-4 py-2 mx-1 rounded-lg
                                                text-sm font-medium tracking-[0.025em]
                                                focus:outline-none
                                                transition-all duration-300 ease-in-out
                                                ${isSubSubItemActive
                                                  ? 'text-blue-500 font-semibold bg-blue-50'
                                                  : 'text-blue-400 hover:text-blue-500 hover:font-semibold hover:bg-blue-50'
                                                }
                                              `}
                                              role="menuitem"
                                              aria-label={`Navigate to ${subSubItem.name}`}
                                            >
                                              {subSubItem.name}
                                            </Link>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className={`
                                    block px-4 py-2 mx-1 rounded-lg
                                    text-sm font-medium tracking-[0.025em]
                                    focus:outline-none
                                    transition-all duration-300 ease-in-out
                                    ${pathname?.startsWith(subItem.href)
                                      ? 'text-blue-500 font-semibold bg-blue-50'
                                      : 'text-blue-400 hover:text-blue-500 hover:font-semibold hover:bg-blue-50'
                                    }
                                  `}
                                  role="menuitem"
                                  aria-label={`Navigate to ${subItem.name}`}
                                >
                                  {subItem.name}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* UserButton removed with Clerk; consider adding profile avatar here */}
                  </>
                )}
              </div>
            </div>

            {/* Right side - Search and Mobile Menu */}
            <div className="flex items-center space-x-2">
              {/* Search Button */}
              <button
                aria-label="Search"
                className="
                  hidden sm:flex items-center justify-center
                  w-11 h-11 min-w-[44px] min-h-[44px]
                  font-inter font-medium
                  text-gray-600 hover:text-gray-900 active:text-blue-600
                  bg-transparent hover:bg-gray-50 active:bg-gray-100
                  border-2 border-transparent hover:border-gray-200 active:border-blue-300
                  rounded-xl
                  focus:outline-none
                  transition-all duration-300 ease-in-out
                  hover:scale-105 active:scale-98
                  hover:shadow-sm active:shadow-md
                "
              >
                <Search
                  size={20}
                  className="transition-all duration-300 ease-in-out"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>

              {/* Mobile menu button */}
              <button
                className="
                  lg:hidden flex items-center justify-center
                  w-11 h-11 min-w-[44px] min-h-[44px]
                  text-gray-800 hover:text-gray-900 active:text-blue-600
                  bg-white hover:bg-gray-50 active:bg-gray-100
                  border border-gray-300 hover:border-gray-400
                  rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  transition-colors duration-200
                  touch-manipulation
                  relative z-50
                "
                onClick={toggleMobileMenu}
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                type="button"
              >
                {!isMobileMenuOpen ? (
                  <div className="flex flex-col justify-center items-center w-6 h-6">
                    {/* Top bar - medium length (12px) */}
                    <div className="w-3 h-0.5 bg-gray-800 rounded-sm mb-1"></div>
                    {/* Middle bar - full length (16px) */}
                    <div className="w-4 h-0.5 bg-gray-800 rounded-sm mb-1"></div>
                    {/* Bottom bar - short length (8px) */}
                    <div className="w-2 h-0.5 bg-gray-800 rounded-sm"></div>
                  </div>
                ) : (
                  <X size={20} className="text-gray-800" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div
        id="mobile-menu"
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-6">
            <Link href="/" className="text-left">
              <div className="text-lg font-bold text-purple-600 leading-tight">
                Unite India
              </div>
              <div className="text-[10px] font-medium text-purple-500 uppercase tracking-wider">
                A NONPROFIT CORPORATION
              </div>
            </Link>
            <button
              onClick={closeMobileMenu}
              className="
                flex items-center justify-center
                w-11 h-11 min-w-[44px] min-h-[44px]
                font-inter font-medium
                text-gray-500 hover:text-gray-800 active:text-red-600
                bg-transparent hover:bg-gray-50 active:bg-gray-100
                border-2 border-transparent hover:border-gray-200 active:border-red-300
                rounded-xl
                focus:outline-none
                transition-all duration-300 ease-in-out
                hover:scale-105 active:scale-98
                hover:shadow-sm active:shadow-md
                touch-manipulation
              "
              aria-label="Close navigation menu"
            >
              <X
                size={22}
                className="transition-all duration-300 ease-in-out"
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Mobile Menu Navigation */}
          <nav className="flex-1 overflow-y-auto py-6" role="navigation" aria-label="Mobile navigation">
            <ul className="space-y-1 px-6">
              {!hideMenuItems && updatedNavItems.map((item) => {
                const hasDropdown = item.dropdown && Array.isArray(item.dropdown) && item.dropdown.length > 0;
                const isDropdownOpen = openMobileDropdowns[item.name] || false;

                if (hasDropdown) {
                  return (
                    <li key={item.name}>
                      <button
                        onClick={() => setOpenMobileDropdowns(prev => ({ ...prev, [item.name]: !prev[item.name] }))}
                        className={`
                          w-full flex items-center justify-between py-4 px-4 min-h-[44px] rounded-xl
                          font-inter text-base font-medium tracking-[0.025em]
                          focus:outline-none
                          transition-all duration-300 ease-in-out
                          text-blue-400 font-medium hover:text-blue-500 hover:font-semibold border-l-4 border-transparent hover:border-blue-400
                        `}
                        aria-label={`Toggle ${item.name} submenu`}
                        aria-expanded={isDropdownOpen}
                      >
                        <span>{item.name}</span>
                        <ChevronDown
                          size={16}
                          className={`text-blue-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                          aria-hidden="true"
                        />
                      </button>
                      {isDropdownOpen && (
                        <ul className="pl-4 mt-1 space-y-1">
                          {item.dropdown.map((subItem: any) => {
                            // Skip Profile if user is not authenticated
                            if (subItem.requiresAuth && !userId) return null;

                            // Skip Membership if membership subscription is not enabled
                            if (subItem.href === '/membership' && !settings?.isMembershipSubscriptionEnabled) return null;

                            const isSubItemActive = subItem.href === pathname ||
                              (subItem.href === '/membership' && pathname?.startsWith('/membership')) ||
                              (subItem.href === '/#about-us' && typeof window !== 'undefined' && window.location.hash === '#about-us') ||
                              (subItem.href === '/#team-section' && typeof window !== 'undefined' && window.location.hash === '#team-section');

                            return (
                              <li key={subItem.name}>
                                <Link
                                  href={subItem.href}
                                  onClick={(e) => {
                                    // Handle smooth scroll for hash links
                                    if (subItem.href.startsWith('/#')) {
                                      handleSmoothScroll(e, subItem.href);
                                    }
                                    closeMobileMenu();
                                  }}
                                  className={`
                                    block py-3 px-4 min-h-[44px] rounded-xl
                                    font-inter text-sm font-medium tracking-[0.025em]
                                    focus:outline-none
                                    transition-all duration-300 ease-in-out
                                    ${isSubItemActive
                                      ? 'text-blue-500 font-semibold border-l-4 border-blue-400 bg-blue-50'
                                      : 'text-blue-400 font-medium hover:text-blue-500 hover:font-semibold border-l-4 border-transparent hover:border-blue-400'
                                    }
                                  `}
                                  aria-label={`Navigate to ${subItem.name}`}
                                >
                                  {subItem.name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`
                        block py-4 px-4 min-h-[44px] rounded-xl
                        font-inter text-base font-medium tracking-[0.025em]
                        focus:outline-none
                        transition-all duration-300 ease-in-out
                        ${item.active
                          ? 'text-blue-400 font-semibold border-l-4 border-blue-400'
                          : 'text-blue-400 font-medium hover:text-blue-500 hover:font-semibold border-l-4 border-transparent hover:border-blue-400'
                        }
                      `}
                      onClick={(e) => {
                        closeMobileMenu();
                        handleSmoothScroll(e, item.href);
                      }}
                      aria-label={`Navigate to ${item.name}`}
                      aria-current={item.active ? 'page' : undefined}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Mobile Menu Auth Section */}
            <div className="px-6 mt-8 space-y-3">
              {!userId ? (
                <>
                  <Link
                    href="/sign-in"
                    className="
                      block w-full py-4 px-6 min-h-[44px] rounded-xl
                      font-inter font-medium text-base tracking-[0.025em]
                      text-center border-2 border-blue-200 text-blue-600 hover:text-blue-700
                      hover:bg-blue-50 hover:border-blue-300 hover:font-semibold
                      focus:outline-none
                      transition-all duration-300 ease-in-out
                      active:scale-98
                    "
                    onClick={closeMobileMenu}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="
                      block w-full py-4 px-6 min-h-[44px] rounded-xl
                      font-inter font-medium text-base tracking-[0.025em]
                      text-center bg-blue-400 text-white hover:bg-blue-500
                      hover:font-semibold focus:outline-none
                      transition-all duration-300 ease-in-out
                      active:scale-98
                    "
                    onClick={closeMobileMenu}
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      handleSignOut();
                    }}
                    disabled={isSigningOut}
                    className={`
                      flex items-center justify-center space-x-2
                      w-full py-4 px-6 min-h-[44px] rounded-xl
                      font-inter font-medium text-base tracking-[0.025em]
                      border-2
                      focus:outline-none
                      transition-all duration-300 ease-in-out
                      active:scale-98
                      ${isSigningOut
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 hover:font-semibold'
                      }
                    `}
                    aria-label="Sign out"
                  >
                    <LogOut size={18} aria-hidden="true" />
                    <span>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
                  </button>

                  {/* Mobile Admin Menu */}
                  {isAdmin && (
                    <>
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 px-2">
                          Admin Panel
                        </div>
                        {adminSubmenuItems.map(subItem => {
                          const hasDropdown = subItem.dropdown && Array.isArray(subItem.dropdown);
                          const isDropdownOpen = openMobileDropdowns[`admin-${subItem.name}`] || false;

                          if (hasDropdown) {
                            return (
                              <div key={subItem.name}>
                                <button
                                  onClick={() => setOpenMobileDropdowns(prev => ({ ...prev, [`admin-${subItem.name}`]: !prev[`admin-${subItem.name}`] }))}
                                  className="
                                    w-full flex items-center justify-between py-3 px-4 min-h-[44px] rounded-lg
                                    font-inter text-sm font-medium text-blue-400 tracking-[0.025em]
                                    hover:text-blue-500 hover:font-semibold hover:bg-blue-50
                                    focus:outline-none
                                    transition-all duration-300 ease-in-out
                                  "
                                  aria-label={`Toggle ${subItem.name} submenu`}
                                  aria-expanded={isDropdownOpen}
                                >
                                  <span>{subItem.name}</span>
                                  <ChevronDown
                                    size={14}
                                    className={`text-blue-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                    aria-hidden="true"
                                  />
                                </button>
                                {isDropdownOpen && (
                                  <ul className="pl-4 mt-1 space-y-1">
                                    {subItem.dropdown.map((subSubItem: any) => {
                                      const isSubSubItemActive = pathname?.startsWith(subSubItem.href);
                                      return (
                                        <li key={subSubItem.name}>
                                          <Link
                                            href={subSubItem.href}
                                            className={`
                                              block py-2 px-4 min-h-[44px] rounded-lg
                                              font-inter text-xs font-medium tracking-[0.025em]
                                              focus:outline-none
                                              transition-all duration-300 ease-in-out
                                              ${isSubSubItemActive
                                                ? 'text-blue-500 font-semibold bg-blue-50'
                                                : 'text-blue-400 hover:text-blue-500 hover:font-semibold hover:bg-blue-50'
                                              }
                                            `}
                                            onClick={closeMobileMenu}
                                            role="menuitem"
                                            aria-label={`Navigate to ${subSubItem.name}`}
                                          >
                                            {subSubItem.name}
                                          </Link>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </div>
                            );
                          }

                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`
                                block py-3 px-4 min-h-[44px] rounded-lg
                                font-inter text-sm font-medium tracking-[0.025em]
                                focus:outline-none
                                transition-all duration-300 ease-in-out
                                ${pathname?.startsWith(subItem.href)
                                  ? 'text-blue-500 font-semibold bg-blue-50'
                                  : 'text-blue-400 hover:text-blue-500 hover:font-semibold hover:bg-blue-50'
                                }
                              `}
                              onClick={closeMobileMenu}
                              role="menuitem"
                              aria-label={`Navigate to ${subItem.name}`}
                            >
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* UserButton removed with Clerk; consider adding profile avatar here */}
                </>
              )}
            </div>

            {/* Mobile Menu Actions */}
            <div className="px-6 mt-8 space-y-3">
              <button
                className="
                  w-full py-4 px-6 min-h-[44px] rounded-xl
                  font-inter font-medium text-base tracking-[0.025em]
                  border-2 border-gray-200 text-gray-600 hover:text-gray-900
                  hover:bg-gray-50 hover:border-gray-300 hover:font-semibold
                  focus:outline-none
                  transition-all duration-300 ease-in-out
                  active:scale-98 flex items-center justify-center space-x-2
                "
                aria-label="Search"
              >
                <Search size={20} aria-hidden="true" />
                <span>Search</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
