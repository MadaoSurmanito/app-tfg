import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { pool } from "@/app/lib/db";
import HeaderTitle from "@/app/components/HeaderTitle";

type Props = {
	params: Promise<{
		id: string;
	}>;
};

type UsuarioDetalle = {
	id: string;
	name: string;
	email: string;
	company: string | null;
	phone: string | null;
	role: "admin" | "client" | "commercial";
	role_name: string;
	status: "active" | "inactive" | "blocked";
	status_name: string;
	profile_image_url: string | null;
	created_at: string;
	updated_at: string;
	last_login_at: string | null;
};

// Formatea fechas
function formatDate(value: string | null) {
	if (!value) return "-";

	return new Date(value).toLocaleString("es-ES", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

// Vista de detalle de usuario
export default async function UsuarioDetailPage({ params }: Props) {
	const session = await auth();

	if (!session?.user || session.user.role !== "admin") {
		redirect("/login");
	}

	const { id } = await params;

	const result = await pool.query<UsuarioDetalle>(
		`
		SELECT
			u.id,
			u.name,
			u.email,
			u.company,
			u.phone,
			r.code AS role,
			r.name AS role_name,
			us.code AS status,
			us.name AS status_name,
			u.profile_image_url,
			u.created_at,
			u.updated_at,
			u.last_login_at
		FROM users u
		INNER JOIN roles r
			ON r.id = u.role_id
		INNER JOIN user_statuses us
			ON us.id = u.status_id
		WHERE u.id = $1
		LIMIT 1
		`,
		[id],
	);

	const usuario = result.rows[0];

	if (!usuario) {
		notFound();
	}

	return (
		<>
			<HeaderTitle title="Detalle de usuario" />

			<div className="mx-auto mt-6 w-full max-w-4xl">
				<div className="rounded-2xl border border-white/15 bg-white/10 p-6 shadow-lg backdrop-blur">
					<div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
						<div>
							<h2 className="text-2xl font-semibold text-white">
								{usuario.name}
							</h2>
							<p className="mt-1 text-sm text-white/70">{usuario.email}</p>
						</div>

						<div className="flex gap-3">
							<Link
								href={`/admin/users/usuarios/${usuario.id}/edit`}
								className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-700"
							>
								Editar
							</Link>

							<Link
								href="/admin/users/usuarios"
								className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
							>
								Volver
							</Link>
						</div>
					</div>

					<div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<p className="text-xs uppercase tracking-wide text-white/50">
								ID
							</p>
							<p className="mt-1 break-all font-mono text-sm text-white/90">
								{usuario.id}
							</p>
						</div>

						<div>
							<p className="text-xs uppercase tracking-wide text-white/50">
								Nombre
							</p>
							<p className="mt-1 text-white/90">{usuario.name}</p>
						</div>

						<div>
							<p className="text-xs uppercase tracking-wide text-white/50">
								Correo
							</p>
							<p className="mt-1 text-white/90">{usuario.email}</p>
						</div>

						<div>
							<p className="text-xs uppercase tracking-wide text-white/50">
								Teléfono
							</p>
							<p className="mt-1 text-white/90">{usuario.phone || "-"}</p>
						</div>

						<div>
							<p className="text-xs uppercase tracking-wide text-white/50">
								Empresa
							</p>
							<p className="mt-1 text-white/90">{usuario.company || "-"}</p>
						</div>

						<div>
							<p className="text-xs uppercase tracking-wide text-white/50">
								Rol
							</p>
							<p className="mt-1 text-white/90">{usuario.role_name}</p>
						</div>

						<div>
							<p className="text-xs uppercase tracking-wide text-white/50">
								Estado
							</p>
							<p className="mt-1 text-white/90">{usuario.status_name}</p>
						</div>

						<div>
							<p className="text-xs uppercase tracking-wide text-white/50">
								Imagen de perfil
							</p>
							<p className="mt-1 text-white/90">
								{usuario.profile_image_url ? "Sí" : "No"}
							</p>
						</div>

						<div>
							<p className="text-xs uppercase tracking-wide text-white/50">
								Fecha de alta
							</p>
							<p className="mt-1 text-white/90">
								{formatDate(usuario.created_at)}
							</p>
						</div>

						<div>
							<p className="text-xs uppercase tracking-wide text-white/50">
								Última actualización
							</p>
							<p className="mt-1 text-white/90">
								{formatDate(usuario.updated_at)}
							</p>
						</div>

						<div>
							<p className="text-xs uppercase tracking-wide text-white/50">
								Último acceso
							</p>
							<p className="mt-1 text-white/90">
								{formatDate(usuario.last_login_at)}
							</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
