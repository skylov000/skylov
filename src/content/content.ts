/**
 * ============================================================================
 *  TREŚĆ — JEDYNY PLIK, KTÓRY EDYTUJESZ
 * ============================================================================
 *
 *  Każdy tekst, każda ścieżka do pliku i każdy link na stronie są tutaj.
 *  Żaden komponent nie zawiera zaszytego na sztywno tekstu.
 *
 *  JAK EDYTOWAĆ
 *  ------------
 *  • Tekst     → zmieniasz stringi poniżej.
 *  • Obrazy    → wrzucasz plik o TEJ SAMEJ NAZWIE do folderu w /public
 *                (np. podmieniasz `public/logo/logo.png`).
 *  • Wideo     → podmieniasz `public/videos/hero.mp4`.
 *  • Muzyka    → wrzucasz .mp3 do `public/audio/` i dopisujesz do `tracks`.
 *  • Sekcje    → usuwasz element z tablicy i znika ze strony.
 *
 *  FOLDERY
 *  -------
 *  /public/logo      logotyp (PNG/SVG)
 *  /public/audio     utwory do odtwarzacza
 *  /public/videos    wideo tła hero
 *  /public/icons     favicony
 *  /public/og        obraz do udostępnień w social media
 *
 *  **pogrubienie** w akapitach „O mnie" renderuje się jako podświetlony tekst.
 * ============================================================================
 */

import type {
  AboutContent,
  Artist,
  BrandContent,
  ContactContent,
  FooterContent,
  HeroContent,
  IntroContent,
  NavLink,
  PlayerContent,
  PricePlan,
  SectionIntro,
  Service,
  SiteConfig,
  SocialLink,
  Track,
  YoutubeContent,
} from '@/types';

/* -------------------------------------------------------------------------- */
/*  STRONA                                                                     */
/* -------------------------------------------------------------------------- */

export const site: SiteConfig = {
  name: 'SKYLOV',
  title: 'SKYLOV — Producent Muzyczny · Mix/Master · Wizualizacje',
  description:
    'Portfolio SKYLOV — producent muzyczny, mix/mastering i wizualizacje. Ponad 10 lat doświadczenia w tworzeniu beatów i profesjonalnej oprawie dźwiękowej. Sprawdź ofertę i cennik.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://skylov.pl',
  locale: 'pl_PL',
  keywords: [
    'producent muzyczny',
    'beaty na sprzedaż',
    'mix i mastering',
    'mix wokalu',
    'wizualizacje muzyczne',
    'remixy',
    'SKYLOV',
    'produkcja muzyki',
    'miniatury youtube',
  ],
  ogImage: '/og/og-image.jpg',
  founded: '2014',
};

export const brand: BrandContent = {
  wordmark: 'SKYLOV',
  logo: '/logo/logo.png',
  // Rzeczywiste wymiary pliku. Muszą się zgadzać, bo z nich liczona jest
  // proporcja — przy złych wartościach logo zostanie rozciągnięte.
  logoWidth: 1413,
  logoHeight: 249,
};

/* -------------------------------------------------------------------------- */
/*  NAWIGACJA                                                                  */
/* -------------------------------------------------------------------------- */

export const navLinks: NavLink[] = [
  { label: 'O mnie', href: '/#o-mnie' },
  { label: 'Usługi', href: '/#uslugi' },
  { label: 'Cennik', href: '/#cennik' },
  { label: 'Współpraca', href: '/#wspolpraca' },
  { label: 'YouTube', href: '/#youtube' },
  { label: 'Kontakt', href: '/#kontakt' },
];

export const socialLinks: SocialLink[] = [
  {
    label: 'YouTube',
    handle: '@SKYLOV_MUSIC',
    href: 'https://www.youtube.com/@SKYLOV_MUSIC',
    icon: 'youtube',
  },
  {
    label: 'Instagram',
    handle: '@skylov_music',
    href: 'https://www.instagram.com/skylov_music/',
    icon: 'instagram',
  },
  {
    label: 'TikTok',
    handle: '@skylov_yt',
    href: 'https://www.tiktok.com/@skylov_yt',
    icon: 'tiktok',
  },
];

