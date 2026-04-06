import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,

	// Para evitar errores con túneles tipo Cloudflare en dev
	allowedDevOrigins: ["*.trycloudflare.com"],

	// Evitar que Next bundlee TypeORM (rompe metadata en build)
	serverExternalPackages: ["typeorm", "pg"],

	// Permite cargar imágenes remotas desde Cloudinary con next/image
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
			},
		],
	},
};

export default nextConfig;
