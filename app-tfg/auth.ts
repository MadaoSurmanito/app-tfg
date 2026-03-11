import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { pool } from "@/app/lib/db";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

// Extendemos los tipos de NextAuth para incluir el role en el JWT y la sesión
declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			role: string;
			name?: string | null;
			email?: string | null;
			phone?: string | null;
			image?: string | null;
		};
	}
}

// Esto es para que TypeScript sepa que el JWT puede tener un campo "role"
declare module "next-auth/jwt" {
	interface JWT {
		role?: string;
	}
}

// Configuración de NextAuth con el proveedor de credenciales
export const { handlers, auth, signIn, signOut } = NextAuth({
	// Usamos JWT para la sesión, lo que es más adecuado para APIs sin estado
	session: {
		strategy: "jwt",
	},
	// Configuramos el proveedor de credenciales para autenticación personalizada
	providers: [
		Credentials({
			// Definimos los campos que esperamos en las credenciales
			credentials: {
				identifier: {}, // email, phone, o name
				password: {},
			},
			// La función authorize se encarga de verificar las credenciales y devolver el usuario si son válidas
			async authorize(credentials) {
				try {
					// Validamos que se hayan proporcionado las credenciales necesarias
					const identifier = String(credentials?.identifier ?? "")
						.trim()
						.toLowerCase();
					const password = String(credentials?.password ?? "");

					if (!identifier || !password) {
						console.log("[login] faltan credenciales");
						console.log("[login] identifier:", identifier);
						console.log("[login] password:", password ? "provided" : "missing");
						return null;
					}

					// Buscamos el usuario por email, phone o name
					const result = await pool.query(
						"SELECT id, email, password_hash, role, image_url FROM users WHERE LOWER(email) = $1 OR LOWER(phone) = $1 OR LOWER(name) = $1 LIMIT 1",
						[identifier],
					);

					const user = result.rows[0];

					// Si no se encuentra el usuario, devolvemos null para indicar que las credenciales son inválidas
					if (!user) {
						console.log("[login] usuario no encontrado");
						return null;
					}

					// Comparamos la contraseña proporcionada con el hash almacenado en la base de datos usando bcrypt
					const valid = await bcrypt.compare(password, user.password_hash);

					if (!valid) {
						console.log("[login] contraseña incorrecta");
						return null;
					}

					// Si las credenciales son válidas, devolvemos un objeto con la información del usuario que queremos incluir en el JWT y la sesión
					return {
						id: String(user.id),
						email: user.email,
						role: user.role,
						name: user.email,
						image: user.image_url,
					};
				} catch (error) {
					console.error("[login] error en authorize:", error);
					return null;
				}
			},
		}),
	],
	// Configuramos la página de inicio de sesión personalizada
	pages: {
		signIn: "/login",
	},
	// Callbacks para incluir el role en el JWT y la sesión
	callbacks: {
		// El callback jwt se llama cada vez que se crea o actualiza el token JWT. Aquí añadimos el role al token.
		async jwt({ token, user }) {
			if (user && "role" in user) token.role = user.role as string;
			return token;
		},
		// El callback session se llama cada vez que se obtiene la sesión. Aquí añadimos el id y el role del usuario a la sesión.
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.sub ?? "";
				session.user.role = typeof token.role === "string" ? token.role : "";
			}
			return session;
		},
	},
});
