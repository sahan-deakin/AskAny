const express = require('express')
const app = express()

app.use(express.json())

// basic health check so we can verify the server is running
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        app: 'AskAny',
        timestamp: new Date()
    })
})

// simple welcome route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to AskAny - Student Help Forum API',
        version: '1.0.0'
    })
})

module.exports = app