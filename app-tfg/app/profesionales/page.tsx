import AssistantCard from "../components/AssistantCard";
import MobileNavCard from "../components/MobileNavCard";
import { AgendaIcon, AppointmentIcon, CatalogIcon, ColorIcon,  OrderIcon,  PricesIcon,  ProductsIcon,  SimulatorIcon,  TrainingIcon } from "../components/IconsSVGs";

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
    <>
      <header className="glass-header mb-4 rounded-2xl px-6 py-4 text-center">
        <h1 className="text-2xl uppercase tracking-widest text-black drop-shadow-">
          KINESTILISTAS
        </h1>
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-black/80">
          Alta Peluquería &amp; Estética
        </p>
      </header>

      <div className="mb-6">
        <AssistantCard />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
        {navItems.map((item) => (
          <MobileNavCard
            key={item.title}
            title={item.title}
            icon={item.icon}
          />
        ))}
      </div>
    </>
  );
}