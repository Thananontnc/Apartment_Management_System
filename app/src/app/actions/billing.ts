'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function markAsPaid(formData: FormData) {
    const readingId = formData.get('readingId') as string;
    const paymentMethod = formData.get('paymentMethod') as string;

    // Validate
    if (!readingId || !paymentMethod) return;

    await (prisma.utilityReading as any).update({
        where: { id: readingId },
        data: {
            isPaid: true,
            paymentMethod: paymentMethod,
            paymentDate: new Date()
        }
    });

    // Revalidate paths - we don't know the exact apartment ID here easily without querying, 
    // but the client will mostly likely be on /billing/[id]
    // A broader revalidation is safer or we pass apartmentId
    const apartmentId = formData.get('apartmentId') as string;
    if (apartmentId) {
        revalidatePath(`/billing/${apartmentId}`);
        revalidatePath(`/apartments/${apartmentId}/invoices`);
        revalidatePath(`/utilities/${apartmentId}`);
        revalidatePath(`/`); // For Dashboard KPIs
    } else {
        revalidatePath('/billing', 'layout');
    }
}
