import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Monorepo: trace files from the repo root so server bundles can include ../../content.
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),
  // Pages render at runtime for unknown project slugs and read content/ then; ship it.
  outputFileTracingIncludes: { "/**": ["../../content/**/*.mdx"] },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
