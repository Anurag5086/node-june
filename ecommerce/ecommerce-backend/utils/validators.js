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

module.exports = {
    userRegistrationSchema,
    userLoginSchema,
    verifyOtpSchema,
    resendOtpSchema,
    getCategorySchema,
    createCategorySchema,
    updateCategorySchema,
    createProductSchema,
    updateProductSchema
}