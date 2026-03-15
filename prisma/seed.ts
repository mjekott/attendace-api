import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  // Create kiosks
  const kioskA = await prisma.kiosk.create({
    data: {
      name: 'Gate A',
      location: 'Main Entrance',
      secretKey: randomBytes(32).toString('hex'),
    },
  });

  const kioskB = await prisma.kiosk.create({
    data: {
      name: 'Gate B',
      location: 'Side Entrance',
      secretKey: randomBytes(32).toString('hex'),
    },
  });

  console.log('Created kiosks:');
  console.log(`  Gate A - secretKey: ${kioskA.secretKey}`);
  console.log(`  Gate B - secretKey: ${kioskB.secretKey}`);

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Amara Okafor',
        employeeId: 'EMP001',
        department: 'Engineering',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Chidi Nwosu',
        employeeId: 'EMP002',
        department: 'Design',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Fatima Bello',
        employeeId: 'EMP003',
        department: 'HR',
      },
    }),
  ]);

  console.log(`\nCreated ${users.length} users`);
  users.forEach((u) => console.log(`  ${u.name} (${u.employeeId})`));

  console.log('\nSeed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
