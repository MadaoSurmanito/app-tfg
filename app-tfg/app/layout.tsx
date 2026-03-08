import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Kinestilistas",
	description: "Aplicación profesional para peluquerías",

	// necesario para que Android detecte la PWA
	manifest: "/manifest.webmanifest",

	// configuración específica para iOS / iPadOS
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "Kinestilistas",
	},

	icons: {
		icon: [
			{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
			{ url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
		],
		apple: [{ url: "/icons/apple-touch-icon.png" }],
	},
};

// Layout raíz de la aplicación que envuelve a todas las páginas y componentes
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="es">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
