const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// Get all posts (public)
router.get('/', (req, res) => {
  res.json(db.getAllPosts());
});

// Get single post (public)
router.get('/:id', (req, res) => {
  const post = db.findPostById(parseInt(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

// Create post (auth required)
router.post('/', authMiddleware, (req, res) => {
  const { title, body } = req.body;
  if (!title || !body)
    return res.status(400).json({ error: 'Title and body required' });

  const post = db.createPost(title, body, req.user.id);
  res.status(201).json({ message: 'Post created', postId: post.id });
});

// Update post (owner only)
router.put('/:id', authMiddleware, (req, res) => {
  const post = db.findPostById(parseInt(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.user_id !== req.user.id)
    return res.status(403).json({ error: 'Not authorised to edit this post' });

  db.updatePost(parseInt(req.params.id), req.body.title, req.body.body);
  res.json({ message: 'Post updated' });
});

// Delete post (owner only)
router.delete('/:id', authMiddleware, (req, res) => {
  const post = db.findPostById(parseInt(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.user_id !== req.user.id)
    return res.status(403).json({ error: 'Not authorised to delete this post' });

  db.deletePost(parseInt(req.params.id));
  res.json({ message: 'Post deleted' });
});

module.exports = router;
