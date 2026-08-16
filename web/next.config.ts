import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOT a static export anymore -- /api/ask needs a real serverless
  // function (calls the Anthropic API at request time). Everything else
  // (the audit pages) still statically optimizes on its own; only the API
  // route becomes a Vercel function.
};

export default nextConfig;
