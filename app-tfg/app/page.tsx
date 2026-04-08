"use client";

import { useState } from "react";
import HeaderTitle from "./components/basics/HeaderTitle";
import PageTransition from "./components/animations/PageTransition";
import Link from "next/link";

export default function Home() {
	const [leaving, setLeaving] = useState(false);

	return (
		<main className="app-bg flex min-h-screen w-full flex-col text-slate-800">
			<div className="bg-overlay fixed inset-0 -z-10" />

			<section className="flex-1 overflow-y-auto px-6 pt-4 pb-6">
				<HeaderTitle title="Kinestilistas" />
 
				<PageTransition
					isLeaving={leaving}
					className="glass-card mx-auto max-w-2xl rounded-2xl p-6 text-center"
				>
					<h2 className="text-2xl font-bold text-black">
						¡Bienvenido a Kinestilistas!
					</h2>

					<p className="mt-4 mb-4 rounded-lg bg-white/50 p-4 text-lg text-gray-700">
						La plataforma definitiva para llevar tu peluquería al siguiente
						nivel. Ya seas un profesional buscando optimizar tu negocio o un
						cliente deseando descubrir todo lo que ofrecemos, estás en el lugar
						correcto.
					</p>

					<p className="mt-4 mb-4 rounded-lg bg-white/50 p-4 text-lg text-gray-700">
						Explora nuestras funcionalidades y descubre cómo Kinestilistas puede
						transformar tu peluquería.
					</p>

					<Link
						href="/login"
						onClick={() => setLeaving(true)}
						className="inline-block rounded-full bg-blue-600 px-6 py-3 text-white transition duration-200 hover:bg-blue-700 active:scale-95"
					>
						Comenzar
					</Link>
				</PageTransition>
			</section>
		</main>
	);
}