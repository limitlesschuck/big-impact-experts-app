/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  async redirects() {
    return [
      {
        source: "/nextjs-app/:path*",
        destination: "/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "artwork.captivate.fm",
      },
      {
        protocol: "https",
        hostname: "podcasts.captivate.fm",
      },
      {
        protocol: "https",
        hostname: "pub-f55ad41545c5408aba9e32ba75a9239f.r2.dev",
      },
    ],
  },
};

export default nextConfig;
