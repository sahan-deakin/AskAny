const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// Get all posts (public)
router.get('/', (req, res) => {
  const posts = db.prepare(`
    SELECT posts.*, users.username 
    FROM posts JOIN users ON posts.user_id = users.id
    ORDER BY posts.created_at DESC
  `).all();
  res.json(posts);
});

// Get single post (public)
router.get('/:id', (req, res) => {
  const post = db.prepare(`
    SELECT posts.*, users.username 
    FROM posts JOIN users ON posts.user_id = users.id
    WHERE posts.id = ?
  `).get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

// Create post (auth required)
router.post('/', authMiddleware, (req, res) => {
  const { title, body } = req.body;
  if (!title || !body)
    return res.status(400).json({ error: 'Title and body required' });

  const result = db.prepare(
    'INSERT INTO posts (title, body, user_id) VALUES (?, ?, ?)'
  ).run(title, body, req.user.id);

  res.status(201).json({ message: 'Post created', postId: result.lastInsertRowid });
});

// Update post (owner only)
router.put('/:id', authMiddleware, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.user_id !== req.user.id)
    return res.status(403).json({ error: 'Not authorised to edit this post' });

  const { title, body } = req.body;
  db.prepare('UPDATE posts SET title = ?, body = ? WHERE id = ?')
    .run(title || post.title, body || post.body, req.params.id);

  res.json({ message: 'Post updated' });
});

// Delete post (owner only)
router.delete('/:id', authMiddleware, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.user_id !== req.user.id)
    return res.status(403).json({ error: 'Not authorised to delete this post' });

  db.prepare('DELETE FROM comments WHERE post_id = ?').run(req.params.id);
  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
  res.json({ message: 'Post deleted' });
});

module.exports = router;
