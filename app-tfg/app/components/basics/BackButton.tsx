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
			className={className}
		>
			{label}
		</button>
	);
}