/* -------------------------------------------------------------------------- */
/*  EKRAN POWITALNY (SŁUCHAWKI)                                                */
/* -------------------------------------------------------------------------- */

export const intro: IntroContent = {
  title: 'Zatrzymaj się na chwilę',
  body: 'Ta strona zawiera muzykę i efekty dźwiękowe.',
  emphasis: 'Załóż słuchawki.',
  button: 'Wejdź na stronę',
  note: 'Dźwięk możesz wyłączyć w każdej chwili w odtwarzaczu na dole ekranu.',
  skip: 'Wejdź bez dźwięku',
  loading: 'Wczytywanie',
  loadingHint: 'Przygotowuję materiał wideo — przyciski odblokują się po wczytaniu.',
  // Komunikat po odblokowaniu awaryjnym, gdy wczytywanie się przeciąga.
  bypass: 'Wczytywanie trwa dłużej niż zwykle — możesz wejść, wideo dociągnie się w tle.',
  bypassAfterSeconds: 15,
};

/* -------------------------------------------------------------------------- */
/*  1 — HERO                                                                   */
/* -------------------------------------------------------------------------- */

export const hero: HeroContent = {
  eyebrow: 'Producent muzyczny · od 2014',
  title: 'SKYLOV — producent muzyczny, mix/master i wizualizacje',
  // Hasła nad filmem. Czasy są w SEKUNDACH FILMU, więc trafiają zawsze
  // w ten sam moment obrazu — niezależnie od czułości przewijania.
  //    7,4 s = kadr przechodzi z logo na pianino
  //   12,2 s = konsoleta / kontroler
  //   15,5 s = wjeżdża pełne ujęcie studia — tu Mix/Master ma już zniknąć
  //   20,0 s = ekrany DAW, końcówka materiału
  tagline: [
    { text: 'Tworzę brzmienie', fromSecond: 7.4, toSecond: 11.8 },
    { text: 'Tworzę klimat', fromSecond: 12.2, toSecond: 15.5 },
    { text: 'Zobacz moje prace', fromSecond: 20, toSecond: 24.6 },
  ],
  subtitle:
    'Tworzę muzykę, która żyje własnym życiem — od beatu po finalny mix, od wizualizacji po pełen projekt artystyczny.',
  primaryCta: { label: 'Sprawdź cennik', href: '/#cennik' },
  secondaryCta: {
    label: 'Zobacz YouTube',
    href: 'https://www.youtube.com/@SKYLOV_MUSIC',
    external: true,
  },
  video: '/videos/hero.mp4',
  // Wariant dla telefonów i słabszych komputerów: 854×480 zamiast 1920×1080
  // i klatka kluczowa co 0,2 s zamiast co 0,8 s. Plik waży 2,3 MB zamiast
  // 5,8 MB, a przewijanie klatek kosztuje ułamek tego, co w 1080p.
  // Generuje go `scripts/encode-hero-video.ps1` z pliku powyżej.
  videoMobile: '/videos/hero-mobile.mp4',
  // Pierwsza klatka filmu. Widać ją zanim wideo się zdekoduje.
  poster: '/og/hero-poster.jpg',
  posterMobile: '/og/hero-poster-mobile.jpg',
  scrollLabel: 'Scroll',
  // ---- CZUŁOŚĆ PRZEWIJANIA ----
  // Całkowita wysokość hero w wysokościach ekranu. To jest pokrętło
  // czułości: więcej = trzeba dłużej scrollować, żeby film poleciał.
  //   400 = szybko  ·  600 = spokojnie  ·  900 = bardzo powoli
  scrubHeightVh: 600,
  // Dwie fazy poniżej podane są w **wysokościach ekranu przewijania**,
  // a nie w ułamku całości. Dzięki temu zmiana `scrubHeightVh` spowalnia
  // sam film, a wstęp zachowuje dokładnie to samo tempo co wcześniej.
  //
  // Po tylu ekranach przewijania znika logo, podtytuł i przyciski:
  introScrollVh: 45,
  // Po tylu ekranach schodzi rozmycie — i wtedy rusza animacja w filmie:
  blurScrollVh: 70,
  // Powiększenie kadru wideo i plakatu. 1 = oryginalna skala 100%.
  mediaScale: 1,
  // Rozmycie startowe w px. Schodzi do zera w miarę przewijania,
  // więc napisy w hero są czytelne, a potem film wychodzi na ostro.
  blurStart: 34,
  // Ile sekund na początku pliku to zamrożona klatka. Wideo stoi na niej
  // przez cały czas rozmycia, więc animacja startuje dopiero wtedy,
  // gdy nic jej już nie zasłania.
  freezeSeconds: 2,
  // Przyciemnienie po odsłonięciu filmu. 1 = tak jak na starcie,
  // niżej = obraz wyraźniejszy, gdy nie leży już na nim typografia.
  overlayFadeTo: 0.4,
  // Od tego postępu (0–1) film rozpływa się w tło strony, żeby sekcja
  // „O mnie" wyłaniała się z ciemności zamiast wskakiwać cięciem.
  outroFadeFrom: 0.86,
};

