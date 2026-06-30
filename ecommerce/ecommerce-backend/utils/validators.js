const joi = require('joi')

const userRegistrationSchema = joi.object({
    name: joi.string().min(2).max(50).required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required()
})

const userLoginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(6).required()
})

const verifyOtpSchema = joi.object({
    email: joi.string().email().required(),
    otp: joi.string().min(6).max(6).required()
})

const resendOtpSchema = joi.object({
    email: joi.string().email().required()
})

const getCategorySchema = joi.object({
    categoryId: joi.string().trim().required()
})

const createCategorySchema = joi.object({
    title: joi.string().min(3).trim().required(),
    description: joi.string().max(500).trim().optional(),
    imageUrl: joi.string().optional()
})

const updateCategorySchema = joi.object({
    title: joi.string().min(3).trim().optional(),
    description: joi.string().max(500).trim().optional(),
    imageUrl: joi.string().optional(),
    isActive: joi.boolean().optional()
})

const createProductSchema = joi.object({
    title: joi.string().min(3).trim().required(),
    description: joi.string().max(1000).trim().required(),
    mrpPrice: joi.number().min(0).required(),
    sellingPrice: joi.number().min(0).required(),
    images: joi.array().optional(),
    categoryId: joi.string().required(),
    stockQuantity: joi.number().min(0).required(),
    rating: joi.number().min(0).max(5).optional(),
    noofRatings: joi.number().min(0).optional(),
    brand: joi.string().trim().required()
})

const updateProductSchema = joi.object({
    title: joi.string().min(3).trim().optional(),
    description: joi.string().max(1000).trim().optional(),
    mrpPrice: joi.number().min(0).optional(),
    sellingPrice: joi.number().min(0).optional(),
    images: joi.array().optional(),
    categoryId: joi.string().optional(),
    stockQuantity: joi.number().min(0).optional(),
    rating: joi.number().min(0).max(5).optional(),
    noofRatings: joi.number().min(0).optional(),
    brand: joi.string().trim().optional(),
    isActive: joi.boolean().optional(),
})

const orderStatusEnum = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
const paymentMethodEnum = ['COD', 'Razorpay']

const updateOrderStatusSchema = joi.object({
    status: joi.string().valid(...orderStatusEnum).required()
})

const createOrderSchema = joi.object({
    products: joi.array().min(1).items(
        joi.object({
            product: joi.string().required(),
            quantity: joi.number().min(1).default(1).required()
        })
    ).required(),
    totalAmount: joi.number().min(0).required(),
    paymentMethod: joi.string().valid(...paymentMethodEnum).required(),
    razorpayPaymentId: joi.string().optional(),
    razorpayOrderId: joi.string().optional(),
    shippingAddress: joi.string().required()
})

const orderItemSchema = joi.object({
    product: joi.string().required(),
    quantity: joi.number().min(1).required(),
})

const createRazorpayOrderSchema = joi.object({
    items: joi.array().min(1).items(orderItemSchema).required(),
})

const verifyRazorpayCheckoutSchema = joi.object({
    items: joi.array().min(1).items(orderItemSchema).required(),
    shippingAddress: joi.string().min(10).required(),
    razorpay_order_id: joi.string().required(),
    razorpay_payment_id: joi.string().required(),
    razorpay_signature: joi.string().required(),
})

module.exports = {
    userRegistrationSchema,
    userLoginSchema,
    verifyOtpSchema,
    resendOtpSchema,
    getCategorySchema,
    createCategorySchema,
    updateCategorySchema,
    createProductSchema,
    updateProductSchema,
    updateOrderStatusSchema,
    createOrderSchema,
    createRazorpayOrderSchema,
    verifyRazorpayCheckoutSchema,
}