import { redirect } from "next/navigation";
import { auth } from "@/auth";
import HeaderTitle from "@/app/components/HeaderTitle";
import PasswordFieldWithStrength from "@/app/components/PasswordFieldWithStrength";

// Página para cambiar la contraseña propia
export default async function ChangePasswordPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<>
			<HeaderTitle title="Cambiar contraseña" />

			<div className="mx-auto mt-6 w-full max-w-2xl">
				<form
					action="/api/account/change-password"
					method="POST"
					className="rounded-2xl border border-white/15 bg-white/10 p-6 shadow-lg backdrop-blur"
				>
					<div className="space-y-4">
						<div>
							<label className="mb-1 block text-sm font-medium text-white">
								Contraseña actual
							</label>
							<input
								name="current_password"
								type="password"
								required
								autoComplete="current-password"
								className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-2 text-white outline-none transition focus:border-cyan-400"
							/>
						</div>

						<PasswordFieldWithStrength
							name="new_password"
							label="Nueva contraseña"
							placeholder="Nueva contraseña"
							required
							showConfirm
							confirmName="confirm_new_password"
							confirmLabel="Confirmar nueva contraseña"
						/>
					</div>

					<div className="mt-6">
						<button
							type="submit"
							className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-700"
						>
							Cambiar contraseña
						</button>
					</div>
				</form>
			</div>
		</>
	);
}
