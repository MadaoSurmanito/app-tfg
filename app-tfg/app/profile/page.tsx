import { redirect } from "next/navigation";
import { auth } from "@/auth";
import PageTransition from "@/app/components/animations/PageTransition";
import UserProfileCard from "@/app/components/users/UserProfileCard";
import { getUserById } from "@/lib/typeorm/services/users/get-user-by-id";
import HeaderTitle from "@/app/components/basics/HeaderTitle";
import BottomNav from "@/app/components/basics/BottomNav";
export default async function ProfilePage() {
	const session = await auth();

	if (!session) {
		redirect("/login");
	}

	if (!session.user?.id) {
		redirect("/");
	}

	const user = await getUserById(session.user.id);

	if (!user) {
		redirect("/");
	}

	return (
		<main className="app-bg min-h-[100svh] w-full px-4 py-4 pb-28 text-slate-800">
			<div className="mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col">
				<HeaderTitle
					title="KinEstilistas"
					subtitle="Alta Peluquería &amp; Estética"
				/>

				<PageTransition>
					<section className="mx-auto mt-4 w-full max-w-4xl">
						<div className="glass-card overflow-hidden rounded-[28px] border border-white/30 p-4 shadow-xl sm:p-6">
							<div className="mb-5">
								<h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
									Mi perfil
								</h1>
								<p className="mt-1 text-sm text-slate-600 sm:text-base">
									Consulta y edita tu información personal.
								</p>
							</div>

							<UserProfileCard
								mode="edit"
								submitUrl="/api/profile"
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
						</div>
					</section>
				</PageTransition>
			</div>

			<BottomNav />
		</main>
	);
}
