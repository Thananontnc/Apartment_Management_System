import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => new PrismaClient({ log: ['query'] });

// If global is stale (missing new models), reset it immediately before any export
if (process.env.NODE_ENV !== 'production') {
    const p = globalForPrisma.prisma as any;
    if (p && (!p.mortgage || !p.roomStatusHistory || !p.maintenance)) {
        console.log('🔄 Stale Prisma Client detected, regenerating instance...');
        globalForPrisma.prisma = createPrismaClient();
    }
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
