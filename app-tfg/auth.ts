import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { findUserForLogin } from "@/lib/typeorm/services/auth/find-user-for-login";
import { logAccessEvent } from "@/lib/typeorm/services/auth/log-access-event";
import { registerSuccessfulLogin } from "@/lib/typeorm/services/auth/register-successful-login";

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
		accessSessionId?: string;
	}
}

declare module "@auth/core/jwt" {
	interface JWT {
		role?: string;
		phone?: string | null;
		name?: string | null;
		image?: string | null;
		accessSessionId?: string;
	}
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	trustHost: true,
	session: {
		strategy: "jwt",
		maxAge: 60 * 60 * 24 * 30,
	},
	providers: [
		Credentials({
			credentials: {
				identifier: {},
				password: {},
			},
			async authorize(credentials, request) {
				try {
					const identifier = String(credentials?.identifier ?? "")
						.trim()
						.toLowerCase();
					const password = String(credentials?.password ?? "");

					const ipAddress =
						request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
						request.headers.get("x-real-ip") ||
						null;

					const userAgent = request.headers.get("user-agent") || null;

					if (!identifier || !password) {
						await logAccessEvent({
							userId: null,
							emailAttempted: identifier || null,
							eventCode: "login_failed",
							resultCode: "failed",
							failureReason: "missing_credentials",
							sessionToken: null,
							ipAddress,
							userAgent,
							revokedAt: null,
							expiresAt: null,
						});

						return null;
					}

					const user = await findUserForLogin(identifier);

					if (!user) {
						await logAccessEvent({
							userId: null,
							emailAttempted: identifier,
							eventCode: "login_failed",
							resultCode: "failed",
							failureReason: "user_not_found",
							sessionToken: null,
							ipAddress,
							userAgent,
							revokedAt: null,
							expiresAt: null,
						});

						return null;
					}

					if (user.status.code !== "active") {
						await logAccessEvent({
							userId: user.id,
							emailAttempted: user.email,
							eventCode: "login_failed",
							resultCode: "failed",
							failureReason: `status_${user.status.code}`,
							sessionToken: null,
							ipAddress,
							userAgent,
							revokedAt: null,
							expiresAt: null,
						});

						return null;
					}

					const validPassword = await bcrypt.compare(
						password,
						user.password_hash,
					);

					if (!validPassword) {
						await logAccessEvent({
							userId: user.id,
							emailAttempted: user.email,
							eventCode: "login_failed",
							resultCode: "failed",
							failureReason: "invalid_password",
							sessionToken: null,
							ipAddress,
							userAgent,
							revokedAt: null,
							expiresAt: null,
						});

						return null;
					}

					const accessSessionId = randomUUID();
					const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

					await registerSuccessfulLogin(user.id);

					await logAccessEvent({
						userId: user.id,
						emailAttempted: user.email,
						eventCode: "login_success",
						resultCode: "success",
						failureReason: null,
						sessionToken: accessSessionId,
						ipAddress,
						userAgent,
						revokedAt: null,
						expiresAt,
					});

					return {
						id: user.id,
						email: user.email,
						phone: user.phone,
						role: user.role.code,
						name: user.name,
						image: user.profile_image_url,
						accessSessionId,
					};
				} catch (error) {
					console.error("[login] error en authorize:", error);
					return null;
				}
			},
		}),
	],
	pages: {
		signIn: "/login",
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				if ("role" in user) token.role = user.role as string;
				if ("phone" in user) token.phone = user.phone as string | null;
				if ("name" in user) token.name = user.name as string | null;
				if ("image" in user) token.image = user.image as string | null;
				if ("accessSessionId" in user) {
					token.accessSessionId = user.accessSessionId as string;
				}
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.sub ?? "";
				session.user.role = typeof token.role === "string" ? token.role : "";
				session.user.phone =
					typeof token.phone === "string" ? token.phone : null;
				session.user.name = typeof token.name === "string" ? token.name : null;
				session.user.image =
					typeof token.image === "string" ? token.image : null;
				session.accessSessionId =
					typeof token.accessSessionId === "string"
						? token.accessSessionId
						: undefined;
			}
			return session;
		},
	},
});
