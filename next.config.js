/** @type {import('next').NextConfig} */
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const isUserOrOrganizationSite = repositoryName?.endsWith('.github.io')

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath:
    process.env.GITHUB_ACTIONS === 'true' &&
    repositoryName &&
    !isUserOrOrganizationSite
      ? `/${repositoryName}`
      : '',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
}
module.exports = nextConfig
