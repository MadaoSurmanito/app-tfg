"use client";

import { useState } from "react";
import HeaderTitle from "../components/HeaderTitle";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError("");
		setSuccess("");
		setLoading(true);

		const form = e.currentTarget;
		const formData = new FormData(form);

		const email = String(formData.get("email") ?? "")
			.trim()
			.toLowerCase();
		const name = String(formData.get("name") ?? "").trim();
		const company = String(formData.get("company") ?? "").trim();
		const phone = String(formData.get("phone") ?? "").trim();
		const password = String(formData.get("password") ?? "");
		
		if (!email || !name || !company || !password) {
			setError("Por favor, completa todos los campos requeridos");
			setLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/auth/register-request", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, name, company, phone, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.message || "Error al enviar la solicitud");
				setLoading(false);
				return;
			}

			setSuccess("Solicitud enviada. El administrador la revisará pronto.");
			form.reset();

			setTimeout(() => {
				router.push("/login");
			}, 2000);
		} catch {
			setError("Error al procesar la solicitud");
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="app-bg min-h-[100svh] w-full px-4 py-4 text-slate-800">
			<HeaderTitle title="Solicitar acceso" noGlass />

			<div className="mx-auto mt-6 w-full max-w-sm">
				<form
					onSubmit={handleSubmit}
					className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-md"
				>
					<h2 className="mb-2 text-center text-xl font-semibold">
						Solicitar acceso
					</h2>

					<input
						name="name"
						type="text"
						placeholder="Nombre completo"
						required
						className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black"
					/>

					<input
						name="email"
						type="email"
						placeholder="Correo electrónico"
						autoComplete="email"
						required
						className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black"
					/>

					<input
						name="company"
						type="text"
						placeholder="Empresa"
						required
						className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black"
					/>

					<input
						name="phone"
						type="tel"
						placeholder="Teléfono"
						autoComplete="tel"
						className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black"
					/>

					<input
						name="password"
						type="password"
						placeholder="Contraseña"
						required
						minLength={4}
						className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black"
					/>

					<button
						type="submit"
						disabled={loading}
						className="mt-2 rounded-lg bg-black py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
					>
						{loading ? "Enviando..." : "Solicitar acceso"}
					</button>

					{error && <p className="text-center text-sm text-red-600">{error}</p>}

					{success && (
						<p className="text-center text-sm text-green-600">{success}</p>
					)}
				</form>
			</div>

			<div className="mx-auto mt-6 w-full max-w-sm text-center">
				<p className="text-sm text-slate-600">
					¿Ya tienes acceso?{" "}
					<Link
						href="/login"
						className="font-semibold text-black hover:underline"
					>
						Inicia sesión aquí
					</Link>
				</p>
			</div>
		</main>
	);
}
