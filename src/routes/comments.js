const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// Get comments for a post (public)
router.get('/', (req, res) => {
  const comments = db.prepare(`
    SELECT comments.*, users.username
    FROM comments JOIN users ON comments.user_id = users.id
    WHERE comments.post_id = ?
    ORDER BY comments.created_at ASC
  `).all(req.params.postId);
  res.json(comments);
});

// Add comment (auth required)
router.post('/', authMiddleware, (req, res) => {
  const { body } = req.body;
  if (!body) return res.status(400).json({ error: 'Comment body required' });

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const result = db.prepare(
    'INSERT INTO comments (body, user_id, post_id) VALUES (?, ?, ?)'
  ).run(body, req.user.id, req.params.postId);

  res.status(201).json({ message: 'Comment added', commentId: result.lastInsertRowid });
});

module.exports = router;
