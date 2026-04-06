"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import PasswordFieldWithStrength from "@/app/components/users/PasswordFieldWithStrength";
import UserAvatar from "@/app/components/users/UserAvatar";
import {
	formatDate,
	getRoleClassesLight,
	getRoleLabel,
	getStatusClassesLight,
	getStatusLabel,
} from "@/lib/utils/user-utils";

// ----------------------------------------------------------------------------
// TIPOS Y HELPERS
// ---------------------------------------------------------------------------
// Tipo de datos para el usuario que se muestra en la tarjeta de perfil.
type UserProfileCardUser = {
	id: string;
	name: string;
	email: string;
	company?: string | null;
	phone?: string | null;
	profile_image_url?: string | null;
	created_at: string | Date;
	last_login_at?: string | Date | null;
	role_id?: number;
	status_id?: number;
	role: {
		code: "admin" | "client" | "commercial";
	};
	status: {
		code: "active" | "inactive" | "blocked";
	};
};

// Tipo de opción para los selectores de rol y estado en el modo de edición administrativa.
type CatalogOption = {
	id: number;
	name: string;
};

type UserProfileCardMode = "view" | "edit" | "admin-edit";

type Props = {
	user: UserProfileCardUser;
	mode?: UserProfileCardMode;
	title?: string;
	subtitle?: string;
	roles?: CatalogOption[];
	statuses?: CatalogOption[];
	backHref?: string;
	submitLabel?: string;
	submitUrl?: string;
	allowPasswordChange?: boolean;
};

type FormDataState = {
	name: string;
	email: string;
	company: string;
	phone: string;
	profile_image_url: string;
	roleId: number;
	statusId: number;
	password: string;
	confirmPassword: string;
};

function toDateString(value: string | Date | null | undefined) {
	if (!value) return null;
	return value instanceof Date ? value.toISOString() : value;
}

function buildInitialFormData(user: UserProfileCardUser): FormDataState {
	return {
		name: user.name ?? "",
		email: user.email ?? "",
		company: user.company ?? "",
		phone: user.phone ?? "",
		profile_image_url: user.profile_image_url ?? "",
		roleId: Number(user.role_id ?? 0),
		statusId: Number(user.status_id ?? 0),
		password: "",
		confirmPassword: "",
	};
}

