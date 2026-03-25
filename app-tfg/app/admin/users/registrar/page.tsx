"use client";

import { useState } from "react";
import PasswordFieldWithStrength from "@/app/components/users/PasswordFieldWithStrength";
import PageTransition from "@/app/components/animations/PageTransition";

// Página de registro manual de usuarios desde el panel de administración.
// Permite al admin crear usuarios internos sin pasar por el flujo público.
function AdminRegisterUser() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [userType, setUserType] = useState("comercial");

	// Gestiona el envío del formulario y comunica el alta a la API interna.
	// Antes de enviar, normaliza y valida los datos básicos del formulario.
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
		const confirmPassword = String(formData.get("confirm_password") ?? "");
		const type = userType;

		// Comprueba que los campos obligatorios estén informados antes de enviar.
		if (!email || !name || !company || !password) {
			setError("Por favor, completa todos los campos requeridos");
			setLoading(false);
			return;
		}

		// Verifica localmente la coincidencia entre contraseña y confirmación.
		if (password !== confirmPassword) {
			setError("Las contraseñas no coinciden");
			setLoading(false);
			return;
		}

		// Envía la solicitud de registro a la API interna y maneja la respuesta.
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

			// Si la API rechaza la operación, muestra el mensaje recibido.
			if (!response.ok) {
				setError(data.error || data.message || "Error al registrar el usuario");
				setLoading(false);
				return;
			}

			// Tras un alta correcta, limpia el formulario y restaura el tipo por defecto.
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
		<PageTransition>
			{/* Formulario de registro para administradores, con campos para toda la información relevante del usuario. */}
			<div className="mx-auto mt-12 w-full max-w-sm">
				<form
					onSubmit={handleAdminSubmit}
					className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-md"
				>
					{/* Título */}
					<h2 className="mb-2 text-center text-xl font-semibold">
						Registrar usuario (admin)
					</h2>

					{/* Selector de tipo de usuario, (comercial o cliente) */}
					<select
						name="type"
						value={userType}
						onChange={(e) => setUserType(e.target.value)}
						className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black"
					>
						<option value="comercial">Comercial</option>
						<option value="cliente">Cliente</option>
					</select>

					{/* Campos de información del usuario */}
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

					{/* Componente de contraseña con indicador de fortaleza y confirmación */}
					<PasswordFieldWithStrength
						name="password"
						label="Contraseña"
						placeholder="Contraseña"
						required
						showConfirm
						confirmName="confirm_password"
					/>

					<button
						type="submit"
						disabled={loading}
						className="mt-2 rounded-lg bg-black py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
					>
						{loading ? "Registrando..." : "Registrar usuario"}
					</button>
					{/* Muestra mensajes de error o éxito según corresponda, debajo del botón de envío. */}
					{error && <p className="text-center text-sm text-red-600">{error}</p>}
					{success && (
						<p className="text-center text-sm text-green-600">{success}</p>
					)}
				</form>
			</div>
		</PageTransition>
	);
}

export default AdminRegisterUser;
