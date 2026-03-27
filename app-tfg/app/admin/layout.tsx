import HeaderTitle from "@/app/components/basics/HeaderTitle";
import BottomNav from "@/app/components/basics/BottomNav";
import { requireAdminSession } from "@/lib/auth/require-session";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	await requireAdminSession();

	return (
		<main className="app-bg min-h-screen w-full text-slate-800">
			<div className="bg-overlay fixed inset-0 -z-10" />

			<section className="px-4 pt-4 pb-28 md:px-6 md:pb-32">
				<HeaderTitle title="Kinestilistas" subtitle="Panel de administración" />
				{children}
			</section>

			<BottomNav props={{
				LandingPage: "/admin"
			}} />
		</main>
	);
}