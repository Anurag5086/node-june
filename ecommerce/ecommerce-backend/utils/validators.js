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

module.exports = {
    userRegistrationSchema,
    userLoginSchema,
    verifyOtpSchema,
    resendOtpSchema
}