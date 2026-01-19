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
    const pattern = formData.get('roomPattern') as string;
    const baseRent = parseFloat(formData.get('baseRent') as string) || 0;

    if (!pattern) return;

    const roomNumbers: string[] = [];

    // Parse pattern: "101-110" or "101, 102, 103"
    const segments = pattern.split(',').map(s => s.trim());
    for (const seg of segments) {
        if (seg.includes('-')) {
            const [startStr, endStr] = seg.split('-').map(s => s.trim());
            const start = parseInt(startStr);
            const end = parseInt(endStr);
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
                    roomNumbers.push(`${i}`);
                }
            }
        } else if (seg) {
            roomNumbers.push(seg);
        }
    }

    const uniqueRoomNumbers = Array.from(new Set(roomNumbers));

    // Get existing rooms to avoid duplicates
    const existingRooms = await prisma.room.findMany({
        where: { apartmentId },
        select: { roomNumber: true }
    });

    const existingSet = new Set(existingRooms.map(r => r.roomNumber));

    const roomsData = uniqueRoomNumbers
        .filter(num => !existingSet.has(num))
        .map(num => ({
            roomNumber: num,
            floor: Math.floor(parseInt(num) / 100) || 1, // Fallback to 1 if not numeric
            baseRent,
            apartmentId,
            status: 'VACANT'
        }));

    if (roomsData.length > 0) {
        await prisma.room.createMany({
            data: roomsData as any
        });
    }

    revalidatePath(`/apartments/${apartmentId}`);
}

export async function updateRoomStatus(formData: FormData) {
    const roomId = formData.get('roomId') as string;
    const apartmentId = formData.get('apartmentId') as string;
    const status = formData.get('status') as string;

    console.log(`Updating status for room ${roomId} to ${status}...`);

    try {
        if (!roomId || !status) {
            throw new Error('Room ID and status are required');
        }

        // Get current status for history
        const currentRoom = await prisma.room.findUnique({
            where: { id: roomId },
            select: { status: true }
        });

        if (!currentRoom) {
            throw new Error(`Room with ID ${roomId} not found`);
        }

        if (currentRoom.status !== status) {
            console.log(`Logging status change: ${currentRoom.status} -> ${status}`);
            await prisma.$transaction([
                prisma.room.update({
                    where: { id: roomId },
                    data: { status }
                }),
                prisma.roomStatusHistory.create({
                    data: {
                        roomId,
                        oldStatus: currentRoom.status,
                        newStatus: status,
                        changeDate: new Date()
                    }
                })
            ]);
        } else {
            await prisma.room.update({
                where: { id: roomId },
                data: { status }
            });
        }

        revalidatePath(`/apartments/${apartmentId}`);
    } catch (e) {
        console.error('Failed to update room status:', e);
        throw e;
    }
}

export async function updateRoomRent(formData: FormData) {
    const roomId = formData.get('roomId') as string;
    const apartmentId = formData.get('apartmentId') as string;
    const baseRent = parseFloat(formData.get('baseRent') as string);

    await prisma.room.update({
        where: { id: roomId },
        data: { baseRent }
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
