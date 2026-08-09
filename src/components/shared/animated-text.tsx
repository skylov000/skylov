'use client';

import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from 'framer-motion';

import { usePerfProfile } from '@/hooks/use-perf-profile';
import type { ScrollOffset } from '@/hooks/use-scroll-reveal';
import { EASE_OUT_EXPO } from '@/lib/animations';
import { cn } from '@/lib/utils';

type SplitMode = 'lines' | 'words' | 'chars';

/** Okno na tyle długie, żeby fragmenty zdążyły wyjechać po kolei. */
const DEFAULT_OFFSET: ScrollOffset = ['start end', 'start 55%'];

interface AnimatedTextProps {
  /** Pojedynczy tekst albo jedna pozycja na linię. */
  text: string | string[];
  /** Ziarnistość odsłony. `chars` jest najdroższy — tylko krótkie napisy. */
  mode?: SplitMode;
  /**
   * Pomiń, żeby animacja była sterowana przewijaniem (i odwracalna).
   * Podaj boolean, żeby odpalić ją czasem — do ekranów bez scrolla.
   */
  play?: boolean;
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  /**
   * Okno przewijania. Elementy przy samym dole dokumentu (stopka) nigdy
   * nie dojadą do środka ekranu i potrzebują własnego, krótszego.
   */
  offset?: ScrollOffset;
}

/**
 * Rozbija tekst na fragmenty, zwracając spacje jako osobne pozycje.
 *
 * To nie jest kosmetyka: spacja doklejona do wyrazu wewnątrz
 * `inline-block` z `overflow: hidden` jest przez przeglądarkę usuwana
 * i wyrazy sklejają się w „Maszpomysł?". Spacje muszą zostać poza maską.
 */
function splitLine(line: string, mode: SplitMode): string[] {
  if (mode === 'lines') return [line];

  if (mode === 'words') {
    const pieces: string[] = [];
    const words = line.split(' ');
    words.forEach((word, index) => {
      pieces.push(word);
      if (index < words.length - 1) pieces.push(' ');
    });
    return pieces;
  }

  return Array.from(line);
}

/**
 * Odsłona tekstu spod maski.
 *
 * Każdy fragment siedzi w kontenerze z `overflow: hidden` i wyjeżdża
 * spod linii bazowej. Pełny tekst trafia do czytników przez `sr-only`,
 * a ruchome fragmenty są `aria-hidden` — czytnik nigdy nie przeczyta
 * „C e n n i k".
 */
