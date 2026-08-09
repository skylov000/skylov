import dynamic from 'next/dynamic';

import { SectionIndicator, type SectionMarker } from '@/components/layout/section-indicator';
import { About } from '@/components/sections/about';
import { Hero } from '@/components/sections/hero';
// Sekcja YouTube jest asynchronicznym komponentem serwerowym (pobiera
// najnowszy film), więc importujemy ją wprost, nie przez `next/dynamic`.
import { Youtube } from '@/components/sections/youtube';
import { JsonLd } from '@/components/shared/json-ld';
import { personSchema, servicesSchema } from '@/lib/seo';

/**
 * Sekcje spod pierwszego ekranu są dzielone na osobne paczki. Nadal
 * renderują się po stronie serwera (bez `ssr: false`), więc SEO i wersja
 * bez JS-a są nietknięte — chodzi tylko o to, żeby nie siedziały
 * w początkowym bundlu.
 */
const Services = dynamic(() =>
  import('@/components/sections/services').then((mod) => mod.Services)
);
const Pricing = dynamic(() => import('@/components/sections/pricing').then((mod) => mod.Pricing));
const Collaboration = dynamic(() =>
  import('@/components/sections/collaboration').then((mod) => mod.Collaboration)
);
const Contact = dynamic(() => import('@/components/sections/contact').then((mod) => mod.Contact));

/** Steruje listwą postępu po prawej. `id` musi pasować do `id` sekcji. */
const sections: SectionMarker[] = [
  { id: 'hero', label: 'Start' },
  { id: 'o-mnie', label: 'O mnie' },
  { id: 'uslugi', label: 'Usługi' },
  { id: 'cennik', label: 'Cennik' },
  { id: 'wspolpraca', label: 'Współpraca' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'kontakt', label: 'Kontakt' },
];

export default function HomePage() {
  return (
    <>
      <SectionIndicator sections={sections} />

      <Hero />
      <About />
      <Services />
      <Pricing />
      <Collaboration />
      <Youtube />
      <Contact />

      <JsonLd data={servicesSchema()} />
      <JsonLd data={personSchema()} />
    </>
  );
}
