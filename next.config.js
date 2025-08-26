/** @type {import('next').NextConfig} */
const nextConfig = {
  // Netlify deployment optimizations
  output: 'standalone',
  
  // Disable image optimization for Netlify
  images: {
    unoptimized: true
  },
  
  // API routes configuration
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
  
  // Experimental features for better performance
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: 'netlify-deployment',
  },
}

module.exports = nextConfig