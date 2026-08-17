/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [{ source: '/majors/compare', destination: '/majors', permanent: true }];
  },
};

export default nextConfig;
