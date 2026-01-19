'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function submitReadings(apartmentId: string, formData: FormData) {
    const entries = Array.from(formData.entries());
    const billingMonthStr = formData.get('recordDate') as string; // format: "YYYY-MM" (changed from billingMonth to recordDate to match form)
    const recordDate = billingMonthStr ? new Date(billingMonthStr + "-01") : new Date();

    // Group by room
    const readingsByRoom: Record<string, { prevElec?: number, elec?: number, prevWater?: number, water?: number }> = {};

    for (const [key, value] of entries) {
        const val = parseFloat(value as string);
        if (isNaN(val)) continue;

        if (key.startsWith('prevElec_')) {
            const roomId = key.replace('prevElec_', '');
            if (!readingsByRoom[roomId]) readingsByRoom[roomId] = {};
            readingsByRoom[roomId].prevElec = val;
        } else if (key.startsWith('elec_')) {
            const roomId = key.replace('elec_', '');
            if (!readingsByRoom[roomId]) readingsByRoom[roomId] = {};
            readingsByRoom[roomId].elec = val;
        } else if (key.startsWith('prevWater_')) {
            const roomId = key.replace('prevWater_', '');
            if (!readingsByRoom[roomId]) readingsByRoom[roomId] = {};
            readingsByRoom[roomId].prevWater = val;
        } else if (key.startsWith('water_')) {
            const roomId = key.replace('water_', '');
            if (!readingsByRoom[roomId]) readingsByRoom[roomId] = {};
            readingsByRoom[roomId].water = val;
        }
    }

    // Get Apartment Rates
    const apartment = await prisma.apartment.findUnique({ where: { id: apartmentId } });
    if (!apartment) throw new Error("Apartment not found");

    // Process each room
    for (const roomId in readingsByRoom) {
        const input = readingsByRoom[roomId];

        if (
            input.elec === undefined ||
            input.water === undefined ||
            input.prevElec === undefined ||
            input.prevWater === undefined
        ) {
            continue;
        }

        const elecUsage: number = Math.max(0, input.elec - input.prevElec);
        const waterUsage: number = Math.max(0, input.water - input.prevWater);

        const elecCost: number = elecUsage * apartment.defaultElecPrice;
        const waterCost: number = waterUsage * apartment.defaultWaterPrice;

        const room = await prisma.room.findUnique({ where: { id: roomId } });
        const rent: number = room?.baseRent || 0;

        const existingReading = await prisma.utilityReading.findFirst({
            where: {
                roomId: roomId,
                recordDate: recordDate
            }
        });

        if (existingReading) {
            await prisma.utilityReading.update({
                where: { id: existingReading.id },
                data: {
                    elecMeterPrev: input.prevElec,
                    elecMeter: input.elec,
                    waterMeterPrev: input.prevWater,
                    waterMeter: input.water,
                    elecUsage,
                    waterUsage,
                    elecCost,
                    waterCost,
                    rentAmount: rent,
                    totalAmount: rent + elecCost + waterCost
                }
            });
        } else {
            await prisma.utilityReading.create({
                data: {
                    room: { connect: { id: roomId } },
                    recordDate: recordDate,
                    elecMeterPrev: input.prevElec,
                    elecMeter: input.elec,
                    waterMeterPrev: input.prevWater,
                    waterMeter: input.water,
                    elecUsage,
                    waterUsage,
                    elecCost,
                    waterCost,
                    rentAmount: rent,
                    totalAmount: rent + elecCost + waterCost
                }
            });
        }
    }

    revalidatePath(`/utilities/${apartmentId}`);
    revalidatePath(`/billing/${apartmentId}`);
    revalidatePath(`/apartments/${apartmentId}/invoices`);

    const monthQuery = billingMonthStr ? `?month=${billingMonthStr}` : '';
    const { redirect } = await import('next/navigation');
    redirect(`/apartments/${apartmentId}/invoices${monthQuery}`);
}
