import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
    try {
        console.log('Checking models...');
        console.log('Mortgage:', !!prisma.mortgage);
        console.log('RoomStatusHistory:', !!prisma.roomStatusHistory);
        console.log('Maintenance:', !!prisma.maintenance);

        const rooms = await prisma.room.findMany({ take: 1 });
        if (rooms.length > 0) {
            console.log('Found room:', rooms[0].id);
            // Don't actually create to avoid mess, just check if the method exists
            console.log('Method exists:', typeof prisma.roomStatusHistory.create === 'function');
        } else {
            console.log('No rooms found to test with.');
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
