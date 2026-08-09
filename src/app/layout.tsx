import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';

import { AudioPlayer } from '@/components/layout/audio-player';
import { CustomCursor } from '@/components/layout/custom-cursor';
import { FloatingSocials } from '@/components/layout/floating-socials';
import { Footer } from '@/components/layout/footer';
import { IntroGate } from '@/components/layout/intro-gate';
import { Navbar } from '@/components/layout/navbar';
import { NeonField } from '@/components/layout/neon-field';
import { ScrollProgress } from '@/components/layout/scroll-progress';
import { AudioProvider } from '@/components/providers/audio-provider';
import { MotionProvider } from '@/components/providers/motion-provider';
import { SmoothScroll } from '@/components/providers/smooth-scroll';
import { JsonLd } from '@/components/shared/json-ld';
import { site } from '@/content/content';
import { organizationSchema, websiteSchema } from '@/lib/seo';

import './globals.css';

/**
 * Fonty hostuje next/font podczas builda: żadnego blokującego zapytania
 * do Google, żadnego skoku layoutu. `latin-ext` jest obowiązkowy —
 * bez niego polskie znaki (ł, ą, ę, ś, ż) lecą na font zastępczy.
 */
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: site.keywords,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  applicationName: site.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
    images: [{ url: site.ogImage, width: 1200, height: 630, alt: site.title }],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.title,
    description: site.description,
    images: [site.ogImage],
  },
  // Ikony generuje `scripts/generate-brand-assets.ps1` z `public/logo/logo.png`.
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/icons/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'music',
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#05000D',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pl"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body className="relative min-h-screen bg-background text-foreground">
        <a href="#main" className="skip-link">
          Przejdź do treści
        </a>

        <NeonField />

        <MotionProvider>
          <AudioProvider>
            <IntroGate />

            <SmoothScroll>
              <CustomCursor />
              <ScrollProgress />
              <Navbar />
              <FloatingSocials />

              <main id="main" className="relative">
                {children}
              </main>

              <Footer />
            </SmoothScroll>

            <AudioPlayer />
          </AudioProvider>
        </MotionProvider>

        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />

        {/*
          Vercel Web Analytics. Poprzednia, statyczna wersja strony
          wstawiała skrypt `/_vercel/insights` wprost w HTML — przy
          przejściu na Next.js trzeba do tego komponentu, bo zliczanie
          odsłon musi obsłużyć nawigację po stronie klienta.
          Skrypt ładuje się wyłącznie na produkcji.
        */}
        <Analytics />
      </body>
    </html>
  );
}
