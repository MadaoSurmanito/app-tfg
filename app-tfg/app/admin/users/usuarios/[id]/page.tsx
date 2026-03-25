import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import H1Title from "@/app/components/H1Title";
import PageTransition from "@/app/components/PageTransition";
import UserProfileCard from "@/app/components/users/UserProfileCard";
import { getUserById } from "@/lib/typeorm/services/users/get-user-by-id";

type Props = {
	params: Promise<{ id: string }>;
};

// Página de detalle de usuario.
// Al ser un Server Component, consulta directamente el servicio.
export default async function UsuarioDetallePage({ params }: Props) {
	const session = await auth();

	if (!session) {
		redirect("/login");
	}

	if (session.user?.role !== "admin") {
		redirect("/");
	}

	const { id } = await params;
	const user = await getUserById(id);

	if (!user) {
		notFound();
	}

	return (
		<PageTransition>
			<H1Title title={user.name} subtitle="Detalle del usuario seleccionado" />

			<UserProfileCard
				mode="view"
				user={{
					id: user.id,
					name: user.name,
					email: user.email,
					company: user.company,
					phone: user.phone,
					profile_image_url: user.profile_image_url,
					created_at: user.created_at,
					last_login_at: user.last_login_at,
					role: {
						code: user.role.code as "admin" | "client" | "commercial",
					},
					status: {
						code: user.status.code as "active" | "inactive" | "blocked",
					},
				}}
			/>
		</PageTransition>
	);
}
