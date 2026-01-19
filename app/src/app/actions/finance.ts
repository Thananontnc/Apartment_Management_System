'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateMortgage(formData: FormData) {
    const apartmentId = formData.get('apartmentId') as string;
    const monthlyPayment = parseFloat(formData.get('monthlyPayment') as string || '0');
    const loanAmount = parseFloat(formData.get('loanAmount') as string || '0');
    const interestRate = parseFloat(formData.get('interestRate') as string || '0');

    if (!apartmentId) return { error: 'Missing Apartment ID' };

    const p = prisma as any;
    if (!p.mortgage) {
        return { error: 'Database model Mortgage not yet loaded. Please refresh the page and try again.' };
    }

    const existingMortgage = await p.mortgage.findUnique({
        where: { apartmentId }
    });

    if (existingMortgage) {
        await p.mortgage.update({
            where: { apartmentId },
            data: { monthlyPayment, loanAmount, interestRate }
        });
    } else {
        await p.mortgage.create({
            data: { apartmentId, monthlyPayment, loanAmount, interestRate }
        });
    }

    revalidatePath(`/finance`);
    revalidatePath(`/apartments/${apartmentId}`);
    return { success: true };
}

export async function addExpense(formData: FormData) {
    const apartmentId = formData.get('apartmentId') as string;
    const amount = parseFloat(formData.get('amount') as string || '0');
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const monthStr = formData.get('month') as string; // YYYY-MM

    if (!apartmentId || !amount || !category || !monthStr) {
        return { error: 'Invalid input' };
    }

    const recordMonth = new Date(monthStr + '-01');

    const p = prisma as any;
    if (!p.expense) {
        return { error: 'Database model Expense not yet loaded. Please refresh the page and try again.' };
    }

    const existingExpense = await p.expense.findFirst({
        where: {
            apartmentId,
            category,
            recordMonth
        }
    });

    if (existingExpense) {
        await p.expense.update({
            where: { id: existingExpense.id },
            data: { amount, description }
        });
    } else {
        await p.expense.create({
            data: { apartmentId, amount, category, description, recordMonth }
        });
    }

    revalidatePath(`/finance`);
    return { success: true };
}

export async function deleteExpense(expenseId: string, apartmentId: string) {
    const p = prisma as any;
    if (!p.expense) return { error: 'Database model stale' };

    await p.expense.delete({
        where: { id: expenseId }
    });
    revalidatePath(`/finance`);
    return { success: true };
}
