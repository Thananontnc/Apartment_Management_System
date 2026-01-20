import { prisma } from '@/lib/prisma';
import UtilitiesClient from './UtilitiesClient';

export default async function RecordUtilitiesPage({ params, searchParams }: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ month?: string }>
}) {
    const { id } = await params;
    const { month: selectedMonthStr } = await searchParams;

    const selectedMonth = selectedMonthStr || new Date().toISOString().slice(0, 7);
    const [year, month] = selectedMonth.split('-').map(Number);

    // We want "Previous" meters to be the latest readings recorded BEFORE this month
    const targetDateStart = new Date(year, month - 1, 1);

    const apartment = await prisma.apartment.findUnique({
        where: { id },
        include: {
            rooms: {
                orderBy: { roomNumber: 'asc' },
                include: {
                    readings: {
                        orderBy: { recordDate: 'desc' },
                        // We'll filter and handle previous vs current in the component logic
                    }
                }
            }
        }
    });

    if (!apartment) return <div>Apartment not found</div>;

    const targetMonthStart = new Date(year, month - 1, 1);
    const targetMonthEnd = new Date(year, month, 0, 23, 59, 59);

    const roomsWithReadings = apartment.rooms.map(room => {
        const currentReading = room.readings.find(r =>
            r.recordDate >= targetMonthStart && r.recordDate <= targetMonthEnd
        );
        const previousReading = room.readings.find(r =>
            r.recordDate < targetMonthStart
        );

        return {
            ...room,
            currentReading: currentReading || null,
            previousReading: previousReading || null
        };
    });

    const sortedRooms = roomsWithReadings.sort((a, b) => {
        const numA = parseInt(a.roomNumber.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.roomNumber.replace(/\D/g, '')) || 0;
        return numA - numB;
    });

    return <UtilitiesClient apartment={apartment} sortedRooms={sortedRooms} />;
}
