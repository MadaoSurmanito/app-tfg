"use client";

import Link from "next/link";
import { useState } from "react";
import PasswordFieldWithStrength from "@/app/components/PasswordFieldWithStrength";
import {
	formatDate,
	getRoleClassesLight,
	getRoleLabel,
	getStatusClassesLight,
	getStatusLabel,
} from "@/app/admin/users/usuarios/users-table-utils";

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

type CatalogOption = {
	id: number;
	name: string;
};

type Props = {
	user: UserProfileCardUser;
	mode?: "view" | "edit" | "admin-edit";
	title?: string;
	subtitle?: string;
	roles?: CatalogOption[];
	statuses?: CatalogOption[];
	backHref?: string;
	submitLabel?: string;
	submitUrl?: string;
};

function toDateString(value: string | Date | null | undefined) {
	if (!value) return null;
	return value instanceof Date ? value.toISOString() : value;
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
}: Props) {
	const isAdminEdit = mode === "admin-edit";
	const [isEditing, setIsEditing] = useState(mode === "edit" || mode === "admin-edit");
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const [formData, setFormData] = useState({
		name: user.name ?? "",
		email: user.email ?? "",
		company: user.company ?? "",
		phone: user.phone ?? "",
		profile_image_url: user.profile_image_url ?? "",
		roleId: Number(user.role_id ?? 0),
		statusId: Number(user.status_id ?? 0),
		password: "",
		confirmPassword: "",
	});

	const handleChange =
		(field: keyof typeof formData) =>
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

	const resetForm = () => {
		setFormData({
			name: user.name ?? "",
			email: user.email ?? "",
			company: user.company ?? "",
			phone: user.phone ?? "",
			profile_image_url: user.profile_image_url ?? "",
			roleId: Number(user.role_id ?? 0),
			statusId: Number(user.status_id ?? 0),
			password: "",
			confirmPassword: "",
		});
		setErrorMessage(null);
		setSuccessMessage(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!submitUrl) return;

		try {
			setIsSaving(true);
			setErrorMessage(null);
			setSuccessMessage(null);

			const payload = isAdminEdit
				? {
						name: formData.name,
						email: formData.email,
						company: formData.company,
						phone: formData.phone,
						profile_image_url: formData.profile_image_url,
						roleId: formData.roleId,
						statusId: formData.statusId,
						password: formData.password,
						confirmPassword: formData.confirmPassword,
					}
				: {
						name: formData.name,
						company: formData.company,
						phone: formData.phone,
						profile_image_url: formData.profile_image_url,
					};

			const response = await fetch(submitUrl, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			const body = await response.json().catch(() => null);

			if (!response.ok) {
				throw new Error(body?.message ?? "No se pudo guardar");
			}

			setSuccessMessage(body?.message ?? "Cambios guardados correctamente");

			if (mode === "edit") {
				setIsEditing(false);
			}

			if (isAdminEdit) {
				setFormData((prev) => ({
					...prev,
					password: "",
					confirmPassword: "",
				}));
			}
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "No se pudo guardar",
			);
		} finally {
			setIsSaving(false);
		}
	};

	const createdAt = toDateString(user.created_at);
	const lastLoginAt = toDateString(user.last_login_at);

	return (
		<div className="mx-auto mt-6 w-full max-w-4xl">
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
				<div className="flex flex-col gap-6 md:flex-row md:items-start">
					<div className="h-24 w-24 overflow-hidden rounded-full bg-gray-200">
						{(isEditing ? formData.profile_image_url : user.profile_image_url) ? (
							<img
								src={
									isEditing
										? formData.profile_image_url
										: (user.profile_image_url ?? "")
								}
								alt={user.name}
								className="h-full w-full object-cover"
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
								Sin imagen
							</div>
						)}
					</div>

					<div className="min-w-0 flex-1">
						{isEditing ? (
							<div className="grid grid-cols-1 gap-4">
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

								{isAdminEdit ? (
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
								) : (
									<div>
										<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
											Correo electrónico
										</p>
										<p className="mt-1 text-sm text-slate-600">{user.email}</p>
									</div>
								)}

								<div>
									<label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
										URL de imagen de perfil
									</label>
									<input
										type="text"
										value={formData.profile_image_url}
										onChange={handleChange("profile_image_url")}
										className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
									/>
								</div>
							</div>
						) : (
							<>
								<h2 className="text-xl font-semibold text-slate-800">
									{user.name}
								</h2>
								<p className="mt-1 text-sm text-slate-600">{user.email}</p>
							</>
						)}

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

				<div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
					<div className="rounded-xl bg-slate-50 p-4">
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
							Empresa
						</p>

						{isEditing ? (
							<input
								type="text"
								value={formData.company}
								onChange={handleChange("company")}
								className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
							/>
						) : (
							<p className="mt-1 text-sm text-slate-800">{user.company || "-"}</p>
						)}
					</div>

					<div className="rounded-xl bg-slate-50 p-4">
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
							Teléfono
						</p>

						{isEditing ? (
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

					{isAdminEdit ? (
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
									{roles.map((role) => (
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

				{isAdminEdit ? (
					<div className="mt-6 rounded-xl bg-slate-50 p-4">
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

				{mode !== "view" ? (
					<div className="mt-6 flex flex-wrap gap-3">
						<button
							type="submit"
							disabled={isSaving}
							className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isSaving
								? "Guardando..."
								: (submitLabel ?? "Guardar cambios")}
						</button>

						{mode === "edit" ? (
							<button
								type="button"
								onClick={() => {
									resetForm();
									setIsEditing(false);
								}}
								className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
							>
								Cancelar
							</button>
						) : backHref ? (
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