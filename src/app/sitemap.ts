import type { MetadataRoute } from 'next';

import { site } from '@/content/content';
import { absoluteUrl } from '@/lib/utils';

/** Serwowane pod /sitemap.xml. Generowane przy każdym buildzie. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl(site.url, '/'),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
