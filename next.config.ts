import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // Permite testar numa pasta de build separada (ex.: NEXT_DIST_DIR=.next-teste) sem corromper
  // a `.next` de outro servidor Next que esteja rodando neste projeto.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
