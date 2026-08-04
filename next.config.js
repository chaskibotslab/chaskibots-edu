/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'chaskibots.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Some browser-only ML packages (@tensorflow-models/speech-commands) reference
    // Node built-ins in unused code paths; stub them out for the client bundle.
    if (!isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false, crypto: false }
    }
    // @tensorflow-models/pose-detection statically references optional runtime
    // backends (MediaPipe, WebGPU) we never use (we only use the 'tfjs' runtime
    // with MoveNet) — alias them away so webpack doesn't try to resolve them.
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mediapipe/pose': false,
      '@tensorflow/tfjs-backend-webgpu': false,
    }
    return config
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
}

module.exports = nextConfig
