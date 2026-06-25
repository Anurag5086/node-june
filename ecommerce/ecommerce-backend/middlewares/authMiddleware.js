const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
    try{
        const token = req.cookies.token

        if(!token){
            res.status(401).json({ success: false, message: "Access denied! No token provided!" })
        }

        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET)    //Payload us returned
        req.user = decodedPayload  // New key is created in req object so that the user details can be accessed throughout the lifecycle of this request

        next()
    }catch(err){
        res.status(401).json({ success: false, message: "Invalid or expired token!" })
    }
}

module.exports = authMiddleware