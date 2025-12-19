import { NextConfig } from 'next';

// Get version info from Railway environment variables
const getVersion = () => {
  const commitSha = process.env.RAILWAY_GIT_COMMIT_SHA;
  const branch = process.env.RAILWAY_GIT_BRANCH;
  const deploymentId = process.env.RAILWAY_DEPLOYMENT_ID;

  if (deploymentId) {
    return deploymentId.substring(0, 8);
  }

  if (commitSha) {
    // Use short commit SHA (first 7 characters) for readability
    const shortSha = commitSha.substring(0, 7);
    return `${branch}@${shortSha}`;
  }

  return 'dev';
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@shared'],
  output: 'standalone',
  htmlLimitedBots: /.*/,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  devIndicators: false,
  env: {
    NEXT_PUBLIC_APP_VERSION: getVersion(),
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
};

export default nextConfig;
