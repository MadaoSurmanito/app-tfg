"use client";

import { useRouter } from "next/navigation";

type Props = {
	label?: string;
	className?: string;
	fallbackHref?: string;
};

export default function BackButton({
	label = "Volver",
	className = "",
	fallbackHref = "/",
}: Props) {
	const router = useRouter();

	const handleBack = () => {
		if (typeof window !== "undefined" && window.history.length > 1) {
			router.back();
			return;
		}

		router.push(fallbackHref);
	};

	return (
		<button
			type="button"
			onClick={handleBack}
			className={`inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 ${className}`}
		>
			<span aria-hidden="true">←</span>
			<span>{label}</span>
		</button>
	);
}
