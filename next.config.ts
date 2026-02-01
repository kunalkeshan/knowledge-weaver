import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow cross-origin requests from ngrok (and similar) when accessing /_next/* resources
  allowedDevOrigins: [
    'https://sharla-unblossoming-caressingly.ngrok-free.dev',
  ],
}

export default nextConfig
