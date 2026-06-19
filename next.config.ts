import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/blogs',
        destination: '/cam-nang',
        permanent: true,
      },
      {
        source: '/blogs/:slug',
        destination: '/cam-nang/:slug',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
