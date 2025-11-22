/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@shared'],
  output: 'standalone',
  serverComponentsExternalPackages: [],
};

export default nextConfig;

