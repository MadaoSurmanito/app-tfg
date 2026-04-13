import CommercialClientDetail from "@/app/components/commercial/CommercialClientDetail";

type PageProps = {
	params: Promise<{
		id: string;
	}>;
};

export default async function CommercialClientDetailPage({
	params,
}: PageProps) {
	const { id } = await params;

	return <CommercialClientDetail clientId={id} />;
}
