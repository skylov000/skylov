'use client';

import { useSyncExternalStore } from 'react';

import {
  getPerfProfile,
  getServerPerfProfile,
  subscribePerfProfile,
  type PerfProfile,
} from '@/lib/perf-profile';

/**
 * Profil wydajnościowy urządzenia — jeden wynik na całą sesję.
 *
 * Podczas SSR i pierwszego renderu po hydratacji zwraca pełne możliwości,
 * a zaraz po niej faktyczny odczyt. Dlatego komponenty muszą degradować
 * się **w dół** (najpierw bogato, potem oszczędnie), a nie odwrotnie —
 * inaczej na słabym sprzęcie mignąłby efekt, który chcemy wyciąć.
 *
 * Wersje czysto wizualne (rozmycia, animacje w pętli) są zdejmowane
 * w CSS przez `[data-perf='lite']`, czyli jeszcze przed pierwszą klatką.
 */
export function usePerfProfile(): PerfProfile {
  return useSyncExternalStore(subscribePerfProfile, getPerfProfile, getServerPerfProfile);
}

/** Skrót: `true`, gdy trzeba oszczędzać GPU. */
export function useLiteMode(): boolean {
  return usePerfProfile().lite;
}
