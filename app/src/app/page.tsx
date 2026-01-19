import { prisma } from '@/lib/prisma';
import DashboardClient from './DashboardClient';

export default async function Dashboard() {
  const apartments = await prisma.apartment.findMany({
    include: {
      rooms: {
        orderBy: { roomNumber: 'asc' }
      }
    }
  });

  const totalApartments = await prisma.apartment.count();
  const totalRooms = await prisma.room.count();
  const occupiedRooms = await prisma.room.count({ where: { status: 'OCCUPIED' } });

  const currentMonth = new Date();
  const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const currentMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);

  // REALIZED REVENUE (Actual readings for the month)
  const monthlyReadings = await prisma.utilityReading.findMany({
    where: {
      recordDate: {
        gte: currentMonthStart,
        lt: currentMonthEnd
      }
    },
    select: {
      totalAmount: true,
      isPaid: true
    }
  });

  const totalInvoiced = monthlyReadings.reduce((acc, r) => acc + r.totalAmount, 0);
  const totalPaid = monthlyReadings.reduce((acc, r) => acc + (r.isPaid ? r.totalAmount : 0), 0);
  const collectionRate = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0;
  const outstandingDebt = totalInvoiced - totalPaid;

  // Expected Rent (Target)
  const rentAggregation = await prisma.room.aggregate({
    _sum: { baseRent: true },
    where: { status: 'OCCUPIED' }
  });

  // Use actual invoiced amount if available, otherwise target rent
  const projectedRevenue = totalInvoiced > 0 ? totalInvoiced : (rentAggregation._sum.baseRent || 0);

  let netProfit = projectedRevenue;

  try {
    const p = prisma as any;
    if (p.mortgage && p.expense) {
      const mortgageSum = await p.mortgage.aggregate({
        _sum: { monthlyPayment: true }
      });

      const expenseSum = await p.expense.aggregate({
        _sum: { amount: true },
        where: {
          recordMonth: {
            gte: currentMonthStart,
            lt: currentMonthEnd
          }
        }
      });

      const totalOutflow = (mortgageSum?._sum?.monthlyPayment || 0) + (expenseSum?._sum?.amount || 0);
      netProfit = projectedRevenue - totalOutflow;
    }
  } catch (e) {
    console.warn("Finance aggregation skipped (Prisma stale):", e);
  }

  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  const currentMonthName = new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <DashboardClient
      stats={{
        totalApartments,
        totalRooms,
        occupiedRooms,
        projectedRevenue,
        netProfit,
        occupancyRate,
        collectionRate,
        outstandingDebt
      }}
      apartments={apartments}
      currentMonthName={currentMonthName}
    />
  );
}
