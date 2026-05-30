const request = require('supertest');
const app = require('../src/app');

let token;
let postId;

beforeAll(async () => {
  await request(app)
    .post('/api/auth/register')
    .send({ username: 'postuser', password: 'pass123' });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ username: 'postuser', password: 'pass123' });
  token = res.body.token;
});

describe('AskAny - Posts Routes', () => {
  it('POST /api/posts - creates a question post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'How do I set up Jenkins?', body: 'I am struggling with the Jenkins pipeline setup for my DevOps unit.' });
    expect(res.statusCode).toBe(201);
    expect(res.body.postId).toBeDefined();
    postId = res.body.postId;
  });

  it('GET /api/posts - returns all posts', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/posts/:id - returns a single post', async () => {
    const res = await request(app).get(`/api/posts/${postId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('How do I set up Jenkins?');
  });

  it('GET /api/posts/:id - returns 404 for missing post', async () => {
    const res = await request(app).get('/api/posts/99999');
    expect(res.statusCode).toBe(404);
  });

  it('PUT /api/posts/:id - owner can update post', async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'How do I set up Jenkins? (Updated)' });
    expect(res.statusCode).toBe(200);
  });

  it('POST /api/posts - fails without auth', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({ title: 'No auth post', body: 'Should fail' });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/posts - fails without title', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'Missing title' });
    expect(res.statusCode).toBe(400);
  });

  it('DELETE /api/posts/:id - owner can delete post', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});
