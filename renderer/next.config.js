/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  compiler: {
    emotion: true,
  },
  compress: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.target = "electron-renderer";
    }
    return config;
  },
};

module.exports = nextConfig;
