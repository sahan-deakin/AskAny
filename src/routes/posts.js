const express = require('express')
const router = express.Router()
const db = require('../db')
const authMiddleware = require('../middleware/auth')

// get all posts - anyone can view
router.get('/', (req, res) => {
    res.json(db.getAllPosts())
})

// get a single post by id - anyone can view
router.get('/:id', (req, res) => {
    const post = db.findPostById(parseInt(req.params.id))
    if (!post) return res.status(404).json({ error: 'Post not found' })
    res.json(post)
})

// create a new post - must be logged in
router.post('/', authMiddleware, (req, res) => {
    const { title, body } = req.body
    if (!title || !body) {
        return res.status(400).json({ error: 'Title and body required' })
    }
    const post = db.createPost(title, body, req.user.id)
    res.status(201).json({ message: 'Post created', postId: post.id })
})

// update a post - only the owner can edit
router.put('/:id', authMiddleware, (req, res) => {
    const post = db.findPostById(parseInt(req.params.id))
    if (!post) return res.status(404).json({ error: 'Post not found' })
    if (post.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorised to edit this post' })
    }
    db.updatePost(parseInt(req.params.id), req.body.title, req.body.body)
    res.json({ message: 'Post updated' })
})

// delete a post - only the owner can delete
router.delete('/:id', authMiddleware, (req, res) => {
    const post = db.findPostById(parseInt(req.params.id))
    if (!post) return res.status(404).json({ error: 'Post not found' })
    if (post.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorised to delete this post' })
    }
    db.deletePost(parseInt(req.params.id))
    res.json({ message: 'Post deleted' })
})

module.exports = router
