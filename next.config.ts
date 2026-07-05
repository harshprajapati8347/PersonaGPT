import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The chat route reads lib/persona.*.md at runtime with fs.readFileSync via a
  // computed path. Static tracing (@vercel/nft) can miss dynamically-built
  // paths, so we explicitly include the persona files in the route's trace to
  // guarantee they ship to serverless/Vercel.
  outputFileTracingIncludes: {
    "/api/chat": ["./lib/persona.*.md"],
  },
};

export default nextConfig;
