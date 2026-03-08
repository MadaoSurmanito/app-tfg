import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// esto es para configurar el PWA, se puede usar el nextConfig directamente pero no se pueden exportar ambos a la vez, por eso se envuelve el nextConfig con el withPWA
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development"
});

// esto hace que se pueda exportar nextConfig directamente envolviendolo con el withPWA
module.exports = withPWA({
  reactStrictMode: true
});