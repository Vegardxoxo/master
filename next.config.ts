import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
      SUPER_TOKEN: process.env.SUPER_TOKEN,
  }
};

export default nextConfig;
