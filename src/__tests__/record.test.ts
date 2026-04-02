import request from 'supertest';
import app from '../server';
import { prisma } from '../prisma/client';
import jwt from 'jsonwebtoken';
import { config } from '../config';

describe('Financial Records Integration Tests', () => {
  let userToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Generate a separate test user directly in DB
    const user = await prisma.user.create({
      data: {
        email: `test_search_${Date.now()}@example.com`,
        name: 'Test Search User',
        password: 'hashed_password_mock',
        role: 'VIEWER',
      },
    });
    testUserId = user.id;

    // Generate JWT token for test user
    userToken = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    // Create a couple of records to test search
    await prisma.financialRecord.createMany({
      data: [
        {
          amount: 500,
          type: 'EXPENSE',
          category: 'Office Supplies',
          description: 'Bought some pens and paper',
          transactionDate: new Date('2026-04-01'),
          userId: testUserId,
        },
        {
          amount: 2500,
          type: 'INCOME',
          category: 'Freelance',
          description: 'Client ABC website project',
          transactionDate: new Date('2026-04-02'),
          userId: testUserId,
        },
      ],
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.financialRecord.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.user.delete({
      where: { id: testUserId },
    });
    await prisma.$disconnect();
  });

  describe('GET /api/records Search functionality', () => {
    it('should return records matching the search query in description', async () => {
      const response = await request(app)
        .get('/api/records?search=website')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].description).toContain('website');
    });

    it('should return records matching the search query in category', async () => {
      const response = await request(app)
        .get('/api/records?search=Office')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].category).toContain('Office');
    });

    it('should return empty when search query matches nothing', async () => {
      const response = await request(app)
        .get('/api/records?search=nonexistent')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('GET /api/records Pagination functionality', () => {
    it('should correctly limit the number of returned records', async () => {
      const response = await request(app)
        .get('/api/records?page=1&limit=1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
    });
  });
});
