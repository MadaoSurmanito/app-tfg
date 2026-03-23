"use client";

import { useMemo, useState } from "react";
import { PASSWORD_MIN_LENGTH, validatePassword } from "@/app/lib/password";

type Props = {
	name?: string;
	label?: string;
	placeholder?: string;
	required?: boolean;
	autoComplete?: string;
	confirmName?: string;
	confirmLabel?: string;
	showConfirm?: boolean;
	defaultValue?: string;
};

// Campo de contraseña reutilizable
export default function PasswordFieldWithStrength({
	name = "password",
	label = "Contraseña",
	placeholder = "Contraseña",
	required = false,
	autoComplete = "new-password",
	confirmName = "confirm_password",
	confirmLabel = "Confirmar contraseña",
	showConfirm = false,
	defaultValue = "",
}: Props) {
	const [password, setPassword] = useState(defaultValue);
	const [confirmPassword, setConfirmPassword] = useState("");

	const validation = useMemo(() => validatePassword(password), [password]);

	const progressWidth = `${(validation.score / 3) * 100}%`;

	const progressClass =
		validation.score === 0
			? "bg-red-500"
			: validation.score === 1
				? "bg-orange-500"
				: validation.score === 2
					? "bg-yellow-500"
					: "bg-green-500";

	const passwordsMatch =
		!showConfirm || confirmPassword === "" || password === confirmPassword;

	return (
		<div className="space-y-3">
			<div>
				<label className="mb-1 block text-sm font-medium text-white hidden">
					{label}
				</label>
				<input
					name={name}
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder={placeholder}
					autoComplete={autoComplete}
					required={required}
					minLength={PASSWORD_MIN_LENGTH}
					className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-2 text-white placeholder:text-white/50 outline-none transition focus:border-cyan-400"
				/>
			</div>

			<div>
				<div className="h-2 w-full overflow-hidden rounded-full bg-black/20">
					<div
						className={`h-full transition-all ${progressClass}`}
						style={{ width: progressWidth }}
					/>
				</div>

				<div className="mt-2 space-y-1 text-xs text-black/80">
					<p className={validation.lengthValid ? "text-green-300" : ""}>
						• Mínimo 8 caracteres
					</p>
					<p className={validation.hasNumber ? "text-green-300" : ""}>
						• Al menos 1 número
					</p>
					<p className={validation.hasSymbol ? "text-green-300" : ""}>
						• Al menos 1 símbolo
					</p>
				</div>
			</div>

			{showConfirm && (
				<div>
					<label className="mb-1 block text-sm font-medium text-white hidden">
						{confirmLabel}
					</label>
					<input
						name={confirmName}
						type="password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						placeholder="Repite la contraseña"
						autoComplete={autoComplete}
						required={required}
						className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-2 text-white placeholder:text-white/50 outline-none transition focus:border-cyan-400"
					/>
					{confirmPassword && !passwordsMatch && (
						<p className="mt-2 text-xs text-red-300">
							Las contraseñas no coinciden
						</p>
					)}
				</div>
			)}
		</div>
	);
}