/* -------------------------------------------------------------------------- */
/*  2 — O MNIE                                                                 */
/* -------------------------------------------------------------------------- */

export const about: AboutContent = {
  eyebrow: 'Kim jestem',
  title: 'Skylov',
  lead: 'Muzyka to moje życie, moja pasja i mój styl bycia.',
  paragraphs: [
    'Cześć, jestem **Skylov** — młody producent muzyczny z ponad **10-letnim doświadczeniem** w produkcji muzyki i tworzeniu do niej wizualizacji.',
    'Ukończyłem **szkołę muzyczną I stopnia** z gry na **akordeonie** oraz **pianinie**, co dało mi solidną bazę teorii muzyki i słuchu absolutnego. To właśnie ta klasyczna podstawa sprawia, że moje produkcje brzmią inaczej niż wszystkie inne.',
    'Tworzę **bity, remixy, wizualizacje** i zajmuję się **mix/masteringiem** — wszystko, co dotyczy muzyki i jej oprawy wizualnej, to mój dom. Każdy projekt traktuję jak osobną historię, którą chcę opowiedzieć dźwiękiem.',
  ],
  stats: [
    { id: 'lata', value: 10, suffix: '+', label: 'Lat doświadczenia' },
    { id: 'wspolprace', value: null, display: '∞', suffix: '', label: 'Współprace' },
    { id: 'produkcje', value: null, display: '∞', suffix: '', label: 'Produkcji' },
    { id: 'instrumenty', value: 3, suffix: '', label: 'Instrumenty' },
  ],
  cta: { label: 'Zobacz, co robię', href: '/#uslugi' },
};

/* -------------------------------------------------------------------------- */
/*  3 — USŁUGI                                                                 */
/* -------------------------------------------------------------------------- */

export const servicesIntro: SectionIntro = {
  eyebrow: 'Co oferuję',
  title: 'Usługi',
  description:
    'Od pierwszego pomysłu po gotowy plik na streaming. Wszystko robię sam — bez pośredników i bez zgadywania.',
};

