import type { Transition, Variants } from 'framer-motion';

/**
 * Shared motion language.
 *
 * One easing curve and three durations across the whole site — that
 * consistency is most of what makes motion read as "expensive".
 */

/** Expo-out. Fast start, long tail. The house curve. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
/** Symmetric expo. Used for things that leave and come back. */
export const EASE_IN_OUT_EXPO = [0.87, 0, 0.13, 1] as const;
/** iOS-flavoured swift-out, for small UI. */
export const EASE_SWIFT = [0.32, 0.72, 0, 1] as const;

export const DURATION = {
  fast: 0.4,
  base: 0.8,
  slow: 1.2,
  cinematic: 1.6,
} as const;

export const baseTransition: Transition = {
  duration: DURATION.base,
  ease: EASE_OUT_EXPO,
};

/** Default viewport config — fires a little before the element is centred. */
export const viewportOnce = { once: true, margin: '-12% 0px -12% 0px' } as const;

/* ---------------------------------------------------------------- */
/*  Container / stagger                                              */
/* ---------------------------------------------------------------- */

export const staggerContainer = (stagger = 0.08, delay = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

/* ---------------------------------------------------------------- */
/*  Primitives                                                       */
/* ---------------------------------------------------------------- */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: baseTransition },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO } },
};

/** Fade + de-blur. The signature entrance for headings and images. */
export const blurUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(12px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO },
  },
};

/** Mask reveal — pair with a parent that has `overflow: hidden`. */
export const maskLine: Variants = {
  hidden: { y: '110%' },
  visible: {
    y: '0%',
    transition: { duration: DURATION.cinematic, ease: EASE_OUT_EXPO },
  },
};

/** Image inside a clipping wrapper: scales down as the mask opens. */
export const imageReveal: Variants = {
  hidden: { scale: 1.35 },
  visible: {
    scale: 1,
    transition: { duration: 1.8, ease: EASE_OUT_EXPO },
  },
};

export const clipReveal: Variants = {
  hidden: { clipPath: 'inset(0% 0% 100% 0%)' },
  visible: {
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: { duration: DURATION.cinematic, ease: EASE_OUT_EXPO },
  },
};

/* ---------------------------------------------------------------- */
/*  Page + overlay transitions                                       */
/* ---------------------------------------------------------------- */

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.35, ease: EASE_SWIFT },
  },
};

export const overlayPanel: Variants = {
  hidden: { clipPath: 'inset(0% 0% 100% 0%)' },
  visible: {
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: { duration: 0.75, ease: EASE_IN_OUT_EXPO },
  },
  exit: {
    clipPath: 'inset(100% 0% 0% 0%)',
    transition: { duration: 0.6, ease: EASE_IN_OUT_EXPO },
  },
};

/** Turns any variant set into a no-op. Used when reduced motion is on. */
export const staticVariants: Variants = {
  hidden: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', clipPath: 'inset(0% 0% 0% 0%)' },
  visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', clipPath: 'inset(0% 0% 0% 0%)' },
};
