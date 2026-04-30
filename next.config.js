/** @type {import('next').NextConfig} */
const isStaticExport = process.env.L1NX_STATIC_EXPORT === "1";

const nextConfig = {
  reactStrictMode: true,
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
        images: { unoptimized: true },
        distDir: ".next-export",
        basePath: process.env.L1NX_BASE_PATH || "",
      }
    : {
        async redirects() {
          return [
            { source: "/train", destination: "/missions", permanent: false },
            { source: "/explore", destination: "/arsenal", permanent: false },
            { source: "/progress", destination: "/profile", permanent: false },
            { source: "/forge/speed-run", destination: "/train/quick-draw", permanent: false },
          ];
        },
      }),
};
module.exports = nextConfig;
