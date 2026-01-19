'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createMaintenance(apartmentId: string, formData: FormData) {
    const roomId = formData.get('roomId') as string | null;
    const description = formData.get('description') as string;
    const cost = parseFloat(formData.get('cost') as string);
    const category = formData.get('category') as string;
    const recordDateStr = formData.get('recordDate') as string;

    const recordDate = recordDateStr ? new Date(recordDateStr) : new Date();

    await prisma.maintenance.create({
        data: {
            apartmentId,
            roomId: roomId || null,
            description,
            cost,
            category,
            status: 'PENDING',
            recordDate
        }
    });

    revalidatePath('/finance');
    revalidatePath(`/apartments/${apartmentId}`);
}

export async function updateMaintenanceStatus(formData: FormData) {
    const id = formData.get('id') as string;
    const status = formData.get('status') as string;

    const updateData: any = { status };

    if (status === 'COMPLETED') {
        updateData.completedDate = new Date();
    }

    await prisma.maintenance.update({
        where: { id },
        data: updateData
    });

    revalidatePath('/finance');
}

export async function deleteMaintenance(formData: FormData) {
    const id = formData.get('id') as string;

    await prisma.maintenance.delete({
        where: { id }
    });

    revalidatePath('/finance');
}

export async function trackRoomStatusChange(roomId: string, oldStatus: string, newStatus: string, notes?: string) {
    await prisma.roomStatusHistory.create({
        data: {
            roomId,
            oldStatus,
            newStatus,
            notes
        }
    });
}
