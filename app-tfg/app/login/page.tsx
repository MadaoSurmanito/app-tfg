// Esta página es la encargada de mostrar el formulario de login, se encarga de manejar el envío del formulario y de mostrar los errores en caso de que los haya
"use client"; // necesario para poder usar el hook useState y la función signIn de next-auth, ya que esta página se renderiza en el cliente y no en el servidor

import { signIn } from "next-auth/react";
import { useState } from "react";
import HeaderTitle from "../components/HeaderTitle";
import PageTransition from "../components/PageTransition";

export default function LoginPage() {
  const [error, setError] = useState("");

  // esta función se encarga de manejar el envío del formulario, se encarga de recoger los datos del formulario, enviarlos a la API de autenticación y manejar la respuesta de la API
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

    window.location.href = "/";
  }
  
  // el formulario de login, se encarga de mostrar los campos de email y contraseña, el botón de submit y los errores en caso de que los haya
  return (
    <PageTransition>
      <HeaderTitle title="Acceso profesional" />

      <div className="flex justify-center mt-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4"
        >
          <h2 className="text-xl font-semibold text-center mb-2">
            Iniciar sesión
          </h2>

          <input
            name="email"
            type="email"
            placeholder="Correo electrónico"
            autoComplete="email"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />

          <button
            type="submit"
            className="mt-2 bg-black text-white rounded-lg py-2 font-medium hover:opacity-90 transition"
          >
            Entrar
          </button>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}
        </form>
      </div>
    </PageTransition>
  );
}