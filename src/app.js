const express = require('express');
const app = express();
app.use(express.json());

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts/:postId/comments', commentRoutes);

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
  res.json({ 
    status: 'UP', 
    app: 'AskAny',
    timestamp: new Date() 
  });
});

module.exports = app;
