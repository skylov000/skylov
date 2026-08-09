'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

import { scrollTo, setLenis } from '@/lib/lenis';
import { prefersReducedMotion } from '@/lib/utils';

/**
 * Płynne przewijanie na Lenisie.
 *
 * Pętla to zwykły `requestAnimationFrame`. Wcześniej napędzał ją ticker
 * GSAP-a, bo współdzielił zegar ze ScrollTriggerem — ale po przejściu
 * odsłon na Framer Motion nie został ani jeden ScrollTrigger, a sam GSAP
 * dokładał ~45 KiB skryptu wyłącznie po to, żeby wołać jedną funkcję
 * co klatkę.
 *
 * Przy `prefers-reduced-motion` nie uruchamiamy Lenisa wcale — obowiązuje
 * wtedy natywne przewijanie.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.15,
      // Expo-out: ta sama krzywa co w CSS-ie i w Framer Motion.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      infinite: false,
    });

    setLenis(lenis);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Nowa trasa → start od góry, bez animowanego przelotu.
  useEffect(() => {
    scrollTo(0, { immediate: true });
  }, [pathname]);

  return <>{children}</>;
}
