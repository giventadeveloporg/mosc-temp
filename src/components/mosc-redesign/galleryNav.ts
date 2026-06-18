/**
 * Gallery quick-link submenu — static MOSC redesign albums vs dynamic API gallery.
 */
export type GalleryMenuItem = {
  label: string;
  href: string;
};

export const GALLERY_QUICK_LINK_LABEL = 'Gallery';

export const GALLERY_MENU_BASE_HREF = '/mosc-redesign/gallery';

export const GALLERY_MENU_ITEMS: GalleryMenuItem[] = [
  {
    label: 'Gallery',
    href: '/mosc-redesign/gallery',
  },
  {
    label: 'Gallery Dynamic',
    href: '/gallery',
  },
];

export function isGalleryNavActive(pathname: string): boolean {
  return GALLERY_MENU_ITEMS.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
}
