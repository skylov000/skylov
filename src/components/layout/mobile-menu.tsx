'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { SmartLink } from '@/components/shared/smart-link';
import { navLinks, socialLinks } from '@/content/content';
import { EASE_IN_OUT_EXPO, EASE_OUT_EXPO } from '@/lib/animations';
import { Icon } from '@/lib/icons';
import { startScroll, stopScroll } from '@/lib/lenis';
import { pad } from '@/lib/utils';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Pełnoekranowa nawigacja.
 *
 * Panel wjeżdża maską clip-path, a linki wychodzą kolejno spod własnych
 * masek. Scroll jest zablokowany, Escape zamyka.
 */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (!open) return;

    stopScroll();
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      startScroll();
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          className="grain fixed inset-0 z-[100] flex flex-col justify-between overflow-y-auto bg-background px-gutter pb-32 pt-28"
          initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 0.8, ease: EASE_IN_OUT_EXPO }}
          data-lenis-prevent
        >
          {/* Poświata w tle */}
          <div
            className="pointer-events-none absolute -right-1/4 top-0 size-[80vmin] rounded-full opacity-60 blur-[100px]"
            style={{
              background:
                'radial-gradient(circle, rgba(179,71,255,0.25) 0%, transparent 70%)',
            }}
            aria-hidden="true"
          />

          <nav aria-label="Nawigacja mobilna" className="relative">
            <ul className="flex flex-col">
              {navLinks.map((link, index) => (
                <li key={link.href} className="border-b border-border last:border-b-0">
                  <span className="mask-line block">
                    <motion.span
                      className="block"
                      initial={{ y: '110%', opacity: 0 }}
                      animate={{ y: '0%', opacity: 1 }}
                      exit={{ y: '110%', opacity: 0 }}
                      transition={{
                        duration: 0.9,
                        ease: EASE_OUT_EXPO,
                        delay: 0.22 + index * 0.06,
                      }}
                    >
                      <SmartLink
                        href={link.href}
                        onNavigate={onClose}
                        className="group flex items-baseline gap-5 py-5 font-display text-[clamp(1.85rem,9vw,3.25rem)] font-bold uppercase leading-none tracking-tight transition-colors duration-500 hover:text-neon-violet"
                      >
                        <span className="font-sans text-[0.625rem] tracking-[0.2em] text-neon-violet">
                          {pad(index + 1)}
                        </span>
                        {link.label}
                      </SmartLink>
                    </motion.span>
                  </span>
                </li>
              ))}
            </ul>
          </nav>

          <motion.div
            className="relative mt-12 flex flex-col gap-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.5 }}
          >
            <span className="eyebrow text-muted-foreground">Znajdź mnie</span>

            <ul className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-3 rounded-full border border-border px-5 py-3 text-sm transition-colors duration-500 hover:border-[rgba(179,71,255,0.5)] hover:text-neon-violet"
                    onClick={onClose}
                  >
                    <Icon name={social.icon} className="size-4" />
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
