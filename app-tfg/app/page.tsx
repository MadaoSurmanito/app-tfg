"use client";

import { useState } from "react";
import HeaderTitle from "./components/HeaderTitle";
import PageTransition from "./components/PageTransition";
import AnimatedLink from "./components/AnimatedLink";

export default function Home() {
	const [leaving, setLeaving] = useState(false);

	return (
		<main className="app-bg flex min-h-screen w-full flex-col text-slate-800">
			<div className="bg-overlay fixed inset-0 -z-10" />
			<section className="flex-1 overflow-y-auto px-6 pt-4 pb-6">
				<HeaderTitle title="Bienvenido a Kinestilistas" />

				<PageTransition
					isLeaving={leaving}
					className="glass-card mx-auto max-w-2xl rounded-2xl p-6 text-center"
				>
					<p className="mb-4 text-lg text-gray-700">
						Kinestilistas es tu aplicación profesional para peluquerías,
						diseñada para ayudarte a gestionar tu negocio de manera eficiente y
						ofrecer una experiencia excepcional a tus clientes.
					</p>
					<p className="mb-6 text-lg text-gray-700">
						Explora nuestras funcionalidades y descubre cómo Kinestilistas puede
						transformar tu peluquería.
					</p>

					<AnimatedLink
						href="/login"
						onNavigateStart={() => setLeaving(true)}
						className="inline-block rounded-full bg-blue-600 px-6 py-3 text-white transition duration-200 hover:bg-blue-700 active:scale-95"
					>
						Comenzar
					</AnimatedLink>
				</PageTransition>
			</section>
		</main>
	);
}
