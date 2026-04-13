import CommercialVisitDetail from "@/app/components/commercial/CommercialVisitDetail";

type PageProps = {
	params: Promise<{
		id: string;
	}>;
};

export default async function CommercialVisitDetailPage({ params }: PageProps) {
	const { id } = await params;

	return <CommercialVisitDetail visitId={id} />;
}
