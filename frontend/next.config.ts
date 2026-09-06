import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // Hide the Next.js dev-tools bubble (bottom-left "N" button) during local demos.
  // Dev-only: the static export never renders it. Compile/runtime errors still surface.
  devIndicators: false,
};

export default nextConfig;
