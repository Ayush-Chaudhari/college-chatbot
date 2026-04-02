import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["chromadb", "pdf-parse", "unpdf", "@langchain/textsplitters", "langchain"],
};

export default nextConfig;