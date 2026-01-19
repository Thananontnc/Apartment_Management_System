import React from 'react';
import { prisma } from '@/lib/prisma';
import FinanceClient from '@/app/finance/FinanceClient';

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
    const apartmentsRaw = await prisma.apartment.findMany({
        include: {
            rooms: {
                include: {
                    readings: {
                        orderBy: { recordDate: 'desc' },
                        take: 1
                    }
                }
            }
        }
    });

    const p = prisma as any;

    // Get last 12 months dates for better trend analysis
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    twelveMonthsAgo.setDate(1);

    const apartments = await Promise.all(apartmentsRaw.map(async (apt) => {
        let mortgage: any = null;
        let expenses: any[] = [];
        let historicalRevenue: any[] = [];
        let maintenance: any[] = [];
        let roomStatusHistory: any[] = [];
        let detailedUtilityStats: any[] = [];

        try {
            mortgage = await prisma.mortgage.findUnique({ where: { apartmentId: apt.id } });
            expenses = await prisma.expense.findMany({
                where: { apartmentId: apt.id },
                orderBy: { recordMonth: 'desc' },
            });
            maintenance = await prisma.maintenance.findMany({
                where: { apartmentId: apt.id },
                orderBy: { recordDate: 'desc' },
                include: { room: true }
            });
            roomStatusHistory = await prisma.roomStatusHistory.findMany({
                where: { room: { apartmentId: apt.id } },
                orderBy: { changeDate: 'desc' },
                include: { room: true }
            });

            // Fetch Utility Readings for revenue trend and breakdown
            const readings = await prisma.utilityReading.findMany({
                where: {
                    room: { apartmentId: apt.id },
                    recordDate: { gte: twelveMonthsAgo }
                },
                select: {
                    recordDate: true,
                    totalAmount: true,
                    elecCost: true,
                    waterCost: true,
                    rentAmount: true,
                    elecUsage: true,
                    waterUsage: true,
                    isPaid: true
                }
            });

            // Group by month
            const monthsGroup: { [key: string]: any } = {};
            readings.forEach(r => {
                const mk = r.recordDate.toISOString().slice(0, 7);
                if (!monthsGroup[mk]) {
                    monthsGroup[mk] = { month: mk, total: 0, rent: 0, elec: 0, water: 0, elecUsage: 0, waterUsage: 0 };
                }
                monthsGroup[mk].total += r.totalAmount;
                monthsGroup[mk].rent += r.rentAmount;
                monthsGroup[mk].elec += r.elecCost;
                monthsGroup[mk].water += r.waterCost;
                monthsGroup[mk].elecUsage += r.elecUsage;
                monthsGroup[mk].waterUsage += r.waterUsage;
            });
            historicalRevenue = Object.values(monthsGroup).sort((a: any, b: any) => b.month.localeCompare(a.month));

        } catch (e) {
            console.warn(`Could not fetch financial details for apartment ${apt.id}:`, e);
        }

        return {
            ...apt,
            mortgage,
            expenses,
            historicalRevenue,
            maintenance,
            roomStatusHistory
        };
    }));

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <FinanceClient apartments={apartments} />
        </div>
    );
}
