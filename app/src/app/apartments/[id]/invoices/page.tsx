import { prisma } from '@/lib/prisma';
import InvoicesClient from './InvoicesClient';

export default async function InvoicesPage({ params, searchParams }: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ month?: string }>
}) {
    const { id } = await params;
    const { month: selectedMonth } = await searchParams;

    // Fetch all unique record months for this apartment to show in a selector
    const allReadings = await prisma.utilityReading.findMany({
        where: { room: { apartmentId: id } },
        select: { recordDate: true },
        orderBy: { recordDate: 'desc' }
    });

    // Create unique months for the dropdown
    const uniqueMonths = allReadings.map(r => {
        const d = new Date(r.recordDate);
        return {
            year: d.getFullYear(),
            month: d.getMonth() + 1
        };
    }).filter((v, i, a) => a.findIndex(t => (t.year === v.year && t.month === v.month)) === i)
        .map(m => {
            const d = new Date(m.year, m.month - 1);
            return {
                value: `${m.year}-${m.month.toString().padStart(2, '0')}`,
                label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            };
        });

    // If no month selected, use the latest one available
    let targetDateStart: Date | undefined;
    let targetDateEnd: Date | undefined;

    if (selectedMonth) {
        const [year, month] = selectedMonth.split('-').map(Number);
        targetDateStart = new Date(year, month - 1, 1);
        targetDateEnd = new Date(year, month, 0, 23, 59, 59);
    }

    const apartment = await prisma.apartment.findUnique({
        where: { id },
        include: {
            rooms: {
                orderBy: { roomNumber: 'asc' },
                include: {
                    readings: {
                        where: targetDateStart ? {
                            recordDate: {
                                gte: targetDateStart,
                                lte: targetDateEnd
                            }
                        } : undefined,
                        orderBy: { recordDate: 'desc' },
                        take: 1
                    }
                }
            }
        }
    });

    if (!apartment) return <div>Property not found</div>;

    const sortedRooms = [...apartment.rooms].sort((a, b) => {
        const numA = parseInt(a.roomNumber.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.roomNumber.replace(/\D/g, '')) || 0;
        return numA - numB;
    });

    return <InvoicesClient
        apartment={apartment}
        sortedRooms={sortedRooms}
        months={uniqueMonths}
        currentMonth={selectedMonth}
    />;
}
