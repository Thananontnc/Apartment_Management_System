'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createApartment(formData: FormData) {
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const elecPrice = parseFloat(formData.get('elecRate') as string) || 7;
    const waterPrice = parseFloat(formData.get('waterRate') as string) || 18;
    const defaultRent = parseFloat(formData.get('defaultRent') as string) || 3000;

    const roomCount = parseInt(formData.get('roomCount') as string) || 0;

    const newApartment = await prisma.apartment.create({
        data: {
            name,
            address,
            defaultElecPrice: elecPrice,
            defaultWaterPrice: waterPrice,
            defaultRent: defaultRent
        },
    });

    if (roomCount > 0) {
        // Auto-generate rooms starting from 1...
        // If more than 99 rooms, logic might need to be smarter, but let's assume < 100 per floor for now or just sequential.
        // Let's do simple: 1, 2, 3...

        const roomsData = [];
        for (let i = 1; i <= roomCount; i++) {
            // Simple logic for now: Room number i
            // A smarter way: 
            // Floor 1: 101-110
            // Floor 2: 201-210
            // Let's stick to simple "Room {i}" or "10{i}"?
            // "101" is standard.
            roomsData.push({
                roomNumber: `${i}`,
                floor: 1,
                baseRent: defaultRent,
                apartmentId: newApartment.id,
                status: 'VACANT'
            });
        }

        await prisma.room.createMany({
            data: roomsData
        });
    }

    revalidatePath('/apartments');
    revalidatePath('/'); // Update dashboard too
}

export async function deleteApartment(id: string) {
    await prisma.apartment.delete({
        where: { id }
    });
    revalidatePath('/apartments');
}
