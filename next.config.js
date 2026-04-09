/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: false,
  },
  images: {
    domains: [
      'localhost', 
      'supabase.co', 
      'supabase.in',
      'images.unsplash.com',
      'lh3.googleusercontent.com',
      'img.youtube.com',
      'drive.google.com',
      '*.googleusercontent.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    workerThreads: false,
    cpus: 1
  },
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';

    const cspHeader = `
      default-src 'self';
      script-src 'self' ${isDev ? "'unsafe-eval'" : ""} 'unsafe-inline' https://*.supabase.co https://*.googleapis.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: https: blob:;
      frame-src 'self' https://www.youtube.com https://drive.google.com https://*.google.com;
      connect-src 'self' https://*.supabase.co https://*.googleapis.com ${isDev ? "ws: wss:" : ""}
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
