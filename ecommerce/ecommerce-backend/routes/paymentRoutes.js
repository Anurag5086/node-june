const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { createRazorpayOrder, verifyRazorpayCheckout } = require('../controllers/paymentController')

const router = express.Router()

router.post('/create-razorpay-order', authMiddleware, createRazorpayOrder)
router.post('/verify-razorpay-checkout', authMiddleware, verifyRazorpayCheckout)

module.exports = router
