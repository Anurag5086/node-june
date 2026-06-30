const Order = require('../models/Order')
const { updateOrderStatusSchema, createOrderSchema } = require('../utils/validators')

exports.getAllOrders = async (req, res) => {
    try{
        const orders = await Order.find()
        if(orders.length < 1){
            res.status(404).json({ success: false, message: "No orders found!" })
        }

        res.status(200).json({ success: true, message: "Successfully fetched all orders!", orders })
    }catch(err){
        res.status(500).json({ success: false, message: 'Internal Server Error!' })
    }
}

exports.getAllOrdersForUser = async (req, res) => {
    try{
        const userId = req.user.userId

        const orders = await Order.find({ userId})
        if(orders.length < 1){
            res.status(404).json({ success: false, message: "No orders found!" })
        }

        res.status(200).json({ success: true, message: "Successfully fetched all orders for user!", orders })
    }catch(err){
        res.status(500).json({ success: false, message: 'Internal Server Error!' })
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
            res.status(400).json({ success: false, message: "Invalid Input!"})
        }

        const newOrder = new Order({
            userId,
            products,
            totalAmount,
            paymentMethod,
            razorpayPaymentId: razorpayPaymentId ? razorpayPaymentId : null,
            razorpayOrderId: razorpayOrderId ? razorpayOrderId : null,
            shippingAddress
        })

        await newOrder.save()

        res.status(201).json({ success: true, message: 'Order created successfully!', order})
    }catch(err){
        res.status(500).json({ success: false, message: 'Internal Server Error!' })
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

        res.status(200).json({ success: true, message: "Order status updated!", updatedOrder })
    }catch(err){
        res.status(500).json({ success: false, message: 'Internal Server Error!' })
    }
}