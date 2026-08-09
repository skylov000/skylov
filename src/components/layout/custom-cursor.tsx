'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';

import { useIsTouch } from '@/hooks/use-media-query';
import { EASE_OUT_EXPO } from '@/lib/animations';
import { prefersReducedMotion } from '@/lib/utils';

type CursorMode = 'default' | 'hover' | 'view' | 'drag' | 'hidden';

const LABELS: Record<CursorMode, string> = {
  default: '',
  hover: '',
  view: 'View',
  drag: 'Drag',
  hidden: '',
};

/**
 * Two-part cursor: a small solid dot that tracks the pointer exactly,
 * and a larger ring that lags behind on a spring.
 *
 * Elements opt into states with `data-cursor="view" | "drag" | "hidden"`.
 * Anything focusable gets the hover state automatically.
 *
 * Disabled on touch devices and under reduced-motion.
 */
export function CustomCursor() {
  const isTouch = useIsTouch();
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<CursorMode>('default');
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  const ringX = useSpring(x, { stiffness: 320, damping: 34, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 320, damping: 34, mass: 0.6 });

  useEffect(() => {
    setEnabled(!isTouch && !prefersReducedMotion());
  }, [isTouch]);

  useEffect(() => {
    if (!enabled) {
      document.documentElement.removeAttribute('data-custom-cursor');
      return;
    }

    document.documentElement.setAttribute('data-custom-cursor', 'true');

    const handleMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);

      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        '[data-cursor], a, button, [role="button"], input, textarea, select, label'
      );

      if (!target) {
        setMode('default');
        return;
      }

      const explicit = target.dataset.cursor as CursorMode | undefined;
      setMode(explicit ?? 'hover');
    };

    const handleLeave = () => setVisible(false);
    const handleEnter = () => setVisible(true);

    window.addEventListener('pointermove', handleMove, { passive: true });
    document.addEventListener('pointerleave', handleLeave);
    document.addEventListener('pointerenter', handleEnter);

    return () => {
      document.documentElement.removeAttribute('data-custom-cursor');
      window.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerleave', handleLeave);
      document.removeEventListener('pointerenter', handleEnter);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const label = LABELS[mode];
  const ringSize = mode === 'view' || mode === 'drag' ? 92 : mode === 'hover' ? 54 : 34;

  return (
    <div className="pointer-events-none fixed inset-0 z-[150] hidden lg:block" aria-hidden="true">
      {/* Ring */}
      <motion.div
        className="absolute left-0 top-0 grid place-items-center rounded-full border border-[rgba(255,255,255,0.5)] backdrop-blur-[1px]"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: ringSize,
          height: ringSize,
          opacity: visible && mode !== 'hidden' ? 1 : 0,
          backgroundColor:
            mode === 'view' || mode === 'drag' ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0)',
          borderColor:
            mode === 'view' || mode === 'drag'
              ? 'rgba(255,255,255,1)'
              : 'rgba(255,255,255,0.45)',
        }}
        transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
      >
        <AnimatePresence>
          {label && (
            <motion.span
              key={label}
              className="text-[0.625rem] font-medium uppercase tracking-[0.18em] text-primary-foreground"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.25 }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Dot — hidden when the ring fills, otherwise it reads as a hole. */}
      <motion.div
        className="absolute left-0 top-0 size-1.5 rounded-full bg-foreground"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        animate={{
          opacity: visible && mode !== 'hidden' && mode !== 'view' && mode !== 'drag' ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      />
    </div>
  );
}
