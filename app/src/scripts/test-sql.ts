import { prisma } from '@/lib/prisma';

async function main() {
    // Example of a Raw SQL Query
    // Note: If you switch to PostgreSQL later, you might need to adjust syntax (e.g., $1 instead of ?)

    const result = await prisma.$queryRaw`
    SELECT * FROM Apartment
  `;

    console.log("Raw SQL Result:", result);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
