"use client";

import AssistantCard from "../components/AssistantCard";
import NavCard from "../components/NavCard";
import HeaderTitle from "../components/HeaderTitle";
import PageTransition from "../components/PageTransition";
import RouteMapCard from "../components/RouteMapCard";

import {
	CatalogIcon,
	ColorIcon,
	OrderIcon,
	ProductsIcon,
	TrainingIcon,
	ClientsIcon,
	VisitsIcon,
	RouteIcon,
	ActivityIcon,
	PaymentsIcon,
	PromotionsIcon,
	ReportsIcon,
} from "../components/IconsSVGs";

const sections = [
	{
		title: "Gestión comercial",
		module: "M2",
		items: [
			{
				title: "Clientes",
				icon: <ClientsIcon className="h-6 w-6" />,
				href: "/comerciales/clients",
			},
			{
				title: "Visitas",
				icon: <VisitsIcon className="h-6 w-6" />,
				href: "/comerciales/visits",
			},
			{
				title: "Rutas",
				icon: <RouteIcon className="h-6 w-6" />,
				href: "/comerciales/routes",
			},
			{
				title: "Actividad",
				icon: <ActivityIcon className="h-6 w-6" />,
				href: "/comerciales/activity",
			},
		],
	},
	{
		title: "Catálogo y operativa comercial",
		module: "M3 · M4",
		items: [
			{
				title: "Catálogo",
				icon: <CatalogIcon className="h-6 w-6" />,
				href: "/comerciales/catalog",
			},
			{
				title: "Coloración",
				icon: <ColorIcon className="h-6 w-6" />,
				href: "/comerciales/color",
			},
			{
				title: "Productos",
				icon: <ProductsIcon className="h-6 w-6" />,
				href: "/comerciales/products",
			},
			{
				title: "Pedidos",
				icon: <OrderIcon className="h-6 w-6" />,
				href: "/comerciales/orders",
			},
			{
				title: "Cobros",
				icon: <PaymentsIcon className="h-6 w-6" />,
				href: "/comerciales/payments",
			},
		],
	},
	{
		title: "Comunicación y seguimiento",
		module: "M6 · M7",
		items: [
			{
				title: "Promociones",
				icon: <PromotionsIcon className="h-6 w-6" />,
				href: "/comerciales/promotions",
			},
			{
				title: "Formaciones",
				icon: <TrainingIcon className="h-6 w-6" />,
				href: "/comerciales/training",
			},
			{
				title: "Informes",
				icon: <ReportsIcon className="h-6 w-6" />,
				href: "/comerciales/reports",
			},
		],
	},
];

export default function ComercialesHome() {
	return (
		<PageTransition>
			<RouteMapCard />

			<div className="space-y-6">
				{sections.map((section) => (
					<section
						key={section.title}
						className="rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-md"
					>
						<div className="mb-4 px-1">
							<p className="text-xs font-medium uppercase tracking-[0.25em] text-black/50">
								{section.module}
							</p>
							<h2 className="text-lg font-semibold text-black/80">
								{section.title}
							</h2>
						</div>

						<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
							{section.items.map((item) => (
								<NavCard
									key={item.title}
									title={item.title}
									icon={item.icon}
									href={item.href}
								/>
							))}
						</div>
					</section>
				))}
			</div>
		</PageTransition>
	);
}
