const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');

let token;
let postId;

beforeEach(async () => {
  db.reset();
  await request(app).post('/api/auth/register').send({ username: 'commentuser', password: 'pass123' });
  const loginRes = await request(app).post('/api/auth/login').send({ username: 'commentuser', password: 'pass123' });
  token = loginRes.body.token;

  const postRes = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Best way to learn Docker?', body: 'Looking for resources.' });
  postId = postRes.body.postId;
});

describe('AskAny - Comments Routes', () => {
  it('POST /api/posts/:id/comments - adds a comment', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'Try the official Docker docs!' });
    expect(res.statusCode).toBe(201);
    expect(res.body.commentId).toBeDefined();
  });

  it('GET /api/posts/:id/comments - returns all comments', async () => {
    await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'Great question!' });
    const res = await request(app).get(`/api/posts/${postId}/comments`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('POST comments - fails without auth', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .send({ body: 'Should fail' });
    expect(res.statusCode).toBe(401);
  });

  it('POST comments - fails without body', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBe(400);
  });

  it('POST comments - fails for non-existent post', async () => {
    const res = await request(app)
      .post('/api/posts/99999/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'Post does not exist' });
    expect(res.statusCode).toBe(404);
  });
});
