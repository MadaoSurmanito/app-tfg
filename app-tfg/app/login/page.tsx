// Esta página es la encargada de mostrar el formulario de login, se encarga de manejar el envío del formulario y de mostrar los errores en caso de que los haya
"use client"; // necesario para poder usar el hook useState y la función signIn de next-auth, ya que esta página se renderiza en el cliente y no en el servidor
import { signIn } from "next-auth/react";
import { useState } from "react";
import HeaderTitle from "../components/HeaderTitle";
import { useRouter } from "next/navigation";

// esta función se encarga de manejar el envío del formulario, se encarga de recoger los datos del formulario, enviarlos a la API de autenticación y manejar la respuesta de la API
export default function LoginPage() {
	const [error, setError] = useState("");
	const router = useRouter();

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		const formData = new FormData(e.currentTarget);
		const email = String(formData.get("email") ?? "").trim();
		const password = String(formData.get("password") ?? "");

		const result = await signIn("credentials", {
			email,
			password,
			redirect: false,
		});

		if (result?.error) {
			setError("Correo o contraseña incorrectos");
			return;
		}

		const userResult = await fetch("/api/auth/session");
		const userData = await userResult.json();

		if (userData?.user?.role === "admin") {
			router.push("/admin");
		} else if (userData?.user?.role === "comercial") {
			router.push("/comerciales");
		} else {
			router.push("/clientes");
		}
	}

	return (
		<main className="app-bg min-h-[100svh] w-full px-4 py-4 text-slate-800">
			<HeaderTitle title="Acceso clientes" noGlass />
			<div className="mx-auto mt-6 w-full max-w-sm">
				<form
					onSubmit={handleSubmit}
					className="rounded-2xl bg-white p-6 shadow-md flex flex-col gap-4"
				>
					<h2 className="mb-2 text-center text-xl font-semibold">
						Iniciar sesión
					</h2>

					<input
						name="email"
						type="email"
						placeholder="Correo electrónico"
						autoComplete="email"
						required
						className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black"
					/>

					<input
						name="password"
						type="password"
						placeholder="Contraseña"
						autoComplete="current-password"
						required
						className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black"
					/>

					<button
						type="submit"
						className="mt-2 rounded-lg bg-black py-3 font-medium text-white hover:opacity-90 transition"
					>
						Entrar
					</button>

					{error && <p className="text-center text-sm text-red-600">{error}</p>}
				</form>
			</div>
			<div className="mx-auto mt-6 w-full max-w-sm text-center">
				<p className="text-sm text-slate-600">
					¿Nuevo cliente?{" "}
					<a
						href="/register"
						className="font-semibold text-black hover:underline"
					>
						Solicita aquí tu acceso.
					</a>
				</p>
			</div>
		</main>
	);
}
