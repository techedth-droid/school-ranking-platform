/** @type {import('next').NextConfig} */
const PROD_API_URL = 'https://school-ranking-platform-production.up.railway.app';
const defaultApiUrl = process.env.NODE_ENV === 'production' ? PROD_API_URL : 'http://localhost:3005';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || defaultApiUrl;

function uploadRemotePatterns() {
  const patterns = [
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '3005',
      pathname: '/uploads/**',
    },
    {
      protocol: 'http',
      hostname: 'backend',
      port: '3005',
      pathname: '/uploads/**',
    },
  ];
  try {
    const u = new URL(apiUrl);
    if (u.hostname && u.hostname !== 'localhost') {
      patterns.push({
        protocol: u.protocol.replace(':', ''),
        hostname: u.hostname,
        ...(u.port ? { port: u.port } : {}),
        pathname: '/uploads/**',
      });
    }
  } catch {
    /* ignore */
  }
  return patterns;
}

const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: uploadRemotePatterns(),
  },
  async redirects() {
    return [{ source: '/ranking', destination: '/', permanent: true }];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
