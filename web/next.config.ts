import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static: every page is build-time-only (fs reads of data/ JSON,
  // generateStaticParams for the audit detail route), no server actions or
  // API routes. Static export deploys as plain files -- no serverless
  // function/lambda involved, sidestepping the Vercel builder issue seen
  // with SSG dynamic routes on this Next.js version.
  output: "export",
};

export default nextConfig;
