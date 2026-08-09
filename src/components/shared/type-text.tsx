'use client';

import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';

import type { ScrollOffset } from '@/hooks/use-scroll-reveal';
import { cn } from '@/lib/utils';

interface TypeTextProps {
  text: string;
  className?: string;
  /** Okno przewijania, na którym rozkłada się pisanie. */
  offset?: ScrollOffset;
  /** Kolor kursora. Domyślnie neon marki. */
  caretClassName?: string;
}

const DEFAULT_OFFSET: ScrollOffset = ['start end', 'start 58%'];

/**
 * Tekst „wystukiwany" w miarę przewijania.
 *
 * Znaki pojawiają się kolejno, a między ostatnim widocznym a pierwszym
 * ukrytym miga kursor. Ponieważ postęp jest funkcją pozycji scrolla,
 * cofnięcie strony „kasuje" tekst — dokładnie tak samo, tyle że wstecz.
 *
 * Dwie decyzje wydajnościowe:
 *
 * 1. Wszystkie znaki są w DOM od początku i sterujemy tylko ich
 *    przezroczystością. Doklejanie znaków do `textContent` zmieniałoby
 *    szerokość bloku co klatkę i wywoływało przeliczanie układu.
 * 2. Znaki zostają elementami `inline` (nie `inline-block`) — inline-block
 *    tworzyłby nowe miejsca łamania i wyrazy dzieliłyby się w środku.
 */
export function TypeText({
  text,
  className,
  offset = DEFAULT_OFFSET,
  caretClassName,
}: TypeTextProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset });
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 32,
    mass: 0.4,
    restDelta: 0.001,
  });

  if (reduce) {
    return <span className={className}>{text}</span>;
  }

  const chars = Array.from(text);

  return (
    <span ref={ref} className={cn('inline', className)}>
      {/* Czytnik ekranu dostaje gotowy tekst, nie strumień liter. */}
      <span className="sr-only">{text}</span>

      <span aria-hidden="true">
        {chars.map((char, index) => (
          <TypedChar
            key={index}
            char={char}
            index={index}
            total={chars.length}
            progress={progress}
            caretClassName={caretClassName}
          />
        ))}
      </span>
    </span>
  );
}

function TypedChar({
  char,
  index,
  total,
  progress,
  caretClassName,
}: {
  char: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  caretClassName?: string;
}) {
  // Ostatnie 8% okna zostawiamy na dopisanie ogona, żeby kursor
  // nie zatrzymywał się w pół słowa na samym końcu.
  const head = useTransform(progress, (value) => (value / 0.92) * total);

  const opacity = useTransform(head, (value) => (value > index ? 1 : 0));
  const caretOpacity = useTransform(head, (value) =>
    value > index && value <= index + 1 ? 1 : 0
  );

  return (
    <span className="relative">
      <motion.span style={{ opacity }}>{char}</motion.span>
      <motion.span
        className={cn(
          'pointer-events-none absolute -right-[1px] top-[0.14em] h-[1.05em] w-[2px] bg-neon-violet',
          caretClassName
        )}
        style={{ opacity: caretOpacity }}
      />
    </span>
  );
}
