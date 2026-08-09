'use client';

import { useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';

import { MobileMenu } from '@/components/layout/mobile-menu';
import { CtaButton } from '@/components/shared/cta-button';
import { Logo } from '@/components/shared/logo';
import { SmartLink } from '@/components/shared/smart-link';
import { navLinks, site } from '@/content/content';
import { EASE_OUT_EXPO } from '@/lib/animations';
import { cn } from '@/lib/utils';

/**
 * Przyklejona nawigacja.
 *
 * Trzy stany: przezroczysta na górze, szklana po przewinięciu i ukryta
 * podczas scrollowania w dół (wraca natychmiast po ruchu w górę).
 */
export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(latest > 24);
    if (menuOpen) return; // nigdy nie chowaj przy otwartym menu
    setHidden(latest > previous && latest > 400);
  });

  return (
    <>
      <motion.header
        className={cn(
          'no-print fixed inset-x-0 top-0 z-[110] border-b transition-[background-color,border-color,backdrop-filter] duration-700 ease-out-expo',
          scrolled && !menuOpen ? 'glass border-border' : 'border-transparent bg-transparent'
        )}
        initial={{ y: -100 }}
        animate={{ y: hidden && !menuOpen ? '-100%' : 0 }}
        transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
      >
        <div className="mx-auto flex h-20 w-full max-w-wide items-center justify-between gap-6 px-gutter">
          <SmartLink
            href="/#hero"
            aria-label={`${site.name} — strona główna`}
            className="relative z-10 shrink-0"
          >
            <Logo className="h-6 sm:h-7" priority />
          </SmartLink>

          {/* Nawigacja desktop */}
          <nav aria-label="Główna" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <SmartLink
                    href={link.href}
                    className="relative block rounded-full px-4 py-2.5 text-sm font-light text-muted-foreground transition-colors duration-500 hover:text-foreground"
                  >
                    <span className="link-underline">{link.label}</span>
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <CtaButton
              href="/#kontakt"
              label="Napisz do mnie"
              size="sm"
              variant="outline"
              strength={0.25}
              className="hidden sm:inline-flex"
            />

            {/* Przełącznik menu — dwie kreski składające się w X */}
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Zamknij menu' : 'Otwórz menu'}
              className="relative z-10 grid size-12 place-items-center rounded-full border border-border transition-colors duration-500 hover:bg-hover lg:hidden"
            >
              <span className="relative block h-3 w-5">
                <motion.span
                  className="absolute left-0 block h-px w-full bg-foreground"
                  animate={menuOpen ? { top: 6, rotate: 45 } : { top: 0, rotate: 0 }}
                  transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                />
                <motion.span
                  className="absolute left-0 block h-px w-full bg-foreground"
                  animate={menuOpen ? { top: 6, rotate: -45 } : { top: 12, rotate: 0 }}
                  transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
