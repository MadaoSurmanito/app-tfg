type Props = {
	label: string;
	value: string | null | undefined;
};

export default function CommercialClientInfoItem({ label, value }: Props) {
	return (
		<div>
			<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
				{label}
			</p>

			<p className="mt-1 text-sm font-medium text-slate-900">
				{value && String(value).trim() ? value : "-"}
			</p>
		</div>
	);
}
