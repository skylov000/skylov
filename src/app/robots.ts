import type { MetadataRoute } from 'next';

import { site } from '@/content/content';
import { absoluteUrl } from '@/lib/utils';

/**
 * Served at /robots.txt.
 *
 * Generated rather than static so the sitemap URL always matches
 * NEXT_PUBLIC_SITE_URL — a hardcoded file drifts the moment you
 * change domain.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: absoluteUrl(site.url, '/sitemap.xml'),
    host: site.url,
  };
}
