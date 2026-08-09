'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

import { gsap, registerGsap } from '@/lib/gsap';
import { scrollTo, setLenis } from '@/lib/lenis';
import { prefersReducedMotion } from '@/lib/utils';

/**
 * Lenis smooth scrolling, driven by the GSAP ticker so that Lenis and
 * ScrollTrigger share a single rAF loop. Two loops means jitter.
 *
 * Skipped entirely when the user prefers reduced motion — native
 * scrolling then applies, and every ScrollTrigger still works.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const { ScrollTrigger } = registerGsap();

    const lenis = new Lenis({
      duration: 1.15,
      // Expo-out: matches the CSS/Framer easing used everywhere else.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      infinite: false,
    });

    setLenis(lenis);

    // Keep ScrollTrigger's cached positions in sync with Lenis.
    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Late-loading fonts and images change the page height.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    const refreshTimer = window.setTimeout(refresh, 800);

    return () => {
      window.removeEventListener('load', refresh);
      window.clearTimeout(refreshTimer);
      gsap.ticker.remove(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // New route → start at the top, without an animated fly-up.
  useEffect(() => {
    scrollTo(0, { immediate: true });
  }, [pathname]);

  return <>{children}</>;
}
