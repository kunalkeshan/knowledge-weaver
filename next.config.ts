import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow cross-origin requests from ngrok (and similar) when accessing /_next/* resources
  allowedDevOrigins: [
    'https://sharla-unblossoming-caressingly.ngrok-free.dev',
    'https://knowledge-weaver-seven.vercel.app/',
  ],
  // Explicit function so build never receives a non-function (Next.js config merge edge case)
  generateBuildId: async () => null,
}

export default nextConfig
