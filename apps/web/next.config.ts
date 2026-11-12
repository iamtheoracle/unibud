import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ["argon2", "@simplewebauthn/server"]
};

export default nextConfig;
