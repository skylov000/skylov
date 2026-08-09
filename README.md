# SKYLOV — Portfolio

Portfolio producenta muzycznego: ciemna, neonowa strona z **wideo w tle przewijanym scrollem**, wbudowanym odtwarzaczem muzyki i pełną ofertą usług.

Zbudowane na **Next.js 15**, **TypeScript**, **TailwindCSS**, **Framer Motion**, **Lenis** i **shadcn/ui**.

Cała treść siedzi w jednym pliku — [`src/content/content.ts`](src/content/content.ts). Żaden komponent nie zawiera zaszytego na sztywno tekstu.

---

## Start

```bash
npm install
```

```bash
npm run dev
```

Otwórz <http://localhost:3000>.

### Komendy

| Komenda | Co robi |
| --- | --- |
| `npm run dev` | Serwer deweloperski na porcie 3000 |
| `npm run build` | Build produkcyjny |
| `npm run start` | Serwuje zbudowaną wersję |
| `npm run lint` | ESLint (reguły Next + TypeScript) |
| `npm run typecheck` | `tsc --noEmit` — pełne sprawdzenie typów |

---

## Jak edytować stronę

### 1. Teksty

Otwórz [`src/content/content.ts`](src/content/content.ts). Plik jest ułożony w tej samej kolejności co strona:

```
site        →  nazwa, opis, domena, słowa kluczowe, obraz OG
brand       →  logotyp i jego wymiary
navLinks    →  nawigacja
socialLinks →  YouTube / Instagram / TikTok
intro       →  ekran powitalny „załóż słuchawki"
hero        →  hasła, podtytuł, CTA, wideo, długość przewijania
about       →  akapity + cztery liczby
services    →  sześć usług
pricing     →  pięć pakietów cenowych
artists     →  lista współprac
youtube     →  opis kanału i gatunki
player      →  głośność startowa odtwarzacza
tracks      →  playlista odtwarzacza
contact     →  nagłówek sekcji kontaktu
footer      →  stopka
```

Usuwasz element z tablicy — znika ze strony. Dodajesz — pojawia się. Nawigacja, listwa sekcji, dane strukturalne i sitemap wyliczają się z tych samych tablic.

W akapitach „O mnie" `**pogrubienie**` renderuje się jako podświetlony tekst.

### 2. Wideo w tle hero

Podmieniasz plik:

```
public/videos/hero.mp4
```

Nic więcej. Jeśli chcesz innej nazwy — zmień `hero.video` w `content.ts`.

Cztery pokrętła w `content.ts`, sekcja `hero`:

| Pole | Domyślnie | Co robi |
| --- | --- | --- |
| `scrubHeightVh` | `600` | **Czułość przewijania.** Więcej = trzeba dłużej scrollować, żeby film poleciał |
| `introScrollVh` | `45` | Po ilu ekranach przewijania znika logo, podtytuł i przyciski |
| `blurScrollVh` | `70` | Po ilu ekranach schodzi rozmycie — i wtedy rusza animacja |
| `mediaScale` | `1` | Skala kadru. `1` = oryginalne 100% |
| `blurStart` | `34` | Rozmycie w px na samym starcie |
| `freezeSeconds` | `2` | Ile sekund na początku pliku to zamrożona klatka |
| `overlayFadeTo` | `0.4` | Przyciemnienie po odsłonięciu filmu. `1` = jak na starcie |
| `outroFadeFrom` | `0.86` | Od tego postępu film rozpływa się w tło, żeby „O mnie" wyłoniło się z ciemności |

### Hasła nad filmem

`hero.tagline` cue'uje napisy **w sekundach filmu**, a nie w postępie przewijania:

```ts
tagline: [
  { text: 'Producent',    fromSecond: 7.4,  toSecond: 11.8 },
  { text: 'Mix / Master', fromSecond: 12.2, toSecond: 15.5 },
  { text: 'Wizualizacje', fromSecond: 20,   toSecond: 24.6 },
],
```

Sekundy to jedyna jednostka, która zachowuje sens przy zmianie czułości przewijania — napis trafia zawsze w ten sam kadr, niezależnie od `scrubHeightVh`. Długość filmu komponent odczytuje sam z metadanych, więc po podmianie wideo dopasowujesz tylko sekundy.

