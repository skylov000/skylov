'use client';

import { MotionConfig } from 'framer-motion';

/**
 * Global motion policy.
 *
 * `reducedMotion="user"` makes every Framer Motion animation in the tree
 * respect the OS setting: transform and layout animations snap straight to
 * their end value, while opacity still cross-fades (which the WCAG guidance
 * treats as safe). That covers components that do not check the media query
 * themselves — the navbar, gallery tiles, carousel and page transitions.
 *
 * Components with bespoke reduced-motion branches (Reveal, AnimatedText,
 * ParallaxImage) still short-circuit earlier and render nothing at all.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
