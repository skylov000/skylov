'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

import { useIsTouch } from '@/hooks/use-media-query';
import { usePerfProfile } from '@/hooks/use-perf-profile';
import { cn } from '@/lib/utils';

interface MagneticProps {
  children: ReactNode;
  /** 0 = inert, 1 = the element sticks to the cursor. */
  strength?: number;
  /** How far outside the element the field reaches, in px. */
  padding?: number;
  className?: string;
}

/**
 * Magnetic field wrapper. The child drifts toward the pointer while it is
 * inside the element's bounds and springs home on exit.
 *
 * Inert on touch devices — there is no pointer to attract.
 */
export function Magnetic({ children, strength = 0.4, padding = 0, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();
  const { lite } = usePerfProfile();
  // Bez kursora nie ma czego przyciągać, a na słabszym sprzęcie każdy
  // taki przycisk to dodatkowa para sprężyn liczonych w tle.
  const inert = isTouch || lite;

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 260, damping: 20, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (inert || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = event.clientX - (rect.left + rect.width / 2);
    const relY = event.clientY - (rect.top + rect.height / 2);
    x.set(relX * strength);
    y.set(relY * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  if (inert) {
    return <div className={cn('inline-flex', className)}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={cn('inline-flex', className)}
      style={{ x: springX, y: springY, padding }}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      onBlur={reset}
    >
      {children}
    </motion.div>
  );
}