export const services: Service[] = [
  {
    id: 'beaty',
    icon: 'piano',
    title: 'Tworzenie Beatów',
    description:
      'Produkuję bity od podstaw — od pomysłu po gotowy, profesjonalny beat. Trap, drill, boom bap, phonk i wiele więcej. Każdy bit to osobna historia.',
  },
  {
    id: 'mix-master',
    icon: 'sliders',
    title: 'Mix / Master',
    description:
      'Profesjonalny mix i mastering sprawia, że Twój utwór brzmi gotowy na streaming, radio i każdą platformę muzyczną. Czystość brzmienia gwarantowana.',
  },
  {
    id: 'mix-vocali',
    icon: 'mic',
    title: 'Mix Vocali',
    description:
      'Profesjonalne przetwarzanie i miksowanie wokalu — tuning, efekty, space. Twój głos zasługuje na brzmienie, które zachwyca od pierwszej sekundy.',
  },
  {
    id: 'midi',
    icon: 'music',
    title: 'Tworzenie MIDI',
    description:
      'Harmonie, melodie, aranżacje — tworzę ścieżki MIDI, które dodają głębi każdemu projektowi. Teoria muzyki w służbie nowoczesnej produkcji.',
  },
  {
    id: 'wizualizacje',
    icon: 'palette',
    title: 'Wizualizacje + Miniatury',
    description:
      'Tworzę animowane wizualizacje do muzyki oraz profesjonalne miniatury na YouTube. Obraz i dźwięk — razem tworzą kompletny przekaz artystyczny.',
  },
  {
    id: 'remixy',
    icon: 'repeat',
    title: 'Remixy',
    description:
      'Odświeżam znane utwory w nowym, energetycznym wydaniu. Remixy, które brzmią jak nowe produkcje — z zachowaniem ducha oryginału.',
  },
];

/* -------------------------------------------------------------------------- */
/*  4 — CENNIK                                                                 */
/* -------------------------------------------------------------------------- */

export const pricingIntro: SectionIntro = {
  eyebrow: 'Inwestycja',
  title: 'Cennik',
  description:
    'Ceny orientacyjne. Dokładna wycena po omówieniu projektu — napisz na social media po szczegóły.',
};

export const pricing: PricePlan[] = [
  {
    id: 'beat',
    icon: 'piano',
    title: 'Beat',
    price: 'od 200 zł',
    note: 'cena zależna od złożoności',
    features: ['Oryginalny, autorski beat', 'Pliki WAV + MP3', 'Stems na życzenie', 'Dowolny gatunek'],
    featured: false,
  },
  {
    id: 'mix-master',
    icon: 'sliders',
    title: 'Mix / Master',
    price: 'od 300 zł',
    note: 'za utwór',
    features: ['Profesjonalny mix', 'Mastering na streaming', '2 rundy poprawek', 'Dostawa w 48h'],
    featured: true,
  },
  {
    id: 'mix-vocali',
    icon: 'mic',
    title: 'Mix Vocali',
    price: 'od 300 zł',
    note: 'za utwór',
    features: ['Tuning wokalu', 'Efekty przestrzenne', 'Layering', 'Profesjonalne brzmienie'],
    featured: false,
  },
  {
    id: 'midi',
    icon: 'music',
    title: 'MIDI',
    price: 'od 15 zł',
    note: 'za ścieżkę',
    features: ['Melodia / harmonia', 'Aranżacja instrumentalna', 'Eksport MIDI + audio', 'Na Twój styl'],
    featured: false,
  },
  {
    id: 'wizualizacja',
    icon: 'palette',
    title: 'Wizualizacja + Miniatura',
    price: 'od 50 zł',
    note: 'komplet',
    features: ['Animowana wizualizacja', 'Miniatura YouTube', 'Format 1080p / 4K', 'Personalizacja grafiki'],
    featured: false,
  },
];

export const pricingFootnote =
  '* Ceny orientacyjne. Dokładna wycena po omówieniu projektu. Napisz na social media po szczegóły.';

/* -------------------------------------------------------------------------- */
/*  5 — WSPÓŁPRACA                                                             */
/* -------------------------------------------------------------------------- */

export const collaborationIntro: SectionIntro = {
  eyebrow: 'Razem tworzymy muzykę',
  title: 'Współprace Artystyczne',
  description:
    'Miałem przyjemność pracować z utalentowanymi artystami ze sceny polskiej muzyki. Każda współpraca to nowe doświadczenie i nowy poziom kreatywności.',
};

