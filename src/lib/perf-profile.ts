/**
 * Profil wydajnościowy urządzenia.
 *
 * Jedno miejsce, w którym decydujemy „ile wolno tej przeglądarce".
 * Wynik liczy skrypt wstawiony w `<head>` (patrz `PERF_PROBE_SCRIPT`),
 * więc jest znany **przed pierwszym malowaniem** — atrybuty `data-perf`
 * i `data-video` na `<html>` pozwalają CSS-owi zdjąć kosztowne efekty,
 * zanim cokolwiek się narysuje. Bez tego przy pierwszej klatce lecą
 * pełne rozmycia, a dopiero po hydratacji je gasimy — czyli dokładnie
 * ten skok, którego chcemy uniknąć.
 *
 * Komponenty czytają ten sam wynik przez `useSyncExternalStore`
 * (patrz `hooks/use-perf-profile.ts`).
 */

/** Który wariant materiału hero ma pobrać przeglądarka. */
export type VideoTier =
  /** Pełne 1080p — mocny sprzęt na dobrym łączu. */
  | 'full'
  /** 480p z gęstymi klatkami kluczowymi — telefony i słabsze komputery. */
  | 'mobile'
  /** Wcale — zostaje plakat. Wolne łącze, oszczędzanie danych, mniej ruchu. */
  | 'off';

export interface PerfProfile {
  /**
   * Ogranicz kosztowne efekty: pełnoekranowe rozmycia, `backdrop-filter`,
   * tryby mieszania, animacje w nieskończonej pętli, filtry na odsłonach.
   */
  lite: boolean;
  /** Wariant wideo hero. */
  video: VideoTier;
  /** Użytkownik prosi o mniej ruchu. */
  reduced: boolean;
  /** Ekran dotykowy — brak kursora, brak hoveru. */
  touch: boolean;
  /**
   * Czy to już odczyt z prawdziwego urządzenia, czy jeszcze migawka z SSR.
   *
   * Ma znaczenie wszędzie tam, gdzie decyzja jest NIEODWRACALNA — a więc
   * przede wszystkim przy pobieraniu plików. Podczas hydratacji React
   * renderuje najpierw migawkę serwerową i dopiero potem podmienia ją na
   * stan klienta; efekt z tego pierwszego przebiegu zdąży się wykonać.
   * Bez tej flagi zaczynaliśmy ściągać wersję 1080p, po czym przerywaliśmy
   * ją i zaczynali od nowa właściwą — czyli dokładnie to marnowanie łącza,
   * którego chcemy uniknąć.
   */
  resolved: boolean;
}

/** Domyślny profil dla SSR: zakładamy pełne możliwości. */
export const FULL_PROFILE: PerfProfile = {
  lite: false,
  video: 'full',
  reduced: false,
  touch: false,
  resolved: false,
};

interface PerfWindow extends Window {
  __SKYLOV_PERF__?: PerfProfile;
}

/**
 * Skrypt wstrzykiwany do `<head>`.
 *
 * Musi być samodzielny (bez importów) i **synchroniczny** — dlatego jest
 * stringiem, a nie zwykłą funkcją. Świadomie bez `const`/arrow function:
 * leci do przeglądarki dokładnie tak, jak go tu zapiszemy.
 */
export const PERF_PROBE_SCRIPT = `(function(){
try{
var d=document.documentElement,n=navigator;
var c=n.connection||n.mozConnection||n.webkitConnection||{};
var save=c.saveData===true;
var et=c.effectiveType||'';
var verySlow=save||et==='slow-2g'||et==='2g';
var slow=verySlow||et==='3g'||(typeof c.downlink==='number'&&c.downlink>0&&c.downlink<1.6);
var cores=n.hardwareConcurrency||8;
var mem=n.deviceMemory||8;
var coarse=matchMedia('(pointer:coarse)').matches;
var narrow=matchMedia('(max-width:1023px)').matches;
var reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
var weak=cores<=4||mem<=4;
/* Telefon i tablet dostają budżet „lite" nawet z ośmioma rdzeniami:
   pełnoekranowe rozmycie kosztuje tam wielokrotnie więcej niż na
   laptopie z tej samej półki, bo ogranicza je przepustowość GPU. */
var lite=reduced||slow||weak||(coarse&&narrow);
var video=(reduced||verySlow)?'off':((lite||coarse)?'mobile':'full');
d.setAttribute('data-perf',lite?'lite':'full');
d.setAttribute('data-video',video);
window.__SKYLOV_PERF__={lite:lite,video:video,reduced:reduced,touch:coarse,resolved:true};
}catch(e){}
})();`;

let cached: PerfProfile | null = null;

/**
 * Awaryjne wyliczenie profilu, gdy skrypt z `<head>` nie zdążył (albo
 * został zablokowany). Logika jest ta sama, tylko zapisana w TS-ie.
 */
function detect(): PerfProfile {
  if (typeof window === 'undefined') return FULL_PROFILE;

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string; downlink?: number };
    deviceMemory?: number;
  };
  const connection = nav.connection ?? {};

  const verySlow =
    connection.saveData === true ||
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g';
  const slow =
    verySlow ||
    connection.effectiveType === '3g' ||
    (typeof connection.downlink === 'number' &&
      connection.downlink > 0 &&
      connection.downlink < 1.6);

  const weak = (navigator.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
  const touch = window.matchMedia('(pointer: coarse)').matches;
  const narrow = window.matchMedia('(max-width: 1023px)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const lite = reduced || slow || weak || (touch && narrow);
  const video: VideoTier = reduced || verySlow ? 'off' : lite || touch ? 'mobile' : 'full';

  return { lite, video, reduced, touch, resolved: true };
}

/**
 * Bieżący profil. Wynik jest zapamiętany — `useSyncExternalStore`
 * porównuje migawki referencją, więc świeży obiekt przy każdym wywołaniu
 * zapętliłby renderowanie.
 */
export function getPerfProfile(): PerfProfile {
  if (cached) return cached;
  if (typeof window === 'undefined') return FULL_PROFILE;
  cached = (window as PerfWindow).__SKYLOV_PERF__ ?? detect();
  return cached;
}

/** Migawka dla SSR — serwer nie wie nic o urządzeniu. */
export function getServerPerfProfile(): PerfProfile {
  return FULL_PROFILE;
}

/**
 * Profil ustalamy raz na wejście i już go nie zmieniamy: przełączanie
 * jakości w trakcie sesji oznaczałoby ponowne pobranie wideo i przebudowę
 * animacji w locie. Subskrypcja istnieje wyłącznie po to, żeby spełnić
 * kontrakt `useSyncExternalStore`.
 */
export function subscribePerfProfile(): () => void {
  return () => {};
}