**Napisy z gradientem nie znoszą transformacji 3D.** Gradient działa przez `background-clip: text` — tło siedzi na elemencie nadrzędnym, a litery są przezroczyste. Nadanie fragmentowi `rotateX` czy perspektywy wypycha go na własną warstwę kompozycyjną i tło rodzica przestaje przez niego przechodzić: napis znika, mimo że w stylach wszystko wygląda poprawnie. W animacjach takich nagłówków używamy wyłącznie transformacji 2D.

**Cień pod napisem to `drop-shadow`, nie `text-shadow`** — i to nie jest dowolny wybór. Napisy mają gradient przez `background-clip: text`, a kolejność malowania elementu to tło → `text-shadow` → tekst. Przy `color: transparent` gradient jest tłem, więc `text-shadow` rysuje się **na nim** i wychodzi czarna plama w środku liter. `drop-shadow` operuje na gotowym renderze, więc otacza glify od zewnątrz.

### Regulacja czułości

Zmieniasz **wyłącznie `scrubHeightVh`**:

| Wartość | Ile przewijania na cały film (ekran 900 px) |
| --- | --- |
| `400` | ~2 300 px — szybko |
| `600` | ~3 900 px — obecne ustawienie |
| `900` | ~7 200 px — bardzo powoli |

Dwie fazy wstępu (`introScrollVh`, `blurScrollVh`) są podane w **ekranach przewijania**, a nie w ułamku całości. Dlatego spowolnienie filmu nie rozciąga wstępu — logo znika i rozmycie schodzi zawsze po tym samym dystansie. Hasła nad filmem same rozkładają się równo na przewijaniu, które zostaje.

### Pobieranie materiału i bramka ładowania

Wideo jest pobierane **strumieniem przez `fetch`**, a nie zostawione elementowi `<video>`. Powód jest konkretny: `preload="auto"` **nie ściąga całego pliku** — przeglądarka buforuje ułamek sekundy, przechodzi w `networkState: IDLE` i uznaje sprawę za załatwioną. Do zwykłego odtwarzania to rozsądne, ale my przewijamy klatki, więc każdy skok poza bufor stawał się osobnym zapytaniem zakresowym. Na wolnym łączu mobilnym to właśnie powodowało szarpanie.

Gotowy materiał trafia do elementu jako `Blob`, czyli z pamięci — przewijanie nie dotyka już sieci. Zmierzone: trafienie w klatkę z dokładnością do 0,02 s na całej długości.

Ekran powitalny pokazuje postęp w bajtach (uczciwy, bo znamy `content-length`) i **odblokowuje przyciski dopiero po pobraniu**. Po `intro.bypassAfterSeconds` sekundach odblokowuje je mimo wszystko — nikt nie może utknąć na ekranie ładowania.

Przy włączonym oszczędzaniu danych rezygnujemy z pobierania: wideo leci wtedy prosto z sieci, a bramka od razu przepuszcza.

### Zamrożona klatka

Wideo **nie** jest mapowane liniowo na całe przewijanie. Dopóki trwa rozmycie (do `blurEndProgress`), film stoi na klatce zero. Dopiero potem sekundy od `freezeSeconds` do końca rozkładają się na resztę przewijania.

Dzięki temu animacja rusza dokładnie w momencie, w którym przestaje ją cokolwiek zasłaniać — i nie musisz dobierać długości zamrożonej klatki do długości filmu. Wystarczy, że `freezeSeconds` zgadza się z tym, co jest w pliku.

**Klatka plakatowa** to `public/og/hero-poster.jpg` — pierwszy kadr filmu, widoczny zanim wideo się zdekoduje. Podmieniasz plik i gotowe. Możesz go też wyciąć z wideo (wymaga ffmpeg):

```bash
ffmpeg -i public/videos/hero.mp4 -vframes 1 -q:v 2 public/og/hero-poster.jpg
```

### 3. Muzyka

Wrzucasz `.mp3` do `public/audio/` i dopisujesz wpis do `tracks` w `content.ts`:

