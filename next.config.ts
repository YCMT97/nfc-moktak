import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  ...(isProd && { output: 'export' }),
  trailingSlash: true,
  basePath: isProd ? '/nfc-moktak' : '',
  assetPrefix: isProd ? '/nfc-moktak/' : '',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
