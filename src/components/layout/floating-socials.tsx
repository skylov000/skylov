'use client';

import { motion } from 'framer-motion';

import { socialLinks } from '@/content/content';
import { EASE_OUT_EXPO } from '@/lib/animations';
import { Icon } from '@/lib/icons';

/**
 * Pionowa listwa social media przy lewej krawędzi, tylko na desktopie.
 *
 * Centrowanie robi rozciągnięcie na całą użyteczną wysokość
 * (`top: 0` … `bottom: var(--player-height)`) plus `justify-center`.
 *
 * Świadomie **nie** ma tu `top: 50%` z `-translate-y-1/2`: Framer
 * animuje `x`, więc sam zapisuje `transform` w stylu inline i zjada
 * klasę translate. Listwa lądowała wtedy o pół swojej wysokości za nisko.
 *
 * Dolna granica uwzględnia zadokowany odtwarzacz — inaczej środek
 * wypadałby poniżej faktycznie widocznego obszaru.
 */
export function FloatingSocials() {
  return (
    <motion.aside
      className="no-print pointer-events-none fixed left-6 z-[80] hidden flex-col items-center justify-center gap-3 xl:flex"
      style={{ top: 0, bottom: 'var(--player-height)' }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 1.2 }}
      aria-label="Social media"
    >
      <span className="mb-2 h-16 w-px bg-border" aria-hidden="true" />

      {socialLinks.map((social) => (
        <a
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={social.label}
          className="group pointer-events-auto relative grid size-10 place-items-center rounded-full border border-transparent text-muted-foreground transition-all duration-500 ease-out-expo hover:border-border hover:text-neon-violet hover:shadow-glow-sm"
        >
          <Icon name={social.icon} className="size-[1.05rem]" />

          <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-full border border-border bg-card px-3 py-1.5 text-[0.625rem] uppercase tracking-[0.14em] text-foreground opacity-0 transition-all duration-500 ease-out-expo group-hover:translate-x-1 group-hover:opacity-100">
            {social.label}
          </span>
        </a>
      ))}

      <span className="mt-2 h-16 w-px bg-border" aria-hidden="true" />
    </motion.aside>
  );
}
