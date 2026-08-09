/**
 * Rejestr elementu wideo hero i jego „rozgrzewanie".
 *
 * iOS nie dekoduje wideo, dopóki nie zostanie ono choć raz odtworzone
 * w odpowiedzi na gest użytkownika. Bez tego ustawianie `currentTime`
 * nie rysuje niczego — element zostaje czarny, mimo że plik jest wczytany
 * i `readyState` wygląda poprawnie.
 *
 * Kluczowa kolejność: rozgrzanie ma sens dopiero wtedy, gdy element **ma
 * już źródło**. Wcześniejsza wersja próbowała przy pierwszym dotknięciu
 * ekranu, czyli zanim materiał został pobrany — `play()` odrzucał
 * obietnicę, wyjątek był połykany, a nasłuch rejestrowano z `once: true`,
 * więc druga szansa nigdy nie nadchodziła.
 */

let element: HTMLVideoElement | null = null;
let primed = false;

export function registerHeroVideo(video: HTMLVideoElement | null) {
  element = video;
}

export function isHeroVideoPrimed() {
  return primed;
}

/**
 * Odtwarza i natychmiast zatrzymuje wideo, żeby wymusić dekodowanie.
 * Wywołuj z procedury obsługi gestu użytkownika — inaczej przeglądarka
 * odrzuci odtwarzanie.
 */
export async function primeHeroVideo(): Promise<boolean> {
  if (primed) return true;

  const video = element;
  // Brak źródła oznacza, że materiał jeszcze nie dojechał; próba teraz
  // tylko zmarnowałaby gest.
  if (!video || !video.currentSrc) return false;

  try {
    await video.play();
    video.pause();
    primed = true;
    return true;
  } catch {
    return false;
  }
}
