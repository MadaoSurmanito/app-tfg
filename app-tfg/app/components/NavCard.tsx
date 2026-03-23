// Componente de tarjeta de navegación reutilizable
import Link from "next/link";

type NavCardProps = {
	title: string;
	icon: React.ReactNode;
	href: string;
};

export default function NavCard({ title, icon, href }: NavCardProps) {
	return (
		<Link
			href={href}
			className="glass-card group flex h-24 flex-col items-center justify-center rounded-2xl px-2 py-3 transition active:scale-[0.97] hover:bg-white/20"
		>
			<div className="mb-3 text-black opacity-90 transition group-hover:scale-110">
				{icon}
			</div>

			<span className="text-center text-xs font-light tracking-wide text-black">
				{title}
			</span>
		</Link>
	);
}