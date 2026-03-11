// Icono de ajustes
export function SettingsIcon({
	className = "w-6 h-6",
}: {
	className?: string;
}) {
	return (
		<svg fill="currentColor" viewBox="0 0 24 24" className={className}>
			<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
		</svg>
	);
}

// Icono de perfil
export function ProfileIcon({ className = "w-6 h-6" }: { className?: string }) {
	return (
		<svg fill="currentColor" viewBox="0 0 24 24" className={className}>
			<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
		</svg>
	);
}

// Icono de inicio
export function HomeIcon({ className = "w-6 h-6" }: { className?: string }) {
	return (
		<svg fill="currentColor" viewBox="0 0 24 24" className={className}>
			<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
		</svg>
	);
}

// Icono de coloración
export function ColorIcon({ className = "w-6 h-6" }: { className?: string }) {
	return (
		<svg
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			className={className}
		>
			<path
				d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1"
			/>
		</svg>
	);
}

// Icono de Catálogos
export function CatalogIcon({ className = "w-6 h-6" }: { className?: string }) {
	return (
		<svg
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			className={className}
		>
			<path
				d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1"
			/>
		</svg>
	);
}

// Icono de Agenda
export function AgendaIcon({ className = "w-6 h-6" }: { className?: string }) {
	return (
		<svg
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			className={className}
		>
			<path
				d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1"
			/>
		</svg>
	);
}

// Icono de Citas
export function AppointmentIcon({
	className = "w-6 h-6",
}: {
	className?: string;
}) {
	return (
		<svg
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			className={className}
		>
			<path
				d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1"
			/>
		</svg>
	);
}

// Icono de Pedido Abierto
export function OrderIcon({ className = "w-6 h-6" }: { className?: string }) {
	return (
		<svg
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			className={className}
		>
			<path
				d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1"
			/>
		</svg>
	);
}

// Icono de Tarifas
export function PricesIcon({ className = "w-6 h-6" }: { className?: string }) {
	return (
		<svg
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			className={className}
		>
			<path
				d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1"
			/>
		</svg>
	);
}

// Icono de Productos
export function ProductsIcon({
	className = "w-6 h-6",
}: {
	className?: string;
}) {
	return (
		<svg
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			className={className}
		>
			<path
				d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1"
			/>
		</svg>
	);
}

// Icono de Simulador
export function SimulatorIcon({
	className = "w-6 h-6",
}: {
	className?: string;
}) {
	return (
		<svg
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			className={className}
		>
			<path
				d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1"
			/>
			<path
				d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1"
			/>
		</svg>
	);
}

// Icono de Formaciones
export function TrainingIcon({
	className = "w-6 h-6",
}: {
	className?: string;
}) {
	return (
		<svg
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			className={className}
		>
			<path
				d="M12 14l9-5-9-5-9 5 9 5z"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1"
			/>
			<path
				d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1"
			/>
			<path
				d="M8 20v-7.5L12 10.278"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1"
			/>
		</svg>
	);
}

// Icono de chat
export function ChatIcon({ className = "w-6 h-6" }: { className?: string }) {
	return (
		<svg
			className="h-6 w-6 text-black"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
			/>
		</svg>
	);
}

// Icono de flecha derecha
export function RightArrowIcon({
	className = "w-6 h-6",
}: {
	className?: string;
}) {
	return (
		<svg
			className="h-5 w-5 text-black/40 transition-transform group-hover:translate-x-1"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M9 5l7 7-7 7"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
			/>
		</svg>
	);
}

// Icono de flecha izquierda
export function LeftArrowIcon({
	className = "w-6 h-6",
}: {
	className?: string;
}) {
	return (
		<svg
			className="h-5 w-5 text-black/40 transition-transform group-hover:-translate-x-1"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M15 19l-7-7 7-7"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
			/>
		</svg>
	);
}

// Icono de solicitudes de registro
export function RegisterRequestsIcon({
	className = "w-6 h-6",
}: {
	className?: string;
}) {
	return (
		<svg
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			className={className}
		>
			<path
				d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a3 3 0 013-3h9a3 3 0 013 3v1zM17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m14-10a3.001 3.001 0 11-6.002-.001A3.001 3.001 0 0117 11z"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1"
			/>
		</svg>
	);
}