export default function UserProfileCard({
	user,
	mode = "view",
	title,
	subtitle,
	roles = [],
	statuses = [],
	backHref,
	submitLabel,
	submitUrl,
	allowPasswordChange = false,
}: Props) {
	// ============================================================================
	// MODO ACTIVO Y FLAGS DERIVADOS
	// ============================================================================
	// Aquí se centraliza la lógica de qué "tipo" de tarjeta estamos pintando.
	// La idea es que si más adelante quieres cambiar qué aparece en cada modo,
	// solo tengas que tocar esta zona y los bloques marcados más abajo.
	const isViewMode = mode === "view";
	const isSelfEditMode = mode === "edit";
	const isAdminEditMode = mode === "admin-edit";

	// En esta card, cualquier modo distinto de "view" se considera editable.
	const isEditableMode = isSelfEditMode || isAdminEditMode;

	// La sección de contraseña aparece:
	// - siempre en edición de admin
	// - opcionalmente en edición de perfil propio
	const showPasswordSection =
		isAdminEditMode || (isSelfEditMode && allowPasswordChange);

	// ============================================================================
	// ESTADO LOCAL DE LA TARJETA
	// ============================================================================
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [formData, setFormData] = useState<FormDataState>(
		buildInitialFormData(user),
	);
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [selectedImageName, setSelectedImageName] = useState<string | null>(
		null,
	);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	// ============================================================================
	// DATOS DERIVADOS
	// ============================================================================
	const createdAt = toDateString(user.created_at);
	const lastLoginAt = toDateString(user.last_login_at);

	// Foto que se muestra en cabecera:
	// - en vista: la persistida en usuario
	// - en edición: la que se está escribiendo en el formulario
	const displayedProfileImage = isEditableMode
		? formData.profile_image_url
		: user.profile_image_url;

	// Texto auxiliar del bloque de subida de imagen.
	// Reglas:
	// - Si no tiene foto, se muestra "Ningún archivo seleccionado".
	// - Si está subiendo, se muestra "Subiendo... [nombre]".
	// - Si ya se subió una nueva imagen pero aún no se ha guardado el perfil,
	//   se muestra "[nombre] preparado para subir".
	// - Si el usuario ya tenía foto y no ha seleccionado una nueva, no se muestra nada.
	const profileImageStatusText = isUploadingImage
		? selectedImageName
			? `Subiendo... ${selectedImageName}`
			: "Subiendo..."
		: selectedImageName
			? `${selectedImageName} preparado para subir`
			: !formData.profile_image_url
				? "Ningún archivo seleccionado"
				: null;

	// ============================================================================
	// HELPERS DE FORMULARIO
	// ============================================================================
	// Manejador genérico para cambios en los campos del formulario.
	const handleChange =
		(field: keyof FormDataState) =>
		(
			e: React.ChangeEvent<
				HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
			>,
		) => {
			const value =
				field === "roleId" || field === "statusId"
					? Number(e.target.value)
					: e.target.value;

			setFormData((prev) => ({
				...prev,
				[field]: value,
			}));
		};

	// Función para restablecer el formulario a los valores iniciales del usuario.
	const resetForm = () => {
		setFormData(buildInitialFormData(user));
		setSelectedImageName(null);
		setErrorMessage(null);
		setSuccessMessage(null);

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// Manejador para subir la imagen de perfil seleccionada.
	const handleProfileImageUpload = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];

		if (!file) return;

		try {
			setSelectedImageName(file.name);
			setIsUploadingImage(true);
			setErrorMessage(null);
			setSuccessMessage(null);

			const uploadFormData = new FormData();
			uploadFormData.append("file", file);

			const response = await fetch("/api/profile/upload-image", {
				method: "POST",
				body: uploadFormData,
			});

			const body = await response.json().catch(() => null);

			if (!response.ok) {
				throw new Error(body?.message ?? "No se pudo subir la imagen");
			}

			setFormData((prev) => ({
				...prev,
				profile_image_url: body?.imageUrl ?? "",
			}));

			setSuccessMessage(
				"Imagen subida correctamente. Guarda los cambios para aplicarla al perfil.",
			);
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "No se pudo subir la imagen",
			);
			setSelectedImageName(null);
		} finally {
			setIsUploadingImage(false);

			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	// Abre el selector de archivos del input oculto.
	const openFilePicker = () => {
		fileInputRef.current?.click();
	};

	// Función para renderizar el campo de subida de imagen, que se muestra en ambos modos de edición.
	const profileImageUploadField = (
		<div>
			<label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
				Foto de perfil
			</label>

			<div className="mt-2 flex flex-col gap-3">
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={handleProfileImageUpload}
					className="hidden"
					disabled={isUploadingImage}
				/>

				<div className="flex flex-wrap items-center gap-3">
					<button
						type="button"
						onClick={openFilePicker}
						disabled={isUploadingImage}
						className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{displayedProfileImage ? "Cambiar foto" : "Seleccionar archivo"}
					</button>

					{profileImageStatusText ? (
						<p className="text-sm text-slate-500">{profileImageStatusText}</p>
					) : null}
				</div>
			</div>
		</div>
	);

	// ============================================================================
	// PAYLOAD SEGÚN MODO
	// ============================================================================
	// Se separa de forma explícita para que sea fácil ver qué se manda
	// en cada uno de los tres modos.
	const requestPayload = useMemo(() => {
		// ------------------------------------------------------------------------
		// MODO 1: VISUALIZACIÓN PURA
		// ------------------------------------------------------------------------
		// No debería enviar nada porque no hay guardado en este modo.
		if (isViewMode) {
			return null;
		}

		// ------------------------------------------------------------------------
		// MODO 2: EDICIÓN DE PERFIL PROPIO
		// ------------------------------------------------------------------------
		// El usuario puede cambiar sus datos básicos.
		// El correo no se edita aquí.
		// La contraseña solo se manda si este modo la permite.
		if (isSelfEditMode) {
			return {
				name: formData.name,
				company: formData.company,
				phone: formData.phone,
				profile_image_url: formData.profile_image_url,
				password: showPasswordSection ? formData.password : "",
				confirmPassword: showPasswordSection ? formData.confirmPassword : "",
			};
		}

		// ------------------------------------------------------------------------
		// MODO 3: EDICIÓN ADMINISTRATIVA
		// ------------------------------------------------------------------------
		// El admin puede modificar también correo, rol y estado.
		if (isAdminEditMode) {
			return {
				name: formData.name,
				email: formData.email,
				company: formData.company,
				phone: formData.phone,
				profile_image_url: formData.profile_image_url,
				roleId: formData.roleId,
				statusId: formData.statusId,
				password: formData.password,
				confirmPassword: formData.confirmPassword,
			};
		}

		return null;
	}, [
		formData,
		isViewMode,
		isSelfEditMode,
		isAdminEditMode,
		showPasswordSection,
	]);

	// ============================================================================
	// ENVÍO DEL FORMULARIO
	// ============================================================================
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!submitUrl || !requestPayload) return;

		try {
			setIsSaving(true);
			setErrorMessage(null);
			setSuccessMessage(null);

			const response = await fetch(submitUrl, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestPayload),
			});

			const body = await response.json().catch(() => null);

			if (!response.ok) {
				throw new Error(body?.message ?? "No se pudo guardar");
			}

			setSuccessMessage(body?.message ?? "Cambios guardados correctamente");
			setSelectedImageName(null);

			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}

			// Tras guardar, se limpian solo los campos sensibles.
			setFormData((prev) => ({
				...prev,
				password: "",
				confirmPassword: "",
			}));
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "No se pudo guardar",
			);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="mx-auto mt-6 w-full max-w-4xl">
			{/* ==================================================================== */}
			{/* CABECERA OPCIONAL DE LA TARJETA                                       */}
			{/* ==================================================================== */}
			{title || subtitle ? (
				<div className="mb-4">
					{title ? (
						<h2 className="text-2xl font-semibold text-slate-800">{title}</h2>
					) : null}

					{subtitle ? (
						<p className="mt-1 text-sm text-slate-600">{subtitle}</p>
					) : null}
				</div>
			) : null}

			<form
				onSubmit={handleSubmit}
				className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md"
			>
				{/* ==================================================================== */}
				{/* BLOQUE SUPERIOR: AVATAR + IDENTIDAD                                   */}
				{/* ==================================================================== */}
				<div className="flex flex-col gap-6 md:flex-row md:items-start">
					<UserAvatar
						name={user.name}
						imageUrl={displayedProfileImage}
						size="xl"
					/>

					<div className="min-w-0 flex-1">
						{/* ---------------------------------------------------------------- */}
						{/* MODO 1: VIEW                                                     */}
						{/* ---------------------------------------------------------------- */}
						{isViewMode ? (
							<>
								<h2 className="text-xl font-semibold text-slate-800">
									{user.name}
								</h2>
								<p className="mt-1 text-sm text-slate-600">{user.email}</p>
							</>
						) : null}

						{/* ---------------------------------------------------------------- */}
						{/* MODO 2: EDIT (perfil propio)                                      */}
						{/* ---------------------------------------------------------------- */}
						{isSelfEditMode ? (
							<div className="grid grid-cols-1 gap-4">
								{/* Nombre */}
								<div>
									<label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
										Nombre
									</label>
									<input
										type="text"
										value={formData.name}
										onChange={handleChange("name")}
										className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
										required
									/>
								</div>

								{/* Correo electrónico (no editable) */}
								<div>
									<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
										Correo electrónico
									</p>
									<p className="mt-1 text-sm text-slate-600">{user.email}</p>
								</div>

								{/* Foto de perfil */}
								{profileImageUploadField}
							</div>
						) : null}

						{/* ---------------------------------------------------------------- */}
						{/* MODO 3: ADMIN-EDIT                                                */}
						{/* ---------------------------------------------------------------- */}
						{isAdminEditMode ? (
							<div className="grid grid-cols-1 gap-4">
								{/* Nombre */}
								<div>
									<label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
										Nombre
									</label>
									<input
										type="text"
										value={formData.name}
										onChange={handleChange("name")}
										className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
										required
									/>
								</div>

								{/* Correo electrónico */}
								<div>
									<label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
										Correo electrónico
									</label>
									<input
										type="email"
										value={formData.email}
										onChange={handleChange("email")}
										className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
										required
									/>
								</div>

								{/* Foto de perfil */}
								{profileImageUploadField}
							</div>
						) : null}

						{/* ================================================================= */}
						{/* CHIPS DE ROL Y ESTADO                                              */}
						{/* ================================================================= */}
						<div className="mt-3 flex flex-wrap gap-2">
							<span
								className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleClassesLight(
									user.role.code,
								)}`}
							>
								{getRoleLabel(user.role.code)}
							</span>

							<span
								className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassesLight(
									user.status.code,
								)}`}
							>
								{getStatusLabel(user.status.code)}
							</span>
						</div>
					</div>
				</div>

				{/* ==================================================================== */}
				{/* BLOQUE MEDIO: DATOS DETALLADOS                                        */}
				{/* ==================================================================== */}
				<div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
					{/* ---------------------------------------------------------------- */}
					{/* CAMPO COMPARTIDO: EMPRESA                                         */}
					{/* ---------------------------------------------------------------- */}
					<div className="rounded-xl bg-slate-50 p-4">
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
							Empresa
						</p>

						{isEditableMode ? (
							<input
								type="text"
								value={formData.company}
								onChange={handleChange("company")}
								className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
							/>
						) : (
							<p className="mt-1 text-sm text-slate-800">
								{user.company || "-"}
							</p>
						)}
					</div>

					{/* ---------------------------------------------------------------- */}
					{/* CAMPO COMPARTIDO: TELÉFONO                                        */}
					{/* ---------------------------------------------------------------- */}
					<div className="rounded-xl bg-slate-50 p-4">
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
							Teléfono
						</p>

						{isEditableMode ? (
							<input
								type="text"
								value={formData.phone}
								onChange={handleChange("phone")}
								className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
							/>
						) : (
							<p className="mt-1 text-sm text-slate-800">{user.phone || "-"}</p>
						)}
					</div>

					{/* ---------------------------------------------------------------- */}
					{/* SOLO MODO 3: ADMIN-EDIT -> ROL Y ESTADO                           */}
					{/* ---------------------------------------------------------------- */}
					{isAdminEditMode ? (
						<>
							<div className="rounded-xl bg-slate-50 p-4">
								<label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Rol
								</label>
								<select
									value={String(formData.roleId)}
									onChange={handleChange("roleId")}
									className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
								>
									{roles
										.filter((role) => role.name !== "Administrador")
										.map((role) => (
											<option key={role.id} value={role.id}>
												{role.name}
											</option>
										))}
								</select>
							</div>

							<div className="rounded-xl bg-slate-50 p-4">
								<label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Estado
								</label>
								<select
									value={String(formData.statusId)}
									onChange={handleChange("statusId")}
									className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
								>
									{statuses.map((status) => (
										<option key={status.id} value={status.id}>
											{status.name}
										</option>
									))}
								</select>
							</div>
						</>
					) : null}

					{/* ---------------------------------------------------------------- */}
					{/* CAMPOS INFORMATIVOS COMPARTIDOS                                   */}
					{/* ---------------------------------------------------------------- */}
					<div className="rounded-xl bg-slate-50 p-4">
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
							Fecha de alta
						</p>
						<p className="mt-1 text-sm text-slate-800">
							{createdAt ? formatDate(createdAt) : "-"}
						</p>
					</div>

					<div className="rounded-xl bg-slate-50 p-4">
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
							Último login
						</p>
						<p className="mt-1 text-sm text-slate-800">
							{lastLoginAt ? formatDate(lastLoginAt) : "-"}
						</p>
					</div>
				</div>

				{/* ==================================================================== */}
				{/* BLOQUE CONTRASEÑA                                                    */}
				{/* ==================================================================== */}
				{/* Aparece:
				    - en admin-edit siempre
				    - en edit solo si allowPasswordChange = true
				    - nunca en view
				*/}
				{showPasswordSection ? (
					<div className="mt-6 rounded-xl bg-slate-50 p-4">
						<p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
							Cambiar contraseña
						</p>

						<PasswordFieldWithStrength
							name="password"
							label="Nueva contraseña"
							placeholder="Dejar en blanco para no cambiarla"
							required={false}
							showConfirm
							confirmName="confirm_password"
							confirmLabel="Confirmar nueva contraseña"
							value={formData.password}
							onChange={(value) =>
								setFormData((prev) => ({ ...prev, password: value }))
							}
							confirmValue={formData.confirmPassword}
							onConfirmChange={(value) =>
								setFormData((prev) => ({
									...prev,
									confirmPassword: value,
								}))
							}
						/>
					</div>
				) : null}

				{/* ==================================================================== */}
				{/* MENSAJES DE FEEDBACK                                                 */}
				{/* ==================================================================== */}
				{errorMessage ? (
					<div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						{errorMessage}
					</div>
				) : null}

				{successMessage ? (
					<div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
						{successMessage}
					</div>
				) : null}

				{/* ==================================================================== */}
				{/* ACCIONES DE PIE                                                      */}
				{/* ==================================================================== */}
				{!isViewMode ? (
					<div className="mt-6 flex flex-wrap gap-3">
						<button
							type="submit"
							disabled={isSaving}
							className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isSaving ? "Guardando..." : (submitLabel ?? "Guardar cambios")}
						</button>

						{/* ---------------------------------------------------------------- */}
						{/* MODO 2: EDIT -> botón de restablecer                              */}
						{/* ---------------------------------------------------------------- */}
						{isSelfEditMode ? (
							<button
								type="button"
								onClick={resetForm}
								className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
							>
								Restablecer
							</button>
						) : null}

						{/* ---------------------------------------------------------------- */}
						{/* MODO 3: ADMIN-EDIT -> enlace cancelar                             */}
						{/* ---------------------------------------------------------------- */}
						{isAdminEditMode && backHref ? (
							<Link
								href={backHref}
								className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
							>
								Cancelar
							</Link>
						) : null}
					</div>
				) : null}
			</form>
		</div>
	);
}