```ts
{ id: 'nowy-utwor', src: '/audio/nowy.mp3', title: 'Tytuł', artist: 'SKYLOV' },
```

Odtwarzacz sam go podchwyci — playlista, losowanie utworu na starcie i wizualizator działają z tablicy.

### 4. Logo

Podmieniasz `public/logo/logo.png` — **i koniecznie aktualizujesz `brand.logoWidth` / `brand.logoHeight`** w `content.ts` na rzeczywiste wymiary pliku. Z nich liczona jest proporcja; przy złych wartościach logo zostanie rozciągnięte.

Rozmiar logotypu ustawiasz wyłącznie klasami Tailwinda (`h-7`, `w-[min(74vw,340px)]`). Komponent `Logo` świadomie nie przyjmuje liczbowej wysokości w stylu inline — inline wygrywa z klasami, więc responsywne warianty przestałyby działać. Obecny logotyp jest bardzo szeroki (5,7:1), dlatego w hero i na ekranie powitalnym ogranicza go **szerokość**, nie wysokość.

Po podmianie odświeżasz favicony i obraz OG:

```bash
powershell -ExecutionPolicy Bypass -File ./scripts/generate-brand-assets.ps1
```

Skrypt składa `public/og/og-image.jpg` oraz ikony w `public/icons/` z Twojego logo na neonowym tle marki — to one są faviconem strony. (Windows — na macOS/Linux wygeneruj te pliki czym chcesz i wrzuć pod te same ścieżki.)

### 5. Kolory

Cała paleta to sześć zmiennych na górze [`src/app/globals.css`](src/app/globals.css):

```css
--neon-violet: #b347ff;
--neon-pink:   #ff2df7;
--neon-blue:   #2d9fff;
--background:  #05000d;
--card:        #0d0620;
--muted-foreground: #c7b3e6;
```

Zmieniasz je i cała strona zmienia skórę — Tailwind mapuje na nie swoje nazwy kolorów w `tailwind.config.ts`.

Motyw jasny jest już zdefiniowany pod `[data-theme='light']` w tym samym pliku. Ustaw `data-theme="light"` na `<html>`, żeby przełączyć.

### 6. Domena

Skopiuj `.env.example` do `.env.local`:

```
NEXT_PUBLIC_SITE_URL=https://skylov.pl
```

To zasila kanoniczne adresy, OpenGraph, `robots.txt`, `sitemap.xml` i Schema.org.

---

## Struktura

```
src/
├── app/
│   ├── layout.tsx              fonty · metadane · providery
│   ├── page.tsx                strona główna — 7 sekcji
│   ├── template.tsx            przejście między trasami
│   ├── error.tsx  not-found.tsx
│   ├── robots.ts  sitemap.ts   → /robots.txt, /sitemap.xml
│   └── globals.css             tokeny designu + utility
├── components/
│   ├── layout/                 navbar · menu mobilne · stopka · kursor ·
│   │                           ekran powitalny · odtwarzacz · pasek postępu ·
│   │                           listwa sekcji · neonowe tło
│   ├── providers/              smooth scroll · audio · motion
│   ├── sections/               hero · o mnie · usługi · cennik ·
│   │                           współpraca · youtube · kontakt
│   ├── shared/                 scroll-video · animated-text · reveal ·
│   │                           counter · magnetic · marquee · CTA · logo
│   └── ui/                     shadcn/ui — button
├── hooks/                      use-tilt (karty 3D) · use-media-query · use-mounted
├── content/content.ts          ← wszystko do edycji
├── lib/ · types/
```

### Odsłony sterowane przewijaniem

Wszystkie sekcje pod hero animują się przez [`use-scroll-reveal.ts`](src/hooks/use-scroll-reveal.ts). Animacja jest **funkcją pozycji scrolla**, a nie odpaleniem na wejściu w widok — dlatego przewijanie w górę odtwarza ją wstecz, klatka w klatkę, a zatrzymanie w połowie zostawia element w połowie odsłonięty.

Regulujesz to w miejscu użycia:

```tsx
<Reveal index={2} y={40} blur={10} scale={0.94}>…</Reveal>
```

`index` przesuwa okno przewijania elementu, co daje kaskadę. Przesunięcie jest ograniczone (max 0,34 okna), więc nawet ostatni kafelek w rzędzie zdąży się domknąć.

