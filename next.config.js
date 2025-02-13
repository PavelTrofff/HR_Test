/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true 
  },
  output: 'standalone',
  experimental: {
    appDir: true
  }
};

module.exports = nextConfig;