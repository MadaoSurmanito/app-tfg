"use client";

type RouteMapCardProps = {
	title?: string;
	subtitle?: string;
	className?: string;
	mapSrc?: string;
};

const ORIGIN = "Escuela Superior de Ingenieria Puerto Real Cadiz";

const STOPS = [
	"Universidad de Cadiz Puerto Real",
	"San Fernando Cadiz",
	"Chiclana de la Frontera Cadiz",
	"Puerto de Santa Maria Cadiz",
	"Rota Cadiz",
	"Jerez de la Frontera Cadiz",
];

const DESTINATION = ORIGIN;

const waypoints = STOPS.join("|");

const defaultMapSrc = `https://www.google.com/maps/embed/v1/directions?key=${
	process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
}&origin=${encodeURIComponent(ORIGIN)}&destination=${encodeURIComponent(
	DESTINATION,
)}&waypoints=${encodeURIComponent(waypoints)}&mode=driving`;

export default function RouteMapCard({
	title = "Ruta diaria",
	subtitle = "Vista previa del recorrido comercial",
	className = "",
	mapSrc = defaultMapSrc,
}: RouteMapCardProps) {
	return (
		<div
			className={`glass-card overflow-hidden rounded-[28px] border border-white/20 ${className}`}
		>
			<div className="glass-header px-5 py-4">
				<p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-black/45">
					M2 · Rutas comerciales
				</p>
				<h2 className="text-base font-medium text-black/80 sm:text-lg">
					{title}
				</h2>
				<p className="mt-1 text-sm text-black/55">{subtitle}</p>
			</div>

			<div className="p-3 sm:p-4">
				<div className="overflow-hidden rounded-[24px] border border-white/20 bg-white/10">
					<iframe
						title="Mapa de ruta comercial"
						src={mapSrc}
						width="100%"
						height="100%"
						loading="lazy"
						referrerPolicy="no-referrer-when-downgrade"
						className="h-[260px] w-full sm:h-[320px] lg:h-[380px]"
					/>
				</div>
			</div>
		</div>
	);
}
