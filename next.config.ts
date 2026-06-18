import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Allow .md / .mdx files to be treated as pages/components (blog posts).
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  // Pin the workspace root: a stray lockfile in the home directory otherwise
  // makes Next infer the wrong root (breaks output file tracing on deploy).
  turbopack: {
    root: projectRoot,
  },
};

const withMDX = createMDX({
  // Add remark/rehype plugins here later if desired (kept dependency-light for MVP).
});

export default withMDX(nextConfig);
