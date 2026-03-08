"use client";

import AssistantCard from "../components/AssistantCard";
import MobileNavCard from "../components/MobileNavCard";
import HeaderTitle from "../components/HeaderTitle";
import PageTransition from "../components/PageTransition";
import {
  AgendaIcon,
  AppointmentIcon,
  CatalogIcon,
  ColorIcon,
  OrderIcon,
  PricesIcon,
  ProductsIcon,
  SimulatorIcon,
  TrainingIcon,
} from "../components/IconsSVGs";

// Opciones de navegación para profesionales
const navItems = [
  { title: "Coloración", icon: <ColorIcon className="h-6 w-6" /> },
  { title: "Catálogos", icon: <CatalogIcon className="h-6 w-6" /> },
  { title: "Agenda", icon: <AgendaIcon className="h-6 w-6" /> },
  { title: "Citas", icon: <AppointmentIcon className="h-6 w-6" /> },
  { title: "Pedido Abierto", icon: <OrderIcon className="h-6 w-6" /> },
  { title: "Tarifas", icon: <PricesIcon className="h-6 w-6" /> },
  { title: "Productos", icon: <ProductsIcon className="h-6 w-6" /> },
  { title: "Simulador", icon: <SimulatorIcon className="h-6 w-6" /> },
  { title: "Formaciones", icon: <TrainingIcon className="h-6 w-6" /> },
];

// Página principal para profesionales
export default function ProfessionalHomePage() {
  return (
    <PageTransition>
      <HeaderTitle title="Kinestilistas" />

      <div className="mb-6">
        <AssistantCard />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {navItems.map((item) => (
          <MobileNavCard
            key={item.title}
            title={item.title}
            icon={item.icon}
          />
        ))}
      </div>
    </PageTransition>
  );
}