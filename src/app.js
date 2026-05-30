const express = require('express')
const app = express()

app.use(express.json())

const authRoutes = require('./routes/auth')
const postRoutes = require('./routes/posts')
const commentRoutes = require('./routes/comments')

app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/posts/:postId/comments', commentRoutes)

// health check for monitoring and pipeline verification
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        app: 'AskAny',
        timestamp: new Date()
    })
})

// welcome message
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to AskAny - Student Help Forum API',
        version: '1.0.0'
    })
})

module.exports = app
