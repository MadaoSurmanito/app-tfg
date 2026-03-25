"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type AnimatedLinkProps = {
	href: string;
	children: React.ReactNode;
	className?: string;
	onNavigateStart?: () => void;
	delay?: number;
};

export default function AnimatedLink({
	href,
	children,
	className = "",
	onNavigateStart,
	delay = 300,
}: AnimatedLinkProps) {
	const router = useRouter();

	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();

		onNavigateStart?.();

		setTimeout(() => {
			router.push(href);
		}, delay);
	};

	return (
		<Link href={href} onClick={handleClick} className={className}>
			{children}
		</Link>
	);
}
