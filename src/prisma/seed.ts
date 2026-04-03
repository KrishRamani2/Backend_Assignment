// ─────────────────────────────────────────────────────────
// Database Seed Script
// ─────────────────────────────────────────────────────────
// Creates one user per role (VIEWER, ANALYST, ADMIN)
// and sample financial records for testing.
// Run: npx ts-node src/prisma/seed.ts
// ─────────────────────────────────────────────────────────

import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clean existing data
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 12);

  // ─── Create Users ────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  const analyst = await prisma.user.create({
    data: {
      email: 'analyst@example.com',
      password: passwordHash,
      name: 'Analyst User',
      role: 'ANALYST',
    },
  });

  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@example.com',
      password: passwordHash,
      name: 'Viewer User',
      role: 'VIEWER',
    },
  });

  console.log('✅ Created users:');
  console.log(`   Admin:   admin@example.com    (password: password123)`);
  console.log(`   Analyst: analyst@example.com  (password: password123)`);
  console.log(`   Viewer:  viewer@example.com   (password: password123)\n`);

  // ─── Create Sample Financial Records ─────────────────
  const records = [
    // Admin's records
    { amount: 75000, type: 'INCOME', category: 'Salary', description: 'Monthly salary — January', transactionDate: '2025-01-01', userId: admin.id },
    { amount: 15000, type: 'EXPENSE', category: 'Rent', description: 'Office space rent', transactionDate: '2025-01-05', userId: admin.id },
    { amount: 3500, type: 'EXPENSE', category: 'Utilities', description: 'Electricity and internet', transactionDate: '2025-01-10', userId: admin.id },
    { amount: 25000, type: 'INCOME', category: 'Investment', description: 'Stock dividend Q1', transactionDate: '2025-01-15', userId: admin.id },
    { amount: 5000, type: 'EXPENSE', category: 'Entertainment', description: 'Team dinner', transactionDate: '2025-01-20', userId: admin.id },

    // Analyst's records
    { amount: 55000, type: 'INCOME', category: 'Salary', description: 'Monthly salary — January', transactionDate: '2025-01-02', userId: analyst.id },
    { amount: 12000, type: 'EXPENSE', category: 'Rent', description: 'Apartment rent', transactionDate: '2025-01-03', userId: analyst.id },
    { amount: 8000, type: 'INCOME', category: 'Freelance', description: 'Data analysis project', transactionDate: '2025-01-12', userId: analyst.id },
    { amount: 2500, type: 'EXPENSE', category: 'Groceries', description: 'Weekly groceries', transactionDate: '2025-01-14', userId: analyst.id },
    { amount: 1500, type: 'EXPENSE', category: 'Transportation', description: 'Fuel and maintenance', transactionDate: '2025-01-18', userId: analyst.id },

    // Viewer's records
    { amount: 40000, type: 'INCOME', category: 'Salary', description: 'Monthly salary — January', transactionDate: '2025-01-03', userId: viewer.id },
    { amount: 10000, type: 'EXPENSE', category: 'Rent', description: 'Room rent', transactionDate: '2025-01-05', userId: viewer.id },
    { amount: 3000, type: 'EXPENSE', category: 'Education', description: 'Online course subscription', transactionDate: '2025-01-08', userId: viewer.id },
    { amount: 1800, type: 'EXPENSE', category: 'Healthcare', description: 'Monthly insurance premium', transactionDate: '2025-01-12', userId: viewer.id },
    { amount: 5000, type: 'INCOME', category: 'Freelance', description: 'Logo design project', transactionDate: '2025-01-22', userId: viewer.id },

    // February records
    { amount: 75000, type: 'INCOME', category: 'Salary', description: 'Monthly salary — February', transactionDate: '2025-02-01', userId: admin.id },
    { amount: 55000, type: 'INCOME', category: 'Salary', description: 'Monthly salary — February', transactionDate: '2025-02-01', userId: analyst.id },
    { amount: 40000, type: 'INCOME', category: 'Salary', description: 'Monthly salary — February', transactionDate: '2025-02-01', userId: viewer.id },
    { amount: 7500, type: 'EXPENSE', category: 'Entertainment', description: 'Weekend trip', transactionDate: '2025-02-10', userId: admin.id },
    { amount: 4200, type: 'EXPENSE', category: 'Groceries', description: 'Monthly groceries', transactionDate: '2025-02-15', userId: analyst.id },
  ];

  for (const record of records) {
    await prisma.financialRecord.create({
      data: {
        ...record,
        transactionDate: new Date(record.transactionDate),
      },
    });
  }

  console.log(`✅ Created ${records.length} sample financial records\n`);

  // ─── Summary ─────────────────────────────────────────
  const totalUsers = await prisma.user.count();
  const totalRecords = await prisma.financialRecord.count();
  console.log('📊 Database summary:');
  console.log(`   Total users:   ${totalUsers}`);
  console.log(`   Total records: ${totalRecords}`);
  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
