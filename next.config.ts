// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org', // TMDB görselleri için
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com', // YouTube thumbnail'ları veya diğer resimleri için
        port: '',
        pathname: '**',
      },
    ],
  },
  // ... diğer Next.js ayarları
};

module.exports = nextConfig;