export const artists: Artist[] = [
  { id: 'szumek', name: 'Szumek' },
  { id: 'dj-skiba', name: 'DJ Skiba' },
  { id: 'mundur', name: 'Mundur' },
  { id: 'ziemus', name: 'Ziemuś' },
  { id: 'blay', name: 'Blay' },
  { id: 'cioostek', name: 'Cioostek' },
  { id: 'esti', name: 'Esti' },
  { id: 'wanchiz', name: 'Wanchiz' },
  { id: 'nomy', name: 'Nomy' },
  { id: 'krojuu', name: 'Krojuu' },
];

/* -------------------------------------------------------------------------- */
/*  6 — YOUTUBE                                                                */
/* -------------------------------------------------------------------------- */

export const youtube: YoutubeContent = {
  eyebrow: 'Moje produkcje',
  title: 'Kanał YouTube',
  cardTitle: 'SKYLOV na YouTube',
  description:
    'Na moim kanale znajdziesz pełne produkcje, bity i wizualizacje. Tworzę muzykę na pograniczu gatunków — łącząc nowoczesne brzmienia ze starą szkołą. Każdy upload to osobna podróż dźwiękowa.',
  styleTags: ['VIXA', 'TECHNO', 'HOUSE', 'SLAP HOUSE', 'DNB', 'TRAP', 'DISCO POLO'],
  cta: { label: 'Odwiedź kanał', href: 'https://www.youtube.com/@SKYLOV_MUSIC', external: true },
  channelHandle: '@SKYLOV_MUSIC',
  // Identyfikator kanału. Pusty = strona wyciągnie go sama z adresu wyżej.
  channelId: 'UCzQqhE-15lu9HCRsVT9BMEg',
  latestLabel: 'Najnowszy film',
};

/* -------------------------------------------------------------------------- */
/*  ODTWARZACZ — dopisz plik do /public/audio i dodaj wpis poniżej             */
/* -------------------------------------------------------------------------- */

export const player: PlayerContent = {
  // Głośność startowa odtwarzacza, 0–1. Użytkownik może ją zmienić,
  // a jego ustawienie zapisuje się w przeglądarce.
  defaultVolume: 0.15,
};

export const tracks: Track[] = [
  { id: 'equador', src: '/audio/pierwsza.mp3', title: 'Equador (Hardstyle Remix)', artist: 'SKYLOV' },
  { id: 'firefly', src: '/audio/druga.mp3', title: 'Firefly', artist: 'SKYLOV' },
  { id: 'saxobeat', src: '/audio/trzecia.mp3', title: 'Mr. Saxobeat (Remix)', artist: 'SKYLOV' },
  { id: 'right-time', src: '/audio/czwarta.mp3', title: 'Right Time', artist: 'SKYLOV' },
  { id: 'we-are-young', src: '/audio/piata.mp3', title: 'We Are Young (Remix)', artist: 'SKYLOV' },
];

/* -------------------------------------------------------------------------- */
/*  7 — KONTAKT                                                                */
/* -------------------------------------------------------------------------- */

export const contact: ContactContent = {
  eyebrow: 'Znajdź mnie w sieci',
  title: 'Social\nMedia',
  description:
    'Chcesz zamówić beat, wizualizację lub porozmawiać o współpracy? Napisz do mnie na social media — odpowiadam szybko!',
};

/* -------------------------------------------------------------------------- */
/*  8 — STOPKA                                                                 */
/* -------------------------------------------------------------------------- */

export const footer: FooterContent = {
  headline: 'Masz pomysł?\nOdezwij się.',
  description: 'Produkcja muzyczna · Mix/Master · Wizualizacje',
  copyright: `© ${new Date().getFullYear()} SKYLOV — Wszelkie prawa zastrzeżone`,
  credit: 'Produkcja muzyczna · Mix/Master · Wizualizacje',
  backToTop: 'Na górę',
};
