'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  MOSC_REDESIGN_NAV_LINKS,
  MOSC_REDESIGN_QUICK_LINKS,
  MOSC_REDESIGN_SEARCH_DIRECTORY_NAV,
} from './navConfig';
import { ADMINISTRATION_PAGE_CARDS } from './administrationCards';
import {
  CALENDAR_MENU_ITEMS,
  CALENDAR_QUICK_LINK_LABEL,
  isCalendarNavActive,
} from './calendarNav';

const ADMINISTRATION_NAV_LABEL = 'Administration';
const ADMINISTRATION_BASE_HREF = '/mosc-redesign/administration';
const ADMIN_MENU_CLOSE_MS = 200;
const CALENDAR_MENU_CLOSE_MS = 200;
const SEARCH_DIRECTORY_ICON_SIZE = 24;

function normalizePath(p: string | null): string {
  if (!p) return '';
  if (p.length > 1 && p.endsWith('/')) return p.slice(0, -1);
  return p;
}

/** Top nav item is active: Home only on exact `/mosc-redesign`; others on exact or nested path under `href`. */
function isTopNavActive(pathname: string, navHref: string): boolean {
  if (navHref === '/mosc-redesign') {
    return pathname === '/mosc-redesign';
  }
  return pathname === navHref || pathname.startsWith(`${navHref}/`);
}

type AdminMenuPos = { top: number; left: number };