export function AnimatedText({
  text,
  mode = 'lines',
  play,
  className,
  lineClassName,
  delay = 0,
  stagger,
  offset = DEFAULT_OFFSET,
}: AnimatedTextProps) {
  const reduce = useReducedMotion();
  const { lite } = usePerfProfile();
  const ref = useRef<HTMLSpanElement>(null);

  const lines = Array.isArray(text) ? text : [text];
  const label = lines.join(' ');

  /*
   * Na słabszym sprzęcie kaskada schodzi z poziomu słów na poziom linii.
   *
   * Ziarnistość jest tu jedynym pokrętłem kosztu: każdy fragment to
   * własne okno przewijania i trzy przeliczane wartości. Nagłówek
   * z ośmiu słów to dwadzieścia cztery wartości na klatkę — ten sam
   * nagłówek jako dwie linie to sześć. Ruch pozostaje, znika mrowienie.
   */
  const effectiveMode: SplitMode = lite ? 'lines' : mode;

  const { scrollYProgress } = useScroll({ target: ref, offset });
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.35,
    restDelta: 0.001,
  });

  // Reduced motion: czysty tekst, żadnych opakowań i transformacji.
  if (reduce) {
    return (
      <span className={cn('block', className)}>
        {lines.map((line, index) => (
          <span key={index} className={cn('block', lineClassName)}>
            {line}
          </span>
        ))}
      </span>
    );
  }

  // Kaskada musi być wyraźna — przy dwóch słowach krok 0,06 sprawiał,
  // że oba wjeżdżały praktycznie razem i ruch był nie do zauważenia.
  const step =
    stagger ?? (effectiveMode === 'chars' ? 0.035 : effectiveMode === 'words' ? 0.16 : 0.18);

  /* Wariant sterowany czasem — dla widoków, w których nie ma czego przewijać. */
  if (play !== undefined) {
    const container: Variants = {
      hidden: {},
      visible: { transition: { staggerChildren: step, delayChildren: delay } },
    };
    const fragment: Variants = {
      hidden: { y: '110%' },
      visible: { y: '0%', transition: { duration: 1.1, ease: EASE_OUT_EXPO } },
    };

    return (
      <motion.span
        className={cn('block', className)}
        variants={container}
        initial="hidden"
        animate={play ? 'visible' : 'hidden'}
      >
        <span className="sr-only">{label}</span>
        {lines.map((line, lineIndex) => (
          <span key={lineIndex} className={cn('mask-line block', lineClassName)} aria-hidden="true">
            {splitLine(line, effectiveMode).map((piece, pieceIndex) =>
              piece === ' ' ? (
                <span key={pieceIndex}> </span>
              ) : (
                <motion.span
                  key={pieceIndex}
                  className={effectiveMode === 'lines' ? 'block' : 'inline-block'}
                  variants={fragment}
                >
                  {piece}
                </motion.span>
              )
            )}
          </span>
        ))}
      </motion.span>
    );
  }

  /* Wariant domyślny — sterowany przewijaniem, więc odwracalny. */
  let fragmentIndex = -1;

  return (
    <span ref={ref} className={cn('block', className)}>
      <span className="sr-only">{label}</span>

      {lines.map((line, lineIndex) => (
        <span
          key={lineIndex}
          className={cn(effectiveMode === 'lines' ? 'mask-line block' : 'block', lineClassName)}
          aria-hidden="true"
        >
          {splitLine(line, effectiveMode).map((piece, pieceIndex) => {
            // Spacja zostaje zwykłym tekstem, poza maską — wewnątrz
            // `inline-block` z `overflow: hidden` zostałaby usunięta.
            if (piece === ' ') {
              return <span key={pieceIndex}> </span>;
            }

            fragmentIndex += 1;
            return (
              <ScrubFragment
                key={pieceIndex}
                progress={progress}
                index={fragmentIndex}
                step={step}
                block={effectiveMode === 'lines'}
                masked={effectiveMode !== 'lines'}
              >
                {piece}
              </ScrubFragment>
            );
          })}
        </span>
      ))}
    </span>
  );
}

/**
 * Pojedynczy fragment tekstu z własnym oknem przewijania.
 *
 * Przesunięcie okna jest ograniczone, żeby nawet ostatni znak zdążył
 * dojechać, zanim postęp osiągnie 1.
 */
function ScrubFragment({
  progress,
  index,
  step,
  block,
  masked,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  step: number;
  block: boolean;
  masked: boolean;
  children: React.ReactNode;
}) {
  const start = Math.min(index * step, 0.42);
  const local = useTransform(progress, [start, start + 0.55], [0, 1], { clamp: true });

  const y = useTransform(local, [0, 1], ['115%', '0%']);
  const opacity = useTransform(local, [0, 0.4], [0, 1], { clamp: true });
  const scale = useTransform(local, [0, 1], [0.86, 1]);

  /*
   * Tylko transformacje 2D — świadomie żadnego `rotateX` ani perspektywy.
   *
   * Nagłówki używają gradientu przez `background-clip: text`: tło siedzi
   * na `<h2>`, a litery są przezroczyste. Transformacja 3D wypycha
   * fragment na własną warstwę kompozycyjną i tło rodzica przestaje
   * przez niego przechodzić — napis znika bez śladu w stylach.
   */
  const inner = (
    <motion.span
      className={block ? 'block' : 'inline-block'}
      style={{ y, opacity, scale }}
    >
      {children}
    </motion.span>
  );

  // W trybie słów/znaków maska musi obejmować pojedynczy fragment,
  // inaczej wystające sąsiedztwo psuje efekt wyjeżdżania spod linii.
  return masked ? <span className="mask-line inline-block">{inner}</span> : inner;
}
