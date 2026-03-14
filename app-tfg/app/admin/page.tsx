"use client";

import { useState } from "react";
import HeaderTitle from "../components/HeaderTitle";
import AssistantCard from "../components/AssistantCard";
import NavCard from "../components/NavCard";
import PageTransition from "../components/PageTransition";
import { RegisterRequestsIcon, ClientsIcon } from "../components/IconsSVGs";

// Opciones de navegación para administradores
const navItems = [

	{
		title: "Gestión de usuarios",
		icon: <ClientsIcon className="h-6 w-6" />,
		href: "/admin/users",
	}
];

// Página de inicio para el admin panel.
export default function AdminHome() {
	const [leaving, setLeaving] = useState(false);

	return (
		<PageTransition>
			<HeaderTitle title="Kinestilistas" />

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
				{navItems.map((item) => (
					<NavCard
						key={item.title}
						title={item.title}
						icon={item.icon}
						href={item.href}
					/>
				))}
			</div>
		</PageTransition>
	);
}
