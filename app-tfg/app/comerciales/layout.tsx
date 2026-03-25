import BottomNav from "../components/BottomNav";
import PageTransition from "../components/animations/PageTransition";
import HeaderTitle from "../components/basics/HeaderTitle";

// Layout específico para la sección de comerciales
export default function CommercialLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main className="app-bg flex min-h-screen w-full flex-col text-slate-800">
			<div className="bg-overlay fixed inset-0 -z-10" />
			<HeaderTitle title="Kinestilistas" />
			<section className="flex-1 overflow-y-auto px-6 pt-4 pb-6">
				<PageTransition>{children}</PageTransition>
			</section>

			<BottomNav />
		</main>
	);
}
