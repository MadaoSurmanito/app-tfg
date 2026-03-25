import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,

	// Para evitar errores con túneles tipo Cloudflare en dev
	allowedDevOrigins: ["*.trycloudflare.com"],

	// evitar que Next bundlee TypeORM (rompe metadata en build)
	serverExternalPackages: ["typeorm", "pg"],
};

export default nextConfig;