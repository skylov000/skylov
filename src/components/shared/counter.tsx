'use client';

import { useEffect, useRef } from 'react';
import { animate, useInView, useMotionValue, useTransform, motion } from 'framer-motion';

import { EASE_OUT_EXPO } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface CounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

/**
 * Number that counts up once, the first time it enters the viewport.
 *
 * Driven by a MotionValue so the digits update per frame without
 * re-rendering the surrounding layout.
 */
export function Counter({
  value,
  suffix = '',
  prefix = '',
  duration = 2.1,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  // `once: true` sprawia, że `inView` przełącza się raz i już zostaje,
  // więc zależności efektu są stabilne i animacja nie jest przerywana.
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });

  const count = useMotionValue(0);
  const display = useTransform(count, (latest) =>
    new Intl.NumberFormat('en-US').format(Math.round(latest))
  );

  useEffect(() => {
    if (!inView) return;

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      count.set(value);
      return;
    }

    /*
     * Świadomie bez strażnika „już poszło" w stanie: `setState` wewnątrz
     * efektu wywoływał re-render, ten zmieniał zależności, a cleanup
     * zatrzymywał animację ułamek sekundy po starcie — licznik zamierał
     * na zerze. Przy `once: true` efekt i tak odpala się raz.
     */
    const controls = animate(count, value, { duration, ease: EASE_OUT_EXPO });
    return () => controls.stop();
  }, [inView, count, value, duration]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {/* Static value for assistive tech and no-JS. */}
      <span className="sr-only">{`${prefix}${value}${suffix}`}</span>
      <span aria-hidden="true">
        {prefix}
        <motion.span>{display}</motion.span>
        {suffix}
      </span>
    </span>
  );
}
