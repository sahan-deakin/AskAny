const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// Get comments for a post (public)
router.get('/', (req, res) => {
  const post = db.findPostById(parseInt(req.params.postId));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(db.getCommentsByPost(parseInt(req.params.postId)));
});

// Add comment (auth required)
router.post('/', authMiddleware, (req, res) => {
  const { body } = req.body;
  if (!body) return res.status(400).json({ error: 'Comment body required' });

  const post = db.findPostById(parseInt(req.params.postId));
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const comment = db.createComment(body, req.user.id, parseInt(req.params.postId));
  res.status(201).json({ message: 'Comment added', commentId: comment.id });
});

module.exports = router;
