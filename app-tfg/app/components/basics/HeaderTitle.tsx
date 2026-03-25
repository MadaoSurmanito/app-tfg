type HeaderTitleProps = {
	title: string;
	subtitle?: string;
	noGlass?: boolean;
};

export default function HeaderTitle({
	title,
	subtitle = "Alta Peluquería & Estética",
	noGlass = false,
}: HeaderTitleProps) {
	return (
		<header
			className={`mb-4 rounded-2xl px-6 py-4 text-center ${
				noGlass ? "bg-white/80" : "glass-header"
			}`}
		>
			<h1 className="text-1xl text-center uppercase tracking-widest text-black sm:text-3xl">
				{title}
			</h1>
			<p className="mt-1 text-center text-[10px] uppercase tracking-[0.2em] text-black/80 sm:text-[15px]">
				{subtitle}
			</p>
			{noGlass && (
				<div className="absolute right-6 top-4">
					<img
						src="/profile-image.png"
						alt="Profile"
						className="h-10 w-10 rounded-full"
					/>
				</div>
			)}
		</header>
	);
}
