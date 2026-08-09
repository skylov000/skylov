import { about, pricing, services, site, socialLinks, tracks } from '@/content/content';
import { absoluteUrl } from '@/lib/utils';

/**
 * Dane strukturalne Schema.org.
 *
 * Renderowane jako JSON-LD w dokumencie. Wszystko wyliczane jest
 * z `content.ts`, więc znaczniki nie mogą się rozjechać z tym,
 * co widać na stronie.
 */

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    '@id': absoluteUrl(site.url, '/#skylov'),
    name: site.name,
    alternateName: 'Skylov',
    description: site.description,
    url: site.url,
    image: absoluteUrl(site.url, site.ogImage),
    logo: absoluteUrl(site.url, '/logo/logo.png'),
    foundingDate: site.founded,
    genre: ['Electronic', 'Techno', 'House', 'Slap House', 'Drum and Bass', 'Trap'],
    sameAs: socialLinks.map((social) => social.href),
    track: tracks.map((item) => ({
      '@type': 'MusicRecording',
      name: item.title,
      byArtist: { '@type': 'MusicGroup', name: item.artist },
    })),
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absoluteUrl(site.url, '/#website'),
    url: site.url,
    name: site.name,
    description: site.description,
    publisher: { '@id': absoluteUrl(site.url, '/#skylov') },
    inLanguage: 'pl',
  };
}

/**
 * Usługi wraz z cenami. `pricing` niesie ceny w formie „od 200 zł",
 * więc wyciągamy z nich samą liczbę na potrzeby `lowPrice`.
 */
export function servicesSchema() {
  const priceOf = (id: string) => {
    const plan = pricing.find((item) => item.id === id);
    if (!plan) return undefined;
    const digits = plan.price.replace(/\D/g, '');
    return digits.length > 0 ? digits : undefined;
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: `Usługi — ${site.name}`,
    itemListElement: services.map((service, index) => {
      const lowPrice = priceOf(service.id);

      return {
        '@type': 'Offer',
        position: index + 1,
        itemOffered: {
          '@type': 'Service',
          name: service.title,
          description: service.description,
          provider: { '@id': absoluteUrl(site.url, '/#skylov') },
        },
        ...(lowPrice
          ? {
              priceSpecification: {
                '@type': 'PriceSpecification',
                minPrice: lowPrice,
                priceCurrency: 'PLN',
              },
            }
          : {}),
      };
    }),
  };
}

export function personSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Skylov',
    jobTitle: 'Producent muzyczny',
    description: about.lead,
    url: site.url,
    sameAs: socialLinks.map((social) => social.href),
    knowsAbout: services.map((service) => service.title),
  };
}
