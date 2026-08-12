import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // ─── 1. Wipe all business data in dependency order ───────────────
  console.log('Cleaning existing data...');
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customerNote.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // ─── 2. Seed only the four required role accounts ────────────────
  // Credentials are documented in README.md for testing purposes only.
  console.log('Seeding role accounts...');
  const salt = await bcrypt.genSalt(12);

  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@minierp.com',
      passwordHash: await bcrypt.hash('password123', salt),
      role: 'ADMIN',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Sales User',
      email: 'sales@minierp.com',
      passwordHash: await bcrypt.hash('password123', salt),
      role: 'SALES',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Warehouse User',
      email: 'warehouse@minierp.com',
      passwordHash: await bcrypt.hash('password123', salt),
      role: 'WAREHOUSE',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Accounts User',
      email: 'accounts@minierp.com',
      passwordHash: await bcrypt.hash('password123', salt),
      role: 'ACCOUNTS',
    },
  });

  console.log('Seeding categories...');
  const categories = [
    'Packaging Materials',
    'Hardware',
    'Electrical',
    'Stationery',
    'Office Supplies',
    'FMCG',
    'Safety Equipment',
    'Tools & Equipment',
    'Raw Materials',
    'Cleaning & Maintenance',
    'Plumbing Supplies',
    'Paint & Supplies',
    'Industrial Supplies',
    'Automotive Supplies',
  ];

  for (const name of categories) {
    await prisma.category.create({
      data: { name },
    });
  }

  console.log('✅ Four role accounts created. No business data seeded.');
  console.log('');
  console.log('Test credentials:');
  console.log('  admin@minierp.com     / password123');
  console.log('  sales@minierp.com     / password123');
  console.log('  warehouse@minierp.com / password123');
  console.log('  accounts@minierp.com  / password123');
  console.log('');
  console.log('👍 Seeding completed. Database is clean and ready for fresh data.');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
