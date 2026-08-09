/**
 * Shared domain types.
 *
 * Everything the site renders is described here, so `content.ts` gets full
 * autocomplete and type-checking. Add a field here first, then in content.
 */

/**
 * Names of the icons wired up in `src/lib/icons.tsx`.
 * Add a name here and to the map in that file to make it usable in content.
 */
export type IconName =
  | 'piano'
  | 'sliders'
  | 'mic'
  | 'music'
  | 'palette'
  | 'repeat'
  | 'headphones'
  | 'youtube'
  | 'instagram'
  | 'tiktok'
  | 'disc'
  | 'waveform'
  | 'sparkles'
  | 'zap'
  | 'mail';

export interface NavLink {
  label: string;
  /** In-page anchor (`/#uslugi`) or a route. */
  href: string;
}

export interface SocialLink {
  label: string;
  handle: string;
  href: string;
  icon: IconName;
}

export interface CtaLink {
  label: string;
  href: string;
  /** Opens in a new tab. */
  external?: boolean;
}

export interface SiteConfig {
  name: string;
  title: string;
  description: string;
  /** Absolute URL, no trailing slash. Falls back to NEXT_PUBLIC_SITE_URL. */
  url: string;
  locale: string;
  keywords: string[];
  ogImage: string;
  founded: string;
}

export interface BrandContent {
  wordmark: string;
  /** Path inside /public/logo. */
  logo: string;
  logoWidth: number;
  logoHeight: number;
}

/* -------------------------------------------------------------------------- */

export interface IntroContent {
  title: string;
  body: string;
  emphasis: string;
  button: string;
  /** Small print under the button. */
  note: string;
  skip: string;
  /** Label above the loading bar. */
  loading: string;
  /** Explains why the buttons are disabled. */
  loadingHint: string;
  /** Escape hatch shown when loading drags on. */
  bypass: string;
  /** After how many seconds the escape hatch appears. */
  bypassAfterSeconds: number;
}

/**
 * A headline shown over the footage, cued to a moment in the video.
 * Times are in **seconds of the video file**, which is the only unit that
 * stays meaningful when you change the scroll sensitivity.
 */
export interface TaglineCue {
  text: string;
  /** Second of the video at which it starts appearing. */
  fromSecond: number;
  /** Second of the video by which it has gone. */
  toSecond: number;
}

export interface HeroContent {
  /** Rendered above the logotype. */
  eyebrow: string;
  /** Screen-reader heading; the logo carries it visually. */
  title: string;
  tagline: TaglineCue[];
  subtitle: string;
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
  /** Scroll-scrubbed background video in /public/videos. */
  video: string;
  /** Poster frame + fallback when the video cannot play. */
  poster: string;
  scrollLabel: string;
  /**
   * Total hero height in viewport heights. This is the scrub sensitivity
   * dial: bigger = the video advances more slowly.
   */
  scrubHeightVh: number;
  /**
   * The two phases below are expressed in **viewport heights of scrolling**,
   * not in fractions of the total. That keeps the intro feeling identical
   * no matter how much you slow the video down with `scrubHeightVh`.
   */
  /** Screen-heights of scrolling after which the hero content has gone. */
  introScrollVh: number;
  /** Screen-heights of scrolling after which the blur has cleared. */
  blurScrollVh: number;
  /** Zoom applied to the video and poster. 1 = untouched. */
  mediaScale: number;
  /** Blur in px at scroll position 0, easing to 0 as you scroll. */
  blurStart: number;
  /** Seconds of frozen frame at the head of the file. */
  freezeSeconds: number;
  /** Overlay opacity once the footage is sharp. 1 = unchanged. */
  overlayFadeTo: number;
  /**
   * Scroll progress (0–1) at which the footage starts dissolving into the
   * page background, so the next section emerges instead of cutting in.
   */
  outroFadeFrom: number;
}

export interface PlayerContent {
  /** Starting volume, 0–1. */
  defaultVolume: number;
}

export interface StatItem {
  id: string;
  /** Numeric value for the count-up. Use null for symbols like ∞. */
  value: number | null;
  /** Rendered instead of the counter when `value` is null. */
  display?: string;
  suffix: string;
  label: string;
}

export interface AboutContent {
  eyebrow: string;
  title: string;
  lead: string;
  /** `**bold**` segments are rendered as highlighted text. */
  paragraphs: string[];
  stats: StatItem[];
  cta: CtaLink;
}

export interface Service {
  id: string;
  icon: IconName;
  title: string;
  description: string;
}

export interface PricePlan {
  id: string;
  icon: IconName;
  title: string;
  price: string;
  /** e.g. "za utwór". */
  note: string;
  features: string[];
  /** Highlights the card as the recommended option. */
  featured: boolean;
}

export interface Artist {
  id: string;
  name: string;
}

export interface YoutubeContent {
  eyebrow: string;
  title: string;
  cardTitle: string;
  description: string;
  styleTags: string[];
  cta: CtaLink;
  channelHandle: string;
  /**
   * Identyfikator kanału (`UC…`). Zostaw pusty, a strona wyciągnie go
   * sama z adresu w `cta.href`. Wpisanie go oszczędza jedno zapytanie.
   */
  channelId: string;
  /** Nagłówek nad kafelkiem z najnowszym filmem. */
  latestLabel: string;
}

export interface Track {
  id: string;
  /** Path inside /public/audio. */
  src: string;
  title: string;
  artist: string;
}

export interface ContactContent {
  eyebrow: string;
  title: string;
  description: string;
}

export interface FooterContent {
  headline: string;
  description: string;
  copyright: string;
  credit: string;
  backToTop: string;
}

export interface SectionIntro {
  eyebrow: string;
  title: string;
  description: string;
}
