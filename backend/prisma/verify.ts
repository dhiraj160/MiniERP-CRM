import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  const users = await prisma.user.count();
  const customers = await prisma.customer.count();
  const products = await prisma.product.count();
  const movements = await prisma.stockMovement.count();
  const challans = await prisma.challan.count();
  const items = await prisma.challanItem.count();
  const notes = await prisma.customerNote.count();

  console.log('─── DATABASE VERIFICATION ───────────────────────');
  console.log(`  Users:           ${users}`);
  console.log(`  Customers:       ${customers}  (expected: 0)`);
  console.log(`  Products:        ${products}  (expected: 0)`);
  console.log(`  StockMovements:  ${movements}  (expected: 0)`);
  console.log(`  Challans:        ${challans}  (expected: 0)`);
  console.log(`  ChallanItems:    ${items}  (expected: 0)`);
  console.log(`  CustomerNotes:   ${notes}  (expected: 0)`);
  console.log('─────────────────────────────────────────────────');

  const userList = await prisma.user.findMany({
    select: { name: true, email: true, role: true }
  });
  console.log('  Seeded role accounts:');
  userList.forEach(u => console.log(`    [${u.role}] ${u.email} — ${u.name}`));
  console.log('─────────────────────────────────────────────────');

  const allClean = customers === 0 && products === 0 && movements === 0
    && challans === 0 && items === 0 && notes === 0 && users === 4;

  console.log(allClean ? '✅ PASS — Database is clean.' : '❌ FAIL — Unexpected records found.');

  await prisma.$disconnect();
}

verify().catch(e => { console.error(e); process.exit(1); });
