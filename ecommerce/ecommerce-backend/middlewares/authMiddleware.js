const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.token

        if (!token) {
            return res.status(401).json({ success: false, message: "Access denied! No token provided!" })
        }

        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decodedPayload

        next()
    } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid or expired token!" })
    }
}

module.exports = authMiddleware
