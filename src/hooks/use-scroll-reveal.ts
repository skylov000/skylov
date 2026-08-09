'use client';

import { useRef } from 'react';
import {
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';

/**
 * Typ okna przewijania wyprowadzony wprost z sygnatury `useScroll` —
 * framer trzyma go jako unię literałów, której nie da się zapisać
 * jako zwykłe `[string, string]`.
 */
export type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>['offset'];

/**
 * Domyślne okno odsłony: od wjazdu w dolną krawędź ekranu do chwili,
 * gdy górna krawędź elementu dojdzie do połowy jego wysokości.
 *
 * Połowa ekranu to świadomy wybór. Krótsze okno (np. do 78%) daje
 * zaledwie ~150 px przewijania i animacja „przeskakuje" zamiast płynąć;
 * dłuższe sprawia, że elementy zbyt długo zostają nieczytelne.
 */
const DEFAULT_OFFSET: ScrollOffset = ['start end', 'start 50%'];

/** Największe możliwe opóźnienie kaskady i długość okna pojedynczego elementu. */
const MAX_STAGGER_OFFSET = 0.34;
const ITEM_SPAN = 0.62;

export interface ScrollRevealOptions {
  /** Pozycja w grupie — przesuwa okno, dając kaskadę. */
  index?: number;
  /** Ile okna zabiera jeden krok kaskady. */
  stagger?: number;
  /** Dystans wjazdu w px. */
  y?: number;
  /** Wjazd z boku w px. Dodatnie = z prawej. */
  x?: number;
  /** Rozmycie startowe w px. */
  blur?: number;
  /** Skala startowa. 1 = bez skalowania. */
  scale?: number;
  /** Obrót startowy wokół osi X w stopniach — daje wrażenie głębi. */
  rotateX?: number;
  /**
   * Okno przewijania. Domyślne kończy się, zanim element dojedzie
   * do środka ekranu; elementy przy samym dole strony (stopka) mogą
   * nigdy tam nie dotrzeć, więc dostają własne, krótsze okno.
   */
  offset?: ScrollOffset;
}

export interface ScrollRevealResult<T extends HTMLElement = HTMLDivElement> {
  ref: React.RefObject<T | null>;
  /** Postęp odsłony 0–1 — przydatny, gdy chcesz sterować czymś jeszcze. */
  progress: MotionValue<number>;
  style: Record<string, MotionValue<number> | MotionValue<string>> | undefined;
  /** `false` przy `prefers-reduced-motion` — wtedy renderuj statycznie. */
  enabled: boolean;
}

/**
 * Odsłona sterowana pozycją przewijania, a nie zegarem.
 *
 * To jest cała różnica względem `whileInView`: animacja jest **funkcją
 * pozycji scrolla**, więc przewijanie w górę odtwarza ją wstecz, klatka
 * w klatkę, bez żadnej dodatkowej logiki. Zatrzymanie w połowie zostawia
 * element w połowie odsłonięty.
 *
 * Sprężyna na wejściu wygładza surowy scrub i dokłada lekką bezwładność —
 * stąd wrażenie masy zamiast sztywnego przypięcia do paska przewijania.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  index = 0,
  stagger = 0.07,
  y = 40,
  x = 0,
  blur = 10,
  scale = 1,
  rotateX = 0,
  offset = DEFAULT_OFFSET,
}: ScrollRevealOptions = {}): ScrollRevealResult<T> {
  const ref = useRef<T | null>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset });

  const eased = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.35,
    restDelta: 0.001,
  });

  /*
   * Okno pojedynczego elementu jest krótsze niż całe okno grupy i przesunięte
   * o jego pozycję. Ograniczenie przesunięcia gwarantuje, że nawet ostatni
   * element w kaskadzie zdąży dojść do końca, zanim postęp osiągnie 1.
   */
  const start = Math.min(index * stagger, MAX_STAGGER_OFFSET);
  const progress = useTransform(eased, [start, start + ITEM_SPAN], [0, 1], { clamp: true });

  const opacity = useTransform(progress, [0, 0.85], [0, 1], { clamp: true });
  const yValue = useTransform(progress, [0, 1], [y, 0]);
  const xValue = useTransform(progress, [0, 1], [x, 0]);
  const scaleValue = useTransform(progress, [0, 1], [scale, 1]);
  const rotateXValue = useTransform(progress, [0, 1], [rotateX, 0]);
  const filter = useTransform(progress, (value) =>
    // Rozmycie jest drogie — poniżej progu zdejmujemy filtr całkowicie,
    // zamiast zostawiać `blur(0px)`, które nadal rastruje warstwę.
    value > 0.985 ? 'none' : `blur(${((1 - value) * blur).toFixed(2)}px)`
  );

  if (reduce) {
    return { ref, progress, style: undefined, enabled: false };
  }

  const style: Record<string, MotionValue<number> | MotionValue<string>> = { opacity };
  if (y !== 0) style.y = yValue;
  if (x !== 0) style.x = xValue;
  if (scale !== 1) style.scale = scaleValue;
  if (rotateX !== 0) style.rotateX = rotateXValue;
  if (blur > 0) style.filter = filter;

  return { ref, progress, style, enabled: true };
}
