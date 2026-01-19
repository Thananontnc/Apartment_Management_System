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
                        where: {
                            recordDate: {
                                lt: targetDateStart
                            }
                        },
                        orderBy: { recordDate: 'desc' },
                        take: 1
                    }
                }
            }
        }
    });

    if (!apartment) return <div>Apartment not found</div>;

    const sortedRooms = [...apartment.rooms].sort((a, b) => {
        const numA = parseInt(a.roomNumber.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.roomNumber.replace(/\D/g, '')) || 0;
        return numA - numB;
    });

    return <UtilitiesClient apartment={apartment} sortedRooms={sortedRooms} />;
}
