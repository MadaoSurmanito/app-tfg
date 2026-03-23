"use client";

// Componente de de navegación inferior
// Este componente se muestra en la parte inferior de la pantalla y permite navegar entre las secciones principales de la aplicación

import { HomeIcon, ProfileIcon, SettingsIcon } from "./IconsSVGs";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function BottomNav() {
	// Maneja el cierre de sesión:
	// 1. Llama a la API para marcar la sesión como revocada
	// 2. Cierra la sesión en Auth.js
	const handleLogout = async () => {
		try {
			await fetch("/api/auth/logout", {
				method: "POST",
			});
		} catch (error) {
			console.error("[logout] error llamando a la API:", error);
		}

		// Cerramos sesión en Auth.js (esto elimina la cookie / JWT)
		await signOut({ redirect: false });
		window.location.href = "/login";
	};

	return (
		<footer className="glass-header mt-auto flex items-center justify-between px-10 py-4">
			{/* Botón de inicio */}
			<Link href="/">
				<button className="flex flex-col items-center opacity-100 hover:opacity-80 transition-opacity">
					<HomeIcon className="mb-1 h-6 w-6 text-black" />
					<span className="text-[10px] uppercase tracking-tight text-black">
						Inicio
					</span>
				</button>
			</Link>

			{/* Botón de perfil */}
			<Link href="/profile">
				<button className="flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity">
					<ProfileIcon className="mb-1 h-6 w-6 text-black" />
					<span className="text-[10px] uppercase tracking-tight text-black">
						Perfil
					</span>
				</button>
			</Link>

			{/* Botón de ajustes */}
			<Link href="/settings">
				<button className="flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity">
					<SettingsIcon className="mb-1 h-6 w-6 text-black" />
					<span className="text-[10px] uppercase tracking-tight text-black">
						Ajustes
					</span>
				</button>
			</Link>

			{/* Botón de cerrar sesión */}
			<button
				onClick={handleLogout}
				className="flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity"
			>
				<SettingsIcon className="mb-1 h-6 w-6 text-black" />
				<span className="text-[10px] uppercase tracking-tight text-black">
					Cerrar sesión
				</span>
			</button>
		</footer>
	);
}
