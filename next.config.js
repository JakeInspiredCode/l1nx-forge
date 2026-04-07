/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/train", destination: "/missions", permanent: false },
      { source: "/explore", destination: "/arsenal", permanent: false },
      { source: "/progress", destination: "/profile", permanent: false },
      { source: "/drill", destination: "/arsenal", permanent: false },
      { source: "/foundations", destination: "/arsenal", permanent: false },
      { source: "/terminal", destination: "/arsenal", permanent: false },
      { source: "/cards", destination: "/arsenal", permanent: false },
      { source: "/forge/speed-run", destination: "/train/quick-draw", permanent: false },
    ];
  },
};
module.exports = nextConfig;
