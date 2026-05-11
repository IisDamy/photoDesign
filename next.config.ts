import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    turbopack: {
    rules: {
      "*.{glsl,frag,vert}": {
        loaders: ['raw-loader'],
        as: "*.js",
      },
    },
  },

  
};

export default nextConfig;
