/**
 * Miniaturowy magazyn postępu wczytywania wideo hero.
 *
 * Ekran powitalny i sekcja hero żyją w różnych gałęziach drzewa Reacta,
 * a wiadomość idzie tylko w jedną stronę i zmienia się wiele razy
 * na sekundę. Kontekst wymuszałby przerenderowanie całej gałęzi przy
 * każdej zmianie — stąd zewnętrzny magazyn z subskrypcją, jak przy Lenisie.
 */

export interface MediaProgressState {
  /** Udział materiału w buforze, 0–1. */
  progress: number;
  /** Czy wideo nadaje się już do przewijania bez dociągania. */
  ready: boolean;
}

const initial: MediaProgressState = { progress: 0, ready: false };

let state: MediaProgressState = initial;
const listeners = new Set<() => void>();

export function setMediaProgress(next: Partial<MediaProgressState>) {
  const merged = { ...state, ...next };
  // Bez tego porównania każde zdarzenie `progress` budziłoby subskrybentów,
  // nawet gdy licznik nie drgnął.
  if (merged.progress === state.progress && merged.ready === state.ready) return;
  state = merged;
  listeners.forEach((listener) => listener());
}

/** Oznacza materiał jako gotowy — gdy nie ma czego wczytywać. */
export function markMediaReady() {
  setMediaProgress({ progress: 1, ready: true });
}

export function getMediaProgress(): MediaProgressState {
  return state;
}

/** Migawka dla SSR — na serwerze nic się jeszcze nie wczytało. */
export function getServerMediaProgress(): MediaProgressState {
  return initial;
}

export function subscribeMediaProgress(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
