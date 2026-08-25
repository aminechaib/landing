import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.NODE_ENV === "development"
    ? {
        headers: async () => [
          {
            source: "/(.*)",
            headers: [
              { key: "Cache-Control", value: "no-store, must-revalidate" },
              { key: "Pragma", value: "no-cache" },
              { key: "X-Accel-Expires", value: "0" },
            ],
          },
        ],
      }
    : {}),
};

export default nextConfig;
