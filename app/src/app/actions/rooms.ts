'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createRoom(apartmentId: string, formData: FormData) {
    const roomNumber = formData.get('roomNumber') as string;
    const floor = parseInt(formData.get('floor') as string) || 1;
    const baseRent = parseFloat(formData.get('baseRent') as string) || 0;

    await prisma.room.create({
        data: {
            roomNumber,
            floor,
            baseRent,
            apartmentId,
            status: 'VACANT'
        }
    });

    revalidatePath(`/apartments/${apartmentId}`);
}

export async function createBulkRooms(apartmentId: string, formData: FormData) {
    const startRoomNumber = parseInt(formData.get('startRoomNumber') as string);
    const count = parseInt(formData.get('count') as string) || 1;
    const floor = parseInt(formData.get('floor') as string) || 1;
    const baseRent = parseFloat(formData.get('baseRent') as string) || 0;

    // Get existing rooms to avoid duplicates
    const existingRooms = await prisma.room.findMany({
        where: { apartmentId },
        select: { roomNumber: true }
    });

    const existingSet = new Set(existingRooms.map(r => r.roomNumber));

    const roomsData = [];
    for (let i = 0; i < count; i++) {
        const roomNum = `${startRoomNumber + i}`;
        if (!existingSet.has(roomNum)) {
            roomsData.push({
                roomNumber: roomNum,
                floor,
                baseRent,
                apartmentId,
                status: 'VACANT'
            });
        }
    }

    // Use createMany for efficiency
    if (roomsData.length > 0) {
        await prisma.room.createMany({
            data: roomsData
        });
    }

    revalidatePath(`/apartments/${apartmentId}`);
}

export async function updateRoomStatus(formData: FormData) {
    const roomId = formData.get('roomId') as string;
    const apartmentId = formData.get('apartmentId') as string;
    const status = formData.get('status') as string;

    await prisma.room.update({
        where: { id: roomId },
        data: { status }
    });

    revalidatePath(`/apartments/${apartmentId}`);
}

export async function deleteRoom(formData: FormData) {
    const roomId = formData.get('roomId') as string;
    const apartmentId = formData.get('apartmentId') as string;

    await prisma.room.delete({
        where: { id: roomId }
    });

    revalidatePath(`/apartments/${apartmentId}`);
}
