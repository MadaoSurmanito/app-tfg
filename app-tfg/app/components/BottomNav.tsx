// Componente de de navegación inferior
// Este componente se muestra en la parte inferior de la pantalla y permite navegar entre las secciones principales de la aplicación
import { HomeIcon, ProfileIcon, SettingsIcon } from "./IconsSVGs";
export default function BottomNav() {
  return (
    <footer className="glass-header mt-auto flex items-center justify-between px-10 py-4">

      {/* Botón de inicio */}
      <div className="flex flex-col items-center opacity-100">
        <HomeIcon className="mb-1 h-6 w-6 text-black" />
        <span className="text-[10px] uppercase tracking-tight text-black">
          Inicio
        </span>
      </div>

      {/* Botón de perfil */}
      <div className="flex flex-col items-center opacity-60">
        <ProfileIcon className="mb-1 h-6 w-6 text-black" />
        <span className="text-[10px] uppercase tracking-tight text-black">
          Perfil
        </span>
      </div>

      {/* Botón de ajustes */}
      <div className="flex flex-col items-center opacity-60">
        <SettingsIcon className="mb-1 h-6 w-6 text-black" />
        <span className="text-[10px] uppercase tracking-tight text-black">
          Ajustes
        </span>
      </div>
    </footer>
  );
}