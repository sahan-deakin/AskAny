const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');

beforeEach(() => db.reset());

describe('AskAny - Auth Routes', () => {
  it('POST /api/auth/register - registers a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'password123' });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User registered');
  });

  it('POST /api/auth/register - fails with duplicate username', async () => {
    await request(app).post('/api/auth/register').send({ username: 'dupeuser', password: 'pass' });
    const res = await request(app).post('/api/auth/register').send({ username: 'dupeuser', password: 'pass' });
    expect(res.statusCode).toBe(409);
  });

  it('POST /api/auth/register - fails without username', async () => {
    const res = await request(app).post('/api/auth/register').send({ password: 'pass123' });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/auth/login - returns JWT token', async () => {
    await request(app).post('/api/auth/register').send({ username: 'loginuser', password: 'pass123' });
    const res = await request(app).post('/api/auth/login').send({ username: 'loginuser', password: 'pass123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/login - fails with wrong password', async () => {
    await request(app).post('/api/auth/register').send({ username: 'loginuser', password: 'pass123' });
    const res = await request(app).post('/api/auth/login').send({ username: 'loginuser', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
  });
});
