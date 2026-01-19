'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateApartment(formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const elecRate = parseFloat(formData.get('elecRate') as string);
    const waterRate = parseFloat(formData.get('waterRate') as string);
    const defaultRentRate = parseFloat(formData.get('defaultRent') as string);

    await prisma.apartment.update({
        where: { id },
        data: {
            name,
            address,
            defaultElecPrice: isNaN(elecRate) ? 7 : elecRate,
            defaultWaterPrice: isNaN(waterRate) ? 18 : waterRate,
            defaultRent: isNaN(defaultRentRate) ? 3000 : defaultRentRate
        }
    });

    revalidatePath(`/apartments/${id}`);
    revalidatePath('/apartments');
    revalidatePath('/');
}
