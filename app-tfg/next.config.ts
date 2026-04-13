import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,

	// Para evitar errores con túneles tipo Cloudflare / DevTunnels al hacer fetch desde el cliente a la API
	allowedDevOrigins: ["*.trycloudflare.com", "*.devtunnels.ms"],

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
