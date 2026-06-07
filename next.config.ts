import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tăng giới hạn body size cho Server Actions (upload video lớn)
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
} as NextConfig;

export default nextConfig;
