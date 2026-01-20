'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Consolidated action to toggle payment status
export async function togglePaymentStatus(formData: FormData) {
    const readingId = formData.get('readingId') as string;
    const apartmentId = formData.get('apartmentId') as string;
    const action = formData.get('action') as string; // 'PAY' or 'UNPAY'

    if (!readingId) return;

    if (action === 'PAY') {
        const paymentMethod = formData.get('paymentMethod') as string;
        await (prisma.utilityReading as any).update({
            where: { id: readingId },
            data: {
                isPaid: true,
                paymentMethod: paymentMethod,
                paymentDate: new Date()
            }
        });
    } else if (action === 'UNPAY') {
        await (prisma.utilityReading as any).update({
            where: { id: readingId },
            data: {
                isPaid: false,
                paymentMethod: null,
                paymentDate: null
            }
        });
    }

    if (apartmentId) {
        revalidatePath(`/billing/${apartmentId}`);
        revalidatePath(`/apartments/${apartmentId}/invoices`);
        revalidatePath(`/utilities/${apartmentId}`);
        revalidatePath(`/`);
    } else {
        revalidatePath('/billing', 'layout');
    }
}

export async function markAsPaid(formData: FormData) {
    // Deprecated wrapper for backward compatibility if needed, but we will switch to togglePaymentStatus
    formData.append('action', 'PAY');
    return togglePaymentStatus(formData);
}
