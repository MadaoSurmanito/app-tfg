"use client";

import { useState } from "react";
import PasswordFieldWithStrength from "@/app/components/users/PasswordFieldWithStrength";
import PageTransition from "@/app/components/animations/PageTransition";

// admin/users/registrar
// Página de registro manual de usuarios desde el panel de administración.
// Permite al administrador crear nuevos usuarios internos sin pasar
// por el flujo público de solicitud de acceso.
export default function AdminRegisterUserPage() {
	// ESTADO LOCAL
	// Controla el estado de envío del formulario y los mensajes de feedback.
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [userType, setUserType] = useState("comercial");

	// ENVÍO DEL FORMULARIO
	// Recoge los datos introducidos, realiza validaciones básicas en cliente
	// y envía la petición de alta a la API interna de administración.
	async function handleAdminSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		setError("");
		setSuccess("");
		setLoading(true);

		const form = e.currentTarget;
		const formData = new FormData(form);

		// LECTURA Y NORMALIZACIÓN DE DATOS
		// Se limpian los campos de texto para evitar espacios sobrantes.
		const email = String(formData.get("email") ?? "")
			.trim()
			.toLowerCase();
		const name = String(formData.get("name") ?? "").trim();
		const company = String(formData.get("company") ?? "").trim();
		const phone = String(formData.get("phone") ?? "").trim();
		const password = String(formData.get("password") ?? "");
		const confirmPassword = String(formData.get("confirm_password") ?? "");
		const type = userType;

		// VALIDACIÓN BÁSICA
		// Comprueba que los campos obligatorios estén presentes antes de enviar.
		if (!email || !name || !company || !password) {
			setError("Por favor, completa todos los campos requeridos");
			setLoading(false);
			return;
		}

		// VALIDACIÓN DE CONTRASEÑA
		// Verifica localmente que la contraseña y su confirmación coincidan.
		if (password !== confirmPassword) {
			setError("Las contraseñas no coinciden");
			setLoading(false);
			return;
		}

		// PETICIÓN A LA API
		// Envía la información del formulario al endpoint interno encargado
		// del alta administrativa de usuarios.
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

			// Si la API devuelve un error, se muestra el mensaje recibido.
			if (!response.ok) {
				setError(data.error || data.message || "Error al registrar el usuario");
				setLoading(false);
				return;
			}

			// Si el alta se completa correctamente, se limpia el formulario
			// y se restablece el tipo de usuario por defecto.
			setSuccess("Usuario registrado correctamente.");
			form.reset();
			setUserType("comercial");
		} catch {
			setError("Error al procesar el registro");
		} finally {
			setLoading(false);
		}
	}

	// RENDER
	return (
		<PageTransition>
			<div className="mx-auto mt-12 w-full max-w-sm">
				<form
					onSubmit={handleAdminSubmit}
					className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-md"
				>
					{/* CABECERA */}
					<h2 className="mb-2 text-center text-xl font-semibold">
						Registrar usuario (admin)
					</h2>

					{/* TIPO DE USUARIO */}
					{/* Permite elegir si el alta corresponde a un comercial o a un cliente. */}
					<select
						name="type"
						value={userType}
						onChange={(e) => setUserType(e.target.value)}
						className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black"
					>
						<option value="comercial">Comercial</option>
						<option value="cliente">Cliente</option>
					</select>

					{/* DATOS DEL USUARIO */}
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

					{/* CONTRASEÑA */}
					{/* Componente reutilizable con indicador de fortaleza y confirmación. */}
					<PasswordFieldWithStrength
						name="password"
						label="Contraseña"
						placeholder="Contraseña"
						required
						showConfirm
						confirmName="confirm_password"
					/>

					{/* ACCIÓN PRINCIPAL */}
					<button
						type="submit"
						disabled={loading}
						className="mt-2 rounded-lg bg-black py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
					>
						{loading ? "Registrando..." : "Registrar usuario"}
					</button>

					{/* FEEDBACK */}
					{/* Muestra mensajes de error o de éxito tras el intento de registro. */}
					{error && <p className="text-center text-sm text-red-600">{error}</p>}
					{success && (
						<p className="text-center text-sm text-green-600">{success}</p>
					)}
				</form>
			</div>
		</PageTransition>
	);
}
