/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow external images from any domain (product images from scraped sites)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Increase serverless function timeout for scraping
  serverExternalPackages: ['cheerio'],
};

export default nextConfig;
