'use client';

import type { ComponentProps, MouseEvent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { hashFromHref, scrollTo } from '@/lib/lenis';

interface SmartLinkProps extends Omit<ComponentProps<typeof Link>, 'href'> {
  href: string;
  /** Fired on every click — used to close the mobile menu. */
  onNavigate?: () => void;
}

/**
 * `next/link` that understands in-page anchors.
 *
 * When the target section lives on the current route it hands the scroll to
 * Lenis instead of letting the browser jump. Cross-route links behave like
 * a normal prefetched `next/link`.
 */
export function SmartLink({ href, onNavigate, onClick, children, ...props }: SmartLinkProps) {
  const pathname = usePathname();
  const hash = hashFromHref(href);
  const targetPath = href.split('#')[0] || '/';

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    onNavigate?.();

    if (!hash || event.defaultPrevented) return;
    if (targetPath !== pathname) return; // different route: let Next handle it

    event.preventDefault();
    scrollTo(`#${hash}`);
    // Keep the URL shareable without triggering the browser's own jump.
    window.history.replaceState(null, '', `#${hash}`);
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
