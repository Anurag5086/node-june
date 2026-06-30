const Order = require('../models/Order')
const { updateOrderStatusSchema, createOrderSchema } = require('../utils/validators')
const { validateAndBuildOrderProducts, decrementStock } = require('../utils/orderHelpers')

exports.getAllOrders = async (req, res) => {
    try{
        const orders = await Order.find()
            .populate('products.product')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            message: orders.length ? 'Successfully fetched all orders!' : 'No orders found!',
            orders,
        })
    }catch(err){
        return res.status(500).json({ success: false, message: 'Internal Server Error!' })
    }
}

exports.getAllOrdersForUser = async (req, res) => {
    try{
        const userId = req.user.userId

        const orders = await Order.find({ userId })
            .populate('products.product')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            message: orders.length ? 'Successfully fetched all orders for user!' : 'No orders found!',
            orders,
        })
    }catch(err){
        return res.status(500).json({ success: false, message: 'Internal Server Error!' })
    }
}

exports.getOrderById = async (req, res) => {
    try{
        const orderId = req.params.id

        const order = await Order.findById(orderId)
        if(!order){
            res.status(404).json({ success: false, message: "No order found!" })
        }

        res.status(200).json({ success: true, message: "Successfully fetched order!", order })
    }catch(err){
        res.status(500).json({ success: false, message: 'Internal Server Error!' })
    }
}

exports.createOrder = async (req, res) => {
    try{
        const { products, totalAmount, paymentMethod, razorpayPaymentId, razorpayOrderId, shippingAddress } = req.body

        const userId = req.user.userId
        const { error } = createOrderSchema.validate({ products, totalAmount, paymentMethod, razorpayPaymentId, razorpayOrderId, shippingAddress })
        if(error){
            return res.status(400).json({ success: false, message: error.details[0].message })
        }

        if (!products?.length) {
            return res.status(400).json({ success: false, message: 'Cart is empty' })
        }

        const { calculatedTotal, orderProducts } = await validateAndBuildOrderProducts(products)

        if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
            return res.status(400).json({ success: false, message: 'Order total does not match product prices' })
        }

        const newOrder = new Order({
            userId,
            products: orderProducts,
            totalAmount: calculatedTotal,
            paymentMethod,
            razorpayPaymentId: razorpayPaymentId || null,
            razorpayOrderId: razorpayOrderId || null,
            shippingAddress
        })

        await newOrder.save()
        await decrementStock(orderProducts)

        return res.status(201).json({ success: true, message: 'Order created successfully!', order: newOrder })
    }catch(err){
        return res.status(500).json({ success: false, message: 'Internal Server Error!' })
    }
}

exports.updateOrderStatus = async (req, res) => {
    try{
        const orderId = req.params.id
        const { status } = req.body

        const { error } = updateOrderStatusSchema.validate({ status })
        if(error){
            res.status(400).json({ success: false, message: "Invalid Input!"})
        }

        const order = await Order.findById(orderId)
        if(!order){
            res.status(404).json({ success: false, message: "No order found!" })
        }

        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true })
            .populate('products.product')
            .populate('userId', 'name email')

        return res.status(200).json({ success: true, message: 'Order status updated!', updatedOrder })
    }catch(err){
        res.status(500).json({ success: false, message: 'Internal Server Error!' })
    }
}