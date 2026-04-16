"use client";

import { useEffect, useState } from "react";
import {
	fetchAdminCommercialOptions,
	getAdminCommercialLabel,
	type AdminCommercialOption,
} from "@/app/admin/users/_shared/admin-commercial-options";
import PasswordFieldWithStrength from "@/app/components/users/PasswordFieldWithStrength";
import PageTransition from "@/app/components/animations/PageTransition";
import SafeForm from "@/app/components/forms/SafeForm";
import SubmitButton from "@/app/components/forms/SubmitButton";

// admin/users/registrar
// Página de registro manual de usuarios desde el panel de administración.
// Permite al administrador crear nuevos usuarios internos sin pasar
// por el flujo público de solicitud de acceso.
export default function AdminRegisterUserPage() {
	// ESTADO LOCAL
	// Controla el estado de envío del formulario y los mensajes de feedback.
	const [loading, setLoading] = useState(false);
	const [loadingCommercials, setLoadingCommercials] = useState(true);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [userType, setUserType] = useState("comercial");
	const [commercials, setCommercials] = useState<AdminCommercialOption[]>([]);
	const [selectedCommercialId, setSelectedCommercialId] = useState("");

	useEffect(() => {
		let ignore = false;

		async function loadCommercials() {
			try {
				setLoadingCommercials(true);
				const data = await fetchAdminCommercialOptions();

				if (!ignore) {
					setCommercials(data);
				}
			} catch (err) {
				if (!ignore) {
					setError(
						err instanceof Error
							? err.message
							: "Error al cargar los comerciales",
					);
				}
			} finally {
				if (!ignore) {
					setLoadingCommercials(false);
				}
			}
		}

		void loadCommercials();

		return () => {
			ignore = true;
		};
	}, []);

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
		const commercialId =
			type === "cliente" ? selectedCommercialId.trim() : null;

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

		// VALIDACIÓN DE COMERCIAL ASIGNADO
		// Si el usuario a crear es un cliente, debe indicarse su comercial.
		if (type === "cliente" && !commercialId) {
			setError("Debes seleccionar el comercial asignado para el cliente");
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
					commercialId,
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
			setSelectedCommercialId("");
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
				<SafeForm
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
						onChange={(e) => {
							const nextType = e.target.value;
							setUserType(nextType);

							if (nextType !== "cliente") {
								setSelectedCommercialId("");
							}
						}}
						className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black"
					>
						<option value="comercial">Comercial</option>
						<option value="cliente">Cliente</option>
					</select>

					{/* COMERCIAL ASIGNADO */}
					{/* Solo es obligatorio cuando el usuario a crear es un cliente. */}
					{userType === "cliente" ? (
						<div className="flex flex-col gap-2">
							<label className="text-sm font-medium text-gray-700">
								Comercial asignado
							</label>

							<select
								name="commercialId"
								value={selectedCommercialId}
								onChange={(e) => setSelectedCommercialId(e.target.value)}
								disabled={loadingCommercials}
								className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
							>
								<option value="">
									{loadingCommercials
										? "Cargando comerciales..."
										: "Selecciona un comercial"}
								</option>
								{commercials.map((commercial) => (
									<option key={commercial.id} value={commercial.id}>
										{getAdminCommercialLabel(commercial)}
									</option>
								))}
							</select>

							<p className="text-xs text-gray-500">
								Cada cliente debe quedar asociado a un único comercial.
							</p>
						</div>
					) : null}

					{/* DATOS DEL USUARIO */}
					<input
						name="name"
						type="text"
						placeholder="Nombre completo"
						autoComplete="name"
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
						autoComplete="organization"
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
					<SubmitButton
						isSubmitting={loading}
						submittingText="Registrando..."
						className="mt-2 rounded-lg bg-black font-medium text-white hover:opacity-90"
					>
						Registrar usuario
					</SubmitButton>

					{/* FEEDBACK */}
					{/* Muestra mensajes de error o de éxito tras el intento de registro. */}
					{error && <p className="text-center text-sm text-red-600">{error}</p>}
					{success && (
						<p className="text-center text-sm text-green-600">{success}</p>
					)}
				</SafeForm>
			</div>
		</PageTransition>
	);
}
