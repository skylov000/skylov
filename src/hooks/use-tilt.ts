'use client';

import { useCallback, useRef, type PointerEvent } from 'react';
import { useMotionValue, useReducedMotion, useSpring, type MotionValue } from 'framer-motion';

import { useIsTouch } from '@/hooks/use-media-query';
import { usePerfProfile } from '@/hooks/use-perf-profile';

interface TiltOptions {
  /** Maksymalne wychylenie w stopniach. */
  max?: number;
  /** Głębia perspektywy w px. Mniej = mocniejszy efekt 3D. */
  perspective?: number;
  /**
   * Referencja do współdzielenia z innym hookiem (np. odsłoną przewijania),
   * gdy oba mają działać na tym samym elemencie.
   */
  ref?: React.RefObject<HTMLDivElement | null>;
}

interface TiltResult {
  ref: React.RefObject<HTMLDivElement | null>;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  perspective: number;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerLeave: () => void;
  enabled: boolean;
}

/**
 * Karta przechylająca się w 3D za kursorem.
 *
 * Pozycja kursora w obrębie elementu mapuje się na obrót wokół osi X i Y,
 * a sprężyna wygładza dojście i powrót. Wartości idą przez MotionValue,
 * więc ruch myszy nie powoduje ani jednego re-renderu Reacta.
 *
 * Wyłączone na dotyku (nie ma kursora), przy `prefers-reduced-motion`
 * i na słabszym sprzęcie.
 *
 * To ostatnie nie jest przesadną ostrożnością: przechył wypycha kartę na
 * własną warstwę 3D (`preserve-3d` plus `translateZ` na jej wnętrzu),
 * a kart z przechyłem jest na stronie kilkanaście — usługi i współprace
 * razem. Każda z nich to dwie sprężyny dobijające do celu jeszcze po
 * zatrzymaniu kursora.
 */
export function useTilt({ max = 9, perspective = 900, ref: externalRef }: TiltOptions = {}): TiltResult {
  const localRef = useRef<HTMLDivElement | null>(null);
  const ref = externalRef ?? localRef;
  const isTouch = useIsTouch();
  const reduce = useReducedMotion();
  const { lite } = usePerfProfile();
  const enabled = !isTouch && !reduce && !lite;

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const spring = { stiffness: 200, damping: 22, mass: 0.6 };
  const rotateX = useSpring(rawX, spring);
  const rotateY = useSpring(rawY, spring);

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const element = ref.current;
      if (!enabled || !element) return;

      const rect = element.getBoundingClientRect();
      // -0.5 … 0.5 względem środka karty
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;

      // Kursor u góry ma odchylić górną krawędź od widza — stąd minus.
      rawX.set(-py * max * 2);
      rawY.set(px * max * 2);
    },
    [enabled, max, rawX, rawY, ref]
  );

  const onPointerLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return { ref, rotateX, rotateY, perspective, onPointerMove, onPointerLeave, enabled };
}
