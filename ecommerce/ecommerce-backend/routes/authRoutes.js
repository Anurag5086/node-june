const express = require('express')
const { registerUser, verifyOtp, resendOtp, loginUser, verifyOtpForForgetPassword } = require('../controllers/authController')
const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/verify-otp', verifyOtp)
router.post('/verify-otp-forget-password', verifyOtpForForgetPassword)
router.post('/resend-otp', resendOtp)

module.exports = router