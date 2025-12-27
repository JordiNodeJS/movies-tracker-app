import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    dynamicIO: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
  cacheLife: {
    trending: {
      stale: 3600,
      revalidate: 7200,
      expire: 86400,
    },
    movie: {
      stale: 86400,
      revalidate: 172800,
      expire: 604800,
    },
    search: {
      stale: 300,
      revalidate: 600,
      expire: 3600,
    },
    genres: {
      stale: 86400,
      revalidate: 604800,
      expire: 2592000,
    },
  },
};

export default withNextIntl(nextConfig);
