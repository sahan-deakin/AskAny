const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db')

const SECRET = process.env.JWT_SECRET || 'askany-secret-key'

// register a new user account
router.post('/register', (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' })
    }

    const existing = db.findUserByUsername(username)
    if (existing) {
        return res.status(409).json({ error: 'Username already exists' })
    }

    const hashed = bcrypt.hashSync(password, 10)
    const user = db.createUser(username, hashed)

    res.status(201).json({ message: 'User registered', userId: user.id })
})

// login and receive a jwt token
router.post('/login', (req, res) => {
    const { username, password } = req.body

    const user = db.findUserByUsername(username)

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
        { id: user.id, username: user.username },
        SECRET,
        { expiresIn: '24h' }
    )

    res.json({ token })
})

module.exports = router