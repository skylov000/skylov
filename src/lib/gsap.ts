'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * GSAP plugins must be registered exactly once, and only in the browser —
 * calling `registerPlugin` during SSR logs a warning and does nothing useful.
 * Every component that needs ScrollTrigger calls this from inside an effect.
 */
let registered = false;

export function registerGsap() {
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

export { gsap, ScrollTrigger };