export default function MoscRedesignHeader() {
  const pathname = normalizePath(usePathname());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  /** Top edge (px) of fixed mobile menu panel — bottom of logo row; measured so menu scroll is independent of body. */
  const [mobileMenuTopPx, setMobileMenuTopPx] = useState(0);

  const adminNavActive = isTopNavActive(pathname, ADMINISTRATION_BASE_HREF);

  const adminTriggerRef = useRef<HTMLDivElement>(null);
  const calendarTriggerRef = useRef<HTMLDivElement>(null);
  const mobileHeaderChromeRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const calendarCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  /** Desktop: portal menu (escapes html overflow:hidden on .syro-layout pages). */
  const [adminMenu, setAdminMenu] = useState<(AdminMenuPos & { open: true }) | null>(null);
  const [calendarMenu, setCalendarMenu] = useState<(AdminMenuPos & { open: true }) | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const fn = () => setIsDesktop(mq.matches);
    fn();
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  const cancelCloseAdminMenu = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const updateAdminMenuPosition = useCallback(() => {
    if (!adminTriggerRef.current) return;
    const r = adminTriggerRef.current.getBoundingClientRect();
    setAdminMenu((m) =>
      m?.open ? { open: true, top: r.bottom + 4, left: r.left } : m
    );
  }, []);

  const scheduleCloseAdminMenu = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setAdminMenu(null);
      closeTimerRef.current = null;
    }, ADMIN_MENU_CLOSE_MS);
  }, []);

  const openAdminDesktopMenu = useCallback(() => {
    if (!isDesktop || !adminTriggerRef.current) return;
    cancelCloseAdminMenu();
    const r = adminTriggerRef.current.getBoundingClientRect();
    setAdminMenu({ open: true, top: r.bottom + 4, left: r.left });
  }, [isDesktop, cancelCloseAdminMenu]);

  const cancelCloseCalendarMenu = useCallback(() => {
    if (calendarCloseTimerRef.current) {
      clearTimeout(calendarCloseTimerRef.current);
      calendarCloseTimerRef.current = null;
    }
  }, []);

  const updateCalendarMenuPosition = useCallback(() => {
    if (!calendarTriggerRef.current) return;
    const r = calendarTriggerRef.current.getBoundingClientRect();
    setCalendarMenu((m) =>
      m?.open ? { open: true, top: r.bottom + 4, left: r.left } : m
    );
  }, []);

  const scheduleCloseCalendarMenu = useCallback(() => {
    if (calendarCloseTimerRef.current) clearTimeout(calendarCloseTimerRef.current);
    calendarCloseTimerRef.current = setTimeout(() => {
      setCalendarMenu(null);
      calendarCloseTimerRef.current = null;
    }, CALENDAR_MENU_CLOSE_MS);
  }, []);

  const openCalendarDesktopMenu = useCallback(() => {
    if (!isDesktop || !calendarTriggerRef.current) return;
    cancelCloseCalendarMenu();
    const r = calendarTriggerRef.current.getBoundingClientRect();
    setCalendarMenu({ open: true, top: r.bottom + 4, left: r.left });
  }, [isDesktop, cancelCloseCalendarMenu]);

  useEffect(() => {
    if (!adminMenu?.open) return;
    const onScrollOrResize = () => updateAdminMenuPosition();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [adminMenu?.open, updateAdminMenuPosition]);

  useEffect(() => {
    if (!calendarMenu?.open) return;
    const onScrollOrResize = () => updateCalendarMenuPosition();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [calendarMenu?.open, updateCalendarMenuPosition]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (calendarCloseTimerRef.current) clearTimeout(calendarCloseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setAdminMenu(null);
    setCalendarMenu(null);
  }, [pathname]);

  useLayoutEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const measure = () => {
      const el = mobileHeaderChromeRef.current;
      setMobileMenuTopPx(el ? Math.ceil(el.getBoundingClientRect().bottom) : 64);
    };
    measure();
    window.addEventListener('resize', measure);
    const vv = window.visualViewport;
    vv?.addEventListener('resize', measure);
    vv?.addEventListener('scroll', measure);
    return () => {
      window.removeEventListener('resize', measure);
      vv?.removeEventListener('resize', measure);
      vv?.removeEventListener('scroll', measure);
    };
  }, [mobileMenuOpen]);

  /** Lock document scroll while mobile nav is open so the menu panel can scroll independently. */
  useEffect(() => {
    if (!mobileMenuOpen || isDesktop) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileMenuOpen, isDesktop]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (isDesktop && mobileMenuOpen) setMobileMenuOpen(false);
  }, [isDesktop, mobileMenuOpen]);

  const adminMenuOpen = !!adminMenu?.open;
  const adminHoverOrOpen = adminNavActive || adminMenuOpen;
  const calendarNavActive = isCalendarNavActive(pathname);
  const calendarMenuOpen = !!calendarMenu?.open;
  const calendarHoverOrOpen = calendarNavActive || calendarMenuOpen;
  const searchDirectoryActive = isTopNavActive(pathname, MOSC_REDESIGN_SEARCH_DIRECTORY_NAV.href);

  const calendarDropdownPanel = (
    <ul className="py-1.5">
      {CALENDAR_MENU_ITEMS.map((item) => {
        const subActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href} role="none">
            <Link
              href={item.href}
              role="menuitem"
              aria-current={subActive ? 'page' : undefined}
              className={`block px-3 py-2 text-[11px] transition-colors no-underline visited:no-underline whitespace-nowrap ${
                subActive
                  ? 'text-warmGold visited:text-warmGold bg-white/15 font-semibold'
                  : 'text-white/95 visited:text-white/95 hover:text-warmGold hover:bg-white/10'
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const adminDropdownPanel = (
    <ul className="py-1.5">
      {ADMINISTRATION_PAGE_CARDS.map((card) => {
        const subActive = pathname === card.href;
        return (
          <li key={card.href} role="none">
            <Link
              href={card.href}
              role="menuitem"
              aria-current={subActive ? 'page' : undefined}
              className={`block px-3 py-2 text-[11px] transition-colors no-underline visited:no-underline ${
                subActive
                  ? 'text-warmGold visited:text-warmGold bg-white/15 font-semibold'
                  : 'text-white/95 visited:text-white/95 hover:text-warmGold hover:bg-white/10'
              }`}
            >
              {card.shortTitle}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <header className="sticky top-0 z-[1000] w-full shrink-0 overflow-visible shadow-md border-b-2 border-burgundy/40">
      {/* Row 1: Logo + hamburger (mobile); part of one sticky block with nav + quick links (desktop) */}
      <div ref={mobileHeaderChromeRef} className="bg-parchment-deep border-b border-burgundy/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
          <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-4">
            <Link
              href="/mosc-redesign"
              className="group inline-flex min-w-0 max-w-[calc(100%-3rem)] flex-1 items-center sm:max-w-[calc(100%-3.5rem)] lg:max-w-none lg:flex-none"
              aria-label="Malankara Orthodox Syrian Church — Home"
            >
              <Image
                src="/images/logos/Current_Edits/Header%20Logo%20Redesign/Header_3_Bg_removed.png"
                alt=""
                width={800}
                height={200}
                className="h-12 w-auto max-w-full object-contain object-left sm:h-14 md:h-16 lg:h-20"
                priority
                sizes="(max-width: 1023px) min(calc(100vw - 5rem), 480px), 600px"
                style={{ width: 'auto' }}
              />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex-shrink-0 lg:hidden text-burgundy/80 hover:text-burgundy p-2"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Main Nav */}
      <div className="relative z-20 overflow-visible bg-burgundy-dark hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
          <nav className="flex w-full items-center gap-0">
            <div className="flex min-w-0 flex-1 items-center justify-end gap-0">
            {MOSC_REDESIGN_NAV_LINKS.map((link) =>
              link.label === ADMINISTRATION_NAV_LABEL ? (
                <div
                  key={link.label}
                  ref={adminTriggerRef}
                  className="relative"
                  onMouseEnter={openAdminDesktopMenu}
                  onMouseLeave={scheduleCloseAdminMenu}
                >
                  <Link
                    href={link.href}
                    aria-current={adminNavActive ? 'page' : undefined}
                    aria-expanded={adminMenuOpen}
                    className={`relative font-medium text-[13px] px-3 py-[7px] transition-all duration-200 whitespace-nowrap flex items-center gap-0.5 overflow-visible no-underline visited:no-underline ${
                      adminHoverOrOpen
                        ? 'text-white visited:text-white'
                        : 'text-white/95 visited:text-white/95 hover:text-white'
                    }`}
                  >
                    <span
                      className={`absolute inset-0 bg-white/10 transition-transform duration-200 origin-left rounded-sm ${
                        adminHoverOrOpen ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                    <span className="relative z-10">{link.label}</span>
                    <svg
                      className={`relative z-10 w-3 h-3 ${adminHoverOrOpen ? 'opacity-100' : 'opacity-80'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                </div>
              ) : (
                (() => {
                  const navActive = isTopNavActive(pathname, link.href);
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      aria-current={navActive ? 'page' : undefined}
                      className={`relative font-medium text-[13px] px-3 py-[7px] transition-all duration-200 whitespace-nowrap group overflow-hidden no-underline visited:no-underline ${
                        navActive
                          ? 'text-white visited:text-white font-semibold'
                          : 'text-white/95 visited:text-white/95 hover:text-white'
                      }`}
                    >
                      <span
                        className={`absolute inset-0 bg-white/10 transition-transform duration-200 origin-left rounded-sm ${
                          navActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                        }`}
                      />
                      <span className="relative z-10">{link.label}</span>
                    </Link>
                  );
                })()
              )
            )}
            </div>
            <div className="ml-3 flex shrink-0 items-center border-l border-white/25 pl-3">
              <Link
                href={MOSC_REDESIGN_SEARCH_DIRECTORY_NAV.href}
                aria-current={searchDirectoryActive ? 'page' : undefined}
                className={`group relative flex items-center gap-2 whitespace-nowrap px-3 py-[7px] text-[13px] font-medium no-underline visited:no-underline text-white visited:text-white hover:text-white ${
                  searchDirectoryActive ? 'font-semibold' : ''
                }`}
              >
                <span
                  className={`absolute inset-0 rounded-sm bg-white/10 transition-transform duration-200 origin-left ${
                    searchDirectoryActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
                <Search
                  size={SEARCH_DIRECTORY_ICON_SIZE}
                  strokeWidth={2.25}
                  className="relative z-10 shrink-0 text-white"
                  aria-hidden
                />
                <span className="relative z-10">{MOSC_REDESIGN_SEARCH_DIRECTORY_NAV.label}</span>
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {mounted &&
        isDesktop &&
        adminMenu?.open &&
        createPortal(
          <div
            role="menu"
            aria-label="Administration sections"
            className="fixed z-[10000] min-w-[14rem] rounded-md border border-white/20 bg-burgundy-dark shadow-lg max-h-[min(70vh,28rem)] overflow-y-auto"
            style={{ top: adminMenu.top, left: adminMenu.left }}
            onMouseEnter={cancelCloseAdminMenu}
            onMouseLeave={scheduleCloseAdminMenu}
          >
            {adminDropdownPanel}
          </div>,
          document.body
        )}

      {mounted &&
        isDesktop &&
        calendarMenu?.open &&
        createPortal(
          <div
            role="menu"
            aria-label="Calendar sections"
            className="fixed z-[10000] min-w-[14rem] rounded-md border border-white/20 bg-burgundy shadow-lg"
            style={{ top: calendarMenu.top, left: calendarMenu.left }}
            onMouseEnter={cancelCloseCalendarMenu}
            onMouseLeave={scheduleCloseCalendarMenu}
          >
            {calendarDropdownPanel}
          </div>,
          document.body
        )}

      {mobileMenuOpen && (
        <div
          className="fixed inset-x-0 bottom-0 z-[1001] flex min-h-0 flex-col border-t border-burgundy/20 bg-parchment-deep shadow-[0_8px_32px_rgba(61,13,13,0.12)] lg:hidden"
          style={{ top: mobileMenuTopPx || 64 }}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain touch-pan-y py-2">
            <div className="max-w-7xl mx-auto px-4">
            {MOSC_REDESIGN_NAV_LINKS.map((link) =>
              link.label === ADMINISTRATION_NAV_LABEL ? (
                <div key={link.label} className="py-1 border-b border-burgundy/10 last:border-b-0">
                  <Link
                    href={link.href}
                    aria-current={adminNavActive ? 'page' : undefined}
                    className={`block text-xs font-semibold py-2 px-2 rounded transition-all duration-200 no-underline visited:no-underline ${
                      adminNavActive
                        ? 'text-burgundy visited:text-burgundy bg-burgundy/15'
                        : 'text-burgundy-dark visited:text-burgundy-dark hover:text-burgundy hover:bg-burgundy/10'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                  <ul className="mt-1 mb-2 pl-3 border-l-2 border-burgundy/25 space-y-0.5">
                    {ADMINISTRATION_PAGE_CARDS.map((card) => {
                      const subActive = pathname === card.href;
                      return (
                        <li key={card.href}>
                          <Link
                            href={card.href}
                            aria-current={subActive ? 'page' : undefined}
                            className={`block text-[11px] py-1.5 px-2 rounded transition-all duration-200 no-underline visited:no-underline ${
                              subActive
                                ? 'text-burgundy visited:text-burgundy font-semibold bg-burgundy/10'
                                : 'text-burgundy-dark/90 visited:text-burgundy-dark/90 hover:text-burgundy hover:bg-burgundy/10'
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {card.shortTitle}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                (() => {
                  const navActive = isTopNavActive(pathname, link.href);
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      aria-current={navActive ? 'page' : undefined}
                      className={`block text-xs py-2 px-2 rounded transition-all duration-200 no-underline visited:no-underline ${
                        navActive
                          ? 'text-burgundy visited:text-burgundy font-semibold bg-burgundy/15'
                          : 'text-burgundy-dark visited:text-burgundy-dark hover:text-burgundy hover:bg-burgundy/10'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  );
                })()
              )
            )}

            <div className="mt-2 border-t border-burgundy/15 pt-2">
              <Link
                href={MOSC_REDESIGN_SEARCH_DIRECTORY_NAV.href}
                aria-current={searchDirectoryActive ? 'page' : undefined}
                className={`flex items-center gap-2.5 rounded px-2 py-2.5 text-xs font-semibold no-underline visited:no-underline ${
                  searchDirectoryActive
                    ? 'bg-burgundy/15 text-burgundy visited:text-burgundy'
                    : 'text-burgundy-dark visited:text-burgundy-dark hover:bg-burgundy/10 hover:text-burgundy'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Search size={22} strokeWidth={2.25} className="shrink-0" aria-hidden />
                <span>{MOSC_REDESIGN_SEARCH_DIRECTORY_NAV.label}</span>
              </Link>
            </div>

            <div className="mt-3 pt-3 border-t border-burgundy/20">
              <p className="text-[10px] font-bold uppercase tracking-wider text-burgundy/70 px-2 mb-2">Quick links</p>
              <div className="flex flex-col">
                {MOSC_REDESIGN_QUICK_LINKS.map((ql) => {
                  const quickActive = pathname === ql.href || pathname.startsWith(`${ql.href}/`);
                  return (
                    <Link
                      key={ql.label}
                      href={ql.href}
                      aria-current={quickActive ? 'page' : undefined}
                      className={`text-xs py-2 px-2 rounded transition-all duration-200 no-underline visited:no-underline border-b border-burgundy/10 ${
                        quickActive
                          ? 'text-burgundy visited:text-burgundy font-semibold bg-burgundy/15'
                          : 'text-burgundy-dark visited:text-burgundy-dark hover:text-burgundy hover:bg-burgundy/10'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {ql.label}
                    </Link>
                  );
                })}
                <div className="border-b border-burgundy/10 py-1">
                  <p
                    className={`text-xs font-semibold py-2 px-2 ${
                      calendarNavActive ? 'text-burgundy' : 'text-burgundy-dark'
                    }`}
                  >
                    {CALENDAR_QUICK_LINK_LABEL}
                  </p>
                  <ul className="pl-3 border-l-2 border-burgundy/25 space-y-0.5 mb-1">
                    {CALENDAR_MENU_ITEMS.map((item) => {
                      const subActive =
                        pathname === item.href || pathname.startsWith(`${item.href}/`);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            aria-current={subActive ? 'page' : undefined}
                            className={`block text-[11px] py-1.5 px-2 rounded transition-all duration-200 no-underline visited:no-underline ${
                              subActive
                                ? 'text-burgundy visited:text-burgundy font-semibold bg-burgundy/10'
                                : 'text-burgundy-dark/90 visited:text-burgundy-dark/90 hover:text-burgundy hover:bg-burgundy/10'
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Row 3: Quick Links Bar (desktop only — mobile: inside hamburger above) */}
      <div className="relative z-10 bg-burgundy overflow-x-auto border-t border-white/10 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 lg:px-16">
          <div className="flex items-center gap-0 min-w-max justify-end ml-auto">
            {MOSC_REDESIGN_QUICK_LINKS.map((ql) => (
              <Link
                key={ql.label}
                href={ql.href}
                className="relative text-parchment-light visited:text-parchment-light font-semibold text-[12px] px-3 py-2 whitespace-nowrap border-r border-white/10 group overflow-hidden transition-colors duration-200 hover:text-warmGold no-underline visited:no-underline"
              >
                <span className="absolute inset-0 bg-warmBrown scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-bottom" />
                <span className="relative z-10">{ql.label}</span>
              </Link>
            ))}
            <div
              ref={calendarTriggerRef}
              className="relative border-r border-white/10 last:border-r-0"
              onMouseEnter={openCalendarDesktopMenu}
              onMouseLeave={scheduleCloseCalendarMenu}
            >
              <button
                type="button"
                aria-expanded={calendarMenuOpen}
                aria-haspopup="menu"
                className={`relative text-parchment-light font-semibold text-[12px] px-3 py-2 whitespace-nowrap group overflow-hidden transition-colors duration-200 hover:text-warmGold flex items-center gap-0.5 ${
                  calendarHoverOrOpen ? 'text-warmGold' : ''
                }`}
              >
                <span
                  className={`absolute inset-0 bg-warmBrown transition-transform duration-200 origin-bottom ${
                    calendarHoverOrOpen ? 'scale-y-100' : 'scale-y-0 group-hover:scale-y-100'
                  }`}
                />
                <span className="relative z-10">{CALENDAR_QUICK_LINK_LABEL}</span>
                <svg
                  className={`relative z-10 w-3 h-3 ${calendarHoverOrOpen ? 'opacity-100' : 'opacity-80'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