Dwie rzeczy warte zapamiętania:

- **Długość okna ma znaczenie.** Domyślne `['start end', 'start 50%']` to ~360 px przewijania na ekranie 720 px. Krótsze okno (próbowałem `78%`) daje ~150 px i animacja wygląda jak przeskok, nie jak ruch.
- **Stopka ma własne okno** (`['start end', 'end end']`). Elementy przy samym dole dokumentu nigdy nie dojadą do połowy ekranu, więc na domyślnym oknie zostałyby na zawsze półprzezroczyste.

### Efekt maszyny do pisania

Lidy sekcji „wystukują się" przez [`type-text.tsx`](src/components/shared/type-text.tsx) — też scrubem, więc cofnięcie strony kasuje tekst wstecz, z kursorem wędrującym w drugą stronę.

Dwie decyzje wydajnościowe warte zapamiętania:

- **Wszystkie znaki są w DOM od początku**, sterujemy tylko przezroczystością. Doklejanie liter do `textContent` zmieniałoby szerokość bloku co klatkę i wywoływało przeliczanie układu.
- **Znaki zostają `inline`**, nie `inline-block` — `inline-block` tworzy nowe miejsca łamania i wyrazy dzieliłyby się w środku.

### Tytuły sekcji

Wielkie tytuły („Usługi", „Cennik", „Kanał YouTube") są `sr-only`. Wizualnie sekcję nazywa nadtytuł, a `<h2>` zostaje w dokumencie — bez niego rozsypałby się konspekt strony, `aria-labelledby` wskazywałoby w pustkę, a wyszukiwarki straciłyby nagłówki drugiego poziomu.

Jeśli chcesz je z powrotem, usuwasz `sr-only` z `<h2>` w [`section-heading.tsx`](src/components/shared/section-heading.tsx).

### Karty 3D

Karty w „Usługi" i „Cennik" przechylają się za kursorem — [`use-tilt.ts`](src/hooks/use-tilt.ts). Obrót idzie przez MotionValue ze sprężyną, więc ruch myszy nie powoduje ani jednego re-renderu. Wyłączone na dotyku i przy `prefers-reduced-motion`.

Jeden haczyk wart zapamiętania: `overflow` inny niż `visible` **spłaszcza** `transform-style: preserve-3d`. Dlatego przycinanie siedzi na dziecku karty, a nie na niej samej — inaczej `translateZ` na warstwach treści przestałby cokolwiek robić i przechył wyglądałby jak obrót płaskiego obrazka.

---

## Jak działa wideo przewijane scrollem

[`src/components/shared/scroll-video.tsx`](src/components/shared/scroll-video.tsx)

Wysoki wrapper (`320svh`) zawiera przyklejoną (`sticky`) scenę na pełny ekran. Postęp przewijania po tym wrapperze mapuje się na `currentTime` wideo — przewijasz stronę, a zamiast przesuwać kadr, przewijasz film.

Jeden szczegół decyduje o płynności: **nie** ustawiamy `currentTime` prosto z eventu scrolla. Zamiast tego trzymamy wartość docelową i w pętli `requestAnimationFrame` dociągamy do niej klatkę interpolacją, pomijając skoki mniejsze niż 0,02 s i czekając na `seeking`. Stąd „równo leci" zamiast szarpania na klatkach kluczowych.

**Rozmycie zdejmowane przewijaniem.** Na starcie kadr jest mocno rozmyty (34 px), więc logotyp, podtytuł i przyciski są w pełni czytelne. Rozmycie schodzi liniowo do zera na 30% postępu — a treść hero znika już na 20%, więc film wychodzi na ostro dokładnie wtedy, gdy nic go już nie zasłania.

Trzy szczegóły, które o tym decydują:

- **Kompensacja krawędzi.** `blur()` próbkuje piksele spoza elementu, więc przy skali 100% krawędzie kadru robiłyby się przezroczyste. Kadr dostaje minimalny nadmiar skali (1,09), który **zanika razem z rozmyciem** — gdy obraz jest ostry, skala wynosi dokładnie 1,00.
- **Filtr znika, nie zeruje się.** Poniżej progu zwracamy `none`, a nie `blur(0px)`. To nie kosmetyka: zerowe rozmycie nadal przepuszcza obraz przez potok filtrów i każe rastrować warstwę. Zdjęcie filtra oddaje wideo natywnemu kompozytorowi — czyli ostrzej.
- **Nakładki gasną.** Przyciemnienie jest potrzebne tylko wtedy, gdy na filmie leży typografia. Po odsłonięciu schodzi do `overlayFadeTo`, przez co obraz zyskuje kontrast i szczegóły.

Pętla chodzi wyłącznie wtedy, gdy sekcja jest widoczna (IntersectionObserver), a przy `prefers-reduced-motion` nie startuje wcale — zostaje statyczna pierwsza klatka i hero o wysokości jednego ekranu.

Nad wideo trzy hasła (`hero.tagline`) wjeżdżają jedno po drugim, też sterowane pozycją scrolla, nie zegarem.

### Waga pliku

Obecne `hero.mp4` waży **31 MB** (1920×1080, 25,2 s). Dla samego przewijania to zaleta — gęste dane oznaczają szybki seek. Ale to też realny transfer.

Strona łagodzi to na dwa sposoby: ekran powitalny daje czas na pobranie w tle, a na ekranach poniżej 768 px oraz przy włączonym trybie oszczędzania danych `preload` schodzi do `metadata` — przeglądarka dociąga wtedy tylko potrzebne zakresy bajtów.

Jeśli chcesz plik lżejszy, przekoduj (wymaga ffmpeg):

```bash
ffmpeg -i public/videos/hero.mp4 -an -vf scale=1280:-2 -c:v libx264 -crf 26 -g 12 -pix_fmt yuv420p -movflags +faststart public/videos/hero-light.mp4
```

`-g 12` to kompromis: gęstsze klatki kluczowe niż domyślne, ale bez eksplozji rozmiaru jak przy `-g 1`.

---

## Odtwarzacz muzyki

- Losowy utwór przy każdym wejściu (jak w oryginale)
- Play/pauza, poprzedni/następny, przewijanie utworu
- Głośność startowa w `player.defaultVolume` w [`content.ts`](src/content/content.ts) (domyślnie **15%**); zmiana użytkownika zapisuje się w `localStorage`
- Rozwijana playlista ze wskaźnikiem aktualnego utworu
- **Wizualizator z realnego widma** — `AnalyserNode` z Web Audio, nie udawana sinusoida

`AudioContext` powstaje dopiero po kliknięciu na ekranie powitalnym, bo przeglądarki blokują dźwięk bez gestu użytkownika. Ekran powitalny ma **dwa wyjścia** — „Wejdź na stronę" (z muzyką) i „Wejdź bez dźwięku". Dostęp do treści nie może zależeć od zgody na audio.

### Bramka dźwięku

Nic nie zagra samo z siebie. `AudioProvider` trzyma flagę `soundEnabledRef`, którą otwiera **wyłącznie** świadome działanie użytkownika: przycisk „Wejdź na stronę", play w odtwarzaczu, wybór utworu z playlisty albo przewijanie na następny.

Dopóki flaga jest zamknięta, żadna ścieżka nie odtwarza dźwięku — ani zmiana utworu, ani koniec poprzedniego. „Wejdź bez dźwięku" znaczy dosłownie tyle: cisza, aż użytkownik sam wciśnie play.

### Pauza przy zmianie karty

Kliknięcie najnowszego filmu otwiera YouTube w nowej karcie — bez tego grałyby dwie ścieżki naraz. Gdy karta przestaje być widoczna, odtwarzanie **pauzuje** (nie wycisza, żeby po powrocie utwór podjął od tego samego miejsca) i wznawia się samo po powrocie.

Jeden przypadek brzegowy jest obsłużony osobno: jeśli użytkownik zatrzymał muzykę **sam**, powrót na kartę jej nie wznowi. Pilnuje tego flaga „to była pauza automatyczna".

---

## Dostępność

- Link „przejdź do treści", znaczniki semantyczne, jeden `<h1>` na stronę
- Widoczne obramowanie fokusu na każdym elemencie interaktywnym
- Animowany tekst wystawia czytnikom pełny string; ruchome fragmenty są `aria-hidden`
- Ekran powitalny: `role="dialog"`, `aria-modal`, fokus na przycisku wejścia
- Odtwarzacz: wszystkie kontrolki opisane, suwaki z `<label>`, playlista jako `listbox`
- Symbol `∞` w liczbach ma tekstowy odpowiednik dla czytników
- Kontrast AA — `#c7b3e6` na `#05000d` to ok. 9:1
- `prefers-reduced-motion` obsłużone w trzech warstwach: `MotionConfig reducedMotion="user"`, własne gałęzie w `Reveal`/`AnimatedText`/`ScrollVideo` oraz reguła CSS wygaszająca resztę

---

## SEO

- Metadata API: szablony tytułów, kanoniczne adresy, OpenGraph, Twitter Card
- `robots.txt` i `sitemap.xml` generowane z treści
- Schema.org JSON-LD: `MusicGroup` (z listą utworów), `WebSite`, `OfferCatalog` (usługi z cenami), `Person`
- Fonty hostowane lokalnie przez `next/font`, z podzbiorem `latin-ext` — bez tego polskie znaki lecą na font zastępczy

---

## Najnowszy film z YouTube

W sekcji „Kanał YouTube" po prawej stronie wyświetla się **ostatni film z kanału i odświeża się sam** — po wrzuceniu nowego materiału pojawi się tu bez żadnego wdrożenia.

Jak to działa ([`src/lib/youtube.ts`](src/lib/youtube.ts)):

- Dane idą z otwartego feedu Atom kanału (`/feeds/videos.xml`) — **bez YouTube Data API**, więc nie ma klucza do trzymania w sekretach, limitów zapytań ani niczego do rotowania.
- Pobranie dzieje się po stronie serwera z rewalidacją co 30 minut (ISR). Przeglądarka nie odpytuje YouTube'a, a miniatura jest w HTML-u od razu.
- Zamiast osadzonego odtwarzacza jest miniatura linkująca do YouTube. Iframe dociąga kilkaset kilobajtów skryptów i ustawia ciasteczka, zanim ktokolwiek kliknie „play".
- Gdy cokolwiek zawiedzie (brak sieci przy budowaniu, zmieniony kanał), funkcja zwraca `null` i sekcja renderuje się bez kafelka. Strona nigdy się przez to nie wywali.

W `content.ts`:

```ts
channelId: 'UCzQqhE-15lu9HCRsVT9BMEg',  // pusty = wyciągnie sam z cta.href
latestLabel: 'Najnowszy film',
```

Częstotliwość odświeżania zmienisz w `REVALIDATE_SECONDS` w `src/lib/youtube.ts`. Miniatury wymagają wpisu `i.ytimg.com` w `remotePatterns` w `next.config.mjs` — jest już dodany.

---

## Kontakt

Sekcja „Kontakt" to wyłącznie kanały social media — YouTube, Instagram, TikTok — dokładnie jak na bazowej stronie. Nie ma formularza zamówienia ani endpointu API; kontakt idzie przez DM.

Kanały edytujesz w `socialLinks` w [`content.ts`](src/content/content.ts).

---

## Wdrożenie

Działa na dowolnym hostingu Node. Na Vercelu:

1. Wypchnij repozytorium i zaimportuj projekt.
2. Ustaw `NEXT_PUBLIC_SITE_URL` na docelową domenę.
3. Deploy — nic więcej nie trzeba.

---

## Uwagi

- **Nie uruchamiaj `npm run build`, gdy chodzi `npm run dev`** — dzielą katalog `.next` i build psuje serwer deweloperski.
- Wymagany jest JavaScript, jak na każdej stronie opartej na animacjach scrolla. Cała treść jest renderowana serwerowo, więc roboty i tryb czytania widzą wszystko.
- `next lint` wypisuje ostrzeżenie o wycofaniu na Next 15.5 — przy przejściu na Next 16 zmigrujesz przez `npx @next/codemod@canary next-lint-to-eslint-cli .`

---

## Licencja

Kod jest Twój. Muzyka, logo i wideo pozostają własnością SKYLOV.
