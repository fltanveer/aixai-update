import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Blog posts live in src/content/blog as .mdx files and are imported as pages' content.
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  images: { formats: ["image/avif", "image/webp"] },
  poweredByHeader: false,
  // a package-lock.json higher up the disk must not be taken for this app's workspace root
  turbopack: { root: process.cwd() },
};

// Plugins are named as strings so the config stays serialisable for Turbopack.
export default createMDX({ options: { remarkPlugins: [["remark-gfm"]] } })(nextConfig);
