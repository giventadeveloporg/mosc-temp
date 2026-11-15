'use client';

/**
 * Layout requires a default-export Header. The previous module was empty, which
 * made every public route 500 (`Element type is invalid ... got: object`).
 * Keep a valid no-op until the product header is restored.
 */
export default function Header(_props: {
  hideMenuItems?: boolean;
  isTenantAdmin?: boolean;
}) {
  return null;
}
