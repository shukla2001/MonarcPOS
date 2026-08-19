import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Monarc POS API & RBAC Test Suite', () => {
  const secret = process.env.JWT_SECRET || 'monarc_royal_ice_cream_super_secret_jwt_key_2026_987654321';
  let isDbConnected = false;

  const mockAdmin = {
    id: 'mock-admin-uuid-101',
    username: 'admin',
    name: 'Monarc Store Manager',
    role: 'ADMIN' as const,
  };

  const mockWorker = {
    id: 'mock-worker-uuid-202',
    username: 'cashier1',
    name: 'Rajesh Sharma',
    role: 'WORKER' as const,
  };

  const adminToken = jwt.sign(mockAdmin, secret);
  const workerToken = jwt.sign(mockWorker, secret);

  beforeAll(async () => {
    try {
      await prisma.$connect();
      isDbConnected = true;
    } catch {
      isDbConnected = false;
    }
  });

  afterAll(async () => {
    if (isDbConnected) {
      await prisma.$disconnect();
    }
  });

  describe('1. Health Check Endpoint', () => {
    it('should return 200 and healthy status metadata', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.brand).toBe('Monarc Ice Creams');
    });
  });

  describe('2. Authentication & Validation', () => {
    it('should reject login with missing credentials (empty payload)', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should reject login with invalid short username/password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        username: 'a',
        password: '123',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should handle authentication requests properly', async () => {
      if (!isDbConnected) return;

      const res = await request(app).post('/api/auth/login').send({
        username: 'non_existent_user',
        password: 'RandomPassword123',
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Role-Based Access Control (RBAC) Token Verification', () => {
    it('should reject unauthenticated requests to protected admin routes', async () => {
      const res = await request(app).get('/api/workers');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject malformed or invalid JWT tokens', async () => {
      const res = await request(app)
        .get('/api/workers')
        .set('Authorization', 'Bearer invalid.token.payload');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject unauthenticated requests to protected sales reports', async () => {
      const res = await request(app).get('/api/reports/sales');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject orders with invalid/negative quantities', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${workerToken}`)
        .send({
          items: [{ itemId: 1, quantity: -5 }],
          paymentMode: 'UPI',
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject orders with missing payment mode', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${workerToken}`)
        .send({
          items: [{ itemId: 1, quantity: 2 }],
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject orders with invalid payment mode string', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${workerToken}`)
        .send({
          items: [{ itemId: 1, quantity: 2 }],
          paymentMode: 'BITCOIN',
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
