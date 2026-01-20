import { getUtilityData } from '@/features/utilities/services/utility-service';
import MeterHub from '@/features/utilities/components/MeterHubClient';

export default async function RecordUtilitiesPage({ params, searchParams }: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ month?: string }>
}) {
    const { id } = await params;
    const { month } = await searchParams;

    // Use our new service layer
    const data = await getUtilityData(id, month);

    if (!data || !data.apartment) return <div>Apartment not found</div>;

    return <MeterHub apartment={data.apartment} sortedRooms={data.sortedRooms} />;
}
