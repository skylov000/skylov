'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

import { useScrollReveal, type ScrollRevealOptions } from '@/hooks/use-scroll-reveal';

interface RevealProps extends ScrollRevealOptions {
  children: ReactNode;
  className?: string;
}

/**
 * Odsłona sterowana przewijaniem.
 *
 * Animacja jest funkcją pozycji scrolla, więc przewijanie w górę odtwarza
 * ją wstecz — bez osobnej logiki i bez „przeskoków" na granicy widoku.
 *
 * Przy `prefers-reduced-motion` renderuje zwykły element, bez transformacji.
 */
export function Reveal({ children, className, ...options }: RevealProps) {
  const { ref, style, enabled } = useScrollReveal(options);

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} className={className} style={style}>
      {children}
    </motion.div>
  );
}

/**
 * Kontener kaskady.
 *
 * Nie animuje niczego sam — jest tylko układem. Kaskadę robią dzieci,
 * przekazując swój `index` do `Reveal`; dzięki temu każdy element ma
 * własne okno przewijania i pozostaje odwracalny.
 */
export function RevealGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
