"use client";

import { useState } from "react";

/**
 * Página para que los administradores registren usuarios directamente.
 * Permite elegir el tipo de usuario: comercial o cliente.
 */
function AdminRegisterUser() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [userType, setUserType] = useState("comercial");

	async function handleAdminSubmit(e: React.FormEvent<HTMLFormElement>) {
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
		const type = userType;

		if (!email || !name || !company || !password) {
			setError("Por favor, completa todos los campos requeridos");
			setLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/admin/register-user", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email,
					name,
					company,
					phone,
					password,
					type,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.message || "Error al registrar el usuario");
				setLoading(false);
				return;
			}

			setSuccess("Usuario registrado correctamente.");
			form.reset();
			setUserType("comercial");
		} catch {
			setError("Error al procesar el registro");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="mx-auto mt-12 w-full max-w-sm">
			<form
				onSubmit={handleAdminSubmit}
				className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-md"
			>
				<h2 className="mb-2 text-center text-xl font-semibold">
					Registrar usuario (admin)
				</h2>

				<select
					name="type"
					value={userType}
					onChange={(e) => setUserType(e.target.value)}
					className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black"
				>
					<option value="comercial">Comercial</option>
					<option value="cliente">Cliente</option>
				</select>

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
					{loading ? "Registrando..." : "Registrar usuario"}
				</button>

				{error && <p className="text-center text-sm text-red-600">{error}</p>}
				{success && (
					<p className="text-center text-sm text-green-600">{success}</p>
				)}
			</form>
		</div>
	);
}

export default AdminRegisterUser;