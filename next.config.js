/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          destination: "/fromgun/a",
        },
        {
          source: "/index",
          destination: "/fromgun/a",
        },
        {
          source: "/fromgun",
          destination: "/fromgun/a",
        },
      ],
    };
  },
};

module.exports = nextConfig;
