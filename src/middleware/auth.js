const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET || 'askany-secret-key'

// checks the bearer token on protected routes
// if valid, attaches decoded user info to req.user
module.exports = (req, res, next) => {
    const header = req.headers['authorization']

    if (!header) {
        return res.status(401).json({ error: 'No token provided' })
    }

    const token = header.split(' ')[1]

    try {
        req.user = jwt.verify(token, SECRET)
        next()
    } catch {
        res.status(401).json({ error: 'Invalid token' })
    }
}