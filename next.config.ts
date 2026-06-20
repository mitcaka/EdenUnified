import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Tăng giới hạn body size cho Server Actions
    serverActions: {
      bodySizeLimit: '500mb',
    },
    // Tăng giới hạn body size cho API Routes (mặc định là 10MB - gây lỗi upload video)
    // Đây là config ĐÚNG để override DEFAULT_BODY_CLONE_SIZE_LIMIT trong body-streams.js
    proxyClientMaxBodySize: '500mb',
  },
} as NextConfig;

export default nextConfig;

