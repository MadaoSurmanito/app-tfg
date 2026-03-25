import HeaderTitle from "@/app/components/basics/HeaderTitle";
import BottomNav from "@/app/components/basics/BottomNav";

// Layout para las páginas del admin panel
export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main className="app-bg min-h-screen w-full text-slate-800">
			<div className="bg-overlay fixed inset-0 -z-10" />

			<section className="px-4 pt-4 pb-28 md:px-6 md:pb-32">
				<HeaderTitle title="Kinestilistas" subtitle="Panel de administración" />
				{children}
			</section>

			<BottomNav />
		</main>
	);
}
