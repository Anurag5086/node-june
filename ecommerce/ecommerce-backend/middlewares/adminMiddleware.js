const adminMiddleware = (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Access denied!" })
        }

        next()
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server error!" })
    }
}

module.exports = adminMiddleware
