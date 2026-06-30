const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const adminMiddleware = require('../middlewares/adminMiddleware')
const router = express.Router()

router.get('/get-all-orders', authMiddleware, adminMiddleware, getAllOrders)
router.get('/get-all-orders-for-user', authMiddleware, getAllOrdersForUser)
router.get('/get-order-by-id/:id', authMiddleware, getOrderById)
router.post('/create-order', authMiddleware, createOrder)
router.put('/update-order-status/:id', authMiddleware, adminMiddleware, updateOrderStatus)

module.exports = router