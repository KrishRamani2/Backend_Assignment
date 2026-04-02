import request from 'supertest';
import app from '../server';

describe('App Integration Tests', () => {
  describe('Health Check API', () => {
    it('should return a 200 health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
    });
  });

  describe('Not Found API', () => {
    it('should return a 404 for an unknown endpoint', async () => {
      const response = await request(app).get('/api/unknown-route');
      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe('Route not found');
    });
  });
});
