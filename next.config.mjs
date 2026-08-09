/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    // Modern formats first — Next will negotiate with the browser.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920, 2560, 3840],
    imageSizes: [64, 96, 128, 200, 256, 384],
    // Every `quality` value used with next/image must be declared here
    // (required from Next.js 16).
    qualities: [75, 88, 90, 92, 95],
    // Miniatury najnowszego filmu pobierane z serwerów YouTube.
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' },
    ],
  },

  // Keeps the client bundle small: only the icons actually used get shipped.
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
