const crypto = require('crypto')
const Order = require('../models/Order')
const razorpay = require('../utils/razorpay')
const { validateAndBuildOrderProducts, decrementStock } = require('../utils/orderHelpers')
const {
    createRazorpayOrderSchema,
    verifyRazorpayCheckoutSchema,
} = require('../utils/validators')

exports.createRazorpayOrder = async (req, res) => {
    try {
        const { items } = req.body
        const { error } = createRazorpayOrderSchema.validate({ items })
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message })
        }

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({ success: false, message: 'Razorpay is not configured on the server' })
        }

        const { calculatedTotal } = await validateAndBuildOrderProducts(items)
        const amountInPaise = Math.round(calculatedTotal * 100)

        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `order_${Date.now()}`,
        })

        return res.status(200).json({
            success: true,
            keyId: process.env.RAZORPAY_KEY_ID,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            orderId: razorpayOrder.id,
        })
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message || 'Failed to create Razorpay order',
        })
    }
}

exports.verifyRazorpayCheckout = async (req, res) => {
    try {
        const {
            items,
            shippingAddress,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body

        const userId = req.user.userId

        const { error } = verifyRazorpayCheckoutSchema.validate({
            items,
            shippingAddress,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        })
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message })
        }

        const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id })
        if (existingOrder) {
            return res.status(400).json({ success: false, message: 'Order already processed for this payment' })
        }

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex')

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' })
        }

        const { calculatedTotal, orderProducts } = await validateAndBuildOrderProducts(items)

        const newOrder = new Order({
            userId,
            products: orderProducts,
            totalAmount: calculatedTotal,
            paymentMethod: 'Razorpay',
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            shippingAddress,
            status: 'confirmed',
        })

        await newOrder.save()
        await decrementStock(orderProducts)

        return res.status(201).json({
            success: true,
            message: 'Payment verified and order placed successfully!',
            order: newOrder,
        })
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message || 'Payment verification failed',
        })
    }
}
