export default function HeaderTitle({ title }: { title: string }) {
	return (
		<header className="glass-header mb-4 rounded-2xl px-6 py-4 text-center">
			<h1 className="text-1xl uppercase tracking-widest text-black drop-shadow- text-center sm:text-3xl">
				{title}
			</h1>
			<p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-black/80 drop-shadow- text-center sm:text-[15px]">
				Alta Peluquería &amp; Estética
			</p>
		</header>
	);
}
