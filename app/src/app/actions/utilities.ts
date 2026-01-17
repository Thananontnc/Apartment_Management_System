'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function submitReadings(apartmentId: string, formData: FormData) {
    // We need to parse dynamic keys: elec_{roomId}, water_{roomId}
    // Iterate over rooms in the apartment directly from DB to know what to look for, or just iterate formData keys.
    // Safer to iterate keys.

    const entries = Array.from(formData.entries());

    // Group by room
    const readingsByRoom: Record<string, { elec?: number, water?: number }> = {};

    for (const [key, value] of entries) {
        if (key.startsWith('elec_')) {
            const roomId = key.replace('elec_', '');
            if (!readingsByRoom[roomId]) readingsByRoom[roomId] = {};
            readingsByRoom[roomId].elec = parseFloat(value as string);
        }
        if (key.startsWith('water_')) {
            const roomId = key.replace('water_', '');
            if (!readingsByRoom[roomId]) readingsByRoom[roomId] = {};
            readingsByRoom[roomId].water = parseFloat(value as string);
        }
    }

    // Get Apartment Rates
    const apartment = await prisma.apartment.findUnique({ where: { id: apartmentId } });
    if (!apartment) throw new Error("Apartment not found");

    // Process each room
    for (const roomId in readingsByRoom) {
        const input = readingsByRoom[roomId];
        if (input.elec === undefined || input.water === undefined) continue; // Skip incomplete

        // Get Previous Reading
        const lastReading = await prisma.utilityReading.findFirst({
            where: { roomId },
            orderBy: { recordDate: 'desc' }
        });

        const prevElec = lastReading?.elecMeter ?? 0; // Default to 0 or some logic
        const prevWater = lastReading?.waterMeter ?? 0;

        const elecUsage = input.elec - prevElec;
        const waterUsage = input.water - prevWater;

        // Simple validation (usage shouldn't be negative usually, unless meter loop, allowing for now)
        const elecCost = elecUsage * apartment.defaultElecPrice;
        const waterCost = waterUsage * apartment.defaultWaterPrice;

        // Get Room Rent
        const room = await prisma.room.findUnique({ where: { id: roomId } });
        const rent = room?.baseRent || 0;

        await prisma.utilityReading.create({
            data: {
                roomId,
                recordDate: new Date(),
                elecMeterPrev: prevElec,
                elecMeterCurrent: input.elec,
                waterMeterPrev: prevWater,
                waterMeterCurrent: input.water,
                elecUsage,
                waterUsage,
                elecCost,
                waterCost,
                rentAmount: rent,
                totalAmount: rent + elecCost + waterCost
            }
        });
    }

    revalidatePath(`/utilities/${apartmentId}`);
}
