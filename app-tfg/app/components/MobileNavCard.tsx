type MobileNavCardProps = {
  title: string;
  icon: React.ReactNode;
};

export default function MobileNavCard({
  title,
  icon,
}: MobileNavCardProps) {
  return (
    <button
      type="button"
      className="glass-card group flex h-24 flex-col items-center justify-center rounded-2xl px-2 py-3 transition active:scale-[0.97] hover:bg-white/20"
    >
      <div className="mb-3 text-black opacity-90 transition group-hover:scale-110">
        {icon}
      </div>

      <span className="text-center text-xs font-light tracking-wide text-black">
        {title}
      </span>
    </button>
  );
}